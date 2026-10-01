import { renderListWithTemplate, calculateDiscount } from "./utils.mjs";

function productCardTemplate(product) {
  const { isDiscounted, discountPercent } = calculateDiscount(product);
  return `
    <li class="product-card--new" data-category="tents">
      <a class="product-link" href="/product_pages/index.html?product=${product.Id}">
      <div class="product-img-wrapper">
          ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
          <span class="product-tag">${product.Brand.Name}</span>
          <img src="${product.Images.PrimaryMedium}" alt="${product.Name}" />
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.NameWithoutBrand}</h3>
          <div class="product-footer">
            <span class="product-price">
              ${isDiscounted ? `<span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>` : ""}
              $${product.FinalPrice.toFixed(2)}
            </span>
          </div>
        </div> 
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
    const list = await this.dataSource.getData(this.category);
    this.renderProductList(list)

    const categoryName = this.category.charAt(0).toUpperCase() + this.category.slice(1);

    const titleElement = document.querySelector('.category-title');
    if (titleElement) {
      titleElement.textContent = `Top Products: ${categoryName}`;
    }
  }
  renderProductList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }
}