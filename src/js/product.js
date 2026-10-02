import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam, updateCartCount, loadHeaderFooter } from "./utils.mjs";

const productID = getParam("product");
const dataSource = new ExternalServices("tents");

const product = new ProductDetails(productID, dataSource);

window.addEventListener("DOMContentLoaded", async () => {
  await product.init();
  updateCartCount();
  loadHeaderFooter();
});
