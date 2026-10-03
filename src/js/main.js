import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.mjs";
import {
  getAppRelativeRoot,
  updateCartCount,
  loadHeaderFooter,
} from "./utils.mjs";

const productList = document.querySelector(".product-list");

const dataSource = new ExternalServices("tents");
const productListView = new ProductList("tents", dataSource, productList);

const alert = new Alert("./json/alerts.json");

window.addEventListener("DOMContentLoaded", async () => {
  const newsletterForm = document.querySelector("#newsletter-form");
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = `${getAppRelativeRoot()}checkout/success.html?type=subscription`;
  });

  await productListView.init();
  alert.init();
  updateCartCount();
  loadHeaderFooter();
});
