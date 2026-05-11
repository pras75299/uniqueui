(function () {
  try {
    var t = localStorage.getItem("uniqueui-theme");
    document.documentElement.dataset.theme =
      t === "light" || t === "dark" ? t : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();
