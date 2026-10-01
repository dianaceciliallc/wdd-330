import { getLocalStorage, setLocalStorage, updateCartCount, renderListWithTemplate } from "./utils.mjs";

function cartItemTemplate(item) {
    const quantity = item.quantity || 1;
    const itemTotal = (item.FinalPrice * quantity).toFixed(2);

    return `
    <li class="cart-card divider">
        <span class="remove-item" data-id="${item.Id}" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </span>
        <a href="#" class="cart-card__image">
            <img src="${item.Images.PrimarySmall}" alt="${item.Name}" />
        </a>
        <a href="#">
            <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${item.Colors[0].ColorName}</p>
        <p class="cart-card__price">$${itemTotal}</p>
        <div class="cart-card__quantity">
            <button class="btn-qty btn-decrement" data-id="${item.Id}">-</button>
            <input 
                type="number" 
                id="qty-${item.Id}" 
                class="cart-quantity-input" 
                value="${quantity}" 
                min="1" 
                data-id="${item.Id}" 
            />
            <button class="btn-qty btn-increment" data-id="${item.Id}">+</button>
        </div>
    </li>
    `;
}

export default class ShoppingCart {
    constructor(key, listElement) {
        this.key = key;
        this.listElement = listElement;
        this.initEventListeners();
    }

    async init() {
        this.renderCartContents();
    }

    getConsolidatedCart() {
        const rawItems = getLocalStorage(this.key) || [];
        const consolidated = [];

        rawItems.forEach((item) => {
            const existing = consolidated.find((p) => p.Id === item.Id);
            const itemQty = item.quantity || 1;

            if (existing) {
                existing.quantity = (existing.quantity || 1) + itemQty;
            } else {
                consolidated.push({ ...item, quantity: itemQty });
            }
        });

        setLocalStorage(this.key, consolidated);
        return consolidated;
    }

    renderCartContents() {
        const cartItems = this.getConsolidatedCart();
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

        const total = cartItems.reduce((acc, item) => acc + item.FinalPrice * (item.quantity || 1), 0);
        const totalElement = document.querySelector(".cart-total-value");
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (cartFooter) cartFooter.classList.remove("hide");
    }

    initEventListeners() {
        this.listElement.addEventListener("click", (event) => {
            const removeBtn = event.target.closest(".remove-item");
            if (removeBtn) {
                const idToRemove = removeBtn.dataset.id;
                if (idToRemove) this.removeFromCart(idToRemove);
                return;
            }

            const qtyBtn = event.target.closest(".btn-qty");
            if (qtyBtn) {
                const id = qtyBtn.dataset.id;
                if (!id) return;

                if (qtyBtn.classList.contains("btn-increment")) {
                    this.changeQuantity(id, 1);
                } else if (qtyBtn.classList.contains("btn-decrement")) {
                    this.changeQuantity(id, -1);
                }
            }
        });

        this.listElement.addEventListener("change", (event) => {
            if (event.target.classList.contains("cart-quantity-input")) {
                const id = event.target.dataset.id;
                const newQty = parseInt(event.target.value, 10);
                if (newQty > 0) {
                    this.updateItemQuantity(id, newQty);
                } else {
                    event.target.value = 1;
                    this.updateItemQuantity(id, 1);
                }
            }
        });
    }

    changeQuantity(id, delta) {
        const cartItems = getLocalStorage(this.key) || [];
        const item = cartItems.find((prod) => prod.Id === id);
        if (item) {
            const currentQty = parseInt(item.quantity, 10) || 1;
            const newQty = currentQty + delta;
            if (newQty >= 1) {
                this.updateItemQuantity(id, newQty);
            }
        }
    }

    updateItemQuantity(id, newQty) {
        let cartItems = getLocalStorage(this.key) || [];
        const itemIndex = cartItems.findIndex((prod) => prod.Id === id);

        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = newQty;
            setLocalStorage(this.key, cartItems);

            if (typeof updateCartCount === "function") updateCartCount();
            this.renderCartContents();
        }
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