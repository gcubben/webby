// about.js
// 1. Sizes the giant "Georgie" so it spans the full width of the page.
// 2. Runs the case-study slides at the bottom of the beliefs feed.
(function () {
  /* ---------- Giant name ---------- */

  var giant = document.querySelector(".giant");
  var word = giant && giant.querySelector(".giant-word");

  function fitName() {
    if (!word) return;
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

  /* ---------- Mantra: one line, margin to margin ---------- */

  var mantra = document.querySelector(".mantra-text");

  function fitMantra() {
    if (!mantra) return;
    mantra.style.fontSize = "";
    if (window.innerWidth <= 760) return;
    mantra.style.fontSize = "40px";
    var natural = mantra.getBoundingClientRect().width;
    var target = mantra.parentNode.clientWidth;
    if (natural > 0 && target > 0) {
      mantra.style.fontSize = Math.min(72, 40 * target / natural).toFixed(2) + "px";
    }
  }

  if (mantra) {
    fitMantra();
    window.addEventListener("resize", fitMantra);
    window.addEventListener("load", fitMantra);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMantra);
  }

  /* ---------- Case-study slides ---------- */

  var root = document.querySelector("[data-slides]");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".work-slide"));
  var count = root.querySelector(".work-count");
  var listLinks = Array.prototype.slice.call(document.querySelectorAll(".work-list [data-go]"));
  var current = 0;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      var on = n === current;
      slide.classList.toggle("is-current", on);
      slide.tabIndex = on ? 0 : -1;
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    listLinks.forEach(function (link) {
      link.classList.toggle("is-current", Number(link.dataset.go) === current);
    });
    count.textContent = current + 1 + " / " + slides.length;
  }

  root.querySelectorAll(".work-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(current + Number(btn.dataset.dir));
    });
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
  });

  // Pointing at a name in the list previews it in the frame; clicking opens it.
  listLinks.forEach(function (link) {
    var go = function () { show(Number(link.dataset.go)); };
    link.addEventListener("pointerenter", go);
    link.addEventListener("focus", go);
  });

  show(0);
})();
