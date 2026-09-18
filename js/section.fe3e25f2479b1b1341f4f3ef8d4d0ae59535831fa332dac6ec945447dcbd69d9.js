"use strict";
(() => {
  // <stdin>
  var TimelineFilter = class {
    elements;
    constructor() {
      this.elements = {
        timeline: document.getElementById("section-timeline"),
        yearFilter: document.getElementById("section-year-filter"),
        monthFilter: document.getElementById("section-month-filter"),
        noDataMessage: document.querySelector(".section__no-data")
      };
      this.init();
    }
    init() {
      if (!this.elements.yearFilter || !this.elements.monthFilter) {
        return;
      }
      this.elements.yearFilter.addEventListener("change", () => this.filterTimeline());
      this.elements.monthFilter.addEventListener("change", () => this.filterTimeline());
      this.filterTimeline();
    }
    filterTimeline() {
      if (!this.elements.timeline) {
        return;
      }
      const selectedYear = this.elements.yearFilter?.value || "";
      const selectedMonth = this.elements.monthFilter?.value || "";
      const yearSections = this.elements.timeline.querySelectorAll(".section__year-section");
      let hasVisibleContent = false;
      yearSections.forEach((yearSection) => {
        const yearLabel = yearSection.getAttribute("data-year");
        let yearHasVisibleMonths = false;
        const monthSections = yearSection.querySelectorAll(".section__month-section");
        monthSections.forEach((monthSection) => {
          const monthLabel = monthSection.getAttribute("data-month");
          const shouldShowMonth = this.shouldShowMonth(yearLabel, monthLabel, selectedYear, selectedMonth);
          if (shouldShowMonth) {
            monthSection.classList.remove("hidden");
            yearHasVisibleMonths = true;
            hasVisibleContent = true;
          } else {
            monthSection.classList.add("hidden");
          }
        });
        if (yearHasVisibleMonths) {
          yearSection.classList.remove("hidden");
        } else {
          yearSection.classList.add("hidden");
        }
      });
      if (this.elements.noDataMessage) {
        if (hasVisibleContent) {
          this.elements.noDataMessage.classList.remove("show");
        } else {
          this.elements.noDataMessage.classList.add("show");
        }
      }
    }
    shouldShowMonth(yearLabel, monthLabel, selectedYear, selectedMonth) {
      if (!selectedYear && !selectedMonth) {
        return true;
      }
      if (selectedYear && !selectedMonth) {
        return yearLabel === selectedYear;
      }
      if (!selectedYear && selectedMonth) {
        return monthLabel === selectedMonth;
      }
      if (selectedYear && selectedMonth) {
        return yearLabel === selectedYear && monthLabel === selectedMonth;
      }
      return false;
    }
  };
  window.addEventListener("load", () => {
    new TimelineFilter();
  });
})();
