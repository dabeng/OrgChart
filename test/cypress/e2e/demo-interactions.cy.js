describe('Demo Interactions', () => {

  it('loads the ajax datasource after showing its loading state', () => {
    cy.visit('demo/ajax-datasource.html');
    cy.get('#chart-container .spinner').should('exist');
    cy.get('#chart-container .node .title', { timeout: 6000 }).should('contain.text', 'Lao Lao');
    cy.get('#chart-container .spinner').should('not.exist');
  });

  it('centers the selected node', () => {
    cy.visit('demo/center-on-selected-node.html');
    cy.get('#chart-container .orgchart').invoke('css', 'transform').then((beforeTransform) => {
      cy.contains('#chart-container .node .title', 'Su Miao').closest('.node').click();
      cy.get('#chart-container .orgchart').should('not.have.css', 'transform', beforeTransform);
    });
  });

  it('starts configured branches collapsed and expands them', () => {
    cy.visit('demo/default-collapsed.html');
    cy.contains('#chart-container .node .title', 'Hei Hei').closest('.node').then(($node) => {
      expect($node[0].nextElementSibling).to.have.class('hidden');
    });

    cy.contains('#chart-container .node .title', 'Hei Hei').closest('.node').find('.bottomEdge').click();
    cy.contains('#chart-container .node .title', 'Dan Dan').should('be.visible');
  });

  it('adds a sibling in the editable hybrid chart', () => {
    cy.visit('demo/edit-hybrid-chart.html');
    cy.contains('#chart-container .node .title', 'Football').closest('.node').click();
    cy.get('#new-nodelist .new-node').type('Futsal');
    cy.get('#rd-sibling').click();
    cy.get('#btn-add-nodes').click();
    cy.contains('#chart-container .node .title', 'Futsal').should('exist');
  });

  it('expands a selected branch to the configured depth', () => {
    cy.visit('demo/expand-to-given-depth.html');
    cy.contains('#chart-container .node .title', 'Su Miao').closest('.node').find('.bottomEdge').click();
    cy.contains('#chart-container .node .title', 'Dan Zai').should('be.visible');
    cy.contains('#chart-container .node .title', 'Er Dan Zai').should('not.be.visible');
    cy.contains('#chart-container .node .title', 'AAA').should('not.be.visible');
  });

  it('filters matching nodes and clears the filter result', () => {
    cy.visit('demo/filter-node.html');
    cy.get('#key-word').type('dan');
    cy.get('#btn-filter-node').click();
    cy.get('#chart-container .node.matched').should('have.length.at.least', 1);
    cy.get('#chart-container .orgchart').should('have.class', 'noncollapsable');
    cy.get('#btn-cancel').click();
    cy.get('#chart-container .node.matched').should('not.exist');
    cy.get('#chart-container .orgchart').should('not.have.class', 'noncollapsable');
  });

  it('exports the current unordered-list hierarchy as JSON', () => {
    cy.visit('demo/get-hierarchy.html');
    cy.get('#btn-export-hier').click();
    cy.get('pre').should('contain.text', 'n1').and('contain.text', 'n7');
  });

  it('highlights and clears related nodes on hover', () => {
    cy.visit('demo/get-related-nodes.html');
    cy.contains('#chart-container .node .title', 'Hei Hei').closest('.node').trigger('mouseenter');
    cy.get('#chart-container .highlight-parent').should('exist');
    cy.get('#chart-container .highlight-siblings').should('exist');
    cy.get('#chart-container .highlight-children').should('exist');
    cy.contains('#chart-container .node .title', 'Hei Hei').closest('.node').trigger('mouseleave');
    cy.get('#chart-container .highlight-parent, #chart-container .highlight-siblings, #chart-container .highlight-children').should('not.exist');
  });

  it('toggles the custom secondary menu created for each node', () => {
    cy.visit('demo/option-createNode.html');
    cy.contains('#chart-container .node .title', 'Lao Lao').closest('.node').find('.second-menu-icon').click({ force: true });
    cy.contains('#chart-container .node .title', 'Lao Lao').closest('.node').find('.second-menu').should('have.css', 'display', 'block');
  });

  it('switches to a hybrid layout on a narrow viewport', () => {
    cy.viewport(500, 720);
    cy.visit('demo/responsive-design.html');
    cy.window().trigger('resize');
    cy.get('#chart-container .verticalNodes, #chart-container .toggleBtn').should('exist');
  });

  it('renders all 10,000 generated nodes', () => {
    cy.visit('demo/10000-nodes.html');
    cy.get('#status', { timeout: 30000 }).should('contain.text', 'Initialization completed');
    cy.get('#chart-container .node').should('have.length', 10000);
  });

});