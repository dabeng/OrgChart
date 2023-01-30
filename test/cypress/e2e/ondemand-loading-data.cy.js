describe('Load data on-demand', () => {

  const sumiao = '.node:contains("Su Miao")';
  const heihei = '.node:contains("Hei Hei")';

  beforeEach(() => {
    cy.visit('demo/ondemand-loading-data.html');
  });

  it('load child nodes of hehei', () => {
    cy.get(heihei).find('.bottomEdge').click();
    cy.get(heihei).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy').length).to.equal(2);
    });
  });

  it('load parent node of sumiao', () => {
    cy.get(sumiao).find('.topEdge').click();
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
    });
  });

  it('load parent and sibling nodes of sumiao', () => {
    cy.get(sumiao).find('.leftEdge').click();
    cy.get(sumiao).should(($node) => {
      expect($node.closest('.nodes').siblings('.node:contains("Lao Lao")')).to.exist;
      expect($node.closest('.hierarchy').siblings().length).to.equal(7);
    });

  });

});