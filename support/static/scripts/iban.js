/**
 * Implement a Stripe IBAN Element that matches the look-and-feel of the app.
 *
 * This makes it easy to collect bank account information.
 */

function initIBAN(elements) {
    // Create a IBAN Element and pass the right options for styles and supported countries.
    const ibanOptions = {
        style,
        supportedCountries: ["SEPA"]
    };
    const iban = elements.create("iban", ibanOptions);

    // Mount the IBAN Element on the page.
    iban.mount("#iban-element");

    // Monitor change events on the IBAN Element to display any errors.
    iban.on("change", ({ error, bankName }) => {
        const ibanErrors = document.getElementById("iban-errors");
        if (error) {
            ibanErrors.textContent = error.message;
            ibanErrors.classList.add("visible");
        } else {
            ibanErrors.classList.remove("visible");
            if (bankName) {
                updateButtonLabel("sepa_debit", bankName);
            }
        }
        // Re-enable the Pay button.
        submitButton.disabled = false;
    });
}
