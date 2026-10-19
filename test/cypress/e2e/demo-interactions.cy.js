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

    cy.contains('#chart-container .node .title', 'Hei Hei').closest('.node').trigger('mouseenter').find('.bottomEdge').click();
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
    cy.contains('#chart-container .node .title', 'Su Miao').closest('.node').trigger('mouseenter').find('.bottomEdge').click();
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

  it('exports current flat records and refreshes parent_id after a node move', () => {
    cy.visit('demo/get-flat-datasource.html');
    cy.get('#flat-datasource-output').then(($output) => {
      const records = JSON.parse($output.text());
      expect(records).to.have.length(7);
      expect(records[0]).to.deep.equal({ id: 'n1', name: 'Lao Lao', parent_id: null });
      expect(records.find((record) => record.id === 'n4').parent_id).to.equal('n3');
      expect(records.every((record) => !('children' in record) && !('level' in record) && !('parentId' in record))).to.equal(true);
    });
    cy.screenshot('get-flat-datasource-desktop');
    cy.window().then((win) => {
      const dataTransfer = new win.DataTransfer();
      cy.get('#n4').then(($node) => {
        $node[0].dispatchEvent(new win.DragEvent('dragstart', { bubbles: true, dataTransfer }));
      });
      cy.get('#n2').should('have.class', 'allowedDrop').then(($node) => {
        $node[0].dispatchEvent(new win.DragEvent('drop', { bubbles: true, dataTransfer }));
      });
    });
    cy.get('#n4').should('have.attr', 'data-parent', 'n2');
    cy.get('#btn-export-flat').click();
    cy.get('#flat-datasource-output').should(($output) => {
      const records = JSON.parse($output.text());
      expect(records).to.have.length(7);
      expect(records.find((record) => record.id === 'n4').parent_id).to.equal('n2');
    });
    cy.get('pre').should('have.length', 1);
  });

  it('shows the flat export below the chart on a narrow viewport', () => {
    cy.viewport(390, 844);
    cy.visit('demo/get-flat-datasource.html');
    cy.get('#btn-export-flat').click();
    cy.get('#flat-datasource-output').should('contain.text', 'parent_id').and('contain.text', 'n7');
    cy.get('.flat-output').then(($output) => {
      cy.get('#chart-container').then(($chart) => {
        expect($output[0].getBoundingClientRect().top).to.be.at.least($chart[0].getBoundingClientRect().bottom);
      });
    });
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(390);
    });
    cy.screenshot('get-flat-datasource-mobile');
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
    cy.get('#chart-container .nodes.vertical').should('exist');
  });

  it('renders all 10,000 generated nodes', () => {
    cy.visit('demo/10000-nodes.html');
    cy.get('#status', { timeout: 30000 }).should('contain.text', 'Initialization completed');
    cy.get('#chart-container .node').should('have.length', 10000);
  });

});

describe('Family Tree with Flat Datasource', () => {
  beforeEach(() => {
    cy.visit('demo/family-tree-with-flat-datasource.html');
  });

  it('preserves all members, spouse groups and local portraits', () => {
    cy.get('#chart-container .node').should('have.length', 10);
    [['8', '1'], ['3', '9'], ['12', '5']].forEach((members) => {
      cy.get('[id="' + members[0] + '"]').parent().children('.node').then(($nodes) => {
        expect(Array.from($nodes, (node) => node.id)).to.deep.equal(members);
      });
    });
    cy.get('[id="5"] .content').should('have.text', 'Me');
    cy.get('[id="7"] .title').should('have.text', 'Dan Dan');
    cy.get('.avatar').should('have.length', 10).each(($image) => {
      cy.wrap($image).should(($portrait) => {
        expect($portrait[0].complete).to.equal(true);
        expect($portrait[0].naturalWidth).to.be.greaterThan(0);
      });
    });
    cy.screenshot('family-tree-with-flat-datasource-desktop');
  });

  it('collapses and expands descendants without hiding the root spouse group', () => {
    cy.get('[id="1"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="2"]').should('not.be.visible');
    cy.get('[id="3"]').should('not.be.visible');
    cy.get('[id="9"]').should('not.be.visible');
    cy.get('[id="8"]').should('be.visible');
    cy.get('[id="1"]').should('be.visible');

    cy.get('[id="1"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="2"]').should('be.visible');
    cy.get('[id="3"]').should('be.visible');
    cy.get('[id="9"]').should('be.visible');
  });

  it('supports keyboard control of the correct spouse descendants on mobile', () => {
    cy.viewport(390, 844);
    cy.get('[id="12"]').focus();
    cy.get('[id="12"] > .bottomEdge').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[id="7"]').should('not.be.visible');
    cy.get('[id="6"]').should('not.be.visible');
    cy.get('[id="5"]').should('be.visible');

    cy.get('[id="12"] > .bottomEdge').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[id="7"]').should('be.visible');
    cy.get('[id="6"]').should('be.visible');
    cy.screenshot('family-tree-with-flat-datasource-mobile');
  });
});