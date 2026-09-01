// Basic JavaScript for the hackerspace website

document.addEventListener('DOMContentLoaded', function () {
    // Show JS-only elements
    document.querySelectorAll('.js-only').forEach(el => {
        el.style.display = 'flex';
    });

    // Theme switching functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const logo = document.querySelector('.logo');

    // Function to update logo based on theme
    function updateLogo(theme) {
        if (theme === 'dark') {
            logo.src = 'img/logo/logo_bw.svg';
        } else {
            logo.src = 'img/logo/logo.svg';
        }
    }

    // Check for saved theme preference or use system preference
    const initialTheme = document.documentElement.getAttribute('data-theme');
    if (initialTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        updateLogo('dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        updateLogo('light');
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        if (currentTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            updateLogo('dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            updateLogo('light');
        }
    });

    // Smooth scrolling for anchor links pointing to the current page
    const allAnchorLinks = document.querySelectorAll('a[href*="#"]:not([href="#"])');

    function smoothScrollToAnchor(e) {
        const targetHref = this.href; // Get full URL (e.g., http://.../#id)
        const currentHref = window.location.href; // Get current full URL

        // Basic check: Compare the part of the URL before the hash
        const targetPath = targetHref.split('#')[0];
        const currentPath = currentHref.split('#')[0];

        // Only proceed if the link points to the current page path
        if (targetPath === currentPath || targetPath === '') { // '' handles href="#id"
            e.preventDefault(); // Only prevent default for same-page links

            const targetId = this.hash; // Gets the # part (e.g., #clenstvi)
            if (!targetId) {
                return; // Exit if hash is somehow empty
            }

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculate header height for better offset
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const offset = 20; // Additional offset
                const totalOffset = headerHeight + offset;

                // Get position with scrollY instead of pageYOffset (which is deprecated)
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - totalOffset;

                // Use a custom smooth scroll implementation for better control
                smoothScrollTo(targetPosition, 800);
            } else {
            }
        } else {
            // Let the browser handle navigation to a different page
        }
    }

    // Custom smooth scroll implementation
    function smoothScrollTo(targetY, duration) {
        const startY = window.scrollY;
        const difference = targetY - startY;
        const startTime = performance.now();

        function step() {
            const currentTime = performance.now();
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Apply easing function for smoother start/end (easeInOutQuad)
            const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(0, startY + difference * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // Apply to all anchor links
    allAnchorLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToAnchor);
    });

    // Current year for footer copyright
    const footerYear = document.querySelector('footer p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2023', currentYear);
    }

    // Satellite popup functionality
    const satellite = document.querySelector('.satellite-sprite');
    const satellitePopup = document.getElementById('satellite-popup');
    const closePopup = document.querySelector('.close-popup');

    // Show popup when satellite is clicked
    if (satellite && satellitePopup) {
        // Add a visible indicator that satellite is clickable
        satellite.title = "Klikni pro informaci";

        // Function to update satellite size based on position
        function updateSatelliteSize() {
            if (satellite) {
                // Get viewport width
                const viewportWidth = window.innerWidth;

                // Get satellite's horizontal position
                const satelliteRect = satellite.getBoundingClientRect();
                const satelliteCenter = satelliteRect.left + (satelliteRect.width / 2);

                // Calculate distance from center as a percentage (0 = center, 1 = edge)
                const centerX = viewportWidth / 2;
                const distanceFromCenter = Math.abs(satelliteCenter - centerX) / centerX;

                // Calculate scale based on position:
                // - At edge (distanceFromCenter = 1): scale = 0.8
                // - At center (distanceFromCenter = 0): scale = 1.5
                const scale = 1.5 - (distanceFromCenter * 0.7);

                // Get current satellite animation position to determine rotation
                // Change rotation based on position in animation cycle
                const rightPosition = parseFloat(window.getComputedStyle(satellite).right);
                const rightPercentage = rightPosition / viewportWidth;
                const normalizedPosition = 1 - (rightPosition % viewportWidth) / viewportWidth;

                // Calculate rotation angle (-15 to 15 degrees)
                let rotation = 0;
                if (normalizedPosition < 0.25) {
                    rotation = 15 - normalizedPosition * 120; // 15 to -15
                } else if (normalizedPosition < 0.5) {
                    rotation = -15 + (normalizedPosition - 0.25) * 120; // -15 to 15
                } else if (normalizedPosition < 0.75) {
                    rotation = 15 - (normalizedPosition - 0.5) * 120; // 15 to -15
                } else {
                    rotation = -15 + (normalizedPosition - 0.75) * 120; // -15 to 15
                }

                // Apply the scale and rotation
                satellite.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
            }

            // Request next animation frame if not showing popup
            if (!satellitePopup.classList.contains('show')) {
                requestAnimationFrame(updateSatelliteSize);
            }
        }

        // Start updating satellite size
        updateSatelliteSize();

        // Function to update popup position to follow satellite
        function updatePopupPosition() {
            if (satellitePopup.classList.contains('show')) {
                // Get satellite position relative to its container
                const satelliteRect = satellite.getBoundingClientRect();
                const containerRect = satellite.parentElement.getBoundingClientRect();

                // Calculate position relative to the satellite container
                const satelliteRelativeLeft = satelliteRect.left - containerRect.left;
                const satelliteRelativeTop = satelliteRect.top - containerRect.top;
                const satelliteCenter = satelliteRelativeLeft + (satelliteRect.width / 2);

                // Update popup position relative to container
                satellitePopup.style.top = (satelliteRelativeTop + satelliteRect.height + 15) + 'px';
                satellitePopup.style.left = satelliteCenter + 'px';

                // Request next animation frame
                requestAnimationFrame(updatePopupPosition);
            }
        }

        satellite.addEventListener('click', function (e) {
            satellitePopup.classList.add('show');

            // Position popup relative to satellite
            updatePopupPosition();

            // Pause satellite animation and size updates
            satellite.style.animationPlayState = 'paused';

            e.stopPropagation(); // Prevent event bubbling
        });

        // Close popup when close button is clicked
        closePopup.addEventListener('click', function (e) {
            satellitePopup.classList.remove('show');

            // Resume satellite animation and size updates
            satellite.style.animationPlayState = 'running';
            updateSatelliteSize(); // Restart size updates

            e.stopPropagation(); // Prevent event bubbling
        });

        // Close popup when clicking anywhere else
        document.addEventListener('click', function (e) {
            if (satellitePopup.classList.contains('show') &&
                !satellitePopup.contains(e.target) &&
                e.target !== satellite) {
                satellitePopup.classList.remove('show');

                // Resume satellite animation and size updates
                satellite.style.animationPlayState = 'running';
                updateSatelliteSize(); // Restart size updates
            }
        });

        // Close popup when ESC key is pressed
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && satellitePopup.classList.contains('show')) {
                satellitePopup.classList.remove('show');

                // Resume satellite animation and size updates
                satellite.style.animationPlayState = 'running';
                updateSatelliteSize(); // Restart size updates
            }
        });

        // Add alternate way to trigger popup for testing
        document.addEventListener('keydown', function (e) {
            if (e.key === 's' && !satellitePopup.classList.contains('show')) {
                satellitePopup.classList.add('show');

                // Position popup relative to satellite
                updatePopupPosition();

                // Pause satellite animation
                satellite.style.animationPlayState = 'paused';
            }
        });
    } else {
        console.error('Missing satellite elements:', {
            satellite: !!satellite,
            popup: !!satellitePopup
        });
    }

    // Scroll to Top Button Logic
    const scrollToTopButton = document.getElementById('scroll-to-top');
    const scrollThreshold = 200; // Pixels scrolled before button appears

    if (scrollToTopButton) {

        // Show/hide button based on scroll position (Simplified)
        window.addEventListener('scroll', () => {
            const isBelowThreshold = window.scrollY > scrollThreshold;

            if (isBelowThreshold) {
                scrollToTopButton.style.display = 'flex'; // Use flex to center icon
                scrollToTopButton.style.opacity = '0.8';
                scrollToTopButton.style.visibility = 'visible';
            } else {
                // Rely on default display:none from CSS, just control opacity/visibility for transition
                scrollToTopButton.style.opacity = '0';
                scrollToTopButton.style.visibility = 'hidden';
                // Optional: Set display back to none after transition if needed, but might not be necessary
                // setTimeout(() => { scrollToTopButton.style.display = 'none'; }, 300);
            }
        });

        // Scroll to top on click
        scrollToTopButton.addEventListener('click', () => {
            smoothScrollTo(0, 800); // Use existing smooth scroll function
        });
    }


    // Hamburger Menu Toggle
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const navWrapper = document.getElementById('main-nav');

    if (hamburgerButton && navWrapper) {
        hamburgerButton.addEventListener('click', () => {
            const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
            hamburgerButton.setAttribute('aria-expanded', !isExpanded);
            navWrapper.classList.toggle('is-active');
            // Optional: Toggle body class to prevent scrolling when menu is open
            // document.body.classList.toggle('no-scroll', !isExpanded);
        });

        // Optional: Close menu when clicking outside of it
        document.addEventListener('click', (event) => {
            if (!navWrapper.contains(event.target) && !hamburgerButton.contains(event.target) && navWrapper.classList.contains('is-active')) {
                hamburgerButton.setAttribute('aria-expanded', 'false');
                navWrapper.classList.remove('is-active');
                // document.body.classList.remove('no-scroll');
            }
        });

        // Optional: Close menu when a nav link is clicked
        navWrapper.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navWrapper.classList.contains('is-active')) {
                    hamburgerButton.setAttribute('aria-expanded', 'false');
                    navWrapper.classList.remove('is-active');
                    // document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');

    let currentGroup = null;
    let currentIndex = 0;
    let currentImages = [];

    // Initialize lightbox
    function initLightbox() {
        // Add click handlers to all gallery links
        document.querySelectorAll('[data-gallery]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const galleryId = this.dataset.gallery;
                const gallery = document.querySelector(`.gallery[data-gallery-id="${galleryId}"]`);
                if (gallery) {
                    const images = Array.from(gallery.querySelectorAll('img'));
                    if (images.length > 0) {
                        openLightbox(galleryId, images);
                    }
                }
            });
        });

        // Close lightbox handlers
        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            } else if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
                showPrevImage();
            } else if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
                showNextImage();
            }
        });

        // Navigation handlers
        prevButton.addEventListener('click', showPrevImage);
        nextButton.addEventListener('click', showNextImage);
    }

    function openLightbox(galleryId, images) {
        currentGroup = galleryId;
        currentImages = images;
        currentIndex = 0;

        // Preload the first image before showing lightbox
        const firstImage = new Image();
        firstImage.onload = function () {
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        firstImage.src = images[0].src;
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Clear the image source when closing to prevent unnecessary loading
        lightboxImage.src = '';
    }

    function updateLightbox() {
        const image = currentImages[currentIndex];

        // Pre-calculate image size before showing
        const tempImage = new Image();
        tempImage.onload = function () {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const isLandscape = viewportWidth > viewportHeight;

            // Adjust max height based on orientation
            const maxImageHeight = isLandscape
                ? viewportHeight * 0.85  // Use more height in landscape
                : viewportHeight * 0.6;  // Keep current height in portrait

            // Set the size immediately without animation
            if (this.naturalHeight > maxImageHeight) {
                lightboxImage.style.maxHeight = maxImageHeight + 'px';
            } else {
                lightboxImage.style.maxHeight = 'none';
            }

            // Set image source after size is calculated
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightboxCaption.textContent = image.alt;
        };
        tempImage.src = image.src;

        // Update navigation buttons visibility
        prevButton.classList.toggle('visible', currentIndex > 0);
        nextButton.classList.toggle('visible', currentIndex < currentImages.length - 1);
    }

    function showPrevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            updateLightbox();
        }
    }

    function showNextImage() {
        if (currentIndex < currentImages.length - 1) {
            currentIndex++;
            updateLightbox();
        }
    }

    // Initialize lightbox
    initLightbox();

    // Base status functionality
    function updateBaseStatus() {
        const statusElement = document.getElementById('base-status');
        if (!statusElement) return;

        // Detect language from HTML lang attribute
        const htmlLang = document.documentElement.lang || 'cs';
        const isCzech = htmlLang === 'cs';

        // Language-specific text
        const texts = {
            czech: {
                open: 'nyní otevřeno',
                closed: 'nyní zavřeno',
                unknown: 'stav neznámý'
            },
            english: {
                open: 'now open',
                closed: 'now closed',
                unknown: 'status unknown'
            }
        };

        const lang = isCzech ? 'czech' : 'english';
        // nginx proxies /api/spaceapi to Home Assistant, so this is same-origin.
        // curl https://base48.cz/api/spaceapi

        // Try to fetch the base status (with cache busting)
        const cacheBuster = Date.now();
        // No custom headers: they would trigger a CORS preflight, which HA
        // answers with 403. The ?t= above is enough to bust the cache.
        fetch(`/api/spaceapi?t=${cacheBuster}`, {
            cache: 'no-cache'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Status file not found');
                }
                return response.json();
            })
            .then(data => {
                // Check if the base is open based on the state field
                // SpaceAPI 0.13: state is {"open": bool, "lastchange": ts}
                const isOpen = data.state.open;

                statusElement.textContent = isOpen ? texts[lang].open : texts[lang].closed;
                statusElement.className = `base-status ${isOpen ? 'open' : 'closed'}`;
                statusElement.style.display = 'inline-block';
            })
            .catch(error => {
                // Default to closed/unknown if file doesn't exist or there's an error
                console.log('Base status not available:', error.message);
                statusElement.textContent = texts[lang].unknown;
                statusElement.className = 'base-status unknown';
                statusElement.style.display = 'inline-block';
            });
    }

    // Update status on page load
    updateBaseStatus();

    // Optionally update status every 30 seconds
    setInterval(updateBaseStatus, 20 * 1000);
}); 
