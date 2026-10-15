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

  it('combines hybrid layout, initial depth and minimap navigation', () => {
    visitChartDemo('options-hybrid-navigation.html');
    cy.get('#chart-container .node').should('have.length', 14);
    cy.get('#chart-container .nodes.vertical').should('exist');
    cy.get('#api').should('not.be.visible');
    cy.get('#chart-container .orgchart-minimap-node').should('have.length.at.least', 1);
    cy.get('#services').trigger('mouseenter');
    cy.get('#services .toggleBtn').click({ force: true });
    cy.get('#api').should('be.visible');
  });

  it('combines compact layout with constrained team assignments', () => {
    visitChartDemo('options-compact-drag.html');
    cy.get('#chart-container .node.compact').should('exist');
    cy.get('#studio > .backToLooseSymbol').click();
    cy.get('#engineering-team > .backToLooseSymbol').click();
    cy.get('#member-tie').should('have.attr', 'draggable', 'true');
    cy.window().then((win) => {
      const dataTransfer = new win.DataTransfer();
      cy.get('#member-tie').then(($node) => {
        $node[0].dispatchEvent(new win.DragEvent('dragstart', { bubbles: true, dataTransfer }));
      });
      cy.get('#product-team').should('have.class', 'allowedDrop');
      cy.get('#member-bo').should('not.have.class', 'allowedDrop');
      cy.get('#studio').should('not.have.class', 'allowedDrop');
      cy.get('#product-team').then(($node) => {
        $node[0].dispatchEvent(new win.DragEvent('drop', { bubbles: true, dataTransfer }));
      });
    });
    cy.get('#product-team #member-tie').should('exist');
    cy.get('#engineering-team #member-tie').should('not.exist');
    cy.get('#assignment-status').should('have.text', 'Tie Hua / Product');
  });

  it('combines horizontal layout, custom fields, avatars and icons', () => {
    visitChartDemo('options-horizontal-template.html');
    cy.get('#chart-container .orgchart').should('have.class', 'l2r');
    cy.get('#design-director').should('have.attr', 'data-office', 'Shanghai');
    cy.get('#design-director .title').should('contain.text', 'Lao Lao');
    cy.get('#design-director .content').should('have.text', 'Design director');
    cy.get('#chart-container .avatar').should('have.length', 7);
    cy.get('#experience-lead > .edge').should('have.class', 'fa-solid');
  });

  it('combines bottom-to-top layout, custom fields and PDF export', () => {
    visitChartDemo('options-export-navigation.html');
    cy.get('#chart-container .orgchart').should('have.class', 'b2t').and('have.class', 'delivery-chart');
    cy.get('#delivery-director .title').should('have.text', 'Lao Lao');
    cy.get('#west-manager').should('have.attr', 'data-region', 'west');
    cy.get('#east-manager').should('have.attr', 'data-region', 'east');
    cy.get('.oc-export-btn').should('be.visible').and('have.text', 'Export PDF');
    cy.window().then((win) => {
      expect(win.html2canvas).to.be.a('function');
      expect(win.jspdf.jsPDF).to.be.a('function');
    });
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