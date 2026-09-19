import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

const productList = document.querySelector(".product-list");

const dataSource = new ProductData("tents");
const productListView = new ProductList("tents", dataSource, productList);

window.addEventListener("DOMContentLoaded", async () => {
  await productListView.init();
});
