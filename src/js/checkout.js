import { loadHeaderFooter, renderBreadcrumbs } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

const checkoutProcess = new CheckoutProcess("so-cart", "orderSummary");
checkoutProcess.init();

loadHeaderFooter();
renderBreadcrumbs();
