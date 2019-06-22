// Retrieve the configuration from the API.
async function getConfig() {
    try {
        const response = await fetch(absoluteLink("config"));
        const config = await response.json();
        if (config.stripePublishableKey.includes("live")) {
            // Hide the demo notice if the publishable key is in live mode.
            document.querySelector("#order-total .demo").style.display = "none";
        }
        return config;
    } catch (err) {
        return { error: err.message };
    }
}

// Create the PaymentIntent with the cart details.
async function createPaymentIntent({ payment_method_id, source }) {
    try {
        const stripe_token = payment_method_id;

        const response = await fetch(absoluteLink("confirm_payment"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                payment_method_id,
                stripe_token,
                source,
                ...window.donation
            })
        });
        const data = await response.json();
        if (data.error) {
            return { error: data.error };
        } else {
            return data;
        }
    } catch (err) {
        return { error: err.message };
    }
}

// Format a price (assuming a two-decimal currency like EUR or USD for simplicity).
function formatPrice(amount, currency) {
    let price = (amount / 100).toFixed(2);
    let numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol"
    });
    return numberFormat.format(price);
}
