import { getLocalStorage, setLocalStorage, updateCartCount, renderListWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
    return `
  <li class="cart-card divider">
    <span class="remove-item" data-id="${item.Id}">❌</span>
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice.toFixed(2)}</p>
  </li>`;
}

export default class ShoppingCart {
    constructor(key, listElement) {
        this.key = key;
        this.listElement = listElement;
    }

    async init() {
        this.renderCartContents();
    }

    renderCartContents() {
        const cartItems = getLocalStorage(this.key) || [];
        const cartFooter = document.querySelector(".cart-footer");

        this.listElement.innerHTML = "";

        if (cartItems.length === 0) {
            this.listElement.innerHTML = "<p>Your cart is empty.</p>";
            if (cartFooter) cartFooter.classList.add("hide");
            return;
        }

        renderListWithTemplate(
            cartItemTemplate,
            this.listElement,
            cartItems,
            "afterbegin",
            true
        );

        const total = cartItems.reduce((acc, item) => acc + item.FinalPrice, 0);
        const totalElement = document.querySelector(".cart-total-value");
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (cartFooter) cartFooter.classList.remove("hide");

        this.addRemoveListeners();
    }

    addRemoveListeners() {
        const removeButtons = this.listElement.querySelectorAll(".remove-item");
        removeButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                const idToRemove = event.target.dataset.id;
                this.removeFromCart(idToRemove);
            });
        });
    }

    removeFromCart(id) {
        let cartItems = getLocalStorage(this.key) || [];
        const index = cartItems.findIndex((item) => item.Id === id);

        if (index !== -1) {
            cartItems.splice(index, 1);
            setLocalStorage(this.key, cartItems);
            if (typeof updateCartCount === "function") updateCartCount();
            this.renderCartContents();
        }
    }
}