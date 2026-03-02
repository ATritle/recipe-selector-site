// ===============================
// AUTO-INJECT RECIPE IMAGE (SAFE VERSION)
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  if (!window.location.pathname.includes("/recipes/")) return;

  const fileName = window.location.pathname.split("/").pop();
  if (!fileName.endsWith(".html")) return;

  const baseName = fileName.replace(".html", "");
  const imagePath = `/images/${baseName}.jpg`;

  const recipeContent = document.querySelector(".recipe-content");
  if (!recipeContent) return;

  const img = new Image();
  img.src = imagePath;

  img.onload = function () {
    const wrapper = document.createElement("div");
    wrapper.className = "recipe-image-wrapper";

    img.className = "recipe-image";
    img.alt = document.title;
    img.loading = "lazy";

    wrapper.appendChild(img);
    recipeContent.after(wrapper);
  };

  // If image doesn't exist, do nothing
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
