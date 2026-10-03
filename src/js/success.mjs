import {
  getAppRelativeRoot,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";
import { hasAuthenticatedSession } from "./ExternalServices.mjs";

const successType = new URLSearchParams(window.location.search).get("type");
const successTitle = document.querySelector("#success-title");
const successMessage = document.querySelector("#success-message");
const successAction = document.querySelector("#success-action");

if (successType === "subscription") {
  document.title = "Subscription Confirmed | SleepOutside";
  successTitle.textContent = "You're subscribed!";
  successMessage.textContent =
    "Thank you for subscribing to the SleepOutside newsletter.";
} else if (successType === "registration") {
  document.title = "Registration Complete | SleepOutside";
  successTitle.textContent = "Registration complete!";
  successMessage.textContent =
    "Thank you for registering with SleepOutside. Your information has been received.";
  if (hasAuthenticatedSession()) {
    successAction.href = `${getAppRelativeRoot()}orders/index.html`;
    successAction.textContent = "Go to Orders";
  } else {
    successAction.href = `${getAppRelativeRoot()}login/index.html`;
    successAction.textContent = "Sign in";
  }
}

loadHeaderFooter();
renderBreadcrumbs();