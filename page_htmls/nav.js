(function () {
  var toggle = document.querySelector(".menu-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", function () {
    document.body.classList.toggle("nav-open");
  });
})();
