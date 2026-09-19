import { setLocalStorage, getLocalStorage } from "./utils.mjs";

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
        const cartItems = getLocalStorage("so-cart") || [];
        if (!Array.isArray(cartItems)) {
            cartItems = [];
        }
        cartItems.push(this.product);
        setLocalStorage("so-cart", cartItems);
    }
    renderProductDetails() {
        const productDetails = document.querySelector(".product-detail");
        productDetails.innerHTML = `
        <h3>${this.product.Brand.Name}</h3>
        <h2 class="divider">${this.product.NameWithoutBrand}</h2>
        <img class="divider" src="${this.product.Image}" alt="${this.product.Name}" />
        <p class="product-card__price">$${this.product.ListPrice}</p>
        <p class="product__color">${this.product.Colors[0].ColorName}</p>
        <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
        <div class="product-detail__add">
            <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
        </div>
    `;
    }
}