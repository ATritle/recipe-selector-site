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
