import {
  getPath,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";
import { hasAuthenticatedSession } from "./ExternalServices.mjs";

if (!hasAuthenticatedSession()) {
  window.location.replace(
    `${getPath()}login/index.html?redirect=${getPath()}orders/index.html`
  );
} else {
  document.querySelector("#logout-button").addEventListener("click", () => {
    sessionStorage.removeItem("so-auth-token");
    sessionStorage.removeItem("so-authenticated");
    sessionStorage.removeItem("so-account-name");
    sessionStorage.removeItem("so-account-email");
    window.location.replace(`${getPath()}login/index.html`);
  });

  loadHeaderFooter();
  renderBreadcrumbs();
}
