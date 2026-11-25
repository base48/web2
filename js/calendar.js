/**
 * Lightweight public Nextcloud calendar widget.
 * Fetches jCal (RFC 7265) export and renders upcoming events.
 * Recurrence (RRULE incl. BYDAY, EXDATE, RECURRENCE-ID overrides, time zones)
 * is expanded by ical.js 2.2.1 (MPL-2.0, https://github.com/kewisch/ical.js),
 * vendored in /vendor/ical/ and loaded only on pages with the widget.
 */
(function () {
    'use strict';

    var CALENDAR_URL = 'https://nextcloud.at.base48.cz/remote.php/dav/public-calendars/oM82tg3RJDLDyZbz?export&accept=jcal';
    var CALENDAR_LINK = 'https://nextcloud.at.base48.cz/apps/calendar/embed/oM82tg3RJDLDyZbz';
    var ICAL_URL = '/vendor/ical/ical.min.js';
    var MAX_EVENTS = 4;
    var LOOKAHEAD_DAYS = 90;
    var MAX_OCCURRENCES = 5000; // safety cap per recurring series

    function escapeHTML(str) {
        var el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    }

    function getStatus(comp) {
        var status = comp.getFirstPropertyValue('status');
        return status ? String(status).toUpperCase() : 'CONFIRMED';
    }

    // --- Display data from an ICAL.Event (series master or override) ---

    function toEvent(item, startDate, endDate) {
        var description = item.description || '';
        var urlMatch = description.match(/https?:\/\/[^\s,;)]+/);

        return {
            start: startDate.toJSDate(),
            end: endDate ? endDate.toJSDate() : null,
            allDay: startDate.isDate,
            summary: item.summary || '(bez názvu)',
            location: item.location || '',
            url: urlMatch ? urlMatch[0] : '',
            status: getStatus(item.component),
            color: item.component.getFirstPropertyValue('color') || '',
            uid: item.uid || ''
        };
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

    // --- Visibility window ---

    // Listed = starts today or later (today's events stay until midnight, even
    // once they have started), or started earlier and is still running.
    function isListed(ev, now, today, limit) {
        if (ev.start > limit) return false;
        if (ev.start >= today) return true;
        return !!ev.end && ev.end > now;
    }

    // --- Parse jCal and expand occurrences ---

    function parseJCal(ICAL, jcal) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var limit = new Date(now.getTime() + LOOKAHEAD_DAYS * 86400000);
        var vevents = new ICAL.Component(jcal).getAllSubcomponents('vevent');

        // Group components by UID into master + RECURRENCE-ID overrides,
        // and link sibling series via RELATED-TO;RELTYPE=SIBLING.
        var uf = makeUnionFind();
        var series = {};

        vevents.forEach(function (comp, i) {
            var uid = comp.getFirstPropertyValue('uid');
            var key = uid || ('no-uid-' + i);
            if (uid) {
                uf.find(uid);
                comp.getAllProperties('related-to').forEach(function (prop) {
                    if (String(prop.getParameter('reltype')).toUpperCase() === 'SIBLING') {
                        uf.union(uid, prop.getFirstValue());
                    }
                });
            }
            if (!series[key]) series[key] = { master: null, overrides: [] };
            if (comp.hasProperty('recurrence-id')) series[key].overrides.push(comp);
            else series[key].master = comp;
        });

        var events = [];

        function add(item, startDate, endDate) {
            var ev = toEvent(item, startDate, endDate);
            if (ev.status === 'CANCELLED') return;
            if (!isListed(ev, now, today, limit)) return;
            events.push(ev);
        }

        Object.keys(series).forEach(function (key) {
            var s = series[key];

            // Overrides without their master in the export → standalone events
            if (!s.master) {
                s.overrides.forEach(function (comp) {
                    var ev = new ICAL.Event(comp);
                    add(ev, ev.startDate, ev.endDate);
                });
                return;
            }

            // Cancelled master → skip all instances
            if (getStatus(s.master) === 'CANCELLED') return;

            // Pass overrides explicitly, otherwise ical.js would relate
            // every RECURRENCE-ID component in the calendar regardless of UID.
            var event = new ICAL.Event(s.master, { exceptions: s.overrides });

            if (!event.isRecurring()) {
                add(event, event.startDate, event.endDate);
                return;
            }

            var it = event.iterator();
            var next;
            for (var n = 0; n < MAX_OCCURRENCES && (next = it.next()); n++) {
                if (next.toJSDate() > limit) break;
                var details = event.getOccurrenceDetails(next);
                add(details.item, details.startDate, details.endDate);
            }
        });

        events.sort(function (a, b) { return a.start - b.start; });

        // Keep only nearest instance per series (by SIBLING-grouped uid)
        var seenSeries = {};
        events = events.filter(function (ev) {
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

        Promise.all([
            fetch(CALENDAR_URL).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
            import(ICAL_URL).then(function (mod) { return mod.default; })
        ])
            .then(function (res) { render(container, parseJCal(res[1], res[0]), lang); })
            .catch(function (err) {
                console.warn('Calendar failed:', err);
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
