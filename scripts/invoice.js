(function() {
    document.getElementById("submit").addEventListener("click", function(e) {
        e.preventDefault();
        if (e.target.getAttribute("disabled")) {
            return;
        }

        const handler = StripeCheckout.configure({
            name: your_name,
            key: window.stripe_key,
            locale: "auto",
            description: "Invoice " + invoice,
            panelLabel: "Pay {{amount}}",
            amount: amount,
            token: function(token) {
                e.target.setAttribute("disabled", "");
                e.target.textContent = "Submitting...";

                const data = new FormData();
                data.append("stripe_token", token.id);
                data.append("email", token.email);
                data.append("amount", amount);
                data.append("type", "once");
                data.append("comment", comment);
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "../donate");
                xhr.onload = function() {
                    const res = JSON.parse(this.responseText);
                    if (res.success) {
                        document
                            .getElementById("donation-stuff")
                            .classList.add("hidden");
                        document
                            .getElementById("thanks")
                            .classList.remove("hidden");
                    } else {
                        const errors = document.getElementById("errors");
                        errors.classList.remove("hidden");
                        errors.querySelector("p").textContent = res.reason;
                        e.target.removeAttribute("disabled");
                        e.target.textContent = "Submit payment";
                    }
                };
                xhr.send(data);
            }
        });

        handler.open();
    });
})();
