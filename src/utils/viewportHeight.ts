/**
 * Viewport height polyfill for dynamic viewport units
 * Sets CSS custom properties for vh, dvh, svh, and lvh
 * Handles browser chrome (address bar) on mobile devices
 */

export const initViewportHeight = () => {
  const setViewportHeight = () => {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;

    // Set CSS custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // For browsers that don't support dvh, svh, lvh
    // We'll use the same value for all (dynamic viewport)
    if (!CSS.supports('height', '100dvh')) {
      document.documentElement.style.setProperty('--dvh', `${vh}px`);
    }

    if (!CSS.supports('height', '100svh')) {
      document.documentElement.style.setProperty('--svh', `${vh}px`);
    }

    if (!CSS.supports('height', '100lvh')) {
      document.documentElement.style.setProperty('--lvh', `${vh}px`);
    }
  };

  // Set on load
  setViewportHeight();

  // Update on resize (debounced)
  let resizeTimer: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setViewportHeight, 100);
  });

  // Update on orientation change
  window.addEventListener('orientationchange', () => {
    // Wait for orientation change to complete
    setTimeout(setViewportHeight, 100);
  });

  // iOS-specific: update on scroll (for address bar hide/show)
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(setViewportHeight, 200);
      },
      { passive: true }
    );
  }
};
