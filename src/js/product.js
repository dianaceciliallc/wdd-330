import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { getParam } from "./utils.mjs";

const productID = getParam("product");
const dataSource = new ProductData("tents");

const product = new ProductDetails(productID, dataSource);
product.init();
