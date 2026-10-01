import ProductData from './ProductData.mjs';
import ProductList from './ProductList.mjs';
import { loadHeaderFooter, getParam } from './utils.mjs';

const searchParam = getParam("search");

const category = getParam('category');
const productList = document.querySelector(".product-grid");

const dataSource = new ProductData();
const productListView = new ProductList(category, dataSource, productList, searchParam);

window.addEventListener("DOMContentLoaded", async () => {
  await productListView.init();
  loadHeaderFooter();
});