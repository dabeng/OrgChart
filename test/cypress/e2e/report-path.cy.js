describe('Report Path', () => {

  const danDan = '.node:contains("Dan Dan")';
  const selectedNode = '#selected-node';
  const reportButton = '#btn-report-path';

  beforeEach(() => {
    cy.visit('demo/report-path.html');
  });

  it('keeps the chosen node selected after drawing its management path', () => {
    cy.get(danDan).click();
    cy.get(selectedNode).should('have.value', 'Dan Dan');

    cy.get(reportButton).click().should('be.disabled');
    cy.get(danDan).should('have.class', 'focused');
    cy.get(selectedNode).should('have.value', 'Dan Dan');
  });

});