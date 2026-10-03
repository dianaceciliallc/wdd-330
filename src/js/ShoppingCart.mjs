import {
    addProductToCart,
    alertMessage,
    getPath,
    getLocalStorage,
    getSavedItems,
    renderListWithTemplate,
    setLocalStorage,
    setSavedItems,
    updateCartCount,
} from "./utils.mjs";

function cartItemKey(item) {
    const color = item.selectedColor || item.Colors?.[0];
    return `${item.Id}:${color?.ColorCode || color?.ColorName || ""}`;
}

function cartItemTemplate(item) {
    const quantity = item.quantity || 1;
    const itemTotal = (item.FinalPrice * quantity).toFixed(2);
    const itemKey = cartItemKey(item);
    const selectedColor = item.selectedColor || item.Colors?.[0];

    return `
    <li class="cart-card divider">
        <span class="remove-item" data-key="${itemKey}" title="Remove item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </span>
        <a href="#" class="cart-card__image">
            <img src="${selectedColor?.ColorPreviewImageSrc || item.Images.PrimarySmall}" alt="${item.Name}" />
        </a>
        <a href="#">
            <h2 class="card__name">${item.Name}</h2>
        </a>
        <p class="cart-card__color">${selectedColor?.ColorName || ""}</p>
        <p class="cart-card__price">$${itemTotal}</p>
        <div class="cart-card__quantity">
            <button class="btn-qty btn-decrement" data-key="${itemKey}">-</button>
            <input 
                type="number" 
                id="qty-${itemKey}"
                class="cart-quantity-input" 
                value="${quantity}" 
                min="1" 
                data-key="${itemKey}"
            />
            <button class="btn-qty btn-increment" data-key="${itemKey}">+</button>
        </div>
    </li>
    `;
}

function savedItemTemplate(item) {
    const image = item.Images?.PrimarySmall || item.Image || "";
    return `
    <li class="saved-item product-card--new">
        <a class="product-link" href="${getPath()}product_pages/index.html?product=${item.Id}">
            <div class="product-img-wrapper">
                <img src="${image}" alt="${item.Name}" loading="lazy" />
            </div>
            <div class="product-body">
                <h3 class="product-title">${item.NameWithoutBrand || item.Name}</h3>
                <p class="product-price">$${Number(item.FinalPrice).toFixed(2)}</p>
            </div>
        </a>
        <div class="saved-item__actions">
            <button class="btn-checkout" type="button" data-saved-action="move" data-id="${item.Id}">
                Move to Cart
            </button>
            <button class="saved-item__remove" type="button" data-saved-action="remove" data-id="${item.Id}">
                Remove
            </button>
        </div>
    </li>
    `;
}

export default class ShoppingCart {
    constructor(key, listElement) {
        this.key = key;
        this.listElement = listElement;
        this.savedListElement = document.querySelector("#saved-items-list");
        this.initEventListeners();
    }

    async init() {
        this.renderCartContents();
    }

    getConsolidatedCart() {
        const rawItems = getLocalStorage(this.key) || [];
        const consolidated = [];

        rawItems.forEach((item) => {
            const existing = consolidated.find((product) => cartItemKey(product) === cartItemKey(item));
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
        } else {
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

        this.renderSavedItems();
    }

    renderSavedItems() {
        if (!this.savedListElement) return;

        const savedItems = getSavedItems();
        this.savedListElement.innerHTML = savedItems.length
            ? savedItems.map(savedItemTemplate).join("")
            : "<li class=\"no-results\">You have no saved items yet.</li>";
    }

    initEventListeners() {
        this.listElement.addEventListener("click", (event) => {
            const removeBtn = event.target.closest(".remove-item");
            if (removeBtn) {
                const itemKey = removeBtn.dataset.key;
                if (itemKey) this.removeFromCart(itemKey);
                return;
            }

            const qtyBtn = event.target.closest(".btn-qty");
            if (qtyBtn) {
                const itemKey = qtyBtn.dataset.key;
                if (!itemKey) return;

                if (qtyBtn.classList.contains("btn-increment")) {
                    this.changeQuantity(itemKey, 1);
                } else if (qtyBtn.classList.contains("btn-decrement")) {
                    this.changeQuantity(itemKey, -1);
                }
            }
        });

        this.listElement.addEventListener("change", (event) => {
            if (event.target.classList.contains("cart-quantity-input")) {
                const itemKey = event.target.dataset.key;
                const newQty = parseInt(event.target.value, 10);
                if (!itemKey) return;
                if (newQty > 0) {
                    this.updateItemQuantity(itemKey, newQty);
                } else {
                    event.target.value = 1;
                    this.updateItemQuantity(itemKey, 1);
                }
            }
        });

        if (this.savedListElement) {
            this.savedListElement.addEventListener("click", (event) => {
                const button = event.target.closest("[data-saved-action]");
                if (!button) return;

                const savedItems = getSavedItems();
                const savedItem = savedItems.find(
                    (item) => String(item.Id) === button.dataset.id
                );
                if (!savedItem) return;

                try {
                    if (button.dataset.savedAction === "move") {
                        addProductToCart(savedItem);
                        alertMessage("Product moved to your cart.", false);
                    } else {
                        setSavedItems(
                            savedItems.filter(
                                (item) => String(item.Id) !== button.dataset.id
                            )
                        );
                        alertMessage("Product removed from your saved items.", false);
                    }
                    this.renderCartContents();
                } catch (error) {
                    console.error("Unable to update saved products:", error);
                    alertMessage("Unable to update your saved items.", true);
                }
            });
        }
    }

    changeQuantity(itemKey, delta) {
        const cartItems = getLocalStorage(this.key) || [];
        const item = cartItems.find((product) => cartItemKey(product) === itemKey);
        if (item) {
            const currentQty = parseInt(item.quantity, 10) || 1;
            const newQty = currentQty + delta;
            if (newQty >= 1) {
                this.updateItemQuantity(itemKey, newQty);
            }
        }
    }

    updateItemQuantity(itemKey, newQty) {
        let cartItems = getLocalStorage(this.key) || [];
        const itemIndex = cartItems.findIndex((product) => cartItemKey(product) === itemKey);

        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = newQty;
            setLocalStorage(this.key, cartItems);

            if (typeof updateCartCount === "function") updateCartCount();
            this.renderCartContents();
        }
    }

    removeFromCart(itemKey) {
        let cartItems = getLocalStorage(this.key) || [];
        const index = cartItems.findIndex((item) => cartItemKey(item) === itemKey);

        if (index !== -1) {
            cartItems.splice(index, 1);
            setLocalStorage(this.key, cartItems);
            if (typeof updateCartCount === "function") updateCartCount();
            this.renderCartContents();
        }
    }
}