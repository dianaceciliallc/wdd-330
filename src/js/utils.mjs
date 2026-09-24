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
  const cartCountElement = qs(".cart-count");

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

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const headerElement = document.getElementById("header");

  const footerTemplate = await loadTemplate("/partials/footer.html");
  const footerElement = document.getElementById("footer");

  renderWithTemplate(headerTemplate, headerElement, null, updateCartCount);
  renderWithTemplate(footerTemplate, footerElement);
}