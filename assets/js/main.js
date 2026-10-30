/* Shelfie — site motion. GSAP 3 + ScrollTrigger + Lenis + SplitType, all vendored.
   Degrades gracefully: no JS / reduced motion = static, fully readable page. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasLibs = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById("site-nav");
  function onScrollNav() { if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24); }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var menuBtn = document.getElementById("menu-btn");
  var menu = document.getElementById("mobile-menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; });
    });
  }
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.indexOf("#") === 0) return;
    var clean = href.replace(/index\.html$/, "");
    if (clean === path || (clean !== "/" && path.indexOf(clean) === 0)) a.setAttribute("aria-current", "page");
  });

  /* ---------- theme switcher (works without GSAP) ---------- */
  var themeTabs = document.querySelectorAll(".theme-tabs button");
  var themePhones = document.querySelectorAll(".theme-stage .phone");
  themeTabs.forEach(function (b) {
    b.addEventListener("click", function () {
      themeTabs.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
      b.setAttribute("aria-selected", "true");
      var t = b.getAttribute("data-theme");
      themePhones.forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-theme") === t); });
    });
  });

  /* ---------- mailto forms ---------- */
  var form = document.getElementById("support-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var to = form.getAttribute("data-to") || "support@shelfie-app.ca";
      var subject = "[Shelfie] " + (fd.get("topic") || "Support request");
      var body = "Name: " + fd.get("name") + "\nEmail: " + fd.get("email") + "\nDevice: " + (fd.get("device") || "") + "\n\n" + fd.get("message");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var ok = document.getElementById("form-ok"); if (ok) ok.hidden = false;
    });
  }
  document.querySelectorAll("form.capture").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value;
      var to = f.getAttribute("data-to") || "beta@shelfie-app.ca";
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Shelfie beta invite request") + "&body=" + encodeURIComponent("Please add me to the Shelfie beta.\n\nEmail: " + email + "\nPlatform: iPhone / Android (delete one)\n");
      var h = f.querySelector(".hint"); if (h) h.textContent = "Your mail app should open with the request pre-filled. We reply within a day.";
    });
  });

  if (!hasLibs || reduceMotion) {
    document.querySelectorAll(".story-step").forEach(function (s) { s.classList.add("is-active"); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(id, { offset: -84 }); else document.querySelector(id).scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  var prog = document.querySelector(".progress");
  if (prog) gsap.to(prog, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- curtain ---------- */
  var curtain = document.querySelector(".curtain");
  if (curtain) {
    gsap.set(curtain, { yPercent: 0, visibility: "visible" });
    gsap.timeline()
      .to(curtain.querySelector(".cur-brand"), { autoAlpha: 1, duration: 0.25 })
      .to(curtain, { yPercent: -101, duration: 0.85, ease: "power4.inOut" }, 0.3)
      .set(curtain, { yPercent: 101, visibility: "hidden" });
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (a.target === "_blank" || (/^https?:\/\//.test(href) && a.host !== location.host)) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        gsap.timeline({ onComplete: function () { window.location.href = href; } })
          .set(curtain, { visibility: "visible" })
          .to(curtain, { yPercent: 0, duration: 0.55, ease: "power4.inOut" })
          .to(curtain.querySelector(".cur-brand"), { autoAlpha: 1, duration: 0.2 }, "-=0.2");
      });
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(curtain, { yPercent: 101, visibility: "hidden" }); });
  }

  /* ---------- hero ---------- */
  var title = document.getElementById("hero-title");
  var split = null;
  if (title && typeof window.SplitType !== "undefined") {
    try { split = new SplitType(title, { types: "words" }); } catch (err) { split = null; }
  }
  var intro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: curtain ? 0.45 : 0 });
  intro
    .from('[data-hero="eyebrow"]', { y: 18, autoAlpha: 0, duration: 0.6 }, 0)
    .from(split ? split.words : (title || '[data-hero="title"]'), { y: 60, autoAlpha: 0, rotateX: -35, transformOrigin: "50% 100%", duration: 1, stagger: split ? 0.06 : 0 }, 0.15)
    .from('[data-hero="sub"]', { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.55")
    .from('[data-hero="cta"] > *', { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.45")
    .from('[data-hero="meta"] > *', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, "-=0.35")
    .from(".hero-stack .phone.p1", { y: 120, autoAlpha: 0, rotateX: 12, duration: 1.2 }, "-=1.1")
    .from(".hero-stack .phone.p2", { x: 80, autoAlpha: 0, duration: 1 }, "-=0.9")
    .from(".hero-stack .phone.p3", { x: -80, autoAlpha: 0, duration: 1 }, "-=1")
    .from(".float-card", { scale: 0.6, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.6");

  gsap.utils.toArray(".float-card").forEach(function (c, i) {
    gsap.to(c, { y: "+=" + (10 + i * 3), duration: 2.6 + i * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });
  if (finePointer) {
    var blobs = gsap.utils.toArray(".hero .blob");
    var stack = document.querySelector(".hero-stack");
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2, ny = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach(function (b, i) { gsap.to(b, { x: nx * (i + 1) * 16, y: ny * (i + 1) * 16, duration: 1.4, ease: "power2.out", overwrite: "auto" }); });
      if (stack) gsap.to(stack, { rotateY: nx * 5, rotateX: -ny * 5, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    }, { passive: true });
  }
  var heroInner = document.querySelector(".hero .hero-inner");
  if (heroInner) gsap.to(heroInner, { yPercent: 10, autoAlpha: 0.15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- reveals ---------- */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    var dir = el.getAttribute("data-reveal") || "up";
    var from = { autoAlpha: 0, duration: 0.95, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%" } };
    if (dir === "up") from.y = 44; if (dir === "left") from.x = -56; if (dir === "right") from.x = 56; if (dir === "scale") { from.scale = 0.92; from.y = 20; }
    gsap.from(el, from);
  });
  if (typeof window.SplitType !== "undefined") {
    gsap.utils.toArray("[data-split]").forEach(function (h) {
      try {
        var s = new SplitType(h, { types: "lines,words" });
        gsap.from(s.words, { y: 40, autoAlpha: 0, rotateX: -30, transformOrigin: "50% 100%", duration: 0.85, stagger: 0.035, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 85%" } });
      } catch (err) {}
    });
  }
  var groups = new Map();
  gsap.utils.toArray("[data-card]").forEach(function (card) { var p = card.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(card); });
  groups.forEach(function (cards, p) { gsap.from(cards, { y: 52, autoAlpha: 0, duration: 0.85, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: p, start: "top 82%" } }); });
  gsap.utils.toArray("[data-stagger]").forEach(function (p) { gsap.from(p.children, { y: 30, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: p, start: "top 85%" } }); });

  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count")), decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "", prefix = el.getAttribute("data-prefix") || "", obj = { v: 0 };
    el.textContent = prefix + (0).toFixed(decimals) + suffix;
    gsap.to(obj, { v: target, duration: 2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: function () { el.textContent = prefix + obj.v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; } });
  });

  gsap.utils.toArray("[data-phone]").forEach(function (ph) {
    gsap.fromTo(ph, { rotateY: -10, rotateX: 5, y: 40 }, { rotateY: 8, rotateX: -4, y: -40, ease: "none", scrollTrigger: { trigger: ph, start: "top bottom", end: "bottom top", scrub: 1 } });
  });
  gsap.utils.toArray("[data-drift]").forEach(function (el) {
    var amt = parseFloat(el.getAttribute("data-drift")) || 200;
    gsap.fromTo(el, { x: amt * 0.4 }, { x: -amt, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- pinned five-tab tour ---------- */
  var tourPin = document.querySelector(".tour-pin");
  var track = tourPin && tourPin.querySelector(".tour-track");
  if (track) {
    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": function () {
        var dist = function () { return track.scrollWidth - window.innerWidth + 160; };
        var bars = tourPin.querySelectorAll(".tour-progress i");
        var panels = gsap.utils.toArray(".tour-panel");
        var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none",
          scrollTrigger: { trigger: tourPin, start: "top top", end: function () { return "+=" + dist() * 1.1; }, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: function (st) {
              var p = st.progress * panels.length;
              bars.forEach(function (b, i) { b.style.setProperty("--p", Math.max(0, Math.min(1, p - i))); });
            } } });
        panels.forEach(function (pnl) {
          gsap.from(pnl, { autoAlpha: 0.4, scale: 0.94, ease: "none", scrollTrigger: { trigger: pnl, containerAnimation: tween, start: "left 95%", end: "left 60%", scrub: true } });
          var ph = pnl.querySelector(".phone");
          if (ph) gsap.fromTo(ph, { rotateY: 18, y: 30 }, { rotateY: -8, y: -10, ease: "none", scrollTrigger: { trigger: pnl, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        });
      }
    });
  }

  /* ---------- scrollytelling: sticky phone screen swap ---------- */
  var story = document.querySelector(".story");
  if (story) {
    var steps = gsap.utils.toArray(".story-step");
    var screens = gsap.utils.toArray(".story-sticky .phone .screen");
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      screens.forEach(function (sc, k) { sc.classList.toggle("is-on", k === i); });
    }
    activate(0);
    steps.forEach(function (s, i) {
      ScrollTrigger.create({ trigger: s, start: "top 60%", end: "bottom 40%", onEnter: function () { activate(i); }, onEnterBack: function () { activate(i); } });
    });
    var stickyPhone = document.querySelector(".story-sticky .phone");
    if (stickyPhone) gsap.fromTo(stickyPhone, { rotateY: -8 }, { rotateY: 8, ease: "none", scrollTrigger: { trigger: story, start: "top bottom", end: "bottom top", scrub: 1 } });
  }

  /* ---------- INCI live demo ---------- */
  var demo = document.querySelector(".inci-demo");
  if (demo) {
    var input = demo.querySelector(".in .txt");
    var full = input ? input.getAttribute("data-text") : "";
    var tags = demo.querySelectorAll(".out .tag");
    var bars = demo.querySelectorAll(".meter i");
    var flag = demo.querySelector(".flag");
    var typed = { n: 0 };
    var tl = gsap.timeline({ scrollTrigger: { trigger: demo, start: "top 70%" } });
    if (input) {
      input.textContent = "";
      tl.to(typed, { n: full.length, duration: Math.min(4, full.length * 0.022), ease: "none", onUpdate: function () { input.textContent = full.slice(0, Math.round(typed.n)); } });
    }
    tl.to(tags, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.07, ease: "back.out(1.6)" }, "-=0.4")
      .to(bars, { scaleX: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" }, "-=0.3")
      .to(flag, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.2");
  }

  /* ---------- chat bubbles pop in ---------- */
  gsap.utils.toArray(".s-chat").forEach(function (chat) {
    gsap.from(chat.children, { y: 16, autoAlpha: 0, scale: 0.9, transformOrigin: "left bottom", duration: 0.5, stagger: 0.35, ease: "back.out(1.5)", scrollTrigger: { trigger: chat, start: "top 80%" } });
  });

  /* ---------- security packets ---------- */
  var arch = document.querySelector(".arch");
  if (arch) {
    var h = function () { return arch.getBoundingClientRect().height; };
    arch.querySelectorAll(".packet").forEach(function (pk, i) {
      gsap.timeline({ repeat: -1, delay: i * 1.1, scrollTrigger: { trigger: arch, start: "top 85%", toggleActions: "play pause resume pause" } })
        .set(pk, { top: 28, autoAlpha: 0, x: (i - 1) * 40 })
        .to(pk, { autoAlpha: 1, duration: 0.3 })
        .to(pk, { top: function () { return h() - 56; }, duration: 2.6, ease: "power1.inOut" }, 0.1)
        .to(pk, { autoAlpha: 0, duration: 0.3 }, "-=0.3");
    });
  }

  /* ---------- confetti in CTA ---------- */
  gsap.utils.toArray(".cta-band .confetti i").forEach(function (c, i) {
    gsap.to(c, { y: "-=" + (30 + i * 6), x: "+=" + ((i % 2 ? 1 : -1) * 14), rotate: 180, duration: 3 + i * 0.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
