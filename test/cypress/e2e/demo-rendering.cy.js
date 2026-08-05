describe('Demo Rendering and Configuration', () => {

  const visitChartDemo = (page) => {
    cy.visit('demo/' + page);
    cy.get('#chart-container .orgchart').should('exist');
  };

  it('renders the bottom-to-top chart', () => {
    visitChartDemo('bottom2top.html', 'Bottom to Top Demo');
    cy.get('#chart-container .orgchart').should('have.class', 'b2t');
  });

  it('renders color-coded node levels', () => {
    visitChartDemo('color-coded.html', 'Color Coded Demo');
    cy.get('#chart-container .node').filter('.middle-level, .product-dept, .rd-dept').should('exist');
  });

  it('renders custom control icons', () => {
    visitChartDemo('custom-icons.html', 'Custom Icons Demo');
    cy.get('#chart-container .node .toggleBtn').should('have.class', 'fa-solid');
  });

  it('renders the custom node template', () => {
    visitChartDemo('custom-template.html', 'Custom Template Demo');
    cy.get('#chart-container .node .office').should('exist');
  });

  it('renders compact nodes from node data', () => {
    visitChartDemo('data-prop-compact.html', 'Compact Nodes Demo');
    cy.get('#chart-container .node.compact').should('exist');
  });

  it('renders hybrid nodes from node data', () => {
    visitChartDemo('data-prop-hybrid.html', 'Hybrid Nodes Demo');
    cy.get('#chart-container .verticalNodes, #chart-container .toggleBtn').should('exist');
  });

  it('renders the PNG export control', () => {
    visitChartDemo('export-chart.html', 'Export Chart Demo');
    cy.get('.oc-export-btn').should('be.visible');
  });

  it('renders the PDF export control', () => {
    visitChartDemo('export-chart-pdf.html', 'Export PDF Demo');
    cy.get('.oc-export-btn').should('be.visible');
  });

  it('renders the picture export control and avatars', () => {
    visitChartDemo('export-chart-with-pictures.html', 'Export Chart with Pictures Demo');
    cy.get('.oc-export-btn').should('be.visible');
    cy.get('#chart-container .avatar').should('exist');
  });

  it('renders the family-tree relationship layout', () => {
    visitChartDemo('family-tree.html', 'Family Tree Demo');
    cy.get('#chart-container .node').should('have.length.at.least', 3);
  });

  it('renders family-tree custom properties', () => {
    visitChartDemo('familytree-custom-properties.html', 'Family Tree Custom Properties Demo');
    cy.get('#chart-container .node').should('have.length.at.least', 3);
  });

  it('renders the left-to-right chart', () => {
    visitChartDemo('left2right.html', 'Left to Right Demo');
    cy.get('#chart-container .orgchart').should('have.class', 'l2r');
  });

  it('renders link nodes', () => {
    visitChartDemo('link-node.html', 'Link Nodes Demo');
    cy.get('#chart-container .node').should('have.length.at.least', 2);
  });

  it('renders nodes with different widths', () => {
    visitChartDemo('nodes-of-different-widths.html', 'Nodes of Different Widths Demo');
    cy.get('#chart-container .node').then(($nodes) => {
      const widths = Array.from($nodes, (node) => node.getBoundingClientRect().width);

      expect(new Set(widths).size).to.be.greaterThan(1);
    });
  });

  it('renders the right-to-left chart', () => {
    visitChartDemo('right2left.html', 'Right to Left Demo');
    cy.get('#chart-container .orgchart').should('have.class', 'r2l');
  });

  it('parses the unordered-list datasource', () => {
    visitChartDemo('ul-datasource.html', 'UL Datasource Demo');
    cy.contains('#chart-container .node .title', 'Lao Lao').should('exist');
  });

  it('renders the map integration page shell without requiring map tiles', () => {
    cy.visit('demo/integrate-map.html');
    cy.contains('h1', 'Map Integration Demo').should('be.visible');
    cy.get('#map').should('exist');
    cy.get('#chart-container').should('exist');
  });

});