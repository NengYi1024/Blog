"use strict";
(() => {
  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\components\articles-toc.ts
  var ArticlesToc = class {
    postContent;
    tocDesktop;
    tocDesktopContent;
    tocMobileContainers = [];
    tocMobileContents = [];
    headings = [];
    toc = [];
    constructor() {
      this.postContent = document.querySelector(".page__content");
      this.tocDesktop = document.getElementById("articles-toc-desktop");
      this.tocDesktopContent = document.getElementById("articles-toc-desktop-content");
      const allMobileContainers = document.querySelectorAll("#articles-toc-mobile");
      this.tocMobileContainers = Array.from(allMobileContainers);
      const allMobileContents = document.querySelectorAll("#articles-toc-mobile-content");
      this.tocMobileContents = Array.from(allMobileContents);
    }
    /**
     * 初始化 TOC
     */
    init() {
      if (!this.postContent) return;
      this.extractHeadings();
      if (this.toc.length === 0) {
        this.hideTocElements();
        return;
      }
      const tocHtml = this.generateTocHtml();
      this.renderDesktopToc(tocHtml);
      this.renderMobileToc(tocHtml);
      this.initEventListeners();
      this.updateActiveHeading();
      this.initScrollListener();
    }
    /**
     * 提取標題
     */
    extractHeadings() {
      if (!this.postContent) return;
      this.headings = Array.from(
        this.postContent.querySelectorAll("h2, h3")
      );
      this.toc = this.headings.map((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        const text = heading.textContent || "";
        const id = heading.id || `heading-${index}`;
        heading.id = id;
        return { level, text, id };
      });
    }
    /**
     * 隱藏 TOC 相關元素
     */
    hideTocElements() {
      if (this.tocDesktop) this.tocDesktop.style.display = "none";
      this.tocMobileContainers.forEach((container) => {
        container.style.display = "none";
      });
    }
    /**
     * 生成目錄 HTML
     */
    generateTocHtml() {
      if (this.toc.length === 0) return "";
      let html = "<ol>";
      let currentLevel = this.toc[0].level;
      const minLevel = currentLevel;
      this.toc.forEach((item) => {
        if (item.level > currentLevel) {
          html += "<ol>";
          currentLevel = item.level;
        } else if (item.level < currentLevel) {
          html += "</ol>".repeat(currentLevel - item.level);
          currentLevel = item.level;
        }
        html += `<li class="toc-level-${item.level}"><span class="toc-number"></span><a href="#${item.id}">${item.text}</a></li>`;
      });
      html += "</ol>".repeat(currentLevel - minLevel);
      html += "</ol>";
      return html;
    }
    /**
     * 渲染桌面版 TOC
     */
    renderDesktopToc(tocHtml) {
      if (!this.tocDesktopContent) return;
      this.tocDesktopContent.innerHTML = tocHtml;
      this.hideNestedLists(this.tocDesktopContent);
    }
    /**
     * 渲染手機版 TOC
     */
    renderMobileToc(tocHtml) {
      this.tocMobileContents.forEach((content) => {
        content.innerHTML = tocHtml;
        this.hideNestedLists(content);
      });
    }
    /**
     * 隱藏嵌套列表
     */
    hideNestedLists(container) {
      const allOls = container.querySelectorAll("ol");
      const firstOl = container.querySelector("ol");
      allOls.forEach((ol) => {
        if (ol !== firstOl) {
          ol.style.display = "none";
        }
      });
    }
    /**
     * 初始化事件監聽
     */
    initEventListeners() {
      const allTocLinks = document.querySelectorAll(
        "#articles-toc-desktop-content a, #articles-toc-mobile-content a"
      );
      allTocLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const targetId = link.getAttribute("href")?.slice(1);
          if (!targetId) return;
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            const offset = 150;
            const targetPos = targetElement.offsetTop - offset;
            window.scrollTo({ top: targetPos, behavior: "smooth" });
            allTocLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      });
    }
    /**
     * 更新活跃標題
     */
    updateActiveHeading() {
      const scrollPos = window.scrollY + 200;
      let activeId = null;
      for (let i = 0; i < this.headings.length; i++) {
        if (this.headings[i].offsetTop > scrollPos) {
          activeId = i > 0 ? this.headings[i - 1].id : this.headings[0].id;
          break;
        }
      }
      if (!activeId && this.headings.length > 0) {
        activeId = this.headings[this.headings.length - 1].id;
      }
      if (this.tocDesktopContent) {
        this.hideNestedLists(this.tocDesktopContent);
      }
      this.tocMobileContents.forEach((content) => {
        this.hideNestedLists(content);
      });
      if (activeId) {
        this.expandActivePath(activeId);
      }
      const allTocLinks = document.querySelectorAll(
        "#articles-toc-desktop-content a, #articles-toc-mobile-content a"
      );
      allTocLinks.forEach((link) => {
        link.classList.remove("active");
        if (activeId && link.getAttribute("href") === `#${activeId}`) {
          link.classList.add("active");
          if (window.innerWidth >= 1024 && this.tocDesktopContent) {
            const tocLink = link;
            if (tocLink.offsetParent) {
              const parent = this.tocDesktopContent.closest(".articles-toc");
              if (parent) {
                parent.scrollTop = tocLink.offsetTop - parent.offsetTop - 100;
              }
            }
          }
        }
      });
    }
    /**
     * 展開活跃路徑
     */
    expandActivePath(activeId) {
      const allTocLinks = document.querySelectorAll(
        "#articles-toc-desktop-content a, #articles-toc-mobile-content a"
      );
      if (this.tocDesktopContent) {
        const activeLink = Array.from(allTocLinks).find(
          (link) => link.getAttribute("href") === `#${activeId}` && this.tocDesktopContent.contains(link)
        );
        if (activeLink) {
          this.expandAncestorsAndChildren(activeLink);
        }
      }
      this.tocMobileContents.forEach((mobileContent) => {
        const mobileActiveLink = Array.from(allTocLinks).find(
          (link) => link.getAttribute("href") === `#${activeId}` && mobileContent.contains(link)
        );
        if (mobileActiveLink) {
          this.expandAncestorsAndChildren(mobileActiveLink);
        }
      });
    }
    /**
     * 展開活跃項及其祖先和子列表
     */
    expandAncestorsAndChildren(link) {
      const activeLi = link.closest("li");
      if (!activeLi) return;
      activeLi.querySelectorAll("ol").forEach((ol) => {
        ol.style.display = "block";
      });
      let current = activeLi.parentElement;
      while (current) {
        if (current.tagName === "OL") {
          current.style.display = "block";
          current = current.parentElement;
        } else if (current.tagName === "LI") {
          current = current.parentElement;
        } else {
          break;
        }
      }
    }
    /**
     * 初始化滾動監聽
     */
    initScrollListener() {
      let isScrolling = false;
      window.addEventListener(
        "scroll",
        () => {
          if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
              this.updateActiveHeading();
              isScrolling = false;
            });
          }
        },
        { passive: true }
      );
    }
  };

  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\shortcodes\tabs.ts
  var initTabs = () => {
    document.querySelectorAll(".tabs").forEach((container) => {
      if (container.classList.contains("tabs--initialized")) return;
      const nav = container.querySelector(".tabs__nav");
      const contents = container.querySelectorAll(".tabs__contents > .tabs__content");
      const tabGroup = container.dataset.tabGroup;
      const activeIdx = parseInt(container.dataset.activeTab || "0");
      contents.forEach((content, idx) => {
        const title = content.getAttribute("data-tab-title");
        const activeClass = idx === activeIdx ? " tabs__tab--active" : "";
        const button = document.createElement("button");
        button.className = `tabs__tab${activeClass}`;
        button.dataset.tabIndex = String(idx);
        button.textContent = title || "";
        button.type = "button";
        button.addEventListener("click", () => switchTab(button, tabGroup));
        nav?.appendChild(button);
        if (idx === activeIdx) {
          content.classList.add("tabs__content--active");
        } else {
          content.classList.remove("tabs__content--active");
        }
      });
      const scrollTopBtn = container.querySelector("[data-scroll-to-top]");
      if (scrollTopBtn) {
        scrollTopBtn.addEventListener("click", () => scrollToTop(scrollTopBtn));
      }
      container.classList.add("tabs--initialized");
    });
  };
  var switchTab = (button, tabGroup) => {
    const tabIndex = parseInt(button.dataset.tabIndex || "0");
    const container = button.closest(".tabs");
    container?.querySelectorAll(".tabs__tab").forEach((t) => t.classList.remove("tabs__tab--active"));
    button.classList.add("tabs__tab--active");
    const contents = container?.querySelectorAll(".tabs__contents > .tabs__content");
    contents?.forEach((content, idx) => {
      if (idx === tabIndex) {
        content.classList.add("tabs__content--active");
      } else {
        content.classList.remove("tabs__content--active");
      }
    });
  };
  var scrollToTop = (button) => {
    const container = button.closest(".tabs");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\shortcodes\mermaid.ts
  var initMermaid = async () => {
    try {
      const mermaidWrappers = document.querySelectorAll(".mermaid-shortcode");
      if (mermaidWrappers.length === 0) return;
      const baseUrl2 = document.querySelector('meta[name="base-url"]')?.getAttribute("content") || "/";
      const mermaidModule = await import(baseUrl2 + "js/mermaid/mermaid.esm.mjs");
      const mermaid = mermaidModule.default;
      mermaid.initialize({
        startOnLoad: true,
        theme: "forest"
      });
      await mermaid.run();
      document.querySelectorAll(".mermaid-shortcode__loader").forEach((loader) => {
        loader.classList.add("hidden");
      });
    } catch (error) {
      console.error("Mermaid initialization failed:", error);
      document.querySelectorAll(".mermaid-shortcode__loader").forEach((loader) => {
        loader.classList.add("hidden");
      });
    }
  };

  // ns-hugo-imp:C:\Users\lo146\Desktop\new\YienBlog\themes\yien\assets\js\components\comments.ts
  function initComments() {
    const wrapper = document.getElementById("comments-wrapper");
    if (!wrapper) return;
    const giscusEnable = wrapper.getAttribute("data-giscus-enable") === "true";
    if (!giscusEnable) {
      wrapper.style.display = "none";
      return;
    }
    const giscusContainer = document.getElementById("giscus-comments");
    if (giscusContainer) initGiscus(giscusContainer);
  }
  function initGiscus(container) {
    const repo = container.getAttribute("data-repo");
    const repoId = container.getAttribute("data-repo-id");
    if (!repo || !repoId) {
      console.warn("Giscus configuration is incomplete");
      return;
    }
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", "\u90E8\u843D\u683C\u7559\u8A00\u677F");
    script.setAttribute("data-category-id", "DIC_kwDOTqDPls4DCcXL");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "0");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", "zh-TW");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
    container.appendChild(script);
  }
  document.addEventListener("DOMContentLoaded", initComments);

  // <stdin>
  var baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute("content") || "/";
  var downloadDebugInfo = () => {
    const codeBlocks = document.querySelectorAll(".code-block");
    const debugInfo = [];
    codeBlocks.forEach((block, index) => {
      const preElement = block.querySelector("pre");
      const codeElement = block.querySelector("code");
      const lineNumbersRows = block.querySelector(".line-numbers-rows");
      const figureStyle = window.getComputedStyle(block);
      const preStyle = preElement ? window.getComputedStyle(preElement) : null;
      const lineNumbersStyle = lineNumbersRows ? window.getComputedStyle(lineNumbersRows) : null;
      debugInfo.push({
        index: index + 1,
        figure: {
          html: block.outerHTML.substring(0, 500),
          position: figureStyle.position,
          overflow: figureStyle.overflow,
          display: figureStyle.display
        },
        pre: preElement ? {
          html: preElement.outerHTML.substring(0, 500),
          position: preStyle?.position,
          overflow: preStyle?.overflow,
          display: preStyle?.display,
          offsetParent: preElement.offsetParent?.tagName || "null"
        } : null,
        code: codeElement ? {
          className: codeElement.className
        } : null,
        lineNumbersRows: lineNumbersRows ? {
          html: lineNumbersRows.outerHTML.substring(0, 300),
          position: lineNumbersStyle?.position,
          top: lineNumbersStyle?.top,
          left: lineNumbersStyle?.left,
          width: lineNumbersStyle?.width,
          display: lineNumbersStyle?.display,
          zIndex: lineNumbersStyle?.zIndex
        } : null
      });
    });
    const jsonStr = JSON.stringify(debugInfo, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-codeblock-${(/* @__PURE__ */ new Date()).getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  window.downloadDebugInfo = downloadDebugInfo;
  var loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };
  var getAvailableLanguages = async (baseUrl2) => {
    try {
      const response = await fetch(baseUrl2 + "js/prism/prism-languages.json");
      const languages = await response.json();
      return new Set(languages);
    } catch {
      return /* @__PURE__ */ new Set();
    }
  };
  var scanCodeLanguages = (availableLanguages) => {
    const languagesToLoad = /* @__PURE__ */ new Map();
    const codeBlocks = document.querySelectorAll('code[class*="language-"]');
    codeBlocks.forEach((code) => {
      const match = code.className.match(/language-(\w+(?:-\w+)?)/);
      if (!match) return;
      const lang = match[1];
      code.dataset.originalLang = lang;
      if (!availableLanguages.has(lang)) {
        code.className = code.className.replace(/language-[\w-]+/, "language-default");
        languagesToLoad.set("default", true);
      } else {
        languagesToLoad.set(lang, true);
      }
    });
    return languagesToLoad;
  };
  var loadLanguages = (languages, baseUrl2) => {
    const promises = Array.from(languages.keys()).map(
      (lang) => loadScript(baseUrl2 + `js/prism/prism-components/prism-${lang}.min.js`).catch(() => {
      })
    );
    return Promise.all(promises);
  };
  var initPrism = async () => {
    const [availableLanguages] = await Promise.all([
      getAvailableLanguages(baseUrl),
      loadScript(baseUrl + "js/prism/prism.js")
    ]);
    const languagesToLoad = scanCodeLanguages(availableLanguages);
    await loadLanguages(languagesToLoad, baseUrl);
    await loadScript(baseUrl + "js/prism/prism-line-numbers.min.js");
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }
    initCodeCopy();
  };
  var initCodeCopy = () => {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".code-block__copy-btn");
      if (!btn) return;
      const codeBlock = btn.closest(".code-block");
      const codeElement = codeBlock?.querySelector("code");
      if (!codeElement) return;
      const code = codeElement.textContent || "";
      try {
        await navigator.clipboard.writeText(code);
        showCopySuccess(btn);
      } catch {
        fallbackCopy(code);
        showCopySuccess(btn);
      }
    });
  };
  var showCopySuccess = (btn) => {
    const tools = btn.closest(".code-block__tools");
    const notice = tools?.querySelector(".code-block__copy-notice");
    if (!notice) return;
    notice.style.opacity = "1";
    setTimeout(() => {
      notice.style.opacity = "0";
    }, 2e3);
  };
  var fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };
  var initPhotoSwipe = async () => {
    try {
      const contentEl = document.querySelector(".page__content");
      if (!contentEl || !contentEl.querySelector(".pswp-gallery-item")) return;
      await loadScript(baseUrl + "js/photoswipe/photoswipe.umd.min.js");
      await loadScript(baseUrl + "js/photoswipe/photoswipe-lightbox.umd.min.js");
      const PhotoSwipeLightbox = window.PhotoSwipeLightbox;
      const PhotoSwipe = window.PhotoSwipe;
      if (PhotoSwipeLightbox && PhotoSwipe) {
        const lightbox = new PhotoSwipeLightbox({
          gallery: ".page__content",
          // 直接指定我們在 Hugo 裡幫 A 標籤設定的 class
          children: "a.pswp-gallery-item",
          pswpModule: PhotoSwipe
        });
        lightbox.init();
      }
    } catch (error) {
      console.error("PhotoSwipe initialization failed:", error);
    }
  };
  var shortcodeInitMap = {
    tabs: initTabs,
    mermaid: initMermaid
  };
  var initPage = async () => {
    const tasks = [];
    const usedShortcodes = /* @__PURE__ */ new Set();
    document.querySelectorAll("[data-shortcode]").forEach((el) => {
      const type = el.getAttribute("data-shortcode");
      if (type) usedShortcodes.add(type);
    });
    usedShortcodes.forEach((type) => {
      const initFn = shortcodeInitMap[type];
      if (!initFn) return;
      const result = initFn();
      if (result instanceof Promise) {
        tasks.push(result.catch((e) => console.warn(`${type} init failed:`, e)));
      }
    });
    if (document.querySelector('code[class*="language-"]')) {
      tasks.push(initPrism().catch((e) => console.warn("Prism init failed:", e)));
    }
    if (document.querySelector(".page__content img")) {
      tasks.push(initPhotoSwipe().catch((e) => console.warn("PhotoSwipe init failed:", e)));
    }
    await Promise.allSettled(tasks);
    initComments();
    const toc = new ArticlesToc();
    toc.init();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
