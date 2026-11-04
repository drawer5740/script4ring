(function () {
  "use strict";

  // TAG TAG TAG TAG TAG TAG TAG
  var script = document.currentScript ||
    document.getElementById("script4link");

  if (!script) {
    console.warn("Script4Ring: script tag not found.");
    return;
  }

  // read domain slugg wugg pair
  var raw = script.getAttribute("data-members") || "";
  var tokens = raw.trim().split(/\s+/).filter(Boolean);
  var members = [];
  var usedSlugs = new Set();

  for (var i = 0; i + 1 < tokens.length; i += 2) {
    var slug = tokens[i];
    var domain = tokens[i + 1];

    // good slug boy
    if (!/^[A-Za-z0-9]+$/.test(slug)) {
      console.warn("Script4Ring: invalid slug:", slug);
      continue;
    }

    // no dupes
    if (usedSlugs.has(slug)) {
      console.warn("Script4Ring: duplicate slug:", slug);
      continue;
    }

    // good desig
    var url;

    try {
      url = new URL(
        /^https?:\/\//i.test(domain)
          ? domain
          : "https://" + domain
      );

      if (!["http:", "https:"].includes(url.protocol)) {
        continue;
      }
    } catch (e) {
      console.warn("Script4Ring: invalid domain:", domain);
      continue;
    }

    usedSlugs.add(slug);

    members.push({
      slug: slug,
      domain: url.href,
      hostname: url.hostname.toLowerCase().replace(/^www\./, "")
    });
  }

  if (tokens.length % 2 !== 0) {
    console.warn("Script4Ring: unmatched slug/domain pair.");
  }

  if (!members.length) {
    console.warn("Script4Ring: no valid members found.");
    return;
  }

  // find memeber
  function go(member) {
    if (member) {
      window.location.href = member.domain;
    }
  }

  // allow ?s4r
  var params = new URLSearchParams(window.location.search);
  var action = params.get("s4r");

  if (!action && params.has("random")) {
    action = "random";
  }

  // star of the star of the show
  if (!action) {
    params.forEach(function (_, key) {
      if (/^[A-Za-z0-9]+-(next|previous)$/i.test(key)) {
        action = key;
      }
    });
  }

  if (!action) return;

  // "random = extremely funny"
  if (action.toLowerCase() === "random") {
    var currentHost = window.location.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    var choices = members.filter(function (member) {
      return member.hostname !== currentHost;
    });

    // allow this site IF this is the only memeber
    if (!choices.length) {
      choices = members;
    }

    var randomMember = choices[
      Math.floor(Math.random() * choices.length)
    ];

    go(randomMember);
    return;
  }

  // narvy warvy
  var match = action.match(
    /^([A-Za-z0-9]+)-(next|previous)$/i
  );

  if (!match) return;

  var slug = match[1];
  var direction = match[2].toLowerCase();

  var index = members.findIndex(function (member) {
    return member.slug === slug;
  });

  if (index === -1) {
    console.warn("Script4Ring: unknown slug:", slug);
    return;
  }

  var nextIndex;

  if (direction === "next") {
    nextIndex = (index + 1) % members.length;
  } else {
    nextIndex = (index - 1 + members.length) % members.length;
  }

  go(members[nextIndex]);

})();
