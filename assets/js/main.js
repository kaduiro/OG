(function () {
  var body = document.body;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktopQuery = window.matchMedia("(min-width: 981px)");

  if (!prefersReducedMotion) {
    body.classList.add("motion-enabled");
  }

  function markReady() {
    body.classList.add("is-ready");
  }

  markReady();
  window.setTimeout(markReady, 80);

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      markReady();
    });
  });

  var header = document.querySelector(".lp-header");
  var toggle = document.querySelector(".lp-header__toggle");
  var nav = document.querySelector(".lp-header__nav");

  if (header && toggle && nav) {
    function syncMobileHeaderControl() {
      var viewportWidth = Math.min(
        window.innerWidth || 9999,
        document.documentElement.clientWidth || 9999,
        window.visualViewport ? window.visualViewport.width : 9999
      );

      if (viewportWidth <= 980) {
        toggle.style.display = "flex";
        toggle.style.position = "fixed";
        toggle.style.top = "0";
        toggle.style.right = "0";
        toggle.style.zIndex = "100";
      } else {
        toggle.removeAttribute("style");
      }
    }

    syncMobileHeaderControl();
    window.addEventListener("resize", syncMobileHeaderControl);

    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("is-locked", isOpen);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName !== "A") {
        return;
      }

      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    });

    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }, { passive: true });
  }

  var motionTargets = document.querySelectorAll("[data-motion]:not([data-motion='hero'])");
  var newsItems = document.querySelectorAll(".news__item[data-motion='item']");

  newsItems.forEach(function (item, index) {
    item.style.setProperty("--motion-delay", String(index * 70) + "ms");
  });

  function isInViewport(target) {
    var rect = target.getBoundingClientRect();

    return rect.bottom > window.innerHeight * 0.08 && rect.top < window.innerHeight * 0.9;
  }

  function revealMotionTarget(target, observer) {
    target.classList.add("is-visible");

    if (observer) {
      observer.unobserve(target);
    }
  }

  function revealVisibleMotionTargets(observer) {
    motionTargets.forEach(function (target) {
      if (!target.classList.contains("is-visible") && isInViewport(target)) {
        revealMotionTarget(target, observer);
      }
    });
  }

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealMotionTarget(entry.target, observer);
        }
      });
    }, {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12
    });

    motionTargets.forEach(function (target) {
      observer.observe(target);
    });

    revealVisibleMotionTargets(observer);
    window.addEventListener("load", function () {
      revealVisibleMotionTargets(observer);
    }, { once: true });
    window.addEventListener("hashchange", function () {
      revealVisibleMotionTargets(observer);
    });
    window.addEventListener("scroll", function () {
      window.requestAnimationFrame(function () {
        revealVisibleMotionTargets(observer);
      });
    }, { passive: true });
    window.setTimeout(function () {
      revealVisibleMotionTargets(observer);
    }, 160);
  } else {
    motionTargets.forEach(function (target) {
      target.classList.add("is-visible");
    });
  }

  var results = [
    {
      number: "01",
      image: "assets/img/result-bridge.jpg",
      peek: "assets/img/result-solar.jpg",
      alt: "レインボーブリッジの施工実績写真",
      title: "レインボーブリッジ",
      place: "施工地：東京都"
    },
    {
      number: "02",
      image: "assets/img/result-solar.jpg",
      peek: "assets/img/result-tower.jpg",
      alt: "太陽光パネルのある公共施設の施工実績写真",
      title: "公共施設改修",
      place: "施工地：埼玉県"
    },
    {
      number: "03",
      image: "assets/img/result-tower.jpg",
      peek: "assets/img/result-coast.jpg",
      alt: "高層集合住宅の施工実績写真",
      title: "レジデンス・ザ・武蔵小杉",
      place: "施工地：神奈川県"
    },
    {
      number: "04",
      image: "assets/img/result-coast.jpg",
      peek: "assets/img/result-bridge.jpg",
      alt: "海岸災害復旧の施工実績写真",
      title: "金浜地区海岸災害復旧",
      place: "施工地：岩手県"
    }
  ];

  var current = 0;
  var resultStage = document.querySelector(".result__stage");
  var number = document.querySelector("[data-result-number]");
  var image = document.querySelector("[data-result-image]");
  var peek = document.querySelector("[data-result-peek]");
  var title = document.querySelector("[data-result-title]");
  var place = document.querySelector("[data-result-place]");
  var nextButtons = document.querySelectorAll("[data-result-next]");
  var prevButton = document.querySelector("[data-result-prev]");
  var autoTimer = null;
  var resultIsVisible = true;

  function renderResult(index) {
    var item = results[index];

    if (!item || !number || !image || !peek || !title || !place) {
      return;
    }

    number.textContent = item.number;
    image.src = item.image;
    image.alt = item.alt;
    peek.src = item.peek;
    title.textContent = item.title;
    place.textContent = item.place;
  }

  function moveResult(direction) {
    current = (current + direction + results.length) % results.length;

    if (resultStage && !prefersReducedMotion) {
      resultStage.classList.remove("is-swapping");
      void resultStage.offsetWidth;
      resultStage.classList.add("is-swapping");
      window.setTimeout(function () {
        resultStage.classList.remove("is-swapping");
      }, 680);
    }

    renderResult(current);
  }

  function stopAutoResult() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startAutoResult() {
    if (prefersReducedMotion || autoTimer || !resultIsVisible) {
      return;
    }

    autoTimer = window.setInterval(function () {
      moveResult(1);
    }, 5200);
  }

  nextButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      stopAutoResult();
      moveResult(1);
      startAutoResult();
    });
  });

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      stopAutoResult();
      moveResult(-1);
      startAutoResult();
    });
  }

  if (resultStage) {
    resultStage.addEventListener("mouseenter", stopAutoResult);
    resultStage.addEventListener("mouseleave", startAutoResult);
    resultStage.addEventListener("focusin", stopAutoResult);
    resultStage.addEventListener("focusout", startAutoResult);

    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      var resultObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          resultIsVisible = entry.isIntersecting;

          if (resultIsVisible) {
            startAutoResult();
          } else {
            stopAutoResult();
          }
        });
      }, { threshold: 0.35 });

      resultObserver.observe(resultStage);
    } else {
      startAutoResult();
    }
  }

  var contentRows = document.querySelectorAll("[data-motion='content-row']");
  var ticking = false;

  function updateParallax() {
    ticking = false;

    if (prefersReducedMotion || !desktopQuery.matches) {
      contentRows.forEach(function (row) {
        row.style.setProperty("--parallax-y", "0px");
      });
      return;
    }

    var viewportCenter = window.innerHeight / 2;

    contentRows.forEach(function (row) {
      var rect = row.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }

      var rowCenter = rect.top + rect.height / 2;
      var offset = Math.max(-16, Math.min(16, (viewportCenter - rowCenter) * 0.028));
      row.style.setProperty("--parallax-y", offset.toFixed(2) + "px");
    });
  }

  function requestParallax() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  if (contentRows.length) {
    updateParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
  }
})();
