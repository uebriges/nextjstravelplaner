export default function LoginUserTest() {
  describe('Login a user', () => {
    beforeEach(() => {
      cy.wait(3000);
    });

    it('Login a user', () => {
      cy.wait(3000);
      // cy.visit('/travelplaner');
      cy.get('[data-cy="UserProfileBtn"]').click();
      cy.get('#userName').type('cypresstestuser');
      cy.get('#password').type('cypresstestuser');
      cy.get('[data-cy="LoginBtn"]').click();
    });
  });
}
