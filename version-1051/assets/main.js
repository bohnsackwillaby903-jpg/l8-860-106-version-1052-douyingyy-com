(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === currentSlide);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var modal = document.querySelector("[data-search-modal]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var openButtons = Array.prototype.slice.call(document.querySelectorAll("[data-open-search]"));
    var closeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-close-search]"));

    function renderResults(keyword) {
      if (!results) {
        return;
      }
      var query = String(keyword || "").trim().toLowerCase();
      var entries = window.movieSearchIndex || [];
      var matches = entries.filter(function (item) {
        var text = [item.title, item.meta, item.tags].join(" ").toLowerCase();
        return !query || text.indexOf(query) >= 0;
      }).slice(0, 18);

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">未找到相关影片</div>';
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return '<a class="search-item" href="' + escapeHtml(item.link) + '">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span>' +
          '</a>';
      }).join("");
    }

    function openSearch() {
      if (!modal) {
        return;
      }
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("search-open");
      renderResults(input ? input.value : "");
      window.setTimeout(function () {
        if (input) {
          input.focus();
        }
      }, 30);
    }

    function closeSearch() {
      if (!modal) {
        return;
      }
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("search-open");
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openSearch);
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    if (input) {
      input.addEventListener("input", function () {
        renderResults(input.value);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });
  });
})();
