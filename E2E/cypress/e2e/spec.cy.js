describe('Automate three test cases using Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should check if item is successfully added to cart', () => {
    cy.get('[data-test="itemCard"]').first().within(() => {
      cy.get('[data-test="itemCardTitle"]').invoke('text').as('itemTitle');
      cy.get('[data-test="addToCartButton"]').click();
    });

    cy.get('@itemTitle').then((title) => {
      cy.get('[data-test="cartItemTitle"]').should('have.text', title);
    });
  });


  it('should check if filter by size is working correctly', () => {
    cy.fixture('products').then((products) => {
      const productsWithXL = products.data.products.filter(
        (product) => Array.isArray(product.availableSizes) && product.availableSizes.includes('XL')
      );
      cy.get('input[value="XL"]').parent().click();
      cy.get('[data-test="itemCard"]').its('length').should('eq', productsWithXL.length);
    });
  });

  it('should verify the subtotal amount is correct in cart and checkout', () => {
    let itemsAmount = 0;

    [0, 1, 5].forEach((index) => {
      cy.get('[data-test="itemCard"]').eq(index).within(() => {
        cy.get('[data-test="itemPrice"]').invoke('text').then((price) => {
          itemsAmount += parseFloat(price.replace('$', ''));
          cy.log('Cart amount is: ' + itemsAmount.toFixed(2));
        });
        cy.get('[data-test="addToCartButton"]').click({ force: true });
      });
    });

    cy.get('[data-test="cartSubtotal"]').invoke('text').then((subtotal) => {
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