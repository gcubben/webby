// about.js
// Sizes the giant "Georgie" on the home page so it spans the full width.
(function () {
  var giant = document.querySelector(".giant");
  var word = giant && giant.querySelector(".giant-word");
  if (!word) return;

  function fitName() {
    word.style.fontSize = "100px";
    var natural = word.getBoundingClientRect().width;
    var target = giant.clientWidth;
    if (natural > 0 && target > 0) {
      word.style.fontSize = (100 * target / natural).toFixed(2) + "px";
    }
  }

  fitName();
  window.addEventListener("resize", fitName);
  window.addEventListener("load", fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
})();
