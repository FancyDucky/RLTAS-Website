// checkout.html?code=XXXX is opened by the plugin.
// Fills account + tiers from the license server, then Continue goes to Stripe via GET /go/<code>.
// checkout.html?paid=1 is the return page after Stripe.
// Opening the page with no code keeps the HTML placeholders so the layout is visible.
(function () {
  "use strict";

  const root = document.getElementById("confirm");
  if (!root) return;

  const api = ((window.RLTAS_CONFIG && window.RLTAS_CONFIG.apiBase) || "").replace(/\/+$/, "");
  const TIER_NAMES = { 0: "Free", 1: "Tier 1", 2: "Tier 2", 3: "Tier 3" };
  const TIER_COST = { 0: 0, 1: 10, 2: 20, 3: 30 };
  const TIER_INFO = {
    1: {
      name: "Tier 1",
      price: "$10",
      includes: ["Everything in Free", "Customizable mirror bots", "Car scaling", "Radial symmetry mirror bot option"]
    },
    2: {
      name: "Tier 2",
      price: "$20",
      includes: [
        "Everything in Tier 1",
        "Frame editor with ball trajectory",
        "Physics tab (boost strength, gravity, speed, and more)",
        "Works in LAN",
        "Multiple balls",
        "Ball scaling"
      ]
    },
    3: {
      name: "Tier 3",
      price: "$30",
      includes: [
        "Everything in Tier 2",
        "Multiplayer TAS",
        "Bots you can control, rename, and rescale",
        "Works in LAN matches with other players",
        "Individual multiplayer physics",
        "Garage tab to customize bot presets"
      ]
    }
  };

  function show(state) {
    root.querySelectorAll("[data-state]").forEach((el) => {
      el.hidden = el.dataset.state !== state;
    });
  }

  function fill(field, text) {
    root.querySelectorAll('[data-field="' + field + '"]').forEach((el) => {
      el.textContent = text;
    });
  }

  function dollars(n) {
    return "$" + n;
  }

  function setTierName(field, name) {
    const el = root.querySelector('[data-field="' + field + '"]');
    if (!el) return;
    el.textContent = String(name || "").toUpperCase();
  }

  function setUpgradePrice(owned, tier, listedPrice) {
    const fullEl = root.querySelector('[data-field="price"]');
    const dueEl = root.querySelector('[data-field="duePrice"]');
    const fullCost = TIER_COST[tier] != null ? TIER_COST[tier] : null;
    const credit = owned > 0 ? (TIER_COST[owned] || 0) : 0;
    const fullText = listedPrice || (fullCost != null ? dollars(fullCost) : "");
    if (fullEl) fullEl.textContent = fullText;

    if (owned > 0 && fullCost != null && fullCost > credit) {
      if (fullEl) fullEl.classList.add("confirm-price--slashed");
      if (dueEl) {
        dueEl.textContent = dollars(fullCost - credit);
        dueEl.hidden = false;
      }
    } else {
      if (fullEl) fullEl.classList.remove("confirm-price--slashed");
      if (dueEl) {
        dueEl.textContent = "";
        dueEl.hidden = true;
      }
    }
  }

  function setIncludes(items) {
    const list = root.querySelector('[data-field="includes"]');
    if (!list) return;
    list.innerHTML = "";
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("paid") === "1") {
    document.querySelectorAll("[data-confirm-head]").forEach((h) => { h.hidden = true; });
    show("paid");
    return;
  }

  const pay = root.querySelector('[data-action="pay"]');
  const notMe = root.querySelector('[data-action="not-me"]');
  const back = root.querySelector('[data-action="back"]');
  if (notMe) {
    notMe.addEventListener("click", () => show("not-me"));
  }
  if (back) {
    back.addEventListener("click", () => show("ready"));
  }
  if (pay) {
    pay.addEventListener("click", (e) => {
      if (!pay.getAttribute("href") || pay.getAttribute("href") === "#") {
        e.preventDefault();
        if (window.RLTAS && window.RLTAS.toast) {
          window.RLTAS.toast("Payment isn't connected yet.");
        }
      }
    });
  }

  const code = (params.get("code") || "").trim().toUpperCase();
  if (!code) return;
  if (!/^[A-Z0-9]{6,20}$/.test(code)) {
    show("expired");
    return;
  }
  if (!api || api.indexOf("YOUR-SUBDOMAIN") !== -1) {
    fill("error", "The license server address isn't set in js/config.js yet.");
    show("error");
    return;
  }

  show("loading");
  fetch(api + "/purchase/" + encodeURIComponent(code), { headers: { Accept: "application/json" } })
    .then((r) => r.json().then((data) => ({ ok: r.ok, status: r.status, data })))
    .then(({ ok, status, data }) => {
      if (status === 404) {
        show("expired");
        return;
      }
      if (!ok) {
        show("error");
        return;
      }

      const platform = String(data.platform || "").toLowerCase();
      fill("name", data.name || (platform === "epic" ? "Epic player" : "Steam player"));
      fill("steamId", platform === "steam" ? data.id : "—");
      fill("epicId", platform === "epic" ? data.id : "—");
      setTierName("currentTier", TIER_NAMES[data.owned] || "Free");
      setTierName("tierName", data.tierName || (TIER_INFO[data.tier] && TIER_INFO[data.tier].name) || "Selected tier");
      setUpgradePrice(Number(data.owned) || 0, Number(data.tier) || 0, data.price || (TIER_INFO[data.tier] && TIER_INFO[data.tier].price) || "");
      setIncludes(data.includes && data.includes.length ? data.includes : (TIER_INFO[data.tier] && TIER_INFO[data.tier].includes) || []);

      if (data.owned >= data.tier) {
        fill("ownedName", TIER_NAMES[data.owned] || "a higher tier");
        show("owned");
        return;
      }

      if (data.owned > 0) {
        const note = root.querySelector('[data-field="ownedNote"]');
        if (note) {
          const credit = TIER_COST[data.owned] || 0;
          const full = TIER_COST[data.tier] || 0;
          const due = Math.max(full - credit, 0);
          note.textContent = "This account already owns " + (TIER_NAMES[data.owned] || "a tier") + ". You pay the " + dollars(due) + " difference.";
          note.hidden = false;
        }
      }

      if (data.checkoutReady) {
        pay.href = api + "/go/" + encodeURIComponent(code);
      } else {
        pay.classList.add("is-disabled");
        pay.setAttribute("aria-disabled", "true");
        pay.textContent = "Payments open soon";
      }
      show("ready");
    })
    .catch(() => show("error"));
})();
