export default class Alert {
  constructor(jsonPath = "./json/alerts.json") {
    this.jsonPath = jsonPath;
  }
  async init() {
    try {
      const response = await fetch(this.jsonPath);
      if (response.ok) {
        const alertData = await response.json();
        if (alertData && alertData.length > 0) {
          this.renderAlerts(alertData);
        }
      }
    } catch (error) {
      console.error("Error fetching alert data:", error);
    }
  }

  renderAlerts(alerts) {
    this.removeAlerts();

    const alertsHTML = alerts
      .map(
        (alert) =>
          `<div class="alert-wrapper">
            <p id="${alert.id}" class="custom-alert" style="background-color: ${alert.background}; color: ${alert.color};">
              <span>${alert.message}</span>
            </p>
          </div>`
      )
      .join("");

    const alertSectionHTML = `<section class="alert-list">${alertsHTML}</section>`;

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.insertAdjacentHTML("afterbegin", alertSectionHTML);
    }
  }

  renderCustomAlerts(messages, isError = true) {
    const alertData = messages.map((msg, index) => ({
      id: `alert-${index}`,
      message: msg,
      background: isError ? "#f8d7da" : "#d4edda",
      color: isError ? "#721c24" : "#155724"
    }));

    this.renderAlerts(alertData);
  }

  removeAlerts() {
    const existingAlerts = document.querySelector(".alert-list");
    if (existingAlerts) {
      existingAlerts.remove();
    }
  }
}