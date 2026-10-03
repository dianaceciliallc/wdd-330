import ExternalServices from "./ExternalServices.mjs";
import { getAppRelativeRoot, getLocalStorage, alertMessage } from "./utils.mjs";


function packageItems(items) {
	return items.map(item => {
		return {
			id: item.Id,
			name: item.Name,
			price: Number(item.FinalPrice),
			quantity: Number(item.quantity || 1)
		}
	})
};

function formFormat(formElement) {
	const formData = new FormData(formElement);
	const toJSON = {};

	formData.forEach((value, key) => {
		toJSON[key] = value;
	});

	return toJSON;
}

export default class CheckoutProcess {
	constructor(key, outputSelector) {
		this.key = key;
		this.outputSelector = outputSelector;
		this.list = [];
		this.itemTotal = 0;
		this.shipping = 0;
		this.tax = 0;
		this.orderTotal = 0;
	}

	init() {
		this.list = getLocalStorage(this.key) || [];
		if (this.list.length === 0) {
			window.location.replace(`${getAppRelativeRoot()}cart/index.html`);
			return;
		}
		this.calculateItemSubTotal();

		const zipInput = document.querySelector("#zip");
		zipInput.addEventListener("blur", () => {
			this.calculateOrderTotal();
		});
		const formElement = document.querySelector("#checkoutForm");
		if (formElement) {
			formElement.addEventListener("submit", (event) => {
				event.preventDefault();
				this.checkout(formElement);
			});
		}
	}

	calculateItemSubTotal() {
		this.itemTotal = this.list.reduce((total, item) => {
			const price = Number(item.FinalPrice || item.price || 0);
			const quantity = Number(item.quantity || 1);

			return total + (price * quantity);
		}, 0);

		const subtotal = document.querySelector(`#${this.outputSelector} #orderTotal`);
		subtotal.innerText = `$${this.itemTotal.toFixed(2)}`;
	}

	calculateOrderTotal() {
		this.tax = (this.itemTotal) * 0.06;
		const totalItemCount = this.list.reduce((sum, item) => sum + (item.quantity || 1), 0);

		if (totalItemCount > 0) {
			this.shipping = 10 + (totalItemCount - 1) * 2;
		} else {
			this.shipping = 0;
		}

		this.orderTotal = this.itemTotal + this.tax + this.shipping;
		this.displayOrderTotals();
	}

	displayOrderTotals() {
		const tax = document.querySelector(`#${this.outputSelector} #orderTotalWithTax`);
		const shipping = document.querySelector(`#${this.outputSelector} #orderShipping`);
		const orderTotal = document.querySelector(`#${this.outputSelector} #orderFinalTotal`);

		tax.innerText = `$${this.tax.toFixed(2)}`;
		shipping.innerText = `$${this.shipping.toFixed(2)}`;
		orderTotal.innerText = `$${this.orderTotal.toFixed(2)}`;
	}

	async checkout(formElement) {

		if (!formElement.checkValidity()) {
			formElement.reportValidity();
			return;
		}

		this.calculateItemSubTotal();
		this.calculateOrderTotal();

		const order = formFormat(formElement);

		order.orderDate = new Date().toISOString();
		order.orderTotal = this.orderTotal.toFixed(2);
		order.tax = this.tax.toFixed(2);
		order.shipping = Number(this.shipping.toFixed(2));
		order.items = packageItems(this.list);

		const externalServices = new ExternalServices();

		try {
			await externalServices.checkout(order);

			localStorage.removeItem(this.key);

			window.location.href = `${getAppRelativeRoot()}checkout/success.html`;
		} catch (error) {
			console.error("Checkout error:", error);
			let message = error.message;
			try {
				const parsed = JSON.parse(error.message);
				message = Object.values(parsed).join(", ");
			} catch {
				alertMessage("An error occurred during checkout. Please try again.", true);
			}
			alertMessage(message, true);
		}
	}
}