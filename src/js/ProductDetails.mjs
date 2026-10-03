import {
  addProductToCart,
  calculateDiscount,
  getPath,
  renderBreadcrumbs,
  alertMessage,
  animateCartIcon,
  getSavedItems,
  setSavedItems,
  setLocalStorage,
} from "./utils.mjs";
import { hasAuthenticatedSession } from "./ExternalServices.mjs";

const productCommentsKey = "so-product-comments";

export default class ProductDetails {
  constructor(productID, dataSource) {
    this.productID = productID;
    this.product = {};
    this.selectedColor = null;
    this.galleryImages = [];
    this.dataSource = dataSource;
  }
  async init() {
    this.product = await this.dataSource.findProductById(this.productID);
    this.selectedColor = this.product.Colors?.[0] || null;
    this.galleryImages = this.getGalleryImages();
    this.renderProductDetails();

    if (this.product && this.product.Category) {
      renderBreadcrumbs(this.product.Category, null, this.product.Name);
    }

    const productDetails = document.querySelector(".product-detail");
    productDetails.addEventListener("click", (event) => {
      const colorButton = event.target.closest("[data-color-index]");
      if (colorButton) {
        this.selectColor(Number(colorButton.dataset.colorIndex));
        return;
      }

      const imageButton = event.target.closest("[data-gallery-index]");
      if (imageButton) {
        this.selectGalleryImage(Number(imageButton.dataset.galleryIndex));
        return;
      }

      const savedButton = event.target.closest("#saveProduct");
      if (savedButton) {
        this.toggleSavedProduct(savedButton);
      }
    });

    productDetails.addEventListener("submit", (event) => {
      if (event.target.id !== "product-comment-form") return;
      event.preventDefault();
      this.addProductComment(event.target);
    });

    this.renderProductComments();

    const addButton = document.getElementById("addToCart");
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.addProductToCart();
      });
    }
  }

  getProductComments() {
    const comments = JSON.parse(localStorage.getItem(productCommentsKey) || "[]");
    if (!Array.isArray(comments)) {
      throw new Error("Saved product comments are invalid.");
    }
    return comments;
  }

  renderProductComments() {
    const commentsList = document.querySelector("#product-comments-list");
    const commentCount = document.querySelector("#product-comment-count");
    if (!commentsList || !commentCount) return;

    try {
      const comments = this.getProductComments().filter(
        (comment) => String(comment.productId) === String(this.product.Id)
      );
      commentCount.textContent = String(comments.length);
      commentsList.replaceChildren();

      if (comments.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "product-comments__empty";
        emptyMessage.textContent = "No comments yet. Be the first to share your thoughts.";
        commentsList.append(emptyMessage);
        return;
      }

      comments
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
        .forEach((comment) => {
          const item = document.createElement("li");
          item.className = "product-comment";

          const author = document.createElement("strong");
          author.className = "product-comment__author";
          author.textContent = comment.author;

          const date = document.createElement("time");
          date.className = "product-comment__date";
          date.dateTime = comment.createdAt;
          date.textContent = new Date(comment.createdAt).toLocaleDateString();

          const text = document.createElement("p");
          text.className = "product-comment__text";
          text.textContent = comment.text;

          const heading = document.createElement("div");
          heading.className = "product-comment__heading";
          heading.append(author, date);
          item.append(heading, text);
          commentsList.append(item);
        });
    } catch (error) {
      console.error("Unable to load product comments:", error);
      commentsList.textContent = "Comments could not be loaded.";
    }
  }

  addProductComment(form) {
    if (!hasAuthenticatedSession()) {
      alertMessage(
        `Please <a href="${getPath()}login/index.html">sign in</a> to post a comment.`,
        true
      );
      return;
    }

    if (!form.reportValidity()) return;

    const author = sessionStorage.getItem("so-account-name")?.trim();
    const text = form.elements.comment.value.trim();
    if (!author || !text) {
      alertMessage("Please sign in again before posting a comment.", true);
      return;
    }

    const comment = {
      productId: String(this.product.Id),
      author,
      text,
      createdAt: new Date().toISOString(),
    };

    try {
      const comments = this.getProductComments();
      comments.push(comment);
      setLocalStorage(productCommentsKey, comments);
      form.reset();
      this.renderProductComments();
      alertMessage("Your comment was added.", false);
    } catch (error) {
      console.error("Unable to save product comment:", error);
      alertMessage("Unable to save your comment. Please try again.", true);
    }
  }

  addProductToCart() {
    addProductToCart(this.product, this.selectedColor);
    alertMessage("Product added to cart successfully!", false);
    animateCartIcon();
  }

  toggleSavedProduct(button) {
    if (
      !hasAuthenticatedSession() ||
      !sessionStorage.getItem("so-account-email")
    ) {
      alertMessage(
        `Please <a href="${getPath()}login/index.html">sign in</a> to save products to your account.`,
        true
      );
      return;
    }

    try {
      const savedItems = getSavedItems();
      const savedIndex = savedItems.findIndex(
        (item) => String(item.Id) === String(this.product.Id)
      );
      const isSaved = savedIndex !== -1;

      if (isSaved) {
        savedItems.splice(savedIndex, 1);
      } else {
        savedItems.push({
          ...this.product,
          selectedColor: this.selectedColor,
        });
      }

      setSavedItems(savedItems);
      button.setAttribute("aria-pressed", String(!isSaved));
      button.setAttribute(
        "aria-label",
        `${isSaved ? "Save" : "Remove"} ${this.product.NameWithoutBrand} ${isSaved ? "from" : "to"} saved items`
      );
      button.title = isSaved ? "Save for later" : "Remove from saved items";
      alertMessage(
        isSaved
          ? "Product removed from your saved items."
          : "Product saved to your wishlist.",
        false
      );
    } catch (error) {
      console.error("Unable to update saved products:", error);
      alertMessage("Unable to update your saved items.", true);
    }
  }

  selectColor(index) {
    const color = this.product.Colors[index];
    if (!color) return;

    this.selectedColor = color;

    document.querySelectorAll("[data-color-index]").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });

    const colorName = document.querySelector("#selected-color-name");
    if (colorName) colorName.textContent = this.selectedColor.ColorName;
  }

  getGalleryImages() {
    const images = this.product.Images || {};
    const primaryImage = images.PrimaryMedium || images.PrimaryLarge || this.product.Image;
    const galleryImages = [
      {
        src: primaryImage,
        smallSrc: images.PrimarySmall,
        mediumSrc: images.PrimaryMedium,
        largeSrc: images.PrimaryLarge,
        title: this.product.Name,
      },
    ];

    for (const [index, image] of (images.ExtraImages || []).entries()) {
      if (!image.Src) continue;

      galleryImages.push({
        src: image.Src,
        smallSrc: image.Src,
        mediumSrc: image.Src,
        largeSrc: image.Src,
        title: image.Title || `${this.product.Name} image ${index + 2}`,
      });
    }

    return galleryImages;
  }

  selectGalleryImage(index) {
    const image = this.galleryImages[index];
    if (!image) return;

    const mainImage = document.querySelector("#product-gallery-main");
    const sources = document.querySelectorAll(".product-gallery__picture source");
    if (!mainImage) return;

    mainImage.src = image.mediumSrc;
    mainImage.alt = image.title;
    sources[0].srcset = image.largeSrc;
    sources[1].srcset = image.mediumSrc;

    document.querySelectorAll("[data-gallery-index]").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
  }

  renderProductDetails() {
    const { isDiscounted, discountPercent } = calculateDiscount(this.product);
    const productDetails = document.querySelector(".product-detail");
    const isSaved = getSavedItems().some(
      (item) => String(item.Id) === String(this.product.Id)
    );

    const mediumImg = this.galleryImages[0].mediumSrc;
    const largeImg = this.galleryImages[0].largeSrc;

    productDetails.innerHTML = `
      <h3>${this.product.Brand.Name}</h3>
      <h2 class="divider">${this.product.NameWithoutBrand}</h2>
      
      <div class="product-detail__image-container">
        <picture class="product-gallery__picture divider">
          <source media="(min-width: 900px)" srcset="${largeImg}" />
          <source media="(min-width: 600px)" srcset="${mediumImg}">
          <img id="product-gallery-main" src="${mediumImg}" alt="${this.galleryImages[0].title}" />
        </picture>
        ${isDiscounted ? `<span class="discount-badge">-${discountPercent}% OFF</span>` : ""}
      </div>
      ${
        this.galleryImages.length > 1
          ? `
            <div class="product-gallery__options" role="group" aria-label="Product images">
              ${this.galleryImages.map((image, index) => `
                <button
                  class="product-gallery__option"
                  type="button"
                  data-gallery-index="${index}"
                  aria-label="View ${image.title}"
                  aria-pressed="${index === 0}"
                >
                  <img src="${image.smallSrc}" alt="" />
                </button>
              `).join("")}
            </div>
          `
          : ""
      }

      <p class="product-card__price">
        ${isDiscounted ? `<span class="original-price">$${this.product.SuggestedRetailPrice.toFixed(2)}</span>` : ""}
        <span class="final-price">$${this.product.FinalPrice.toFixed(2)}</span>
      </p>

      ${
        this.product.Colors?.length
          ? `
            <section class="product-colors" aria-label="Available colors">
              <p class="product__color">
                Color: <span id="selected-color-name">${this.selectedColor.ColorName}</span>
              </p>
              <div class="product-color-swatches" role="group" aria-label="Choose a color">
                ${this.product.Colors.map(
                  (color, index) => `
                    <button
                      class="product-color-swatch"
                      type="button"
                      data-color-index="${index}"
                      aria-label="Select ${color.ColorName}"
                      aria-pressed="${index === 0}"
                      title="${color.ColorName}"
                    >
                      ${
                        color.ColorChipImageSrc
                          ? `<img src="${color.ColorChipImageSrc}" alt="" />`
                          : `<span>${color.ColorName.slice(0, 2)}</span>`
                      }
                    </button>
                  `
                ).join("")}
              </div>
            </section>
          `
          : ""
      }
      <p class="product__description">${this.product.DescriptionHtmlSimple}</p>
      <div class="product-detail__add">
        <button id="addToCart" data-id="${this.product.Id}">Add to Cart</button>
        <button
          id="saveProduct"
          class="product-detail__save"
          type="button"
          aria-label="${isSaved ? "Remove" : "Save"} ${this.product.NameWithoutBrand} ${isSaved ? "from" : "to"} saved items"
          aria-pressed="${isSaved}"
          title="${isSaved ? "Remove from saved items" : "Save for later"}"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3.75h12a1 1 0 0 1 1 1v16l-7-4.5-7 4.5v-16a1 1 0 0 1 1-1Z" />
          </svg>
        </button>
      </div>
      <section class="product-comments" aria-labelledby="product-comments-title">
        <h2 id="product-comments-title">Product Comments (<span id="product-comment-count">0</span>)</h2>
        <form id="product-comment-form" class="product-comments__form">
          <label for="product-comment-input">Add a comment</label>
          <textarea
            id="product-comment-input"
            name="comment"
            rows="4"
            maxlength="1000"
            placeholder="Share your thoughts about this product"
            required
          ></textarea>
          <button class="btn-checkout" type="submit">Post Comment</button>
        </form>
        <ul id="product-comments-list" class="product-comments__list"></ul>
      </section>
    `;
  }
}