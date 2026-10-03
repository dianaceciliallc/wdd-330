import {
  alertMessage,
  getAppRelativeRoot,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const authenticatedKey = "so-authenticated";
const loginForm = document.querySelector("#login-form");
const loginButton = loginForm.querySelector('button[type="submit"]');
const externalServices = new ExternalServices();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!loginForm.reportValidity()) return;

  loginButton.disabled = true;
  try {
    const email = loginForm.elements.email.value.trim().toLowerCase();
    const password = loginForm.elements.password.value;
    const users = await externalServices.getUsers();
    const user = users.find(
      (user) =>
        typeof user.email === "string" &&
        user.email.trim().toLowerCase() === email &&
        typeof user.password === "string" &&
        user.password === password
    );

    if (!user) {
      alertMessage("Email or password is incorrect.", true);
      return;
    }

    const savedProfile = JSON.parse(localStorage.getItem("so-account-profile") || "null");
    const accountName =
      savedProfile?.email === email && typeof savedProfile.name === "string"
        ? savedProfile.name
        : [user.firstname, user.lastname].filter(Boolean).join(" ") ||
          user.username ||
          "Staff";
    sessionStorage.setItem(authenticatedKey, "true");
    sessionStorage.setItem("so-account-name", accountName);
    sessionStorage.setItem("so-account-email", email);
  } catch (error) {
    console.error("Unable to sign in:", error);
    alertMessage(
      "Unable to verify your account with the server. Please try again later.",
      true
    );
    return;
  } finally {
    loginButton.disabled = false;
  }

  const requestedPath = new URLSearchParams(window.location.search).get("redirect");
  const ordersPath = `${getAppRelativeRoot()}orders/index.html`;
  const safeRedirect = requestedPath === ordersPath ? requestedPath : ordersPath;
  window.location.href = safeRedirect;
});

loadHeaderFooter();
renderBreadcrumbs();
