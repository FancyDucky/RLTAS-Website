// Always uses GitHub's /releases/latest so a new DLL tag does not need a site change.
(function () {
  "use strict";

  const API = "https://api.github.com/repos/FancyDucky/RLTAS-Website/releases/latest";
  const versionEl = document.querySelector("[data-plugin-version]");
  if (!versionEl) return;

  fetch(API)
    .then(function (res) {
      if (!res.ok) throw new Error("release lookup failed");
      return res.json();
    })
    .then(function (data) {
      const tag = data.tag_name || data.name;
      if (tag) versionEl.textContent = tag;
    })
    .catch(function () {});
})();
