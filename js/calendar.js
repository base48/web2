/**
 * Lightweight public Nextcloud calendar widget.
 * Fetches jCal (RFC 7265) export and renders upcoming events.
 * Handles RRULE recurrence, recurrence-id overrides, STATUS and COLOR.
 */
(function () {
    'use strict';

    var CALENDAR_URL = 'https://nextcloud.at.base48.cz/remote.php/dav/public-calendars/oM82tg3RJDLDyZbz?export&accept=jcal';
    var CALENDAR_LINK = 'https://nextcloud.at.base48.cz/apps/calendar/embed/oM82tg3RJDLDyZbz';
    var MAX_EVENTS = 4;
    var LOOKAHEAD_DAYS = 90;

    // --- jCal helpers ---

    function getProp(props, name) {
        for (var i = 0; i < props.length; i++) {
            if (props[i][0] === name) return props[i];
        }
        return null;
    }

    function parseDate(prop) {
        if (!prop) return null;
        var type = prop[2];
        var val = prop[3];
        if (type === 'date') {
            return { date: new Date(val + 'T00:00:00'), allDay: true };
        }
        return { date: new Date(val), allDay: false };
    }

    function escapeHTML(str) {
        var el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    }

    // --- Extract event data from jCal property array ---

    function extractEvent(props) {
        var dtstart = getProp(props, 'dtstart');
        if (!dtstart) return null;
        var parsed = parseDate(dtstart);

        var dtend = getProp(props, 'dtend');
        var sumProp = getProp(props, 'summary');
        var locProp = getProp(props, 'location');
        var descProp = getProp(props, 'description');
        var statusProp = getProp(props, 'status');
        var colorProp = getProp(props, 'color');
        var uidProp = getProp(props, 'uid');

        var description = descProp ? descProp[3] : '';
        var urlMatch = description.match(/https?:\/\/[^\s,;)]+/);

        return {
            start: parsed.date,
            end: dtend ? parseDate(dtend).date : null,
            allDay: parsed.allDay,
            summary: sumProp ? sumProp[3] : '(bez názvu)',
            location: locProp ? locProp[3] : '',
            url: urlMatch ? urlMatch[0] : '',
            status: statusProp ? statusProp[3].toUpperCase() : 'CONFIRMED',
            color: colorProp ? colorProp[3] : '',
            uid: uidProp ? uidProp[3] : ''
        };
    }

    // --- RRULE expansion ---

    function expandRecurrence(start, end, allDay, rrule, limit) {
        var instances = [];
        var freq = (rrule.freq || '').toUpperCase();
        var interval = parseInt(rrule.interval) || 1;
        var count = rrule.count ? parseInt(rrule.count) : Infinity;
        var until = rrule.until ? new Date(rrule.until) : limit;
        if (until > limit) until = limit;
        var duration = (start && end) ? end.getTime() - start.getTime() : 0;
        var cur = new Date(start);
        var n = 0;

        while (cur <= until && n < count && n < 500) {
            instances.push({
                start: new Date(cur),
                end: duration ? new Date(cur.getTime() + duration) : null,
                allDay: allDay
            });
            n++;
            switch (freq) {
                case 'DAILY': cur.setDate(cur.getDate() + interval); break;
                case 'WEEKLY': cur.setDate(cur.getDate() + 7 * interval); break;
                case 'MONTHLY': cur.setMonth(cur.getMonth() + interval); break;
                case 'YEARLY': cur.setFullYear(cur.getFullYear() + interval); break;
                default: return instances;
            }
        }
        return instances;
    }

    // --- SIBLING union-find (Nextcloud splits recurring series across UIDs) ---

    function makeUnionFind() {
        var par = {};
        function find(x) {
            if (!par[x]) par[x] = x;
            while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; }
            return x;
        }
        function union(a, b) { var ra = find(a), rb = find(b); if (ra !== rb) par[ra] = rb; }
        return { find: find, union: union };
    }

    // --- Parse jCal with override handling ---

    function parseJCal(jcal) {
        var components = jcal[2] || [];
        var now = new Date();
        var limit = new Date(now.getTime() + LOOKAHEAD_DAYS * 86400000);

        // Build series groups from related-to SIBLING links
        var uf = makeUnionFind();
        for (var s = 0; s < components.length; s++) {
            if (components[s][0] !== 'vevent') continue;
            var sProps = components[s][1];
            var sUid = getProp(sProps, 'uid');
            if (!sUid) continue;
            uf.find(sUid[3]);
            for (var k = 0; k < sProps.length; k++) {
                if (sProps[k][0] === 'related-to' && sProps[k][1] && sProps[k][1].reltype === 'SIBLING') {
                    uf.union(sUid[3], sProps[k][3]);
                }
            }
        }

        // Separate recurrence-id overrides from base events
        var overrides = {}; // "uid|timestamp" → event
        var bases = [];

        for (var i = 0; i < components.length; i++) {
            if (components[i][0] !== 'vevent') continue;
            var props = components[i][1];
            var ev = extractEvent(props);
            if (!ev) continue;

            var recId = getProp(props, 'recurrence-id');
            if (recId) {
                var recDate = parseDate(recId).date;
                overrides[ev.uid + '|' + recDate.getTime()] = ev;
            } else {
                bases.push({ props: props, ev: ev });
            }
        }

        var events = [];

        for (var j = 0; j < bases.length; j++) {
            var base = bases[j];
            var ev = base.ev;

            // Cancelled base series → skip all instances
            if (ev.status === 'CANCELLED') continue;

            var rruleProp = getProp(base.props, 'rrule');
            if (rruleProp) {
                var rrule = rruleProp[3];
                var instances = expandRecurrence(ev.start, ev.end, ev.allDay, rrule, limit);
                instances.forEach(function (inst) {
                    if (inst.start < now || inst.start > limit) return;
                    var key = ev.uid + '|' + inst.start.getTime();
                    var override = overrides[key];
                    if (override) {
                        events.push(override);
                    } else {
                        inst.uid = ev.uid;
                        inst.summary = ev.summary;
                        inst.location = ev.location;
                        inst.url = ev.url;
                        inst.status = ev.status;
                        inst.color = ev.color;
                        events.push(inst);
                    }
                });
            } else if (ev.start >= now && ev.start <= limit) {
                events.push(ev);
            }
        }

        events.sort(function (a, b) { return a.start - b.start; });

        // Skip cancelled; keep only nearest instance per series (by SIBLING-grouped uid)
        var seenSeries = {};
        events = events.filter(function (ev) {
            if (ev.status === 'CANCELLED') return false;
            var sid = ev.uid ? uf.find(ev.uid) : '';
            if (sid && seenSeries[sid]) return false;
            if (sid) seenSeries[sid] = true;
            return true;
        });

        return events.slice(0, MAX_EVENTS);
    }

    // --- Render ---

    function formatDate(start, allDay, end) {
        var d = start.getDate();
        var m = start.getMonth() + 1;
        if (allDay) {
            var str = d + '. ' + m + '.';
            if (end) {
                var last = new Date(end); last.setDate(last.getDate() - 1); // DTEND is exclusive
                if (last > start) str += ' – ' + last.getDate() + '. ' + (last.getMonth() + 1) + '.';
            }
            return str;
        }
        var hh = start.getHours().toString().padStart(2, '0');
        var mm = start.getMinutes().toString().padStart(2, '0');
        return d + '. ' + m + '. – ' + hh + ':' + mm;
    }

    function render(container, events, lang) {
        if (!events.length) {
            container.innerHTML = '<p class="calendar-empty">' +
                (lang === 'cs' ? 'Žádné nadcházející akce.' : 'No upcoming events.') + '</p>';
            return;
        }
        var html = '<div class="calendar-events">';
        events.forEach(function (ev) {
            var href = ev.url || CALENDAR_LINK;
            var statusClass = ev.status === 'TENTATIVE' ? ' tentative' : '';
            var statusBadge = ev.status === 'TENTATIVE'
                ? ' <span class="calendar-badge tentative">' + (lang === 'cs' ? 'předběžně' : 'tentative') + '</span>'
                : '';
            var colorStyle = ev.color ? ' style="border-left: 3px solid ' + ev.color + ';"' : '';

            html += '<a href="' + escapeHTML(href) + '" target="_blank" rel="noopener" class="calendar-event button' + statusClass + '"' + colorStyle + '>' +
                '<span class="calendar-event-date"><i class="fas fa-calendar-day"></i> ' +
                    formatDate(ev.start, ev.allDay, ev.end) + '</span>' +
                '<span>' + escapeHTML(ev.summary) + statusBadge + '</span>' +
                '</a>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // --- Init ---

    function init() {
        var container = document.getElementById('calendar-events');
        if (!container) return;
        var lang = document.documentElement.lang || 'cs';

        fetch(CALENDAR_URL)
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(function (jcal) { render(container, parseJCal(jcal), lang); })
            .catch(function (err) {
                console.warn('Calendar fetch failed:', err);
                container.innerHTML =
                    '<a href="' + CALENDAR_LINK + '" target="_blank" rel="noopener" class="button">' +
                    '<i class="fas fa-calendar-alt"></i>' +
                    '<span>' + (lang === 'cs' ? 'Zobrazit kalendář' : 'View calendar') + '</span></a>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
