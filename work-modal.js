(function () {
  if (window.__portfolioWorkModalInitialized) return;
  window.__portfolioWorkModalInitialized = true;

  const config = window.PortfolioWorkModalConfig || {};
  const cardSelector = config.cardSelector || ".data-project-card, [data-project-card]";
  const overlayId = "work-modal-overlay";
  const modalId = "work-modal";
  const frameId = "work-modal-frame";
  const expandId = "work-modal-expand";
  const pageCache = new Set();

  function preloadPage(url) {
    const href = new URL(url, window.location.href).toString();
    if (pageCache.has(href)) return;
    pageCache.add(href);

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    link.as = "document";
    document.head.appendChild(link);
  }

  function ensureModalMarkup() {
    if (document.getElementById(overlayId)) return;

    const wrapper = document.createElement("div");
    wrapper.id = overlayId;
    wrapper.className = "work-modal-overlay";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.innerHTML = [
      '<div id="work-modal" class="work-modal" role="dialog" aria-modal="true" aria-label="Project preview">',
      '  <div class="work-modal-header">',
      '    <button id="work-modal-expand" type="button" class="work-modal-action" aria-label="Expand modal" aria-pressed="false">⤢</button>',
      "  </div>",
      '  <iframe id="work-modal-frame" title="Project preview" loading="lazy"></iframe>',
      "</div>",
    ].join("");

    document.body.appendChild(wrapper);
  }

  function initWorkModal() {
    ensureModalMarkup();

    const overlay = document.getElementById(overlayId);
    const workModal = document.getElementById(modalId);
    const frame = document.getElementById(frameId);
    const expandButton = document.getElementById(expandId);
    let lockedScrollY = 0;
    if (!overlay || !workModal || !frame || !expandButton) return;

    const lockBodyScroll = () => {
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add("modal-open");
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.classList.add("modal-open");
    };

    const unlockBodyScroll = () => {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      window.scrollTo(0, lockedScrollY);
    };

    const sendFullscreenState = (isFullscreen) => {
      frame.contentWindow?.postMessage(
        { type: "portfolio-modal-state", fullscreen: isFullscreen },
        window.location.origin
      );
    };

    const getModalUrl = (href) => {
      const url = new URL(href, window.location.href);
      url.searchParams.set("modal", "1");
      return url.toString();
    };

    const setFrameSrcIfChanged = (nextSrc) => {
      if (frame.getAttribute("src") === nextSrc) return false;
      frame.setAttribute("src", nextSrc);
      return true;
    };

    const applyIframeModalState = (isFullscreen) => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        doc.documentElement.setAttribute("data-iframe-modal", "1");
        doc.documentElement.classList.toggle("modal-fullscreen", isFullscreen);
        doc.body?.classList.add("modal-embedded");
        doc.body?.classList.toggle("modal-fullscreen", isFullscreen);
      } catch (error) {
        // Ignore cross-origin iframe access restrictions.
      }
    };

    const setFullscreenState = (isFullscreen) => {
      overlay.classList.toggle("fullscreen", isFullscreen);
      expandButton.setAttribute("aria-pressed", String(isFullscreen));
      applyIframeModalState(isFullscreen);
      sendFullscreenState(isFullscreen);
    };

    const resetFullscreen = () => {
      overlay.classList.remove("fullscreen");
      expandButton.setAttribute("aria-pressed", "false");
      sendFullscreenState(false);
    };

    const closeModal = () => {
      overlay.classList.remove("open");
      unlockBodyScroll();
      resetFullscreen();
      workModal.classList.remove("is-loading");
      window.setTimeout(() => {
        overlay.setAttribute("aria-hidden", "true");
      }, 300);
    };

    const openModal = (href) => {
      const modalUrl = getModalUrl(href);
      const shouldLoad = frame.getAttribute("src") !== modalUrl;

      overlay.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      window.requestAnimationFrame(() => {
        overlay.classList.add("open");
      });

      if (!shouldLoad) {
        frame.classList.add("is-ready");
        workModal.classList.remove("is-loading");
        sendFullscreenState(overlay.classList.contains("fullscreen"));
        return;
      }

      workModal.classList.add("is-loading");
      frame.classList.remove("is-ready");
      window.setTimeout(() => {
        setFrameSrcIfChanged(modalUrl);
      }, 60);
    };

    document.addEventListener(
      "pointerenter",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const card = target.closest(cardSelector);
        if (!card) return;

        const href = card.getAttribute("href") || card.getAttribute("data-href");
        if (!href) return;
        preloadPage(getModalUrl(href));
      },
      true
    );

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const trigger = target.closest(cardSelector);
        if (!trigger) return;

        const linkEl =
          trigger instanceof HTMLAnchorElement
            ? trigger
            : trigger.querySelector("a[href]");
        const href = linkEl?.getAttribute("href") || trigger.getAttribute("data-href");
        if (!href) return;

        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (linkEl?.target === "_blank" || trigger.getAttribute("target") === "_blank") return;

        event.preventDefault();
        event.stopPropagation();
        openModal(href);
      },
      true
    );

    expandButton.addEventListener("click", () => {
      setFullscreenState(!overlay.classList.contains("fullscreen"));
    });

    frame.addEventListener("load", () => {
      workModal.classList.remove("is-loading");
      frame.classList.add("is-ready");
      applyIframeModalState(overlay.classList.contains("fullscreen"));
      sendFullscreenState(overlay.classList.contains("fullscreen"));
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("open")) {
        closeModal();
      }
    });

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "portfolio-modal-collapse-request") return;
      if (!overlay.classList.contains("fullscreen")) return;

      setFullscreenState(false);
    });
  }

  if (window.Webflow && Array.isArray(window.Webflow)) {
    window.Webflow.push(initWorkModal);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkModal);
  } else {
    initWorkModal();
  }
})();
