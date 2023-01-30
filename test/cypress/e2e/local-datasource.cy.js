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
    cy.get(laolao).find('.bottomEdge').click();
    cy.get(bomiao).get(sumiao).get(hongmiao).should('not.be.visible');

    cy.get(laolao).find('.bottomEdge').click();
    cy.get(bomiao).get(sumiao).get(hongmiao).should('be.visible');
  });

  it('topEdge of sumiao node works well', () => {
    cy.get(sumiao).find('.topEdge').click();
    cy.get(laolao).get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).find('.topEdge').click();
    cy.get(laolao).should('be.visible');
    cy.get(bomiao).get(hongmiao).should('not.be.visible');
  });

  it('leftEdge of sumiao node works well', () => {
    cy.get(sumiao).find('.leftEdge').click();
    cy.get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).find('.leftEdge').click();
    cy.get(bomiao).get(hongmiao).should('be.visible');
  });

  it('rightEdge of sumiao node works well', () => {
    cy.get(sumiao).find('.rightEdge').click();
    cy.get(bomiao).get(hongmiao).should('not.be.visible');

    cy.get(sumiao).find('.rightEdge').click();
    cy.get(bomiao).get(hongmiao).should('be.visible');
  });

  it('bottomEdge of sumiao node works well', () => {
    cy.get(sumiao).find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).get(pangpang).get(dandan).should('not.be.visible');

    cy.get(sumiao).find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).get(pangpang).should('be.visible');
  });

  it('topEdge of heihei node works well', () => {
    cy.get(heihei).find('.topEdge').click();
    cy.get(laolao).get(bomiao).get(sumiao).get(hongmiao).get(tiehua).get(pangpang).should('not.be.visible');

    cy.get(heihei).find('.topEdge').click();
    cy.get(sumiao).should('be.visible');
    cy.get(laolao).should('not.be.visible');
  });

  it('horizontalEdge of heihei node works well', () => {
    cy.get(heihei).find('.topEdge').click();
    cy.get(heihei).find('.leftEdge').click();
    cy.get(sumiao).get(tiehua).get(pangpang).should('be.visible');
    cy.get(laolao).should('not.be.visible');
  });

  it('horizontalEdge of pangpang node works well', () => {
      cy.get(pangpang).find('.leftEdge').click();
      cy.get(tiehua).get(heihei).get(dandan).should('not.be.visible');

      cy.get(pangpang).find('.leftEdge').click();
      cy.get(tiehua).get(heihei).should('be.visible');
  });

});

