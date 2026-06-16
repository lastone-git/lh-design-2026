(function () {
  document.documentElement.classList.add("lh-js");

  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function getNumber(el, key, fallback) {
    var value = parseFloat(el.dataset[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function getMotionValue(el, key, fallback) {
    var value = el.dataset[key];

    if (!value) {
      return fallback;
    }

    var parsed = parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    var unit = value.replace(String(parsed), "").trim() || "px";

    return {
      value: parsed,
      unit: unit
    };
  }

  function getInterpolatedMotionValue(start, end, progress) {
    return lerp(start.value, end.value, progress) + (end.unit || start.unit || "px");
  }

  function updateStickyHeader() {
    var header = document.querySelector("[data-lh-sticky-header]");

    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  function resetScrollMotion(el) {
    el.style.removeProperty("transform");
    el.style.removeProperty("opacity");
  }

  function updateScrollMotion() {
    var motionEls = document.querySelectorAll("[data-scroll-motion]");
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    var reduceMotion = reducedMotionQuery.matches;

    motionEls.forEach(function (el) {
      var disableBelow = getNumber(el, "disableBelow", 0);

      if (reduceMotion || (disableBelow && viewportWidth < disableBelow)) {
        resetScrollMotion(el);
        return;
      }

      var rect = el.getBoundingClientRect();
      var startVh = getNumber(el, "startVh", 0.85);
      var endVh = Math.min(getNumber(el, "endVh", 0.35) + getNumber(el, "finishEarly", 0.18), startVh - 0.05);
      var startPoint = viewportHeight * startVh;
      var endPoint = viewportHeight * endVh;
      var scrollRange = Math.max(Math.abs(startPoint - endPoint), 1);
      var progress = clamp((startPoint - rect.top) / scrollRange, 0, 1);
      var motionAt = getNumber(el, "motionAt", 0);
      var motionBy = Math.max(getNumber(el, "motionBy", 1), 0.001);
      var motionProgress = clamp((progress - motionAt) / motionBy, 0, 1);
      var xStart = getMotionValue(el, "xStart", { value: 0, unit: "px" });
      var xEnd = getMotionValue(el, "xEnd", { value: 0, unit: xStart.unit });
      var yStart = getMotionValue(el, "yStart", { value: 0, unit: "px" });
      var yEnd = getMotionValue(el, "yEnd", { value: 0, unit: yStart.unit });
      var x = lerp(xStart.value, xEnd.value, motionProgress);
      var y = lerp(yStart.value, yEnd.value, motionProgress);
      var imageMotion = el.classList.contains("lh-media-grid__motion") || el.classList.contains("lh-process__image");
      var motionDuration = getNumber(el, "settleDuration", imageMotion ? 3 : 1.1);
      var opacityDuration = getNumber(el, "opacityDuration", motionDuration);

      el.style.setProperty("--lh-motion-duration", motionDuration + "s");
      el.style.setProperty("--lh-motion-opacity-duration", opacityDuration + "s");
      el.style.transform = "translate3d(" + x + (xEnd.unit || xStart.unit || "px") + ", " + y + (yEnd.unit || yStart.unit || "px") + ", 0)";

      if (getNumber(el, "animateOpacity", 0)) {
        var appearAt = getNumber(el, "appearAt", 0);
        var appearBy = Math.max(getNumber(el, "appearBy", 0.25), 0.001);
        var opacityProgress = clamp((progress - appearAt) / appearBy, 0, 1);

        el.style.opacity = String(opacityProgress);
      } else {
        el.style.opacity = "";
      }
    });
  }

  function updatePage() {
    updateStickyHeader();
    updateScrollMotion();
  }

  var updateFrame = null;

  function requestUpdate() {
    if (updateFrame) {
      return;
    }

    updateFrame = window.requestAnimationFrame(function () {
      updateFrame = null;
      updatePage();
    });
  }

  function initHeroIntro() {
    var hero = document.querySelector("[data-lh-hero-section]");

    if (!hero) {
      return;
    }

    window.requestAnimationFrame(function () {
      hero.classList.add("is-loaded");
    });
  }

  function initMenuPreviews() {
    function normalisePath(url) {
      return url.pathname.replace(/\/+$/, "") || "/";
    }

    function isCurrentPageLink(link) {
      if (!link.href || link.getAttribute("href").charAt(0) === "#") {
        return false;
      }

      var linkUrl;

      try {
        linkUrl = new URL(link.href, window.location.href);
      } catch (error) {
        return false;
      }

      return normalisePath(linkUrl) === normalisePath(window.location);
    }

    document.querySelectorAll("[data-menu-preview]").forEach(function (menu) {
      var menuItem = menu.closest(".lh-site-header__menu-item");
      var image = menu.querySelector(".lh-site-header__submenu-preview img");
      var trigger = menuItem ? menuItem.querySelector(":scope > a[data-preview-src]") : null;
      var links = Array.prototype.slice.call(menu.querySelectorAll("[data-preview-src]"));
      var closeTimer = null;
      var compactNavQuery = window.matchMedia("(max-width: 1050px)");
      var currentPageLink = null;
      var fallbackLink = null;

      if (trigger && !links.length) {
        links.push(trigger);
      }

      if (!image || !links.length) {
        return;
      }

      function openMenu() {
        if (compactNavQuery.matches) {
          return;
        }

        window.clearTimeout(closeTimer);

        if (menuItem) {
          menuItem.classList.add("is-menu-open");
        }

        setPreview(fallbackLink);
      }

      function closeMenu() {
        if (compactNavQuery.matches) {
          return;
        }

        window.clearTimeout(closeTimer);
        setPreview(fallbackLink);

        closeTimer = window.setTimeout(function () {
          if (menuItem) {
            menuItem.classList.remove("is-menu-open");
          }
        }, 220);
      }

      function setPreview(link, suppressCurrentActive) {
        if (!link) {
          return;
        }

        var src = link.dataset.previewSrc;

        links.forEach(function (currentLink) {
          var isCurrent = currentLink === currentPageLink;

          currentLink.classList.toggle("is-active", isCurrent && !suppressCurrentActive);

          if (isCurrent) {
            currentLink.setAttribute("aria-current", "page");
          } else {
            currentLink.removeAttribute("aria-current");
          }
        });

        if (!src || image.getAttribute("src") === src) {
          return;
        }

        image.classList.add("is-changing");
        image.src = src;
      }

      image.addEventListener("load", function () {
        image.classList.remove("is-changing");
      });

      links.forEach(function (link) {
        var previewSrc = link.dataset.previewSrc;

        if (previewSrc) {
          link.style.setProperty("--lh-submenu-card-image", "url(\"" + previewSrc.replace(/"/g, "%22") + "\")");
        }

        if (isCurrentPageLink(link)) {
          currentPageLink = link;
        }

        link.addEventListener("mouseenter", function () {
          if (compactNavQuery.matches) {
            return;
          }

          openMenu();
          setPreview(link, link !== currentPageLink);
        });

        link.addEventListener("focus", function () {
          if (compactNavQuery.matches) {
            return;
          }

          openMenu();
          setPreview(link, link !== currentPageLink);
        });

        link.addEventListener("mouseleave", function () {
          if (compactNavQuery.matches) {
            return;
          }

          setPreview(fallbackLink);
        });

        link.addEventListener("blur", function () {
          if (compactNavQuery.matches) {
            return;
          }

          setPreview(fallbackLink);
        });
      });

      if (menuItem) {
        menuItem.addEventListener("mouseenter", openMenu);
        menuItem.addEventListener("mouseleave", closeMenu);
        menuItem.addEventListener("focusin", openMenu);
        menuItem.addEventListener("focusout", closeMenu);
      }

      menu.addEventListener("mouseenter", openMenu);
      menu.addEventListener("mouseleave", function () {
        setPreview(fallbackLink);
        closeMenu();
      });

      fallbackLink = currentPageLink || links[0];
      setPreview(fallbackLink);
    });
  }

  function initHeaderNavDropdown() {
    document.querySelectorAll("[data-lh-site-nav]").forEach(function (nav) {
      var toggle = nav.querySelector("[data-lh-nav-toggle]");
      var header = nav.closest("[data-lh-sticky-header]");

      if (!toggle) {
        return;
      }

      function closeSubmenus() {
        nav.querySelectorAll(".lh-site-header__menu-item.is-menu-open").forEach(function (openItem) {
          openItem.classList.remove("is-menu-open");

          var openLink = openItem.querySelector(":scope > a");

          if (openLink) {
            openLink.setAttribute("aria-expanded", "false");
          }
        });
      }

      function setOpen(open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.documentElement.classList.toggle("lh-site-nav-is-open", open);

        if (header) {
          header.classList.toggle("is-nav-open", open);
        }

        if (!open) {
          closeSubmenus();
        }
      }

      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        setOpen(!nav.classList.contains("is-open"));
      });

      nav.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      nav.querySelectorAll(".lh-site-header__menu-item.has-children > a").forEach(function (link) {
        link.setAttribute("aria-haspopup", "true");
        link.setAttribute("aria-expanded", "false");

        link.addEventListener("click", function (event) {
          var compactNav = window.matchMedia("(max-width: 1050px)").matches;
          var menuItem = link.closest(".lh-site-header__menu-item");

          if (!compactNav || !menuItem) {
            return;
          }

          event.preventDefault();

          var wasOpen = menuItem.classList.contains("is-menu-open");

          closeSubmenus();

          if (!wasOpen) {
            menuItem.classList.add("is-menu-open");
            link.setAttribute("aria-expanded", "true");

            var activeSubLink = menuItem.querySelector(".lh-site-header__submenu-list a[aria-current='page']");

            if (activeSubLink) {
              menuItem.querySelectorAll(".lh-site-header__submenu-list a").forEach(function (subLink) {
                subLink.classList.toggle("is-active", subLink === activeSubLink);
              });
            }
          }
        });
      });

      nav.querySelectorAll(".lh-site-header__submenu-list a, .lh-site-header__menu-item:not(.has-children) > a, .lh-site-header__button").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
        });
      });

      document.addEventListener("click", function () {
        setOpen(false);
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          setOpen(false);
        }
      });

      window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 1051px)").matches) {
          setOpen(false);
        }
      });
    });
  }

  function initMarquees() {
    document.querySelectorAll(".lh-marquee.is-continuous .lh-marquee__track").forEach(function (track) {
      var originalCards = Array.prototype.slice.call(track.children).filter(function (card) {
        return !card.hasAttribute("data-lh-marquee-clone");
      });

      if (!originalCards.length) {
        return;
      }

      if (!track.hasAttribute("data-lh-marquee-ready")) {
        originalCards.forEach(function (card) {
          var clone = card.cloneNode(true);

          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("data-lh-marquee-clone", "true");
          clone.tabIndex = -1;

          if (clone.matches("a")) {
            clone.setAttribute("tabindex", "-1");
          }

          clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(function (focusable) {
            focusable.setAttribute("tabindex", "-1");
          });

          track.appendChild(clone);
        });

        track.setAttribute("data-lh-marquee-ready", "true");
      }

      var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
      var distance = originalCards.reduce(function (total, card) {
        return total + card.getBoundingClientRect().width;
      }, 0) + (gap * originalCards.length);

      track.style.setProperty("--lh-marquee-offset", "-" + distance + "px");
    });
  }

  function initRoomGalleries() {
    document.querySelectorAll(".lh-room-gallery").forEach(function (gallery) {
      var originalGrid = gallery.querySelector(".lh-room-gallery__grid:not([data-lh-room-gallery-clone])");

      if (!originalGrid) {
        return;
      }

      var track = originalGrid.closest(".lh-room-gallery__track");

      if (!track) {
        var viewport = document.createElement("div");

        track = document.createElement("div");
        viewport.className = "lh-room-gallery__viewport";
        track.className = "lh-room-gallery__track";

        originalGrid.parentNode.insertBefore(viewport, originalGrid);
        viewport.appendChild(track);
        track.appendChild(originalGrid);
      }

      if (!track.querySelector("[data-lh-room-gallery-clone]")) {
        var clone = originalGrid.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-lh-room-gallery-clone", "true");
        clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(function (focusable) {
          focusable.setAttribute("tabindex", "-1");
        });

        track.appendChild(clone);
      }

      var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
      var distance = originalGrid.getBoundingClientRect().width + gap;

      track.style.setProperty("--lh-room-gallery-offset", "-" + distance + "px");
    });
  }

  function initOfficeGalleries() {
    document.querySelectorAll(".lh-office-gallery").forEach(function (gallery) {
      var originalGrid = gallery.querySelector(".lh-office-gallery__grid:not([data-lh-office-gallery-clone])");

      if (!originalGrid) {
        return;
      }

      var track = originalGrid.closest(".lh-office-gallery__track");

      if (!track) {
        var viewport = document.createElement("div");

        track = document.createElement("div");
        viewport.className = "lh-office-gallery__viewport";
        track.className = "lh-office-gallery__track";

        originalGrid.parentNode.insertBefore(viewport, originalGrid);
        viewport.appendChild(track);
        track.appendChild(originalGrid);
      }

      if (!track.querySelector("[data-lh-office-gallery-clone]")) {
        var clone = originalGrid.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-lh-office-gallery-clone", "true");
        clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(function (focusable) {
          focusable.setAttribute("tabindex", "-1");
        });

        track.appendChild(clone);
      }

      var gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap) || 0;
      var distance = originalGrid.getBoundingClientRect().width + gap;

      track.style.setProperty("--lh-office-gallery-offset", "-" + distance + "px");
    });
  }

  function initNewsFilters() {
    var filters = document.querySelector("[data-news-filters]");
    var list = document.querySelector("[data-news-list]");

    if (!filters || !list) {
      return;
    }

    var buttons = Array.prototype.slice.call(filters.querySelectorAll("[data-news-filter-button]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-news-category]"));

    if (!buttons.length || !cards.length) {
      return;
    }

    function setFilter(filter) {
      buttons.forEach(function (button) {
        var active = button.dataset.filter === filter;

        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      cards.forEach(function (card) {
        var show = "all" === filter || card.dataset.newsCategory === filter;

        card.hidden = !show;
      });

      requestUpdate();
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setFilter(button.dataset.filter || "all");
      });
    });
  }

  function initRoomLayoutTabs() {
    document.querySelectorAll("[data-lh-room-layout-tabs]").forEach(function (tabsRoot) {
      var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll("[role='tab']"));
      var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll("[role='tabpanel']"));
      var initialTab = tabs[0];

      if (!tabs.length || !panels.length) {
        return;
      }

      function getPanel(tab) {
        var href = tab.getAttribute("href") || "";
        var id = href.charAt(0) === "#" ? href.slice(1) : "";
        var panel = id ? document.getElementById(id) : null;

        return panel && tabsRoot.contains(panel) ? panel : null;
      }

      function activateTab(tab, shouldFocus) {
        if (!tab) {
          return;
        }

        tabs.forEach(function (currentTab) {
          var active = currentTab === tab;
          var panel = getPanel(currentTab);

          currentTab.classList.toggle("is-active", active);
          currentTab.setAttribute("aria-selected", active ? "true" : "false");
          currentTab.setAttribute("tabindex", active ? "0" : "-1");

          if (panel) {
            panel.hidden = !active;
            panel.classList.toggle("is-active", active);
          }
        });

        if (shouldFocus) {
          tab.focus();
        }

        requestUpdate();
      }

      tabs.forEach(function (tab, index) {
        if (tab.classList.contains("is-active")) {
          initialTab = tab;
        }

        tab.addEventListener("click", function (event) {
          event.preventDefault();
          activateTab(tab, false);
        });

        tab.addEventListener("keydown", function (event) {
          var nextIndex = index;

          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (index + 1) % tabs.length;
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
          } else {
            return;
          }

          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        });
      });

      activateTab(initialTab, false);
    });
  }

  function initConsentPreferences() {
    document.querySelectorAll("[data-lh-consent-preferences]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var revisitButton = document.querySelector(".cky-revisit-bottom-left, .cky-revisit-bottom-right, .cky-btn-revisit, [data-cky-tag='revisit-consent']");
        var cookieYesReady = Boolean(
          window.CookieYes ||
          window.ckySettings ||
          document.querySelector(".cky-consent-container, .cky-modal, .cky-preference-center, .cky-revisit-bottom-left, .cky-revisit-bottom-right")
        );

        if (cookieYesReady && link.classList.contains("cky-banner-element")) {
          return;
        }

        event.preventDefault();

        if (revisitButton && revisitButton !== link) {
          revisitButton.click();
        }
      });
    });
  }

  function getStoredValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function removeStoredValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  function getSessionStoredValue(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setSessionStoredValue(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function removeSessionStoredValue(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      return;
    }
  }

  function initCoworkingOfferPopup() {
    var popup = document.querySelector("[data-lh-coworking-offer]");

    if (!popup) {
      return;
    }

    var closeKey = "lhCoworkingOfferClosedAt";
    var submittedKey = "lhCoworkingOfferSubmitted";
    var closeButtons = Array.prototype.slice.call(popup.querySelectorAll("[data-lh-coworking-offer-close]"));
    var form = popup.querySelector("[data-lh-coworking-offer-form]");
    var firstField = popup.querySelector(".lh-coworking-offer__form input:not([type='hidden']), .lh-coworking-offer__form select, .lh-coworking-offer__form textarea, .lh-coworking-offer__form button");
    var dateInput = popup.querySelector("input[type='date']");
    var hasOpened = false;
    var closeTimer = null;

    var searchParams = window.URLSearchParams ? new URLSearchParams(window.location.search) : null;
    var offerMode = searchParams ? searchParams.get("coworking-offer") : "";
    var forcePopup = offerMode === "show";
    var resetPopup = offerMode === "reset";
    var requestSent = searchParams && searchParams.get("coworking-day") === "sent";

    if (resetPopup) {
      removeSessionStoredValue(closeKey);
      removeStoredValue(closeKey);
      removeStoredValue(submittedKey);
    }

    if (requestSent) {
      setStoredValue(submittedKey, "1");
    }

    if (!forcePopup && (requestSent || getStoredValue(submittedKey) === "1")) {
      return;
    }

    if (!forcePopup && getSessionStoredValue(closeKey) === "1") {
      return;
    }

    if (dateInput && !dateInput.min) {
      var today = new Date();

      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      dateInput.min = today.toISOString().split("T")[0];
    }

    function openPopup() {
      if (hasOpened) {
        return;
      }

      hasOpened = true;
      popup.hidden = false;
      document.documentElement.classList.add("lh-coworking-offer-is-open");

      window.requestAnimationFrame(function () {
        popup.classList.add("is-visible");
      });

      window.setTimeout(function () {
        if (firstField) {
          firstField.focus({ preventScroll: true });
        }
      }, 260);

      window.removeEventListener("scroll", checkTrigger);
    }

    function closePopup(rememberChoice) {
      window.clearTimeout(closeTimer);
      popup.classList.remove("is-visible");
      document.documentElement.classList.remove("lh-coworking-offer-is-open");

      if (rememberChoice) {
        setSessionStoredValue(closeKey, "1");
      }

      closeTimer = window.setTimeout(function () {
        popup.hidden = true;
      }, 300);
    }

    function checkTrigger() {
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      var maxScroll = Math.max(documentHeight - viewportHeight, 1);
      var scrollProgress = window.scrollY / maxScroll;

      if (window.scrollY >= 700 || scrollProgress >= 0.35) {
        openPopup();
      }
    }

    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        closePopup(true);
      });
    });

    if (form) {
      form.addEventListener("submit", function () {
        setStoredValue(submittedKey, "1");
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!popup.hidden && event.key === "Escape") {
        closePopup(true);
      }
    });

    if (forcePopup) {
      window.setTimeout(openPopup, 300);
    } else {
      window.addEventListener("scroll", checkTrigger, { passive: true });
      checkTrigger();
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () {
    initMarquees();
    initRoomGalleries();
    initOfficeGalleries();
    requestUpdate();
  }, { passive: true });

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", requestUpdate);
  } else if (reducedMotionQuery.addListener) {
    reducedMotionQuery.addListener(requestUpdate);
  }

  function initPage() {
    initHeroIntro();
    initHeaderNavDropdown();
    initMenuPreviews();
    initMarquees();
    initRoomGalleries();
    initOfficeGalleries();
    initNewsFilters();
    initRoomLayoutTabs();
    initConsentPreferences();
    initCoworkingOfferPopup();
    requestUpdate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
