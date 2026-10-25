(function () {
  "use strict";

  const ICONS = "assets/images/Link tree assests/";
  const PHOTOS = {
    fractal: ICONS + "Fractal.webp",
    fancyduck: ICONS + "FancyDuck.jpg",
    bredzel: ICONS + "Bredzel.webp",
    senju: ICONS + "Senju.webp",
    june: ICONS + "TAS June.webp",
    blaku: ICONS + "Blaku.webp",
    souldameep: ICONS + "SoulDaMeep.webp"
  };

  const TEAM = {
    fractal: {
      name: "F R A C T A L",
      role: "Founder",
      photo: PHOTOS.fractal,
      links: [
        { label: "YouTube", url: "https://www.youtube.com/@fractalrl", icon: "youtube.png" },
        { label: "TikTok", url: "https://www.tiktok.com/@fractal.rl", icon: "tiktok.png" },
        { label: "Instagram", url: "https://www.instagram.com/fractal.rl/", icon: "insta.png" },
        { label: "X", url: "https://x.com/Realfractalrl", icon: "X icon.webp" }
      ]
    },
    fancyduck: {
      name: "FancyDuck",
      role: "Founder",
      photo: PHOTOS.fancyduck,
      links: [
        { label: "YouTube", url: "https://www.youtube.com/@FancyDuck_RL", icon: "youtube.png" },
        { label: "Twitch", url: "https://www.twitch.tv/fancyduck", icon: "Twitch.png" },
        { label: "X", url: "https://x.com/FancyDuckRL", icon: "X icon.webp" },
        { label: "TikTok", url: "https://www.tiktok.com/@fancyduck_rl", icon: "tiktok.png" }
      ]
    },
    bredzel: {
      name: "Bredzel",
      role: "TAS creator",
      photo: PHOTOS.bredzel,
      links: [
        { label: "YouTube", url: "https://www.youtube.com/@TASbredzel/videos", icon: "youtube.png" },
        { label: "TikTok", url: "https://www.tiktok.com/@bredz3l", icon: "tiktok.png" },
        { label: "Discord", url: "https://discord.com/invite/MqVUjBHtjn", icon: "discord.png" }
      ]
    },
    bluebird: {
      name: "BlueBird",
      role: "TAS creator",
      photo: "",
      links: [
        { label: "YouTube", url: "https://www.youtube.com/@treeefu", icon: "youtube.png" },
        { label: "TikTok", url: "https://www.tiktok.com/@bluebird.rl", icon: "tiktok.png" }
      ]
    },
    senju: {
      name: "Senju",
      role: "TAS creator",
      photo: PHOTOS.senju,
      links: [
        { label: "YouTube", url: "https://www.youtube.com/channel/UCIDGvB15U6R2rA2FFQ62c_Q", icon: "youtube.png" },
        { label: "Twitch", url: "https://www.twitch.tv/senjurl", icon: "Twitch.png" },
        { label: "TikTok", url: "https://www.tiktok.com/@senju.rl", icon: "tiktok.png" }
      ]
    },
    june: {
      name: "TAS June",
      role: "TAS creator",
      photo: PHOTOS.june,
      links: [
        { label: "TikTok", url: "https://www.tiktok.com/@tas_june", icon: "tiktok.png" },
        { label: "Instagram", url: "https://www.instagram.com/tas_june", icon: "insta.png" }
      ]
    },
    blaku: {
      name: "Blaku",
      role: "Predecessor",
      photo: PHOTOS.blaku,
      links: [
        { label: "YouTube", url: "https://www.youtube.com/channel/UCg4cT70vd2wXKG2A1VvniUA", icon: "youtube.png" },
        { label: "X", url: "https://x.com/BlakuRL", icon: "X icon.webp" }
      ]
    },
    souldameep: {
      name: "SoulDaMeep",
      role: "Predecessor",
      photo: PHOTOS.souldameep,
      links: [
        { label: "GitHub", url: "https://github.com/SoulDaMeep", icon: "github" }
      ]
    }
  };

  function iconHtml(icon) {
    if (icon === "github") {
      return '<span class="team-pop-x" aria-hidden="true">GH</span>';
    }
    return '<img src="' + encodeURI(ICONS + icon) + '" alt="" />';
  }

  function photoHtml(person, cls) {
    if (person.photo) return '<img src="' + person.photo + '" alt="' + person.name + '" />';
    return '<span class="' + cls + '">' + person.name.charAt(0) + "</span>";
  }

  const pop = document.createElement("div");
  pop.className = "team-pop";
  pop.innerHTML =
    '<div class="team-pop-backdrop"></div>' +
    '<div class="team-pop-card" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(pop);
  const card = pop.querySelector(".team-pop-card");

  function close() {
    pop.classList.remove("is-open");
    document.querySelectorAll(".team-pill.is-open").forEach((el) => el.classList.remove("is-open"));
  }

  function open(id, pill) {
    const person = TEAM[id];
    if (!person) return;
    document.querySelectorAll(".team-pill.is-open").forEach((el) => el.classList.remove("is-open"));
    pill.classList.add("is-open");
    card.innerHTML =
      photoHtml(person, "team-pop-fallback") +
      "<h3>" + person.name + "</h3>" +
      '<p class="muted">' + person.role + "</p>" +
      '<div class="team-pop-links">' +
      person.links.map((link) =>
        '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer">' +
        iconHtml(link.icon) + link.label + "</a>"
      ).join("") +
      "</div>";
    pop.classList.add("is-open");
  }

  document.querySelectorAll(".team-pill").forEach((pill) => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = pill.dataset.person;
      if (pill.classList.contains("is-open")) close();
      else open(id, pill);
    });
  });

  pop.querySelector(".team-pop-backdrop").addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
