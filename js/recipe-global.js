// ===============================
// AUTO-INJECT RECIPE IMAGE
// Supports .jpg and .png
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  // Only run on recipe pages
  if (!window.location.pathname.includes("/recipes/")) return;

  const fileName = window.location.pathname.split("/").pop();
  if (!fileName.endsWith(".html")) return;

  const baseName = fileName.replace(".html", "");
  const recipeContent = document.querySelector(".recipe-content");
  if (!recipeContent) return;

  // Possible image formats (order matters — jpg first)
  const formats = ["jpg", "png"];

  function tryNextFormat(index) {
    if (index >= formats.length) return; // No image found

    const imagePath = `/images/${baseName}.${formats[index]}`;
    const testImg = new Image();
    testImg.src = imagePath;

    testImg.onload = function () {
      injectImage(imagePath);
    };

    testImg.onerror = function () {
      tryNextFormat(index + 1);
    };
  }

  function injectImage(path) {
    const wrapper = document.createElement("div");
    wrapper.className = "recipe-image-wrapper";

    const img = document.createElement("img");
    img.className = "recipe-image";
    img.src = path;
    img.alt = document.title;
    img.loading = "lazy";

    wrapper.appendChild(img);
    recipeContent.after(wrapper);
  }

  tryNextFormat(0);

});

// ===============================
// DOWNLOAD PDF LINK
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // Only run on recipe pages
  if (!window.location.pathname.includes("/recipes/")) return;

  // 🔥 Auto-set PDF download link
  const downloadLink = document.getElementById("downloadLink");

  if (downloadLink) {
    const pageName = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", ".pdf");

    downloadLink.href = "../pdfs/" + pageName;
  }

});
document.addEventListener("DOMContentLoaded", () => {

  if (!window.location.pathname.includes("/recipes/")) return;

  const pageName = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", ".pdf");

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "download-recipe";

  const link = document.createElement("a");
  link.className = "accent-button";
  link.textContent = "DOWNLOAD THIS RECIPE (PDF)";
  link.href = "../pdfs/" + pageName;

  wrapper.appendChild(link);

  // Insert at bottom of page
  document.body.appendChild(wrapper);

});
