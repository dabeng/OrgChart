describe('Toggle sibling nodes respectively', () => {

  const bomiao = '.node:contains("Bo Miao")';
  const sumiao = '.node:contains("Su Miao")';
  const hongmiao = '.node:contains("Hong Miao")';
  const renwu = '.node:contains("Ren Wu")';
  const lixin = '.node:contains("Li Xin")';
  const xingan = '.node:contains("Xing An")';
  const yidian = '.node:contains("Yi Dian")';

  beforeEach(() => {
    cy.visit('demo/toggle-sibs-resp.html');
  });

  it('toggle the left side sibling nodes of sumiao', () => {
    cy.get(sumiao).find('.leftEdge').click();
    cy.get(bomiao).get(renwu).get(lixin).should('not.be.visible');

    cy.get(sumiao).find('.leftEdge').click();
    cy.get(bomiao).should('be.visible');
    cy.get(renwu).get(lixin).should('not.be.visible');
  });

  it('toggle the right side sibling nodes of sumiao', () => {
    cy.get(sumiao).find('.rightEdge').click();
    cy.get(hongmiao).get(xingan).get(yidian).should('not.be.visible');

    cy.get(sumiao).find('.rightEdge').click();
    cy.get(hongmiao).should('be.visible');
    cy.get(xingan).get(yidian).should('not.be.visible');
  });

});