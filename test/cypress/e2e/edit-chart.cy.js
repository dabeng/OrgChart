describe('Edit Chart', () => {

  const editPanel = '#edit-panel';
  const ballgame = '.node:contains("Ball game")';
  const football = '.node:contains("Football")';
  const viewState = '#rd-view';
  const editState = '#rd-edit';
  const selectedNode = '#selected-node';
  const newNodes = '#new-nodelist .new-node';
  const addInput = '#btn-add-input';
  const removeInput = '#btn-remove-input';
  const parentRel = '#rd-parent';
  const childRel = '#rd-child';
  const siblingRel = '#rd-sibling';
  const addBtn = '#btn-add-nodes';
  const deleteBtn = '#btn-delete-nodes';
  const resetBtn = '#btn-reset';

  beforeEach(() => {
    cy.visit('demo/edit-chart.html');
  });

  it('add parent(root) node -- sports', () => {
    cy.get(ballgame).click();
    cy.get(newNodes).eq(0).type('Sports');
    cy.get(parentRel).click();
    cy.get(addBtn).click();
    cy.get(selectedNode).should('have.value', 'Ball game');
    cy.get(ballgame).should(($node) => {
      expect($node.closest('.nodes').siblings('.node')).to.have.text('Sports');
    });
  });

  it('add child nodes -- Futsal and Beach football', () => {
    cy.get(football).click();
    cy.get(newNodes).eq(0).type('Futsal');
    cy.get(addInput).click();
    cy.get(newNodes).eq(1).type('Beach football');
    cy.get(addInput).click();
    cy.get(newNodes).eq(2).type('Robot football');
    cy.get(removeInput).click();
    cy.get(childRel).click();
    cy.get(addBtn).click();
    cy.get(selectedNode).should('have.value', 'Football');
    cy.get(football).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy').length).to.equal(2);
    });
    cy.get(football).should(($node) => {
      expect($node.siblings('.nodes').find('.node:contains("Futsal")')).to.exist;
      expect($node.siblings('.nodes').find('.node:contains("Beach football")')).to.exist;
    });

    cy.get(resetBtn).click();
    cy.get(football).should('not.have.class', 'focused');
    cy.get(selectedNode).should('have.value', '');
    cy.get(newNodes).should('have.length', 1);
    cy.get(childRel).should('not.be.checked');
  });

  it('add sibling node -- Baseball', () => {
    cy.get(football).click();
    cy.get(newNodes).eq(0).type('Baseball');
    cy.get(siblingRel).click();
    cy.get(addBtn).click();
    cy.get(selectedNode).should('have.value', 'Football');
    cy.get(ballgame).should(($node) => {
      expect($node.siblings('.nodes').children('.hierarchy').length).to.equal(4);
      expect($node.siblings('.nodes').find('.node:contains("Baseball")')).to.exist;
    });
  });

  it('delete the football node', () => {
    cy.get(football).click();
    cy.get(selectedNode).should('have.value', 'Football');
    cy.get(deleteBtn).click();
    cy.get(selectedNode).should('have.value', '');
    cy.get(football).should('not.exist');
  });

});