describe('Load data on-demand', () => {

  const sumiao = '.node:contains("Su Miao")';
  const heihei = '.node:contains("Hei Hei")';

  beforeEach(() => {
    cy.visit('demo/ondemand-loading-data.html');
  });

  it('load the descendants of hehei', () => {
    cy.get(heihei).find('.bottomEdge').click();
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy').length).to.equal(2);
      expect($node.siblings('.nodes').children('.hierarchy').eq(0).find('.node:contains("Er Dan")')).to.exist;
    });
  });

  it('load the ancestors of sumiao by expanding vertically', () => {
    cy.get(sumiao).find('.topEdge').click();
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
      expect($node.closest('.hierarchy').siblings().length).to.equal(7);
    });
  });

  it('load the ancestors of sumiao by expanding horizontally', () => {
    cy.get(sumiao).find('.leftEdge').click();
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
      expect($node.closest('.hierarchy').siblings().length).to.equal(7);
    });

  });

});