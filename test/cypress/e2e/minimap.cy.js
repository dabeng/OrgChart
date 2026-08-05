describe('Minimap', () => {

  const chart = '.orgchart';
  const minimap = '.orgchart-minimap';
  const minimapViewport = '.orgchart-minimap-viewport';
  const parseMatrixScale = (transformValue) => {
    const matrixMatch = /matrix\(([^)]+)\)/.exec(transformValue || '');

    return matrixMatch ? Number.parseFloat(matrixMatch[1].split(',')[0]) : 1;
  };

  beforeEach(() => {
    cy.visit('demo/minimap.html');
  });

  it('renders an overview and moves the chart when its viewport is dragged', () => {
    cy.get(minimap).should('be.visible');
    cy.get('.orgchart-minimap-node').should('have.length.at.least', 30);
    cy.get(minimapViewport).should('be.visible');

    cy.get(chart).invoke('css', 'transform').then((beforeTransform) => {
      cy.get(minimapViewport).then(($viewport) => {
        const viewport = $viewport[0];
        const rect = viewport.getBoundingClientRect();
        const startX = rect.left + (rect.width / 2);
        const startY = rect.top + (rect.height / 2);
        const win = viewport.ownerDocument.defaultView;

        viewport.dispatchEvent(new win.MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: startX,
          clientY: startY
        }));
        viewport.ownerDocument.dispatchEvent(new win.MouseEvent('mousemove', {
          bubbles: true,
          clientX: startX + 20,
          clientY: startY + 20
        }));
        viewport.ownerDocument.dispatchEvent(new win.MouseEvent('mouseup', { bubbles: true }));
      });

      cy.get(chart).should('not.have.css', 'transform', beforeTransform);
    });
  });

  it('zooms the main chart from the minimap wheel control', () => {
    cy.get(chart).invoke('css', 'transform').then((beforeTransform) => {
      cy.get(minimap).then(($minimap) => {
        const minimapElement = $minimap[0];
        const win = minimapElement.ownerDocument.defaultView;

        minimapElement.dispatchEvent(new win.WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaY: -1
        }));
      });

      cy.get(chart).invoke('css', 'transform').then((afterTransform) => {
        expect(parseMatrixScale(afterTransform)).to.be.greaterThan(parseMatrixScale(beforeTransform));
      });
    });
  });

});