// about.js
// Hovering (or tapping) a highlighted line on the about page turns it pink,
// hides the portrait and shows that line's card in the right column. A thin
// pink thread connects the line to its card. The "connections" card is a
// small stack of three that the arrow buttons cycle through.
(function () {
  var hero = document.querySelector("[data-about]");
  if (!hero) return;

  var ties = Array.prototype.slice.call(hero.querySelectorAll(".tie"));
  var stage = hero.querySelector(".about-stage");
  var copy = hero.querySelector(".about-copy");
  var cardsEl = hero.querySelector(".stage-cards");
  var cards = Array.prototype.slice.call(hero.querySelectorAll(".stage-card"));
  var line = hero.querySelector(".thread-line");
  var narrow = window.matchMedia("(max-width: 900px)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var HIDE_DELAY = 450; // time to travel from a line over to its card
  var active = null;
  var hideTimer = null;
  var lastPointer = "mouse";
  var pointerDownOnTie = false;

  line.setAttribute("pathLength", "1");

  ties.forEach(function (tie) {
    tie.setAttribute("role", "button");
    tie.setAttribute("aria-expanded", "false");
  });

  /* ---------- Showing and hiding cards ---------- */

  function activate(tie) {
    clearTimeout(hideTimer);
    if (active === tie) return;
    if (active) {
      active.classList.remove("is-active");
      active.setAttribute("aria-expanded", "false");
    }
    active = tie;
    tie.classList.add("is-active");
    tie.setAttribute("aria-expanded", "true");
    cards.forEach(function (card) {
      card.classList.toggle("is-active", card.dataset.card === tie.dataset.card);
    });
    hero.classList.add("is-active");
    place();
    replayThread();
  }

  function deactivate() {
    clearTimeout(hideTimer);
    if (!active) return;
    active.classList.remove("is-active");
    active.setAttribute("aria-expanded", "false");
    active = null;
    hero.classList.remove("is-active");
    cards.forEach(function (card) {
      card.classList.remove("is-active");
    });
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(deactivate, HIDE_DELAY);
  }

  // Desktop: cards live in the right column. Small screens: the card opens
  // directly under the paragraph that was tapped.
  function place() {
    if (narrow.matches && active) {
      var para = active.closest("p");
      if (para && para.nextElementSibling !== cardsEl) para.after(cardsEl);
    } else if (cardsEl.parentNode !== stage) {
      stage.appendChild(cardsEl);
    }
  }

  /* ---------- The pink thread ---------- */

  function drawThread() {
    if (!active || narrow.matches) return;
    var h = hero.getBoundingClientRect();
    var rects = active.getClientRects();
    var last = rects[rects.length - 1];
    var c = cardsEl.getBoundingClientRect();
    var t = copy.getBoundingClientRect();

    var x1 = t.right - h.left + 14;
    var y1 = last.top + last.height / 2 - h.top;
    var x2 = c.left - h.left - 3;
    var y2 = Math.min(Math.max(y1, c.top - h.top + 48), c.bottom - h.top - 48);
    var bend = Math.max((x2 - x1) * 0.5, 12);

    line.setAttribute(
      "d",
      "M" + x1 + " " + y1 +
      " C" + (x1 + bend) + " " + y1 + " " + (x2 - bend) + " " + y2 + " " + x2 + " " + y2
    );
  }

  function replayThread() {
    drawThread();
    line.style.transition = "none";
    line.style.strokeDashoffset = "1";
    line.getBoundingClientRect(); // flush so the draw-in animates again
    line.style.transition = "";
    line.style.strokeDashoffset = "";
  }

  var frame = null;
  function redrawSoon() {
    if (!active || frame) return;
    frame = requestAnimationFrame(function () {
      frame = null;
      drawThread();
    });
  }
  window.addEventListener("scroll", redrawSoon, { passive: true });
  window.addEventListener("resize", redrawSoon);

  function onBreakpointChange() {
    place();
    drawThread();
  }
  if (narrow.addEventListener) narrow.addEventListener("change", onBreakpointChange);
  else narrow.addListener(onBreakpointChange);

  /* ---------- Lines: hover, tap, keyboard ---------- */

  ties.forEach(function (tie) {
    tie.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      userActed();
      activate(tie);
    });
    tie.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") scheduleHide();
    });
    tie.addEventListener("pointerdown", function (e) {
      lastPointer = e.pointerType;
      pointerDownOnTie = true;
    });
    tie.addEventListener("click", function () {
      userActed();
      pointerDownOnTie = false;
      if (active === tie && lastPointer !== "mouse") deactivate();
      else activate(tie);
    });
    tie.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        userActed();
        if (active === tie) deactivate();
        else activate(tie);
      }
    });
    tie.addEventListener("focus", function () {
      if (pointerDownOnTie) return;
      userActed();
      activate(tie);
    });
    tie.addEventListener("blur", function (e) {
      if (!e.relatedTarget || !cardsEl.contains(e.relatedTarget)) scheduleHide();
    });
  });

  /* ---------- Cards: keep open while in use ---------- */

  cardsEl.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    userActed();
    clearTimeout(hideTimer);
  });
  cardsEl.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse") scheduleHide();
  });
  cardsEl.addEventListener("focusin", function () {
    clearTimeout(hideTimer);
  });
  cardsEl.addEventListener("focusout", function (e) {
    var to = e.relatedTarget;
    if (!to || !(cardsEl.contains(to) || ties.indexOf(to) !== -1)) scheduleHide();
  });

  // Tapping anywhere else closes the card on touch screens.
  document.addEventListener("pointerdown", function (e) {
    if (!active || e.pointerType === "mouse") return;
    if (cardsEl.contains(e.target) || ties.indexOf(e.target) !== -1) return;
    deactivate();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") deactivate();
  });

  /* ---------- Hints: a pink wave on load, then a demo ---------- */

  var WAVE_START = 700; // after the page settles
  var WAVE_STEP = 260; // gap between each line lighting up
  var WAVE_HOLD = 650; // how long each line stays pink
  var DEMO_AFTER = 10000; // open a card by itself if nobody has yet
  var DEMO_HOLD = 4000; // how long the demo card stays open

  var userHasActed = false;
  var demoTimer = null;
  var demoCloseTimer = null;

  // Any real hover, tap or focus cancels the demo for good.
  function userActed() {
    if (userHasActed) return;
    userHasActed = true;
    clearTimeout(demoTimer);
    clearTimeout(demoCloseTimer);
  }

  function playWave() {
    ties.forEach(function (tie, i) {
      setTimeout(function () {
        tie.classList.add("is-wave");
        setTimeout(function () {
          tie.classList.remove("is-wave");
        }, WAVE_HOLD);
      }, i * WAVE_STEP);
    });
  }

  function heroInView() {
    var r = hero.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  function runDemo() {
    // Skip on phones: opening a card there would push the text around.
    if (userHasActed || active || narrow.matches || document.hidden || !heroInView()) return;
    var first = ties[0];
    activate(first);
    demoCloseTimer = setTimeout(function () {
      if (!userHasActed && active === first) deactivate();
    }, DEMO_HOLD);
  }

  function startHints() {
    setTimeout(playWave, WAVE_START);
    demoTimer = setTimeout(runDemo, DEMO_AFTER);
  }

  if (document.readyState === "complete") startHints();
  else window.addEventListener("load", startHints);

  /* ---------- The stack of three ---------- */

  var deck = hero.querySelector(".stage-deck");
  if (deck) {
    var slides = Array.prototype.slice.call(deck.querySelectorAll(".deck-slide"));
    var count = deck.querySelector(".deck-count");
    var order = slides.map(function (_, i) { return i; }); // order[0] is on top
    var busy = false;

    var renderDeck = function () {
      order.forEach(function (slideIndex, pos) {
        var slide = slides[slideIndex];
        slide.dataset.pos = pos;
        slide.tabIndex = pos === 0 ? 0 : -1;
        slide.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
      });
      count.textContent = order[0] + 1 + " / " + slides.length;
    };

    var step = function (dir) {
      if (busy) return;
      if (dir < 0) {
        order.unshift(order.pop());
        renderDeck();
        return;
      }
      // Toss the top card aside, then tuck it in at the back of the stack.
      var top = slides[order[0]];
      busy = true;
      top.classList.add("is-tossed");
      setTimeout(function () {
        order.push(order.shift());
        top.classList.remove("is-tossed");
        renderDeck();
        busy = false;
      }, reduceMotion.matches ? 0 : 260);
    };

    deck.querySelectorAll(".deck-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        step(Number(btn.dataset.dir));
      });
    });

    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });

    renderDeck();
  }
})();
