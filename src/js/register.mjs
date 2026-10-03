import ExternalServices from "./ExternalServices.mjs";
import {
  alertMessage,
  loadHeaderFooter,
  renderBreadcrumbs,
} from "./utils.mjs";

const registrationForm = document.querySelector("#registration-form");
const submitButton = document.querySelector("#registration-submit");
const externalServices = new ExternalServices();

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!registrationForm.reportValidity()) return;

  const fullName = registrationForm.elements.name.value.trim();
  const [firstName, ...lastNameParts] = fullName.split(/\s+/);
  const userData = {
    firstname: firstName,
    lastname: lastNameParts.join(" "),
    address: registrationForm.elements.address.value.trim(),
    email: registrationForm.elements.email.value.trim().toLowerCase(),
    password: registrationForm.elements.password.value,
  };

  submitButton.disabled = true;
  try {
    await externalServices.registerUser(userData);
    const accountProfile = { name: fullName, email: userData.email };
    localStorage.setItem("so-account-profile", JSON.stringify(accountProfile));
    window.location.href = "/checkout/success.html?type=registration";
  } catch (error) {
    console.error("Unable to register account:", error);
    alertMessage(
      "Unable to create your account. Please check your information and try again.",
      true
    );
  } finally {
    submitButton.disabled = false;
  }
});

loadHeaderFooter();
renderBreadcrumbs();
