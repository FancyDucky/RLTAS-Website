(function () {
  "use strict";

  // ---------- Mobile nav ----------
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ---------- Media placeholders ----------
  // Each .media element gets a label naming the file it expects. When the file exists and
  // loads, the real image/video fades in over the placeholder.
  function initMedia(root) {
    root.querySelectorAll(".media").forEach((slot) => {
      if (slot.dataset.ready) return;
      slot.dataset.ready = "1";

      const el = slot.querySelector("img, video");
      const src = el ? el.getAttribute("src") : "";
      const isVideo = el && el.tagName === "VIDEO";
      const isGif = /\.gif$/i.test(src || "");
      const icon = isVideo ? "▶" : isGif ? "◎" : "▣";

      const label = document.createElement("div");
      label.className = "media-label";
      label.innerHTML =
        '<span class="media-icon">' + icon + "</span>" +
        "<strong>" + (slot.dataset.label || "Media placeholder") + "</strong>" +
        (src ? "<code>" + src + "</code>" : "");
      slot.appendChild(label);

      if (!el) return;
      const markLoaded = () => slot.classList.add("is-loaded");

      if (isVideo) {
        if (el.readyState >= 2) markLoaded();
        else el.addEventListener("loadeddata", markLoaded, { once: true });
      } else {
        if (el.complete && el.naturalWidth > 0) markLoaded();
        else el.addEventListener("load", markLoaded, { once: true });
      }
    });
  }

  initMedia(document);
  window.RLTAS = { initMedia };

  // ---------- Feature image lightbox ----------
  (function initFeatureZoom() {
    const images = document.querySelectorAll(".feature-card .media img");
    if (!images.length) return;

    const popIn = "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)";
    const popOut = "transform 0.36s cubic-bezier(0.4, 0, 0.2, 1)";
    let open = false;
    let source = null;
    let sourceSlot = null;
    let box = null;
    let clone = null;
    let closing = false;

    function destRect(img) {
      const maxW = Math.min(window.innerWidth * 0.9, 1280);
      const maxH = window.innerHeight * 0.86;
      const nw = img.naturalWidth || img.clientWidth;
      const nh = img.naturalHeight || img.clientHeight;
      const scale = Math.min(maxW / nw, maxH / nh);
      const w = nw * scale;
      const h = nh * scale;
      return {
        top: (window.innerHeight - h) / 2,
        left: (window.innerWidth - w) / 2,
        width: w,
        height: h
      };
    }

    function startTransform(from, to) {
      const sx = from.width / to.width;
      const sy = from.height / to.height;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      return "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")";
    }

    function close() {
      if (!open || closing || !source) return;
      closing = true;
      const from = source.getBoundingClientRect();
      const to = destRect(source);
      box.classList.remove("is-open");
      clone.style.transition = popOut;
      clone.style.transform = startTransform(from, to);
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (sourceSlot) sourceSlot.classList.remove("is-zoomed");
        if (box) box.remove();
        box = null;
        clone = null;
        source = null;
        sourceSlot = null;
        open = false;
        closing = false;
      };
      clone.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, 480);
    }

    function openZoom(img) {
      if (open || !img.naturalWidth) return;
      source = img;
      sourceSlot = img.closest(".media");
      const from = img.getBoundingClientRect();
      const to = destRect(img);

      box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = '<div class="lightbox-backdrop"></div>';
      clone = img.cloneNode(true);
      clone.className = "lightbox-img";
      clone.removeAttribute("loading");
      clone.style.top = to.top + "px";
      clone.style.left = to.left + "px";
      clone.style.width = to.width + "px";
      clone.style.height = to.height + "px";
      clone.style.transition = "none";
      clone.style.transform = startTransform(from, to);
      box.appendChild(clone);
      document.body.appendChild(box);
      sourceSlot.classList.add("is-zoomed");
      open = true;

      void clone.offsetWidth;
      box.classList.add("is-open");
      clone.style.transition = popIn;
      clone.style.transform = "translate(0, 0) scale(1)";

      box.addEventListener("click", close);
    }

    images.forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!img.naturalWidth) return;
        openZoom(img);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  })();

  // ---------- Hero photo cycle ----------
  // Add a matching pair of .hero-slide divs (back photo + front ball) to grow the series.
  const heroLayers = [...document.querySelectorAll("[data-hero-layer]")].map((layer) =>
    [...layer.querySelectorAll(".hero-slide")]
  );
  if (heroLayers[0] && heroLayers[0].length > 1) {
    heroLayers.flat().forEach((el) => {
      const match = /url\(["']?([^"')]+)["']?\)/.exec(el.style.backgroundImage || "");
      if (match) {
        const img = new Image();
        img.src = match[1];
      }
    });

    const at = (index) => heroLayers.map((layer) => layer[index]);
    const setZoom = (els, scale, instant) => {
      els.forEach((el) => {
        el.style.transition = instant
          ? "opacity 2.2s ease-in-out, transform 0s"
          : "opacity 2.2s ease-in-out, transform 8s ease-out";
        el.style.transform = "scale(" + scale + ")";
      });
    };

    let slide = 0;
    setZoom(at(0), 1.06, false);

    setInterval(() => {
      const next = (slide + 1) % heroLayers[0].length;
      setZoom(at(next), 1, true);
      at(next).forEach((el) => void el.offsetWidth);
      at(next).forEach((el) => el.classList.add("is-active"));
      setZoom(at(next), 1.06, false);
      at(slide).forEach((el) => el.classList.remove("is-active"));
      slide = next;
    }, 8000);
  }

  // ---------- Toast ----------
  let toastEl;
  let toastTimer;
  window.RLTAS.toast = function (message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
  };

  // ---------- Checkout / download placeholders ----------
  document.querySelectorAll("[data-checkout]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.getAttribute("href") && btn.getAttribute("href") !== "#") return;
      e.preventDefault();
      window.RLTAS.toast("Checkout for \"" + btn.dataset.checkout + "\" isn't connected yet.");
    });
  });

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Footer year ----------
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // ---------- Header news bar ----------
  document.querySelectorAll(".news-bar").forEach((bar) => {
    const track = bar.querySelector(".news-bar-track");
    if (!track || track.children.length < 2) return;
    track.style.animation = "none";
    let index = 0;
    const last = track.children.length - 1;
    const move = () => {
      const height = track.children[0].getBoundingClientRect().height || bar.clientHeight || 48;
      index += 1;
      track.style.transition = "transform 0.54s cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = "translateY(-" + index * height + "px)";
      if (index >= last) {
        setTimeout(() => {
          track.style.transition = "none";
          track.style.transform = "translateY(0)";
          index = 0;
        }, 540);
      }
    };
    setInterval(move, 6000);
  });
})();
