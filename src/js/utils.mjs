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
      !path.includes("cart"))
  ) {
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