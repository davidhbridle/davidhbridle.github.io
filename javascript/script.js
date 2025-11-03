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
    const downloadButton = document.getElementById('downloadPdf');
    const storyStart = document.getElementById('story-start');

    if (!downloadButton || !storyStart) {
        return;
    }

    const pdfBundle = window.html2pdf;
    const pdfGenerator =
        typeof pdfBundle === 'function'
            ? pdfBundle
            : pdfBundle && typeof pdfBundle.default === 'function'
              ? pdfBundle.default
              : null;

    if (!pdfGenerator) {
        downloadButton.disabled = true;
        downloadButton.setAttribute('aria-disabled', 'true');
        downloadButton.title = 'PDF download is currently unavailable.';
        return;
    }

    const defaultLabel = downloadButton.textContent || 'Download PDF';
    const loadingLabel = downloadButton.getAttribute('data-loading-text') || 'Preparing PDF…';

    const setLoadingState = (isLoading) => {
        downloadButton.disabled = isLoading;

        if (isLoading) {
            downloadButton.setAttribute('aria-busy', 'true');
            downloadButton.textContent = loadingLabel;
        } else {
            downloadButton.removeAttribute('aria-busy');
            downloadButton.textContent = defaultLabel;
        }
    };

    downloadButton.addEventListener('click', (event) => {
        event.preventDefault();

        if (downloadButton.disabled) {
            return;
        }

        setLoadingState(true);

        pdfGenerator()
            .set({
                margin: 0.5,
                filename: 'siddhartha-hermann-hesse.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            })
            .from(storyStart)
            .save()
            .then(
                () => {
                    setLoadingState(false);
                    downloadButton.focus();
                },
                (error) => {
                    console.error('Failed to generate PDF download.', error);
                    setLoadingState(false);
                    downloadButton.focus();
                },
            );
    });
})();

