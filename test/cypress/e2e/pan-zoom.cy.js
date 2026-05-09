describe('Pan & Zoom', () => {

  beforeEach(() => {
    cy.visit('demo/pan-zoom.html');
  });

  const chart = '.orgchart';
  const chartContainer = '#chart-container';
  const pinchAnchorTolerance = 5;
  const dispatchTouchEvent = (win, target, type, touches) => {
    const touchLikePoints = touches.map((touch, index) => ({
      identifier: index,
      target,
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY
    }));
    const touchEvent = new win.Event(type, {
      bubbles: true,
      cancelable: true
    });

    Object.defineProperty(touchEvent, 'touches', {
      value: type === 'touchend' ? [] : touchLikePoints,
      configurable: true
    });
    Object.defineProperty(touchEvent, 'targetTouches', {
      value: type === 'touchend' ? [] : touchLikePoints,
      configurable: true
    });
    Object.defineProperty(touchEvent, 'changedTouches', {
      value: touchLikePoints,
      configurable: true
    });

    target.dispatchEvent(touchEvent);
  };
  const parseMatrixScale = (transformValue) => {
    const matrixMatch = /matrix\(([^)]+)\)/.exec(transformValue || '');

    if (!matrixMatch) {
      return 1;
    }

    return Number.parseFloat(matrixMatch[1].split(',')[0]);
  };
  const pinchAtPoint = (win, target, center, startGap, endGap) => {
    const initialTouches = [
      { clientX: center.x - (startGap / 2), clientY: center.y },
      { clientX: center.x + (startGap / 2), clientY: center.y }
    ];
    const movedTouches = [
      { clientX: center.x - (endGap / 2), clientY: center.y },
      { clientX: center.x + (endGap / 2), clientY: center.y }
    ];

    dispatchTouchEvent(win, target, 'touchstart', initialTouches);
    dispatchTouchEvent(win, win.document, 'touchmove', movedTouches);
    dispatchTouchEvent(win, win.document, 'touchend', movedTouches);
  };
  const getNodeCenter = ($node) => {
    const rect = $node[0].getBoundingClientRect();

    return {
      x: rect.left + (rect.width / 2),
      y: rect.top + (rect.height / 2)
    };
  };

  it('drag the chart to the top', () => {
    cy.get(chart)
      .trigger('mousedown', { which: 1, pageX: 10, pageY: 200 })
      .trigger('mousemove', { which: 1, pageX: 10, pageY: 100 })
      .trigger('mouseup')
      .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, -100)');
  });

  it('drag the chart to the bottom', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 10, pageY: 100 })
    .trigger('mousemove', { which: 1, pageX: 10, pageY: 200 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 100)');
  });

  it('drag the chart to the left', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 200, pageY: 10 })
    .trigger('mousemove', { which: 1, pageX: 100, pageY: 10 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, -100, 0)');
  });

  it('drag the chart to the right', () => {
    cy.get(chart)
    .trigger('mousedown', { which: 1, pageX: 100, pageY: 10 })
    .trigger('mousemove', { which: 1, pageX: 200, pageY: 10 })
    .trigger('mouseup')
    .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 100, 0)');
  });

  it('zooms around the node under the mouse pointer', () => {
    cy.contains('.node .title', 'Lao Lao')
      .closest('.node')
      .then(($node) => {
        const beforeCenter = getNodeCenter($node);

        cy.get(chartContainer).trigger('wheel', {
          eventConstructor: 'WheelEvent',
          deltaY: -1,
          clientX: beforeCenter.x,
          clientY: beforeCenter.y,
          bubbles: true,
          cancelable: true
        });

        cy.contains('.node .title', 'Lao Lao')
          .closest('.node')
          .then(($zoomedNode) => {
            const afterCenter = getNodeCenter($zoomedNode);

            expect(Math.abs(afterCenter.x - beforeCenter.x)).to.be.lessThan(1);
            expect(Math.abs(afterCenter.y - beforeCenter.y)).to.be.lessThan(1);
          });
      });
  });

  it('ignores wheel zoom when the pointer is outside the chart container bounds', () => {
    cy.get(chart).invoke('css', 'transform').then((beforeTransform) => {
      cy.get(chartContainer).then(($container) => {
        const rect = $container[0].getBoundingClientRect();

        cy.get(chartContainer).trigger('wheel', {
          eventConstructor: 'WheelEvent',
          deltaY: -1,
          clientX: rect.left - 5,
          clientY: rect.top + 10,
          bubbles: true,
          cancelable: true
        });
      });

      cy.get(chart).should('have.css', 'transform', beforeTransform);
    });
  });

  it('zooms in on touch pinch out', () => {
    cy.window().then((win) => {
      const chartContainerElement = win.document.querySelector(chartContainer);

      pinchAtPoint(win, chartContainerElement, { x: 160, y: 160 }, 40, 80);
    });

    cy.get(chart)
      .invoke('css', 'transform')
      .then((transformValue) => {
        expect(parseMatrixScale(transformValue)).to.be.greaterThan(1);
      });
  });

  it('zooms out on touch pinch in', () => {
    cy.window().then((win) => {
      const chartContainerElement = win.document.querySelector(chartContainer);

      pinchAtPoint(win, chartContainerElement, { x: 160, y: 160 }, 80, 40);
    });

    cy.get(chart)
      .invoke('css', 'transform')
      .then((transformValue) => {
        expect(parseMatrixScale(transformValue)).to.be.lessThan(1);
      });
  });

  it('keeps the pinch midpoint inside the same node during touch pinch', () => {
    cy.contains('.node .title', 'Lao Lao')
      .closest('.node')
      .then(($node) => {
        const beforeCenter = getNodeCenter($node);

        cy.window().then((win) => {
          const chartContainerElement = win.document.querySelector(chartContainer);

          pinchAtPoint(win, chartContainerElement, beforeCenter, 40, 80);
        });

        cy.contains('.node .title', 'Lao Lao')
          .closest('.node')
          .then(($zoomedNode) => {
            const rect = $zoomedNode[0].getBoundingClientRect();

            expect(beforeCenter.x).to.be.greaterThan(rect.left - pinchAnchorTolerance);
            expect(beforeCenter.x).to.be.lessThan(rect.right + pinchAnchorTolerance);
            expect(beforeCenter.y).to.be.greaterThan(rect.top - pinchAnchorTolerance);
            expect(beforeCenter.y).to.be.lessThan(rect.bottom + pinchAnchorTolerance);
          });
      });
  });

});