import ProductData from "./ProductData.mjs";

const productList = document.querySelector(".product-list");

const dataSource = new ProductData("tents");

window.addEventListener("DOMContentLoaded", async () => {
  const products = await dataSource.getData();
  products.forEach((product) => {
    const productElement = document.createElement("li");
    productElement.classList.add("product-card");
    productElement.innerHTML = `
        <a href="product_pages/index.html?product=${product.Id}">
            <img
            src=${product.Image}
            alt=${product.Name}
            />
            <h3 class="card__brand">${product.Brand.Name}</h3>
            <h2 class="card__name">${product.NameWithoutBrand}</h2>
            <p class="product-card__price">$${product.ListPrice}</p>
        </a>
    `;
    productList.appendChild(productElement);
  });
});
