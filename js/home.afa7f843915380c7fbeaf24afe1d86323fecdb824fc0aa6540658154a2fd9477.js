"use strict";
(() => {
  // <stdin>
  var initPaginator = () => {
    const pageInput = document.getElementById("page-input");
    if (!pageInput) return;
    pageInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        const page = parseInt(this.value);
        const totalPages = parseInt(document.querySelector(".paginator__total")?.textContent || "1");
        const currentPage = parseInt(document.querySelector(".paginator__info")?.getAttribute("data-current") || this.value);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content") || "/";
          const url = page === 1 ? baseUrl : baseUrl + "page/" + page + "/";
          window.location.href = url;
        }
      }
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPaginator);
  } else {
    initPaginator();
  }
})();
