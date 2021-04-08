export default function CreateNewTrip() {
  describe('Create new trip by setting waypoints on the map', () => {
    it('Add first waypoint', () => {
      // cy.visit('/travelplaner');
      cy.wait(7000);
      cy.get('div.overlays').click(500, 500, { force: true });
      cy.get('[data-cy="AddWaypointBtn"]').click();
      cy.wait(1200);
      cy.get('div.overlays').click(600, 100, { force: true });
      cy.wait(1200);
      cy.get('div.overlays').click(300, 400, { force: true });
      cy.get('[data-cy="AddWaypointBtn"]').click({ force: true });
      cy.wait(1200);
      cy.get('div.overlays').click(600, 100, { force: true });
      cy.wait(1200);
      cy.get('div.overlays').click(500, 300, { force: true });
      cy.get('[data-cy="AddWaypointBtn"]').click({ force: true });
    });
  });
}
