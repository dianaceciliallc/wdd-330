import { hasAuthenticatedSession } from "./ExternalServices.mjs";

// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function wishlistStorageKey() {
  if (!hasAuthenticatedSession()) return null;
  const email = sessionStorage.getItem("so-account-email")?.trim().toLowerCase();
  return email ? `so-wishlist:${encodeURIComponent(email)}` : null;
}

export function getSavedItems() {
  const key = wishlistStorageKey();
  if (!key) return [];

  const savedItems = JSON.parse(sessionStorage.getItem(key) || "[]");
  if (!Array.isArray(savedItems)) {
    throw new Error("Saved products data is invalid.");
  }
  return savedItems;
}

export function setSavedItems(items) {
  const key = wishlistStorageKey();
  if (!key) {
    throw new Error("Sign in to save products to your account.");
  }
  sessionStorage.setItem(key, JSON.stringify(items));
  updateSavedCount();
}

export function updateSavedCount() {
  return getSavedItems().length;
}

export function addProductToCart(product, selectedColor = product.selectedColor || product.Colors?.[0] || null) {
  const cartItems = getLocalStorage("so-cart") || [];
  const colorKey = selectedColor?.ColorCode || selectedColor?.ColorName || "";
  const existingItem = cartItems.find((item) => {
    const itemColor = item.selectedColor || item.Colors?.[0];
    const itemColorKey = itemColor?.ColorCode || itemColor?.ColorName || "";
    return String(item.Id) === String(product.Id) && itemColorKey === colorKey;
  });

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cartItems.push({
      ...product,
      selectedColor,
      quantity: 1,
    });
  }

  setLocalStorage("so-cart", cartItems);
  updateCartCount();

  const savedItems = getSavedItems();
  const remainingSavedItems = savedItems.filter(
    (item) => String(item.Id) !== String(product.Id)
  );
  if (remainingSavedItems.length !== savedItems.length) {
    setSavedItems(remainingSavedItems);
  }
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  const productElements = list.map((product) => templateFn(product))
  parentElement.insertAdjacentHTML(position, productElements.join(''));
}

export function calculateDiscount(product) {
  if (!product || !product.SuggestedRetailPrice || !product.ListPrice) {
    return { isDiscounted: false, discountPercent: 0 };
  }

  const isDiscounted = product.ListPrice < product.SuggestedRetailPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.SuggestedRetailPrice - product.ListPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  return {
    isDiscounted,
    discountPercent
  };
}

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCountElement = qs(".cart-badge");

  if (!cartCountElement) return;

  const totalItems = cartItems.length;

  if (totalItems > 0) {
    cartCountElement.textContent = totalItems;
    cartCountElement.classList.remove("hide");
  } else {
    cartCountElement.classList.add("hide");
  }
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback();
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load template "${path}" (${response.status}).`);
  }
  const template = await response.text();
  return template;
}

export function getPath() {
  const nestedPage = /\/(?:cart|checkout|login|orders|product_listing|product_pages|register)(?:\/|$)/.test(
    window.location.pathname
  );
  return nestedPage ? "../" : "./";
}

export function setupSearch() {
  const searchContainer = document.querySelector(".search-container");
  const path = window.location.pathname;

  if (path.includes("cart") || path.includes("product_pages")) {
    if (searchContainer) {
      searchContainer.style.display = "none";
    }
    return;
  }

  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `${getPath()}product_listing/index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

export async function loadHeaderFooter() {
  try {
    const appRelativeRoot = getPath();
    const headerTemplate = await loadTemplate(
      `${appRelativeRoot}partials/header.html`
    );
    const headerElement = document.getElementById("header");

    const footerTemplate = await loadTemplate(
      `${appRelativeRoot}partials/footer.html`
    );
    const footerElement = document.getElementById("footer");

    if (headerElement) {
      renderWithTemplate(
        headerTemplate.replaceAll("{{basePath}}", appRelativeRoot),
        headerElement,
        null,
        () => {
        updateCartCount();
        updateSavedCount();
        initializeAccountMenu();
        }
      );
    }

    if (footerElement) {
      renderWithTemplate(
        footerTemplate.replaceAll("{{basePath}}", appRelativeRoot),
        footerElement
      );
      initializeRegistrationAlert();
    }

    setupSearch();

  } catch (error) {
    console.error("Error header/footer:", error);
  }
}

function initializeAccountMenu() {
  const accountName = sessionStorage.getItem("so-account-name");
  const isSignedIn = hasAuthenticatedSession();
  const staffLoginLink = document.querySelector(".staff-login-link");
  const registerLink = document.querySelector(".register-link");
  const accountSession = document.querySelector(".account-session");

  if (!staffLoginLink || !registerLink || !accountSession) return;

  staffLoginLink.classList.toggle("hide", isSignedIn);
  registerLink.classList.toggle("hide", isSignedIn);
  accountSession.classList.toggle("hide", !isSignedIn);

  if (isSignedIn) {
    accountSession.querySelector(".account-name").textContent =
      accountName || "Staff";
    accountSession.querySelector(".account-signout").addEventListener("click", () => {
      sessionStorage.removeItem("so-account-name");
      sessionStorage.removeItem("so-account-email");
      sessionStorage.removeItem("so-auth-token");
      sessionStorage.removeItem("so-authenticated");
      window.location.href = `${getPath()}index.html`;
    });
  }
}

function initializeRegistrationAlert() {
  const storageKey = "so-registration-promo-modal-seen";
  if (
    localStorage.getItem(storageKey) ||
    hasAuthenticatedSession() ||
    document.querySelector("#registration-promo-modal")
  ) {
    return;
  }

  const modal = document.createElement("dialog");
  modal.id = "registration-promo-modal";
  modal.className = "registration-promo-modal";
  modal.setAttribute("aria-labelledby", "registration-promo-title");
  modal.innerHTML = `
    <button class="registration-promo__close" type="button" aria-label="Close promotion">
      &times;
    </button>
    <p class="registration-promo__eyebrow">Giveaway</p>
    <h2 id="registration-promo-title">Enter for a chance to win outdoor gear</h2>
    <p class="registration-promo__disclaimer">
      By creating an account, you will be entered into our monthly giveaway for a chance to win a sample camping gear bundle. No purchase necessary. See official rules for details.
    </p>
    <section class="registration-promo__details" aria-labelledby="registration-promo-details-title">
      <h3 id="registration-promo-details-title">Sample camping gear bundle</h3>
      <p>
        Explore a sample collection inspired by our catalog: a tent for shelter,
        a backpack for carrying essentials, and a sleeping bag for nights outdoors.
      </p>
      <p class="registration-promo__note">
        *Winners will be selected at random and notified via email. By creating an account, you agree to receive promotional emails from us. You can unsubscribe at any time.
      </p>
    </section>
    <a class="btn-checkout registration-promo__register" href="${getPath()}register/index.html?type=registration">
      Create an account
    </a>
  `;

  modal.querySelector(".registration-promo__close").addEventListener("click", () => {
    modal.close();
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
  document.body.append(modal);

  try {
    modal.showModal();
    localStorage.setItem(storageKey, "true");
  } catch (error) {
    modal.remove();
    console.error("Unable to show registration promotion:", error);
  }
}

export function renderBreadcrumbs(category, itemCount = null, productName = null) {
  const breadcrumbsElement = document.querySelector("#breadcrumbs");
  if (!breadcrumbsElement) return;

  const path = window.location.pathname;

  if (
    path === "/" ||
    (path.endsWith("/index.html") &&
      !path.includes("product_listing") &&
      !path.includes("product_pages") &&
      !path.includes("cart")) &&
    !path.includes("checkout") &&
    !path.includes("success")) {
    breadcrumbsElement.innerHTML = "";
    return;
  }

  if (path.includes("cart")) {
    breadcrumbsElement.innerHTML = `
      <li><a href="${getPath()}index.html">Home</a></li>
      <li>Cart</li>
    `;
    return;
  }

  if (!category) return;

  const formattedCategory = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  if (path.includes("product_listing")) {
    const countItem = itemCount !== null ? `<li>(${itemCount} items)</li>` : "";

    breadcrumbsElement.innerHTML = `
      <li><a href="${getPath()}index.html">Home</a></li>
      <li>${formattedCategory}</li>
      ${countItem}
    `;
  }
  else if (path.includes("product_pages")) {
    const productTitle = productName ? `<li>${productName}</li>` : "";

    breadcrumbsElement.innerHTML = `
      <li><a href="${getPath()}index.html">Home</a></li>
      <li><a href="${getPath()}product_listing/index.html?category=${category.toLowerCase()}">${formattedCategory}</a></li>
      ${productTitle}
    `;
  }
}

export function alertMessage(message, scroll = true) {
  const alert = document.createElement('div');
  alert.classList.add('alert-wrapper');

  alert.innerHTML = `
    <p class="custom-alert" style="background-color: ${scroll ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)'}">
      <span>${message}</span>
      <button class="close-btn" aria-label="Close alert">X</button>
    </p>
  `;

  const main = document.querySelector('main');

  alert.addEventListener('click', function (e) {
    if (e.target.classList.contains('close-btn') || e.target.innerText === 'X') {
      main.removeChild(this);
    }
  });

  if (main) {
    main.prepend(alert);
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function renderQuickViewModal(product) {
  const modal = document.querySelector("#quick-view-modal");
  const modalContent = document.querySelector("#modal-content");

  if (!modal || !modalContent) return;

  const isDiscounted = product.SuggestedRetailPrice > product.FinalPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100)
    : 0;

  modalContent.innerHTML = `
    <h3>${product.Brand?.Name || ''}</h3>
    <h2 class="divider">${product.NameWithoutBrand || product.Name}</h2>
    
    <div class="product-detail__image-container">
      <img src="${product.Images?.PrimaryMedium || product.Image}" alt="${product.Name}" />
      ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
    </div>

    <p class="product-card__price">
      ${isDiscounted ? `<span class="original-price">$${product.SuggestedRetailPrice.toFixed(2)}</span>` : ""}
      <span class="final-price">$${product.FinalPrice.toFixed(2)}</span>
    </p>

    <div class="product__description">${product.DescriptionHtmlSimple}</div>
    
    <div class="product-detail__add">
      <button id="modalAddToCart">Add to Cart</button>
    </div>
  `;

  document.querySelector("#modalAddToCart").addEventListener("click", () => {
    addProductToCart(product);
    alertMessage("Product added to cart successfully!", false);
    modal.close();
  });

  modal.showModal();
}

export function animateCartIcon() {
  const cartElement =
    document.querySelector(".cart-btn")

  if (cartElement) {
    cartElement.classList.add("cart-animate");

    cartElement.addEventListener(
      "animationend",
      () => {
        cartElement.classList.remove("cart-animate");
      },
      { once: true }
    );
  }
}