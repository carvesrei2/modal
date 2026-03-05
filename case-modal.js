(function () {
  if (window.__portfolioCaseModalInitialized) return;
  window.__portfolioCaseModalInitialized = true;

  const config = window.PortfolioCaseModalConfig || {};
  const collapseSelector =
    config.collapseSelector || "[data-modal-collapse-trigger], .navigation-link[href='/']";

  function initCaseModalMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("modal") !== "1") return;
    if (window.self === window.top) return;

    document.documentElement.setAttribute("data-iframe-modal", "1");

    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "portfolio-modal-state") return;

      document.documentElement.classList.toggle(
        "modal-fullscreen",
        Boolean(event.data.fullscreen)
      );
    });

    const collapseTrigger = document.querySelector(collapseSelector);
    if (!collapseTrigger) return;

    collapseTrigger.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage(
          { type: "portfolio-modal-collapse-request" },
          window.location.origin
        );
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCaseModalMode);
  } else {
    initCaseModalMode();
  }
})();
