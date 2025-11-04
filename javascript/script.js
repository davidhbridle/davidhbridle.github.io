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

