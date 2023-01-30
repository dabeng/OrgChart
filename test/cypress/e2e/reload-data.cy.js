describe('Refresh orgchart with new options', () => {

  beforeEach(() => {
    cy.visit('demo/reload-data.html');
  });

  const loadChart1 = '#btn-chart1';
  const loadChart2 = '#btn-chart2';
  const loadChart3 = '#btn-chart3';

  it('load chart2', () => {
    cy.get(loadChart2).click();
    cy.get('.node').should('have.length', 3);
  });

  it('load chart3', () => {
    cy.get(loadChart3).click();
    cy.get('.node').should('have.length', 4);
  });

  it('load chart1', () => {
    cy.get(loadChart1).click();
    cy.get('.node').should('have.length', 9);
  });

});