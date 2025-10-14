(() => {
    const scrollButton = document.getElementById('myBtn');

    if (!scrollButton) {
        return;
    }

    let isVisible = false;
    let scheduled = false;
    const scheduler = window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : (callback) => window.setTimeout(callback, 16);

    scrollButton.tabIndex = -1;

    const updateVisibility = () => {
        scheduled = false;
        const shouldShow = window.pageYOffset > 20;

        if (shouldShow === isVisible) {
            return;
        }

        isVisible = shouldShow;
        scrollButton.classList.toggle('is-visible', isVisible);
        scrollButton.setAttribute('aria-hidden', String(!isVisible));
        scrollButton.tabIndex = isVisible ? 0 : -1;
    };

    const requestUpdate = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;
        scheduler(updateVisibility);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });

    scrollButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateVisibility();
})();

(() => {
    const chapterNav = document.querySelector('.chapter-nav');

    if (!chapterNav) {
        return;
    }

    const toggle = chapterNav.querySelector('.chapter-nav__toggle');
    const list = chapterNav.querySelector('.chapter-nav__list');

    if (!(toggle instanceof HTMLElement) || !(list instanceof HTMLElement)) {
        return;
    }

    const openClass = 'is-open';
    let closeTimer = 0;
    let isOpen = false;
    const reduceMotionQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    const setExpanded = (expanded) => {
        toggle.setAttribute('aria-expanded', String(expanded));
    };

    function handleOutsidePointerDown(event) {
        if (!chapterNav.contains(event.target)) {
            hideList();
        }
    }

    const addOutsideListeners = () => {
        document.addEventListener('pointerdown', handleOutsidePointerDown);
    };

    const removeOutsideListeners = () => {
        document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };

    const showList = () => {
        window.clearTimeout(closeTimer);

        if (isOpen) {
            return;
        }

        if (!chapterNav.classList.contains(openClass)) {
            chapterNav.classList.add(openClass);
        }

        if (list.hasAttribute('hidden')) {
            list.removeAttribute('hidden');
        }

        isOpen = true;
        addOutsideListeners();
        setExpanded(true);
    };

    const hideList = () => {
        window.clearTimeout(closeTimer);

        if (!isOpen) {
            return;
        }

        if (chapterNav.classList.contains(openClass)) {
            chapterNav.classList.remove(openClass);
        }

        if (!list.hasAttribute('hidden')) {
            list.setAttribute('hidden', '');
        }

        isOpen = false;
        removeOutsideListeners();
        setExpanded(false);
    };

    const scheduleHide = (delay = 0) => {
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(hideList, delay);
    };

    toggle.addEventListener('click', () => {
        if (chapterNav.classList.contains(openClass)) {
            hideList();
        } else {
            showList();
        }
    });

    chapterNav.addEventListener('mouseenter', () => {
        showList();
    });

    chapterNav.addEventListener('mouseleave', () => {
        scheduleHide(100);
    });

    toggle.addEventListener('focus', showList);
    list.addEventListener('focusin', showList);

    chapterNav.addEventListener('focusout', (event) => {
        const relatedTarget = event.relatedTarget;

        if (!relatedTarget || !chapterNav.contains(relatedTarget)) {
            scheduleHide();
        }
    });

    const focusHeading = (element) => {
        if (!(element instanceof HTMLElement)) {
            return;
        }

        const originalTabIndex = element.getAttribute('tabindex');

        if (originalTabIndex === null) {
            element.setAttribute('tabindex', '-1');
        }

        try {
            element.focus({ preventScroll: true });
        } catch (error) {
            element.focus();
        }

        if (originalTabIndex === null) {
            element.removeAttribute('tabindex');
        }
    };

    const prefersReducedMotion = () => {
        return reduceMotionQuery ? reduceMotionQuery.matches : false;
    };

    const smoothScrollToHash = (hash) => {
        if (typeof hash !== 'string' || !hash.startsWith('#') || hash.length === 1) {
            return false;
        }

        const target = document.getElementById(hash.slice(1));

        if (!target) {
            return false;
        }

        const scrollToTarget = (options) => {
            if (typeof target.scrollIntoView !== 'function') {
                return;
            }

            try {
                target.scrollIntoView(options);
            } catch (error) {
                target.scrollIntoView();
            }
        };

        const updateHash = () => {
            if (window.location.hash !== hash) {
                if (typeof window.history.pushState === 'function') {
                    window.history.pushState(null, '', hash);
                } else {
                    window.location.hash = hash;
                }
            } else if (typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, '', hash);
            }
        };

        if (prefersReducedMotion()) {
            scrollToTarget({ block: 'start' });
            focusHeading(target);
            updateHash();
            return true;
        }

        scrollToTarget({ behavior: 'smooth', block: 'start' });

        window.setTimeout(() => {
            focusHeading(target);
            updateHash();
        }, 450);

        return true;
    };

    list.addEventListener('click', (event) => {
        const link = event.target instanceof HTMLElement ? event.target.closest('.chapter-nav__link') : null;

        if (link) {
            const hash = link.getAttribute('href');

            if (smoothScrollToHash(hash)) {
                event.preventDefault();
            }

            hideList();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (chapterNav.classList.contains(openClass)) {
                event.preventDefault();
                hideList();
                toggle.focus();
            }
        }
    });
})();

