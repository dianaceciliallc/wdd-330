import { renderListWithTemplate, calculateDiscount } from "./utils.mjs";

function productCardTemplate(product) {
  const { isDiscounted, discountPercent } = calculateDiscount(product);
  return `
    <li class="product-card">
      <a href="product_pages/index.html?product=${product.Id}">
        ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
        <img src=${product.Image} alt=${product.Name} />
        <h3 class="card__brand">${product.Brand.Name}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">
          ${isDiscounted ? `<span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>` : ""}
          $${product.FinalPrice.toFixed(2)}
        </p>
      </a>
    </li>
    `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }
  async init() {
    const list = await this.dataSource.getData();
    this.renderProductList(list);
  }
  renderProductList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }
}