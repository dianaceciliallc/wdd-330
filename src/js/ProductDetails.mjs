import {
  setLocalStorage,
  getLocalStorage,
  calculateDiscount,
  updateCartCount,
  renderBreadcrumbs,
  alertMessage,
  animateCartIcon
} from "./utils.mjs";

export default class ProductDetails {
  constructor(productID, dataSource) {
    this.productID = productID;
    this.product = {};
    this.dataSource = dataSource;
  }
  async init() {
    this.product = await this.dataSource.findProductById(this.productID);
    this.renderProductDetails();

    if (this.product && this.product.Category) {
      renderBreadcrumbs(this.product.Category, null, this.product.Name);
    }

    const addButton = document.getElementById("addToCart");
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.addProductToCart();
      });
    }
  }
  addProductToCart() {
    let cartItems = getLocalStorage("so-cart") || [];
    const isIndex = cartItems.findIndex((item) => item.Id === this.product.Id);
    if (isIndex !== -1) {
      cartItems[isIndex].quantity = (cartItems[isIndex].quantity || 1) + 1;
    } else {
      this.product.quantity = 1;
      cartItems.push(this.product);
    }
    
    setLocalStorage("so-cart", cartItems);
    if (typeof updateCartCount === "function") {
      updateCartCount();
    }

    alertMessage("Product added to cart successfully!", false);
    animateCartIcon();
  }

  renderProductDetails() {
    const { isDiscounted, discountPercent } = calculateDiscount(this.product);
    const productDetails = document.querySelector(".product-detail");

    const smallImg = this.product.Images?.PrimarySmall || this.product.Image;
    const mediumImg = this.product.Images?.PrimaryMedium || this.product.Image;
    const largeImg = this.product.Images?.PrimaryLarge || this.product.Image;

    productDetails.innerHTML = `
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      
      <div class="product-detail__image-container">
        <picture class="divider">
          <source media="(min-width: 900px)" srcset="${largeImg}">
          <source media="(min-width: 600px)" srcset="${mediumImg}">
          <img src="${mediumImg}" alt="${this.product.Name}" />
        </picture>
        ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
      </div>

      <p class="product-card__price">
        ${isDiscounted ? `<span class="original-price">$${this.product.SuggestedRetailPrice.toFixed(2)}</span>` : ""}
        <span class="final-price">$${this.product.FinalPrice.toFixed(2)}</span>
      </p>

      <p class="product__color">${this.product.Colors[0].ColorName}</p>
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
      </div>
    `;
  }
}