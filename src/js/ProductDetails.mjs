import { setLocalStorage, getLocalStorage, calculateDiscount } from "./utils.mjs";

export default class ProductDetails {
    constructor(productID, dataSource) {
        this.productID = productID;
        this.product = {};
        this.dataSource = dataSource;
    }
    async init() {
        this.product = await this.dataSource.findProductById(this.productID);
        this.renderProductDetails();

        document.getElementById("addToCart")
            .addEventListener("click", this.addProductToCart.bind(this));
    }
    addProductToCart() {
        let cartItems = getLocalStorage("so-cart") || [];
        if (!Array.isArray(cartItems)) {
            cartItems = [];
        }
        cartItems.push(this.product);
        setLocalStorage("so-cart", cartItems);
    }
    renderProductDetails() {
        const { isDiscounted, discountPercent } = calculateDiscount(this.product);
        const productDetails = document.querySelector(".product-detail");
        productDetails.innerHTML = `
            <h3>${this.product.Brand.Name}</h3>
        <h2 class="divider">${this.product.NameWithoutBrand}</h2>
        
        <div class="product-detail__image-container">
            <img class="divider" src="${this.product.Image}" alt="${this.product.Name}"/>
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