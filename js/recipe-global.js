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

// ===============================
// AUTO-INJECT RECIPE IMAGE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  // Get current filename
  const path = window.location.pathname;
  const fileName = path.substring(path.lastIndexOf("/") + 1);

  if (!fileName.endsWith(".html")) return;

  const baseName = fileName.replace(".html", "");
  const imagePath = `../images/${baseName}.jpg`;

  // Create image wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "recipe-image-wrapper";

  const img = document.createElement("img");
  img.className = "recipe-image";
  img.alt = document.title;
  img.loading = "lazy";

  img.src = imagePath;

  // If image loads successfully, append it
  img.onload = function () {
    wrapper.appendChild(img);

    const recipeContent = document.querySelector(".recipe-content");
    if (recipeContent) {
      recipeContent.after(wrapper);
    }
  };

});
