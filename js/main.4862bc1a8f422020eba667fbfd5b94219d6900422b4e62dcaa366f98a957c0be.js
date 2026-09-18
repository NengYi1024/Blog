"use strict";
(() => {
  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\base\navbar.ts
  var baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content") || "/";
  function initNavbar() {
    const header = document.querySelector("header");
    if (!header) return;
    document.addEventListener("scroll", function() {
      if (window.scrollY > 0) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
    initSearch();
  }
  async function initSearch() {
    const searchBtn = document.querySelector(".navbar__search");
    const searchModal = document.getElementById("search-modal");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const closeBtn = document.querySelector(".search-modal__close");
    const overlay = document.querySelector(".search-modal__overlay");
    const header = document.querySelector("header");
    if (!searchBtn || !searchModal || !searchInput) return;
    let pagefind;
    try {
      const pagefindPath = `${baseUrl.replace(/\/$/, "")}/pagefind/pagefind.js`;
      pagefind = await import(pagefindPath);
      await pagefind.init();
    } catch (error) {
      console.error("\u8F09\u5165 Pagefind \u5931\u6557:", error);
      return;
    }
    const openSearch = () => {
      searchModal.classList.add("active");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      searchInput.focus();
    };
    const closeSearch = () => {
      searchModal.classList.remove("active");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      searchInput.value = "";
      if (searchResults) searchResults.innerHTML = "";
    };
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openSearch();
    });
    closeBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      closeSearch();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    });
    let searchTimeout;
    const spinner = document.getElementById("search-loading");
    searchInput.addEventListener("input", async (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;
      if (!query || query.length < 2) {
        if (searchResults) searchResults.innerHTML = "";
        if (spinner) spinner.classList.remove("active");
        return;
      }
      searchTimeout = setTimeout(async () => {
        try {
          if (spinner) spinner.classList.add("active");
          const results = await pagefind.search(query);
          displayResults(results);
        } catch (error) {
          console.error("\u641C\u5C0B\u932F\u8AA4:", error);
          if (spinner) spinner.classList.remove("active");
          if (searchResults) searchResults.innerHTML = '<p class="search-modal__error">\u641C\u5C0B\u5931\u6557</p>';
        }
      }, 300);
    });
    async function displayResults(results) {
      if (spinner) spinner.classList.remove("active");
      if (!results.results || results.results.length === 0) {
        if (searchResults) searchResults.innerHTML = '<p class="search-modal__no-results">\u627E\u4E0D\u5230\u7D50\u679C</p>';
        return;
      }
      let totalSubResults = 0;
      const resultElements = await Promise.all(
        results.results.slice(0, 10).map(async (result) => {
          const data = await result.data();
          const title = data.meta?.title || "\u672A\u547D\u540D";
          const subResults = data.sub_results || [];
          totalSubResults += subResults.length;
          const subResultsHtml = subResults.map(
            (sub) => `
          <a href="${sub.url}" class="search-modal__sub-result">
            <div class="search-modal__sub-result-title">${sub.title}</div>
            ${sub.excerpt ? `<div class="search-modal__sub-result-excerpt">${sub.excerpt}</div>` : ""}
          </a>
        `
          ).join("");
          return `
          <div class="search-modal__result">
            <div class="search-modal__result-title">${title}</div>
            ${subResultsHtml ? `<div class="search-modal__sub-results">${subResultsHtml}</div>` : ""}
          </div>
        `;
        })
      );
      const articleCount = results.results.length;
      const stats = `<div class="search-modal__stats">\u627E\u5230 <span class="search-modal__stats-article">${articleCount}</span> \u7BC7\u6587\u7AE0\uFF0C<span class="search-modal__stats-result">${totalSubResults}</span> \u500B\u641C\u5C0B\u7D50\u679C</div>`;
      if (searchResults) searchResults.innerHTML = stats + resultElements.join("");
      document.querySelectorAll(".search-modal__sub-result").forEach((link) => {
        link.addEventListener("click", closeSearch);
      });
    }
  }

  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\base\blog-setting.ts
  var DEFAULT_FONT_SIZE = "16";
  function initBlogSetting() {
    const settingsToggle = document.getElementById("settings-toggle");
    const settingPanel = document.getElementById("setting-panel");
    const tocToggle = document.getElementById("toc-toggle");
    const tocPanel = document.getElementById("toc-panel");
    const themeToggle = document.getElementById("theme-toggle");
    const fontSizeToggle = document.getElementById("font-size-toggle");
    const fullscreenToggle = document.getElementById("fullscreen-toggle");
    const scrollToTop = document.getElementById("scroll-to-top");
    const scrollToTopItem = document.getElementById("scroll-to-top-item");
    const advancedPanel = document.getElementById("advanced-panel");
    const advancedPanelClose = document.getElementById("advanced-panel-close");
    const resetButton = document.getElementById("reset-advanced");
    const fontSizeInput = document.getElementById("font-size-input");
    const lineHeightInput = document.getElementById("line-height-input");
    const fontSizeValue = document.getElementById("font-size-value");
    const lineHeightValue = document.getElementById("line-height-value");
    if (settingsToggle) {
      settingsToggle.addEventListener("click", function() {
        if (settingPanel) {
          settingPanel.style.display = settingPanel.style.display === "none" ? "flex" : "none";
        }
      });
    }
    if (tocToggle && tocPanel) {
      tocToggle.addEventListener("click", function() {
        tocPanel.style.display = tocPanel.style.display === "none" ? "block" : "none";
      });
    }
    function syncTocVisibility() {
      const desktopToc = document.getElementById("articles-toc-desktop");
      const tocPanel2 = document.getElementById("toc-panel");
      const mobileTocs = document.querySelectorAll("#articles-toc-mobile");
      if (desktopToc) {
        if (getComputedStyle(desktopToc).display !== "none") {
          if (tocPanel2) tocPanel2.style.display = "none";
          mobileTocs.forEach((toc) => {
            toc.style.display = "none";
          });
        } else {
          mobileTocs.forEach((toc) => {
            toc.style.display = "";
          });
        }
      }
    }
    syncTocVisibility();
    window.addEventListener("resize", syncTocVisibility);
    if (themeToggle) {
      themeToggle.addEventListener("click", function() {
        document.documentElement.setAttribute(
          "data-theme",
          document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
        );
        localStorage.setItem("theme", document.documentElement.getAttribute("data-theme") || "");
      });
    }
    if (fontSizeToggle) {
      fontSizeToggle.addEventListener("click", function() {
        if (advancedPanel) {
          advancedPanel.style.display = advancedPanel.style.display === "none" ? "block" : "none";
        }
      });
    }
    if (advancedPanelClose) {
      advancedPanelClose.addEventListener("click", function() {
        if (advancedPanel) {
          advancedPanel.style.display = "none";
        }
      });
    }
    if (resetButton) {
      resetButton.addEventListener("click", function() {
        document.documentElement.style.fontSize = DEFAULT_FONT_SIZE + "px";
        localStorage.removeItem("fontSize");
        if (fontSizeInput) {
          fontSizeInput.value = DEFAULT_FONT_SIZE;
        }
        if (fontSizeValue) {
          fontSizeValue.textContent = DEFAULT_FONT_SIZE + "px";
        }
      });
    }
    if (fontSizeInput) {
      fontSizeInput.addEventListener("input", function() {
        const size = this.value;
        document.documentElement.style.fontSize = size + "px";
        if (fontSizeValue) {
          fontSizeValue.textContent = size + "px";
        }
        localStorage.setItem("fontSize", size);
      });
    }
    window.addEventListener("scroll", function() {
      if (scrollToTopItem) {
        if (window.scrollY > 100) {
          scrollToTopItem.style.display = "flex";
        } else {
          scrollToTopItem.style.display = "none";
        }
      }
    });
    if (scrollToTop) {
      scrollToTop.addEventListener("click", function() {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener("click", function() {
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          }
          fullscreenToggle.classList.remove("fullscreen-active");
        } else {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
          }
          fullscreenToggle.classList.add("fullscreen-active");
        }
      });
      document.addEventListener("fullscreenchange", function() {
        if (document.fullscreenElement) {
          fullscreenToggle.classList.add("fullscreen-active");
        } else {
          fullscreenToggle.classList.remove("fullscreen-active");
        }
      });
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize && fontSizeInput) {
      document.documentElement.style.fontSize = savedFontSize + "px";
      fontSizeInput.value = savedFontSize;
      if (fontSizeValue) {
        fontSizeValue.textContent = savedFontSize + "px";
      }
    }
  }

  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initBlogSetting();
  });
})();
