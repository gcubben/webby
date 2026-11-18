// about.js
// 1. Sizes the giant "Georgie" on the home page so it spans the full width.
// 2. Runs a pink wave through the mantra's links once the page has loaded.
(function () {
  /* ---------- Giant name ---------- */

  var giant = document.querySelector(".giant");
  var word = giant && giant.querySelector(".giant-word");

  function fitName() {
    word.style.fontSize = "100px";
    var natural = word.getBoundingClientRect().width;
    var target = giant.clientWidth;
    if (natural > 0 && target > 0) {
      word.style.fontSize = (100 * target / natural).toFixed(2) + "px";
    }
  }

  if (word) {
    fitName();
    window.addEventListener("resize", fitName);
    window.addEventListener("load", fitName);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  }

  /* ---------- Pink wave through the mantra's links ---------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".belief-link"));
  if (!links.length) return;

  var WAVE_START = 700; // after the page settles
  var WAVE_STEP = 260; // gap between each link lighting up
  var WAVE_HOLD = 650; // how long each link stays pink

  function playWave() {
    links.forEach(function (link, i) {
      setTimeout(function () {
        link.classList.add("is-wave");
        setTimeout(function () {
          link.classList.remove("is-wave");
        }, WAVE_HOLD);
      }, WAVE_START + i * WAVE_STEP);
    });
  }

  if (document.readyState === "complete") playWave();
  else window.addEventListener("load", playWave);
})();
