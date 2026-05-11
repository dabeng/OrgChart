describe('Level Offset', () => {

  beforeEach(() => {
    cy.visit('demo/level-offset.html');
  });

  it('applies the configured offset to the node and connector variables', () => {
    cy.contains('.node .title', 'Hong Miao')
      .closest('.node')
      .should('have.css', 'margin-top', '140px')
      .then(($node) => {
        const nodeStyle = $node[0].style;

        expect(nodeStyle.getPropertyValue('--top')).to.equal('-151px');
        expect(nodeStyle.getPropertyValue('--height')).to.equal('149px');
        expect(nodeStyle.getPropertyValue('--top-cross-point')).to.equal('-153px');
        expect(nodeStyle.getPropertyValue('--height-cross-point')).to.equal('151px');
      });
  });

});