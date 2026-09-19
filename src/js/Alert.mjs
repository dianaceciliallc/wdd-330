export default class Alert {
    constructor(jsonPath = "/json/alerts.json") {
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
        const alertsHTML = alerts
            .map(
                (alert) =>
                    `<p style="background-color: ${alert.background}; color: ${alert.color};">${alert.message}</p>`
            )
            .join("");

        const alertSectionHTML = `<section class="alert-list">${alertsHTML}</section>`;

        const mainElement = document.querySelector("main");
        if (mainElement) {
            mainElement.insertAdjacentHTML("afterbegin", alertSectionHTML);
        }
    }
}