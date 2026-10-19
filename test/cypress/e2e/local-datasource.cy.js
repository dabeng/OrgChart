describe('Local Datasource', () => {

  const laolao = '.node:contains("Lao Lao")';
  const bomiao = '.node:contains("Bo Miao")';
  const sumiao = '.node:contains("Su Miao")';
  const hongmiao = '.node:contains("Hong Miao")';
  const tiehua = '.node:contains("Tie Hua")';
  const heihei = '.node:contains("Hei Hei")';
  const pangpang = '.node:contains("Pang Pang")';
  const dandan = '.node:contains("Dan Dan")';

  beforeEach(() => {
    cy.visit('demo/local-datasource.html');
  });

  it('bottomEdge of root node works well', () => {
    cy.get(laolao).trigger('mouseenter').find('.bottomEdge').click();
    cy.get(bomiao).get(sumiao).get(hongmiao).should('not.be.visible');

    cy.get(laolao).trigger('mouseenter').find('.bottomEdge').click();
    cy.get(bomiao).get(sumiao).get(hongmiao).should('be.visible');
  });

  it('topEdge of sumiao node works well', () => {
    cy.get(sumiao).trigger('mouseenter').find('.topEdge').click();
    cy.get(laolao).get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).trigger('mouseenter').find('.topEdge').click();
    cy.get(laolao).should('be.visible');
    cy.get(bomiao).get(hongmiao).should('not.be.visible');
  });

  it('leftEdge of sumiao node works well', () => {
    cy.get(sumiao).trigger('mouseenter').find('.leftEdge').click();
    cy.get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).trigger('mouseenter').find('.leftEdge').click();
    cy.get(bomiao).get(hongmiao).should('be.visible');
  });

  it('rightEdge of sumiao node works well', () => {
    cy.get(sumiao).trigger('mouseenter').find('.rightEdge').click();
    cy.get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).trigger('mouseenter').find('.rightEdge').click();
    cy.get(bomiao).get(hongmiao).should('be.visible');
  });

  it('bottomEdge of sumiao node works well', () => {
    cy.get(sumiao).trigger('mouseenter').find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).get(pangpang).get(dandan).should('not.be.visible');

    cy.get(sumiao).trigger('mouseenter').find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).get(pangpang).should('be.visible');
  });

  it('topEdge of heihei node works well', () => {
    cy.get(heihei).trigger('mouseenter').find('.topEdge').click();
    cy.get(laolao).get(bomiao).get(sumiao).get(hongmiao).get(tiehua).get(pangpang).should('not.be.visible');

    cy.get(heihei).trigger('mouseenter').find('.topEdge').click();
    cy.get(sumiao).should('be.visible');
    cy.get(laolao).should('not.be.visible');
  });

  it('horizontalEdge of heihei node works well', () => {
    cy.get(heihei).trigger('mouseenter').find('.topEdge').click();
    cy.get(heihei).trigger('mouseenter').find('.leftEdge').click();
    cy.get(sumiao).get(tiehua).get(pangpang).should('be.visible');
    cy.get(laolao).should('not.be.visible');
  });

  it('horizontalEdge of pangpang node works well', () => {
      cy.get(pangpang).trigger('mouseenter').find('.leftEdge').click();
      cy.get(tiehua).get(heihei).get(dandan).should('not.be.visible');

      cy.get(pangpang).trigger('mouseenter').find('.leftEdge').click();
      cy.get(tiehua).get(heihei).should('be.visible');
  });

});

describe('Parent ID Datasource', () => {
  beforeEach(() => {
    cy.visit('demo/flat-datasource.html');
  });

  it('renders all database rows in their parent_id hierarchy', () => {
    cy.get('#chart-container .node').should('have.length', 10);
    cy.get('[id="1"] .title').should('have.text', 'ELECTRONICS');
    cy.get('.node[data-parent="1"]').then(($nodes) => {
      expect(Array.from($nodes, (node) => node.id)).to.deep.equal(['2', '6']);
    });
    cy.get('.node[data-parent="2"]').should('have.length', 3);
    cy.get('.node[data-parent="6"]').should('have.length', 3);
    cy.get('[id="8"]').should('have.attr', 'data-parent', '7');
    cy.get('.node .title').each(($title) => {
      expect($title[0].scrollWidth).to.be.at.most($title[0].clientWidth);
    });
    cy.screenshot('flat-datasource-desktop');
  });

  it('collapses and expands the root children', () => {
    cy.get('[id="1"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="2"]').should('not.be.visible');
    cy.get('[id="6"]').should('not.be.visible');
    cy.get('[id="8"]').should('not.be.visible');

    cy.get('[id="1"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="2"]').should('be.visible');
    cy.get('[id="6"]').should('be.visible');
  });

  it('collapses and expands a branch without affecting the other branch', () => {
    cy.get('[id="6"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="7"]').should('not.be.visible');
    cy.get('[id="8"]').should('not.be.visible');
    cy.get('[id="3"]').should('be.visible');

    cy.get('[id="6"]').trigger('mouseenter').find('.bottomEdge').click();
    cy.get('[id="7"]').should('be.visible');
    cy.get('[id="9"]').should('be.visible');
    cy.get('[id="10"]').should('be.visible');
  });

  it('hides and reveals the parent of a nested node', () => {
    cy.get('[id="7"]').trigger('mouseenter').find('.topEdge').click();
    cy.get('[id="6"]').should('not.be.visible');
    cy.get('[id="1"]').should('not.be.visible');
    cy.get('[id="9"]').should('not.be.visible');

    cy.get('[id="7"]').trigger('mouseenter').find('.topEdge').click();
    cy.get('[id="6"]').should('be.visible');
    cy.get('[id="1"]').should('not.be.visible');
  });

  ['leftEdge', 'rightEdge'].forEach((edge) => {
    it('toggles sibling branches with the ' + edge, () => {
      cy.get('[id="6"]').trigger('mouseenter').find('.' + edge).click();
      cy.get('[id="2"]').should('not.be.visible');
      cy.get('[id="7"]').should('be.visible');

      cy.get('[id="6"]').trigger('mouseenter').find('.' + edge).click();
      cy.get('[id="2"]').should('be.visible');
    });
  });

  it('supports keyboard expand and collapse on a narrow viewport', () => {
    cy.viewport(390, 844);
    cy.get('[id="1"]').focus();
    cy.get('[id="1"] > .bottomEdge').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[id="6"]').should('not.be.visible');
    cy.get('[id="1"] > .bottomEdge').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[id="6"]').should('be.visible');
    cy.screenshot('flat-datasource-mobile');
  });
});

