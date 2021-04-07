export default function SwitchToAnotherTrip() {
  describe('Switch to another trip', () => {
    it('Switch to another trip', () => {
      cy.wait(3000);
      cy.get('[data-cy="UserProfileBtn"]').click();
      cy.get('.MuiTableRow-root.MuiTableRow-hover').first().click();
    });
  });
}
