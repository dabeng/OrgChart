describe('Hybrid Drag and Drop Chart', () => {

  const sanDan = '.node:contains("San Dan")';
  const sanYue = '.node:contains("San Yue")';

  beforeEach(() => {
    cy.visit('demo/drag-drop-hybrid-chart.html');
  });

  it('recomputes vertical relationships after moving a nested branch', () => {
    const dataTransfer = new DataTransfer();

    cy.get(sanDan).trigger('dragstart', { dataTransfer, force: true });
    cy.get(sanYue).trigger('drop', { dataTransfer, force: true });

    cy.get(sanYue).should(($node) => {
      expect($node.siblings('.nodes').find('.node:contains("San Dan")')).to.exist;
      expect($node.find('.toggleBtn')).to.exist;
    });
  });

});