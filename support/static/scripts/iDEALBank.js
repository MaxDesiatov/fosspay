/**
 * Add an iDEAL Bank selection Element that matches the look-and-feel of the app.
 *
 * This allows you to send the customer directly to their iDEAL enabled bank.
 */

function initIDEALBank(elements) {
    // Create a iDEAL Bank Element and pass the style options, along with an extra `padding` property.
    const idealBank = elements.create("idealBank", {
        style: {
            base: Object.assign(
                {
                    padding: "10px 15px"
                },
                style.base
            )
        }
    });

    // Mount the iDEAL Bank Element on the page.
    idealBank.mount("#ideal-bank-element");
}
