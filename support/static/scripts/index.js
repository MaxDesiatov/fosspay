(function() {
    window.donation = {
        type: window.default_type,
        amount: window.default_amount * 100, // cents
        project: null,
        comment: null
    };
    const donationFrequencySpan = document.getElementById("payment-frequency");

    updateFrequencySpan(window.donation.type);

    function setAmount(value) {
        donation.amount = value * 100;
        window._paymentRequest.update({
            total: {
                label: "Total",
                amount: donation.amount,
            }
        });
    }

    function selectAmount(e) {
        e.preventDefault();
        document.querySelector(".amounts .active").classList.remove("active");
        e.target.classList.add("active");
        const custom = document.querySelector("#custom-amount");
        const amount = e.target.dataset.amount;
        if (amount === "custom") {
            custom.classList.remove("hidden");
            setAmount(+document.querySelector("#custom-amount-text").value);
        } else {
            custom.classList.add("hidden");
            setAmount(+e.target.dataset.amount);
        }

        // update Pay button
        if (updateButtonLabel) updateButtonLabel("card");
    }

    function selectFrequency(e) {
        e.preventDefault();
        document
            .querySelector(".frequencies .active")
            .classList.remove("active");
        e.target.classList.add("active");
        donation.type = e.target.dataset.frequency;

        // update frequency
        updateFrequencySpan(donation.type);
    }

    function updateFrequencySpan(type = "") {
        const text =
            type == "monthly"
                ? i18n["Monthly Sponsorship"]
                : i18n["One-time Sponsorship"];
        donationFrequencySpan.innerText = text.toLowerCase();
    }

    const amounts = document.querySelectorAll(".amounts button");
    for (let i = 0; i < amounts.length; i++) {
        amounts[i].addEventListener("click", selectAmount);
    }

    const frequencies = document.querySelectorAll(".frequencies button");
    for (let i = 0; i < frequencies.length; i++) {
        frequencies[i].addEventListener("click", selectFrequency);
    }

    document
        .getElementById("custom-amount-text")
        .addEventListener("change", function(e) {
            const value = +e.target.value;
            if (isNaN(value)) {
                value = 1;
            }
            if (value <= 0) {
                value = 1;
            }
            e.target.value = value;
            setAmount(value * 100);

            // update Pay button
            updateButtonLabel("card");
        });

    const project = document.getElementById("project");
    if (project) {
        project.addEventListener("change", function(e) {
            if (e.target.value === "null") {
                donation.project = null;
            } else {
                donation.project = e.target.value;
            }
        });
    }
})();
