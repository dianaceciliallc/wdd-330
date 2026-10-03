import { loadHeaderFooter, renderBreadcrumbs } from "./utils.mjs";
import { hasAuthenticatedSession } from "./ExternalServices.mjs";

if (!hasAuthenticatedSession()) {
  window.location.replace(
    "/login/index.html?redirect=/orders/index.html"
  );
} else {
  document.querySelector("#logout-button").addEventListener("click", () => {
    sessionStorage.removeItem("so-auth-token");
    sessionStorage.removeItem("so-authenticated");
    sessionStorage.removeItem("so-account-name");
    sessionStorage.removeItem("so-account-email");
    window.location.replace("/login/index.html");
  });

  loadHeaderFooter();
  renderBreadcrumbs();
}
