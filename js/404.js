"use strict";
(() => {
  // <stdin>
  var init404 = () => {
    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content") || "/";
    const islandIcon = document.querySelector(".error-page__island-icon");
    const errorPage = document.querySelector(".error-page");
    if (islandIcon) {
      islandIcon.addEventListener("touchstart", () => {
        islandIcon.style.transform = "scale(0.95)";
      });
      islandIcon.addEventListener("touchend", () => {
        islandIcon.style.transform = "scale(1)";
      });
    }
    document.querySelectorAll("[data-wave-url]").forEach((el) => {
      const htmlEl = el;
      const waveUrl = htmlEl.getAttribute("data-wave-url");
      if (waveUrl) {
        htmlEl.style.backgroundImage = `url(${waveUrl})`;
      }
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init404);
  } else {
    init404();
  }
})();
