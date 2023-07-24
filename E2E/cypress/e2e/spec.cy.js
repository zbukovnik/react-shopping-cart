describe('automate three test cases using Cypress', () => {
  it('check if item is successfully added to cart', () => {
    cy.visit('/');
    cy.get('[data-test="itemCard"]')
      .first()
      .within(() => {
        cy.get('[data-test="itemCardTitle"]').then(($title) => {
          const title = $title.text();
          cy.wrap(title).as('itemTitle');
        });
        cy.get('[data-test="addToCartButton"]').click();
      });
    cy.get('@itemTitle').then((title) => {
      cy.get('[data-test="cartItemTitle"]').should('have.text', title);
    });
  });

  it('check if filter by size is working correctly', () => {
    let countXLFromFixture;

    cy.fixture('products').then((products) => {
      const productsArray = Object.values(products.data.products);
      const productsWithXL = productsArray.filter(
        (product) =>
          Array.isArray(product.availableSizes) &&
          product.availableSizes.includes('XL')
      );
      countXLFromFixture = productsWithXL.length;
    });
    cy.visit('/');
    cy.get('input[value="XL"]').parent().click();
    cy.get('[data-test="itemCard"]')
      .its('length')
      .then((countDisplayedOnPage) => {
        expect(countDisplayedOnPage).to.equal(countXLFromFixture);
      });
  });

  it('verify the subtotal amount is correct in cart and checkout', () => {
    let itemsAmount = 0;

    cy.visit('/');
    cy.wrap([0, 1, 5]).each((index) => {
      cy.get('[data-test="itemCard"]')
        .eq(index)
        .within(() => {
          cy.get('[data-test="itemPrice"]').then((priceField) => {
            const price = priceField.text();
            const priceNumber = parseFloat(price.replace('$', ''));
            itemsAmount += priceNumber;
            cy.get('[data-test="addToCartButton"]').click({ force: true });
            cy.log('Cart amount is: ' + itemsAmount.toFixed(2));
          });
        });
    });
    cy.get('[data-test="cartSubtotal"]').then((subtotalField) => {
      const subtotal = subtotalField.text();
      const subtotalNumber = parseFloat(subtotal.replace('$', ''));
      expect(subtotalNumber).to.equal(itemsAmount);
    });
    cy.get('[data-test="checkoutButton"]').click();
    cy.on('window:alert', (alertMessage) => {
      const regex = /[\d.]+/;
      const matches = alertMessage.match(regex);
      if (matches) {
        const displayedAmount = parseFloat(matches[0]);
        expect(displayedAmount).to.equal(itemsAmount);
      }
    });
  });
});
