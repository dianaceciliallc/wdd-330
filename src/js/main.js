import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.mjs";
import { updateCartCount } from "./utils.mjs";

const productList = document.querySelector(".product-list");

const dataSource = new ProductData("tents");
const productListView = new ProductList("tents", dataSource, productList);

const alert = new Alert("/json/alerts.json");

window.addEventListener("DOMContentLoaded", async () => {
  await productListView.init();
  alert.init();
  updateCartCount();
});
