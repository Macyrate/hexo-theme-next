/* global Fancybox, NexT, CONFIG */

(() => {
  let assets;
  let bound = false;

  function loadAssets() {
    if (assets) return assets;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = CONFIG.fancyboxAssets.css.url;
    if (CONFIG.fancyboxAssets.css.integrity) {
      css.integrity = CONFIG.fancyboxAssets.css.integrity;
      css.crossOrigin = 'anonymous';
    }
    assets = Promise.all([
      new Promise((resolve, reject) => {
        css.onload = resolve;
        css.onerror = reject;
        document.head.appendChild(css);
      }),
      NexT.utils.getScript(CONFIG.fancyboxAssets.js, {
        async: true,
        condition: Boolean(window.Fancybox)
      })
    ]).catch(error => {
      css.remove();
      assets = null;
      throw error;
    });
    return assets;
  }

  async function initialize() {
    if (!document.querySelector('.post-body img, [data-fancybox]')) return;
    try {
      await loadAssets();
      wrapImages();
      if (!bound) {
        Fancybox.bind('[data-fancybox]');
        bound = true;
      }
    } catch (error) {
      console.error('Fancybox could not load; image links remain available.', error);
    }
  }

  function wrapImages() {
    /**
     * Wrap images with fancybox.
     */
    document.querySelectorAll('.post-body :not(a) > img, .post-body > img').forEach(image => {
      const imageLink = image.dataset.src || image.src;
      const imageWrapLink = document.createElement('a');
      imageWrapLink.classList.add('fancybox');
      imageWrapLink.href = imageLink;
      imageWrapLink.setAttribute('itemscope', '');
      imageWrapLink.setAttribute('itemtype', 'http://schema.org/ImageObject');
      imageWrapLink.setAttribute('itemprop', 'url');

      let dataFancybox = 'default';
      if (image.closest('.post-gallery') !== null) {
        dataFancybox = 'gallery';
      } else if (image.closest('.group-picture') !== null) {
        dataFancybox = 'group';
      }
      imageWrapLink.dataset.fancybox = dataFancybox;

      const imageTitle = image.title || image.alt;
      if (imageTitle) {
        imageWrapLink.title = imageTitle;
        // Make sure img captions will show correctly in fancybox
        imageWrapLink.dataset.caption = imageTitle;
      }
      image.wrap(imageWrapLink);
    });
  }

  document.addEventListener('page:loaded', () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(initialize, { timeout: 1500 });
      } else {
        setTimeout(initialize, 0);
      }
    }));
  });
})();
