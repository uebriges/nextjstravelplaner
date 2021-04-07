export default function RegisterUserTest() {
  describe('Register a new user', () => {
    it('Register a new user', () => {
      cy.visit('/travelplaner', { responseTimeout: 31000 });
      cy.get('[data-cy="UserProfileBtn"]').click();
      cy.get('[data-cy="OpenRegisterBtn"]').click();
      cy.get('#userName').type('cypresstestuser');
      cy.get('#firstName').type('Test');
      cy.get('#lastName').type('Cypress');
      cy.get('#email').type('test@cypress.com');
      cy.get('#password').type('cypresstestuser');
      cy.get('[data-cy="RegisterBtn"]').click();
    });
  });
}
