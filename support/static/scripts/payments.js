/**
 * payments.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * This modern JavaScript file handles the checkout process using Stripe.
 *
 * 1. It shows how to accept card payments with the `card` Element, and
 * the `paymentRequestButton` Element for Payment Request and Apple Pay.
 * 2. It shows how to use the Stripe Sources API to accept non-card payments,
 * such as iDEAL, SOFORT, SEPA Direct Debit, and more.
 */

(async () => {
  'use strict';

  // Retrieve the configuration for the store.
  const config = await store.getConfig();

  // Create references to the main form and its submit button.
  const form = document.getElementById('payment-form');
  const submitButton = form.querySelector('button[type=submit]');
  const amountSpan = document.getElementById("payment-amount");

  // Global variable to store the PaymentIntent object.
  let paymentIntent;

  /**
   * Setup Stripe Elements.
   */

  // Create a Stripe client.
  const stripe = Stripe(config.stripePublishableKey);

  // Create an instance of Elements.
  const elements = stripe.elements();

  // Prepare the styles for Elements.
  const style = {
    base: {
      iconColor: '#666ee8',
      color: '#31325f',
      fontWeight: 400,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#aab7c4',
      },
      ':-webkit-autofill': {
        color: '#666ee8',
      },
    },
  };

  /**
   * Implement a Stripe Card Element that matches the look-and-feel of the app.
   *
   * This makes it easy to collect debit and credit card payments information.
   */

  // Create a Card Element and pass some custom styles to it.
  const card = elements.create('card', {style});

  // Mount the Card Element on the page.
  card.mount('#card-element');

  // Monitor change events on the Card Element to display any errors.
  card.on('change', ({error}) => {
    const cardErrors = document.getElementById('card-errors');
    if (error) {
      cardErrors.textContent = error.message;
      cardErrors.classList.add('visible');
    } else {
      cardErrors.classList.remove('visible');
    }
    // Re-enable the Pay button.
    submitButton.disabled = false;
  });

  /**
   * Implement a Stripe IBAN Element that matches the look-and-feel of the app.
   *
   * This makes it easy to collect bank account information.
   */

  // Create a IBAN Element and pass the right options for styles and supported countries.
  const ibanOptions = {
    style,
    supportedCountries: ['SEPA'],
  };
  const iban = elements.create('iban', ibanOptions);

  // Mount the IBAN Element on the page.
  iban.mount('#iban-element');

  // Monitor change events on the IBAN Element to display any errors.
  iban.on('change', ({error, bankName}) => {
    const ibanErrors = document.getElementById('iban-errors');
    if (error) {
      ibanErrors.textContent = error.message;
      ibanErrors.classList.add('visible');
    } else {
      ibanErrors.classList.remove('visible');
      if (bankName) {
        updateButtonLabel('sepa_debit', bankName);
      }
    }
    // Re-enable the Pay button.
    submitButton.disabled = false;
  });

  /**
   * Add an iDEAL Bank selection Element that matches the look-and-feel of the app.
   *
   * This allows you to send the customer directly to their iDEAL enabled bank.
   */

  // Create a iDEAL Bank Element and pass the style options, along with an extra `padding` property.
  const idealBank = elements.create('idealBank', {
    style: {base: Object.assign({padding: '10px 15px'}, style.base)},
  });

  // Mount the iDEAL Bank Element on the page.
  idealBank.mount('#ideal-bank-element');

  /**
   * Implement a Stripe Payment Request Button Element.
   *
   * This automatically supports the Payment Request API (already live on Chrome),
   * as well as Apple Pay on the Web on Safari, Google Pay, and Microsoft Pay.
   * When of these two options is available, this element adds a “Pay” button on top
   * of the page to let users pay in just a click (or a tap on mobile).
   */

  // Create the payment request.
  const paymentRequest = stripe.paymentRequest({
    country: config.stripeCountry,
    currency: config.currency,
    total: {
      label: 'Total',
      amount: store.getPaymentTotal(),
    },
    requestShipping: false,
    requestPayerEmail: true
  });

  function handleServerResponse(response, complete) {
    if (!complete) {
      complete = (str) => console.log(str)
    }
    if (response.error) {
      complete('fail');
    } else if (response.requires_action) {
      complete('success');
      handleAction(response);
    } else {
      complete('success');
    }
  }

  function handleAction(response) {
    stripe
      .handleCardAction(response.payment_intent_client_secret)
      .then(function(result) {
        if (result.error) {
          // Show error in payment form
        } else {
          // The card action has been handled
          // The PaymentIntent can be confirmed again on the server
          console.log(window.donation.amount);
          fetch(absoluteLink("confirm_payment"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              payment_intent_id: result.paymentIntent.id,
              amount: store.getPaymentTotal()
            })
          })
            .then(function(confirmResult) {
              return confirmResult.json();
            })
            .then(handleServerResponse);
        }
      });
  }
  // Create the Payment Request Button.
  const paymentRequestButton = elements.create(
    'paymentRequestButton',
    {
      paymentRequest
    }
  );

  // Check if the Payment Request is available (or Apple Pay on the Web).
  const paymentRequestSupport = await paymentRequest.canMakePayment();
  if (paymentRequestSupport) {
    // Display the Pay button by mounting the Element in the DOM.
    paymentRequestButton.mount('#payment-request-button');
    // Replace the instruction.
    document.querySelector('.instruction').innerText =
      'Or enter your payment details below';
    // Show the payment request section.
    document.getElementById('payment-request').classList.add('visible');
  }

  /**
   * Handle the form submission.
   *
   * This uses Stripe.js to confirm the PaymentIntent using payment details collected
   * with Elements.
   *
   * Please note this form is not submitted when the user chooses the "Pay" button
   * or Apple Pay, Google Pay, and Microsoft Pay since they provide name and
   * shipping information directly.
   */

  // Listen to changes to the user-selected country.
  form
    .querySelector('select[name=country]')
    .addEventListener('change', event => {
      event.preventDefault();
      selectCountry(event.target.value);
    });

  // Submit handler for our payment form.
  form.addEventListener('submit', async event => {
    event.preventDefault();

    // Retrieve the user information from the form.
    // TODO information from form definitely should be used somewhere
    const name = form.querySelector('input[name=name]').value;
  
    // Disable the Pay button to prevent multiple click events.
    submitButton.disabled = true;
    submitButton.textContent = 'Processing…';
      const {
        paymentMethod,
        error
      } = await stripe.createPaymentMethod("card", card, {
        billing_details: { name: name }
      });
      if (error) {
        // Show error in payment form
      } else {
               // Send paymentMethod.id to your server (see Step 2)
               const response = await store.createPaymentIntent(
                 {
                   payment_method_id: paymentMethod.id,
                   currency: config.currency,
                   items: [
                     {
                       type: "sku",
                       parent: "pSku",
                       quantity: 1
                     }
                   ]
                 }
               );
               paymentIntent = response.paymentIntent;
               handleServerResponse(response);
             }
  });

  // Handle new PaymentIntent result
  const handlePayment = paymentResponse => {
    const {paymentIntent, error} = paymentResponse;

    const mainElement = document.getElementById('main');
    const confirmationElement = document.getElementById('confirmation');

    if (error) {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      confirmationElement.querySelector('.error-message').innerText =
        error.message;
      mainElement.classList.add('error');
    } else if (paymentIntent.status === 'succeeded') {
      // Success! Payment is confirmed. Update the interface to display the confirmation screen.
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      // Update the note about receipt and shipping (the payment has been fully confirmed by the bank).
      confirmationElement.querySelector('.note').innerText =
        'We just sent your receipt to your email address, and your items will be on their way shortly.';
      mainElement.classList.add('success');
    } else if (paymentIntent.status === 'processing') {
      // Success! Now waiting for payment confirmation. Update the interface to display the confirmation screen.
      mainElement.classList.remove('processing');
      // Update the note about receipt and shipping (the payment is not yet confirmed by the bank).
      confirmationElement.querySelector('.note').innerText =
        'We’ll send your receipt and ship your items as soon as your payment is confirmed.';
      mainElement.classList.add('success');
    } else {
      // Payment has failed.
      mainElement.classList.remove('success');
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      mainElement.classList.add('error');
    }
  };

  /**
   * Monitor the status of a source after a redirect flow.
   *
   * This means there is a `source` parameter in the URL, and an active PaymentIntent.
   * When this happens, we'll monitor the status of the PaymentIntent and present real-time
   * information to the user.
   */

  const pollPaymentIntentStatus = async (
    paymentIntent,
    timeout = 30000,
    interval = 500,
    start = null
  ) => {
    start = start ? start : Date.now();
    const endStates = ['succeeded', 'processing', 'canceled'];
    // Retrieve the PaymentIntent status from our server.
    const rawResponse = await fetch(absoluteLink(`confirm_payment/${paymentIntent}/status`));
    const response = await rawResponse.json();
    if (
      !endStates.includes(response.paymentIntent.status) &&
      Date.now() < start + timeout
    ) {
      // Not done yet. Let's wait and check again.
      setTimeout(
        pollPaymentIntentStatus,
        interval,
        paymentIntent,
        timeout,
        interval,
        start
      );
    } else {
      handlePayment(response);
      if (!endStates.includes(response.paymentIntent.status)) {
        // Status has not changed yet. Let's time out.
        console.warn(new Error('Polling timed out.'));
      }
    }
  };

  const url = new URL(window.location.href);
  const mainElement = document.getElementById('main');
  if (url.searchParams.get('source') && url.searchParams.get('client_secret')) {
    // Update the interface to display the processing screen.
    mainElement.classList.add('checkout', 'success', 'processing');

    const {source} = await stripe.retrieveSource({
      id: url.searchParams.get('source'),
      client_secret: url.searchParams.get('client_secret'),
    });

    // Poll the PaymentIntent status.
    pollPaymentIntentStatus(source.metadata.paymentIntent);
  } else {
    // Update the interface to display the checkout form.
    mainElement.classList.add('checkout');
  }
  document.getElementById('main').classList.remove('loading');

  /**
   * Display the relevant payment methods for a selected country.
   */

  // List of relevant countries for the payment methods supported in this demo.
  // Read the Stripe guide: https://stripe.com/payments/payment-methods-guide
  const paymentMethods = {
    ach_credit_transfer: {
      name: 'Bank Transfer',
      flow: 'receiver',
      countries: ['US'],
      currencies: ['usd'],
    },
    alipay: {
      name: 'Alipay',
      flow: 'redirect',
      countries: ['CN', 'HK', 'SG', 'JP'],
      currencies: [
        'aud',
        'cad',
        'eur',
        'gbp',
        'hkd',
        'jpy',
        'nzd',
        'sgd',
        'usd',
      ],
    },
    bancontact: {
      name: 'Bancontact',
      flow: 'redirect',
      countries: ['BE'],
      currencies: ['eur'],
    },
    card: {
      name: 'Card',
      flow: 'none',
    },
    eps: {
      name: 'EPS',
      flow: 'redirect',
      countries: ['AT'],
      currencies: ['eur'],
    },
    ideal: {
      name: 'iDEAL',
      flow: 'redirect',
      countries: ['NL'],
      currencies: ['eur'],
    },
    giropay: {
      name: 'Giropay',
      flow: 'redirect',
      countries: ['DE'],
      currencies: ['eur'],
    },
    multibanco: {
      name: 'Multibanco',
      flow: 'receiver',
      countries: ['PT'],
      currencies: ['eur'],
    },
    sepa_debit: {
      name: 'SEPA Direct Debit',
      flow: 'none',
      countries: [
        'FR',
        'DE',
        'ES',
        'BE',
        'NL',
        'LU',
        'IT',
        'PT',
        'AT',
        'IE',
        'FI',
      ],
      currencies: ['eur'],
    },
    sofort: {
      name: 'SOFORT',
      flow: 'redirect',
      countries: ['DE', 'AT'],
      currencies: ['eur'],
    },
    wechat: {
      name: 'WeChat',
      flow: 'none',
      countries: ['CN', 'HK', 'SG', 'JP'],
      currencies: [
        'aud',
        'cad',
        'eur',
        'gbp',
        'hkd',
        'jpy',
        'nzd',
        'sgd',
        'usd',
      ],
    },
  };

  // Update the main button to reflect the payment method being selected.
  const updateButtonLabel = (paymentMethod, bankName) => {
    
    let amount = store.formatPrice(store.getPaymentTotal(), config.currency);
    let name = paymentMethods[paymentMethod].name;
    let label = `Sponsor ${amount}`;
    if (paymentMethod !== 'card') {
      label = `Sponsor ${amount} with ${name}`;
    }
    if (paymentMethod === 'wechat') {
      label = `Generate QR code to sponsor ${amount} with ${name}`;
    }
    if (paymentMethod === 'sepa_debit' && bankName) {
      label = `Debit ${amount} from ${bankName}`;
    }
    submitButton.innerText = label;

    // Update above button text
    amountSpan.innerText = amount;
  };

  // Move updateButtonLabel to global to fire it on donation amount change
  window.updateButtonLabel = updateButtonLabel;

  const selectCountry = country => {
    const selector = document.getElementById('country');
    selector.querySelector(`option[value=${country}]`).selected = 'selected';
    selector.className = `field ${country}`;

    // Trigger the methods to show relevant fields and payment methods on page load.
    showRelevantFormFields();
    showRelevantPaymentMethods();
  };

  // Show only form fields that are relevant to the selected country.
  const showRelevantFormFields = country => {
    if (!country) {
      country = form.querySelector('select[name=country] option:checked').value;
    }
    const zipLabel = form.querySelector('label.zip');
    // Only show the state input for the United States.
    zipLabel.parentElement.classList.toggle('with-state', country === 'US');
    // Update the ZIP label to make it more relevant for each country.
    form.querySelector('label.zip span').innerText =
      country === 'US' ? 'ZIP' : country === 'GB' ? 'Postcode' : 'Postal Code';
  };

  // Show only the payment methods that are relevant to the selected country.
  const showRelevantPaymentMethods = country => {
    if (!country) {
      country = form.querySelector('select[name=country] option:checked').value;
    }
    const paymentInputs = form.querySelectorAll('input[name=payment]');
    for (let i = 0; i < paymentInputs.length; i++) {
      let input = paymentInputs[i];
      input.parentElement.classList.toggle(
        'visible',
        input.value === 'card' ||
          (config.paymentMethods.includes(input.value) &&
            paymentMethods[input.value].countries.includes(country) &&
            paymentMethods[input.value].currencies.includes(config.currency))
      );
    }

    // Hide the tabs if card is the only available option.
    const paymentMethodsTabs = document.getElementById('payment-methods');
    paymentMethodsTabs.classList.toggle(
      'visible',
      paymentMethodsTabs.querySelectorAll('li.visible').length > 1
    );

    // Check the first payment option again.
    paymentInputs[0].checked = 'checked';
    form.querySelector('.payment-info.card').classList.add('visible');
    form.querySelector('.payment-info.ideal').classList.remove('visible');
    form.querySelector('.payment-info.sepa_debit').classList.remove('visible');
    form.querySelector('.payment-info.wechat').classList.remove('visible');
    form.querySelector('.payment-info.redirect').classList.remove('visible');
    updateButtonLabel(paymentInputs[0].value);
  };

  // Listen to changes to the payment method selector.
  for (let input of document.querySelectorAll('input[name=payment]')) {
    input.addEventListener('change', event => {
      event.preventDefault();
      const payment = form.querySelector('input[name=payment]:checked').value;
      const flow = paymentMethods[payment].flow;

      // Update button label.
      updateButtonLabel(event.target.value);

      // Show the relevant details, whether it's an extra element or extra information for the user.
      form
        .querySelector('.payment-info.card')
        .classList.toggle('visible', payment === 'card');
      form
        .querySelector('.payment-info.ideal')
        .classList.toggle('visible', payment === 'ideal');
      form
        .querySelector('.payment-info.sepa_debit')
        .classList.toggle('visible', payment === 'sepa_debit');
      form
        .querySelector('.payment-info.wechat')
        .classList.toggle('visible', payment === 'wechat');
      form
        .querySelector('.payment-info.redirect')
        .classList.toggle('visible', flow === 'redirect');
      form
        .querySelector('.payment-info.receiver')
        .classList.toggle('visible', flow === 'receiver');
      document
        .getElementById('card-errors')
        .classList.remove('visible', payment !== 'card');
    });
  }

  // Select the default country from the config on page load.
  let country = config.country;
  // Override it if a valid country is passed as a URL parameter.
  var urlParams = new URLSearchParams(window.location.search);
  let countryParam = urlParams.get('country')
    ? urlParams.get('country').toUpperCase()
    : config.country;
  if (form.querySelector(`option[value="${countryParam}"]`)) {
    country = countryParam;
  }
  selectCountry(country);
})();
