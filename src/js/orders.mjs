import {
  getAppRelativeRoot,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";
import { hasAuthenticatedSession } from "./ExternalServices.mjs";

if (!hasAuthenticatedSession()) {
  window.location.replace(
    `${getAppRelativeRoot()}login/index.html?redirect=${getAppRelativeRoot()}orders/index.html`
  );
} else {
  document.querySelector("#logout-button").addEventListener("click", () => {
    sessionStorage.removeItem("so-auth-token");
    sessionStorage.removeItem("so-authenticated");
    sessionStorage.removeItem("so-account-name");
    sessionStorage.removeItem("so-account-email");
    window.location.replace(`${getAppRelativeRoot()}login/index.html`);
  });

  loadHeaderFooter();
  renderBreadcrumbs();
}
