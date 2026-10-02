import { loadHeaderFooter, renderBreadcrumbs } from "./utils.mjs";
import ShoppingCart from "./ShoppingCart.mjs";


const listElement = document.querySelector(".product-list");
const cart = new ShoppingCart("so-cart", listElement);

cart.init();
loadHeaderFooter();
renderBreadcrumbs();