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
  const template = await response.text();
  return template;
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
          window.location.href = `/product_listing/index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("../partials/header.html");
    const headerElement = document.getElementById("header");

    const footerTemplate = await loadTemplate("../partials/footer.html");
    const footerElement = document.getElementById("footer");

    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement, null, updateCartCount);
    }

    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }

    setupSearch();

  } catch (error) {
    console.error("Error header/footer:", error);
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
      <li><a href="/index.html">Home</a></li>
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
      <li><a href="/index.html">Home</a></li>
      <li>${formattedCategory}</li>
      ${countItem}
    `;
  }
  else if (path.includes("product_pages")) {
    const productTitle = productName ? `<li>${productName}</li>` : "";

    breadcrumbsElement.innerHTML = `
      <li><a href="/index.html">Home</a></li>
      <li><a href="/product_listing/index.html?category=${category.toLowerCase()}">${formattedCategory}</a></li>
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
    let cartItems = getLocalStorage("so-cart") || [];
    const index = cartItems.findIndex((item) => item.Id === product.Id);

    if (index !== -1) {
      cartItems[index].quantity = (cartItems[index].quantity || 1) + 1;
    } else {
      product.quantity = 1;
      cartItems.push(product);
    }

    setLocalStorage("so-cart", cartItems);
    alertMessage("Product added to cart successfully!", false);
    if (typeof updateCartCount === "function") updateCartCount();
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