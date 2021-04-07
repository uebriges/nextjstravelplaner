export default function SaveTrip(tripName) {
  describe('Save the current Trip', () => {
    it('Save the current Trip', () => {
      cy.wait(3000);
      cy.get('[data-cy="SaveTripBtn"]').click();
      cy.get('#tripName').type(tripName);
      cy.get('[data-cy="SaveTripToDBBtn"]').click();
    });
  });
}
