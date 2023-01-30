describe('Pan & Zoom', () => {

  beforeEach(() => {
    cy.visit('demo/pan-zoom.html');
  });

  const chart = '.orgchart';

  it('drag the chart to the top', () => {
    cy.get(chart)
      .trigger('mousedown', { which: 1, pageX: 10, pageY: 200 })
      .trigger('mousemove', { which: 1, pageX: 10, pageY: 100 })
      .trigger('mouseup')
      .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, -100)');
  });

  it('drag the chart to the bottom', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 10, pageY: 100 })
    .trigger('mousemove', { which: 1, pageX: 10, pageY: 200 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 100)');
  });

  it('drag the chart to the left', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 200, pageY: 10 })
    .trigger('mousemove', { which: 1, pageX: 100, pageY: 10 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, -100, 0)');
  });

  it('drag the chart to the right', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 100, pageY: 10 })
    .trigger('mousemove', { which: 1, pageX: 200, pageY: 10 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 100, 0)');
  });

});