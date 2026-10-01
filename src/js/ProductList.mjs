import { renderListWithTemplate, calculateDiscount } from "./utils.mjs";

function productCardTemplate(product) {
  const { isDiscounted, discountPercent } = calculateDiscount(product);
  
  const smallImg = product.Images?.PrimarySmall || product.Image;
  const mediumImg = product.Images?.PrimaryMedium || product.Image;
  const largeImg = product.Images?.PrimaryLarge || product.Image;

  return `
    <li class="product-card--new" data-category="tents">
      <a class="product-link" href="/product_pages/index.html?product=${product.Id}">
      <div class="product-img-wrapper">
          ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
          <span class="product-tag">${product.Brand.Name}</span>
          <picture>
            <source media="(min-width: 900px)" srcset="${largeImg}">
            <source media="(min-width: 600px)" srcset="${mediumImg}">
            <img src="${smallImg}" alt="${product.Name}" loading="lazy" />
          </picture>
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
    this.products = [];
  }
  async init() {
    const list = await this.dataSource.getData(this.category);

    this.products = list;

    this.sortProducts("name-asc");
    this.renderProductList(this.products);

    const categoryName = this.category.charAt(0).toUpperCase() + this.category.slice(1);

    const titleElement = document.querySelector('.category-title');
    if (titleElement) {
      titleElement.textContent = `Top Products: ${categoryName}`;
    }

    this.initSortListener();
  }
  renderProductList(list) {
    this.listElement.innerHTML = "";
    renderListWithTemplate(productCardTemplate, this.listElement, list, 'afterbegin', true);
  }
  initSortListener() {
    const sortSelect = document.querySelector("#sort-select") || document.querySelector("select");
    if (!sortSelect) return;

    sortSelect.addEventListener("change", (event) => {
      const sortValue = event.target.value;
      this.sortProducts(sortValue);
      this.renderProductList(this.products);
    });
  }
  sortProducts(criteria) {
    switch (criteria) {
      case "name-asc":
      case "Name (A-Z)":
        this.products.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case "name-desc":
      case "Name (Z-A)":
        this.products.sort((a, b) => b.Name.localeCompare(a.Name));
        break;
      case "price-asc":
      case "Price (Low to High)":
        this.products.sort((a, b) => a.FinalPrice - b.FinalPrice);
        break;
      case "price-desc":
      case "Price (High to Low)":
        this.products.sort((a, b) => b.FinalPrice - a.FinalPrice);
        break;
      default:
        break;
    }
  }
}