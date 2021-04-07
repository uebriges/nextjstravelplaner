export default function LoginUserTest() {
  describe('Login a user', () => {
    it('Login a user', () => {
      // cy.visit('/travelplaner');
      cy.get('[data-cy="UserProfileBtn"]').click();
      cy.get('#userName').type('cypresstestuser');
      cy.get('#password').type('cypresstestuser');
      cy.get('[data-cy="LoginBtn"]').click();
    });
  });
}
