describe('Hybrid(horizontal + vertical) Chart', () => {

  beforeEach(() => {
    cy.visit('demo/vertical-level.html');
  });

  const sumiao = '.node:contains("Su Miao")';
  const tiehua = '.node:contains("Tie Hua")';
  const heihei = '.node:contains("Hei Hei")';
  const pangpang = '.node:contains("Pang Pang")';
  const dandan = '.node:contains("Dan Dan")';
  const erdan = '.node:contains("Er Dan")';
  const sandan = '.node:contains("San Dan")';
  const sidan = '.node:contains("Si Dan")';
  const wudan = '.node:contains("Wu Dan")';

  it('toggle the vertical nodes', () => {
    cy.get(dandan).find('.toggleBtn').click();
    cy.get(erdan).get(sandan).should('be.visible');
    cy.get(sidan).get(wudan).should('not.be.visible');
  
    cy.get(heihei).find('.toggleBtn').click();
    cy.get(pangpang).get(dandan).get(erdan).get(sandan).should('not.be.visible');
  
    cy.get(heihei).find('.toggleBtn').click();
    cy.get(pangpang).get(dandan).should('be.visible');
  });

  it('toggle the vertical nodes by cicking horizontal nodes', () => {
    cy.get(sumiao).find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).get(pangpang).get(dandan).should('be.visible');

    cy.get(sumiao).find('.bottomEdge').click();
    cy.get(tiehua).get(heihei).should('be.visible');
    cy.get(pangpang).get(dandan).should('not.be.visible');
  });

});