(function () {
  window.donation = {
    type: window.default_type,
    amount: window.default_amount * 100, // cents
    project: null,
    comment: null
  };

  function selectAmount(e) {
    e.preventDefault();
    document.querySelector(".amounts .active").classList.remove("active");
    e.target.classList.add("active");
    var custom = document.querySelector("#custom-amount");
    var amount = e.target.dataset.amount;
    if (amount === "custom") {
      custom.classList.remove("hidden");
      donation.amount = +document.querySelector("#custom-amount-text").value * 100;
    } else {
      custom.classList.add("hidden");
      donation.amount = +e.target.dataset.amount * 100;
    }
  }

  function selectFrequency(e) {
    e.preventDefault();
    document.querySelector(".frequencies .active").classList.remove("active");
    e.target.classList.add("active");
    donation.type = e.target.dataset.frequency;
  }

  var amounts = document.querySelectorAll(".amounts button");
  for (var i = 0; i < amounts.length; i++) {
    amounts[i].addEventListener("click", selectAmount);
  }

  var frequencies = document.querySelectorAll(".frequencies button");
  for (var i = 0; i < frequencies.length; i++) {
    frequencies[i].addEventListener("click", selectFrequency);
  }

  document.getElementById("custom-amount-text").addEventListener("change", function (e) {
    var value = +e.target.value;
    if (isNaN(value)) {
      value = 1;
    }
    if (value <= 0) {
      value = 1;
    }
    e.target.value = value;
    donation.amount = value * 100;
  });

  var project = document.getElementById("project")
  if (project) {
    project.addEventListener("change", function (e) {
      if (e.target.value === "null") {
        donation.project = null;
      } else {
        donation.project = e.target.value;
      }
    });
  }
})();