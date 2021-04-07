export default function StartNewTrip() {
  describe('Start a new trip', () => {
    it('Start a new trip', () => {
      cy.wait(3000);
      cy.get('[data-cy="StartNewTripBtn"]').click();
    });

    it('Create waypoints in new trip', () => {
      cy.get('div.overlays').click(600, 200);
      cy.get('[data-cy="AddWaypointBtn"]').click();
      cy.wait(1200);
      cy.get('div.overlays').click(600, 100);
      cy.wait(1200);
      cy.get('div.overlays').click(400, 340);
      cy.get('[data-cy="AddWaypointBtn"]').click();
      cy.wait(1200);
      cy.get('div.overlays').click(600, 100);
      cy.wait(1200);
      cy.get('div.overlays').click(500, 600);
      cy.get('[data-cy="AddWaypointBtn"]').click();
    });
  });
}
