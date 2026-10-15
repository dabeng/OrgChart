describe('Load data on-demand', () => {

  const sumiao = '#n1';
  const heihei = '#n3';

  beforeEach(() => {
    cy.visit('demo/ondemand-loading-data.html');
  });

  it('load the descendants of hehei', () => {
    cy.get(heihei).find('.bottomEdge, .request-control').should('not.exist');
    cy.get(heihei).trigger('mouseenter').find('.request-children').click();
    cy.get('#n5').should('exist');
    cy.get(heihei).find('.request-control').should('not.exist');
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy').length).to.equal(2);
      expect($node.siblings('.nodes').children('.hierarchy').eq(0).find('.node:contains("Er Dan")')).to.exist;
    });
    cy.get(heihei).trigger('mouseenter').find('.bottomEdge').click();
    cy.get('#n5').should('not.be.visible');
    cy.get(heihei).find('.bottomEdge').click();
    cy.get('#n5').should('be.visible');
  });

  it('load the ancestors of sumiao by expanding vertically', () => {
    cy.get(sumiao).trigger('mouseenter').find('.request-parent').click();
    cy.get('#n0').should('exist');
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
      expect($node.closest('.hierarchy').siblings().length).to.equal(7);
    });
  });

  it('load the ancestors of sumiao by expanding horizontally', () => {
    cy.get(sumiao).trigger('mouseenter').find('.request-siblings').click();
    cy.get('#n0').should('exist');
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
      expect($node.closest('.hierarchy').siblings().length).to.equal(7);
    });

  });

});