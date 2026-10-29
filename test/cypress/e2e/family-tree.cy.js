const couples = [
  { members: ['8', '1'], descendants: ['2', '3', '9', '10', '12', '5', '7', '6'], children: ['2', '3', '9', '10'] },
  { members: ['3', '9'], descendants: ['12', '5', '7', '6'], children: ['12', '5'] },
  { members: ['12', '5'], descendants: ['7', '6'], children: ['7', '6'] }
];
const allIds = ['8', '1', '2', '3', '9', '12', '5', '7', '6', '10'];
const parentIds = couples.flatMap((couple) => couple.members);
const leafIds = ['2', '10', '7', '6'];

function node(identifier) {
  return cy.get('#chart-container .node[id="' + identifier + '"]');
}

function control(identifier, edge) {
  return node(identifier).scrollIntoView().trigger('mouseenter').children('.' + edge)
    .should('have.attr', 'role', 'button');
}

function clickControl(identifier, edge) {
  return control(identifier, edge).click();
}

function expectVisible(identifiers) {
  cy.get('#chart-container .node').should(($nodes) => {
    const elements = new Map(Array.from($nodes, (element) => [element.id, element]));
    identifiers.forEach((identifier) => {
      const element = elements.get(identifier);
      expect(element, identifier + ' exists').to.exist;
      const style = element.ownerDocument.defaultView.getComputedStyle(element);
      expect(element.closest('.hidden'), identifier + ' hidden ancestor').to.equal(null);
      expect(element.getBoundingClientRect().width, identifier + ' rendered width').to.be.greaterThan(0);
      expect(element.getBoundingClientRect().height, identifier + ' rendered height').to.be.greaterThan(0);
      expect(style.visibility, identifier + ' visibility').to.equal('visible');
      expect(style.opacity, identifier + ' opacity').to.equal('1');
      expect(style.transform, identifier + ' transform').to.equal('none');
      expect(element.classList.contains('sliding'), identifier + ' animation cleanup').to.equal(false);
    });
  });
}

function expectHidden(identifiers) {
  cy.get('#chart-container .node').should(($nodes) => {
    const elements = new Map(Array.from($nodes, (element) => [element.id, element]));
    identifiers.forEach((identifier) => {
      const element = elements.get(identifier);
      expect(element, identifier + ' exists').to.exist;
      expect(element.closest('.hidden'), identifier + ' hidden ancestor').not.to.equal(null);
      expect(element.classList.contains('sliding'), identifier + ' animation cleanup').to.equal(false);
    });
  });
}

function expectStructure() {
  cy.get('#chart-container .node').should('have.length', allIds.length).should(($nodes) => {
    expect(Array.from($nodes, (element) => element.id)).to.deep.equal(allIds);
    const elements = new Map(Array.from($nodes, (element) => [element.id, element]));
    expect(elements.size).to.equal(allIds.length);
    couples.forEach(({ members }) => {
      const family = elements.get(members[0]).parentElement;
      expect(Array.from(family.children).filter((element) => element.matches('.node')).map((element) => element.id))
        .to.deep.equal(members);
    });
    parentIds.forEach((identifier) => {
      const symbols = elements.get(identifier).querySelectorAll(':scope > .title .parentNodeSymbol');
      expect(symbols, identifier + ' parent symbol').to.have.length(1);
      expect(symbols[0].classList.contains('oci-menu')).to.equal(true);
    });
    leafIds.forEach((identifier) => {
      expect(elements.get(identifier).querySelectorAll('.parentNodeSymbol'), identifier + ' leaf symbol').to.have.length(0);
    });
    expect($nodes[0].closest('.orgchart').querySelector('.sliding')).to.equal(null);
  });
}

function expectHorizontalArrows(identifier, expanded) {
  control(identifier, 'leftEdge').should('have.class', expanded ? 'oci-chevron-right' : 'oci-chevron-left');
  control(identifier, 'rightEdge').should('have.class', expanded ? 'oci-chevron-left' : 'oci-chevron-right');
}

function expectSingleSpouseConnector(identifier) {
  node(identifier).scrollIntoView().should(($node) => {
    const element = $node[0];
    const win = element.ownerDocument.defaultView;
    const connector = win.getComputedStyle(element, '::after');
    const children = element.parentElement.querySelector(':scope > .nodes > .hierarchy');
    expect(connector.content).not.to.equal('none');
    expect(connector.width).to.equal('2px');
    expect(connector.height).to.equal('10px');
    expect(connector.bottom).to.equal('-12px');
    expect(win.getComputedStyle(element.parentElement, '::after').content).to.equal('none');
    const connectorBottom = element.getBoundingClientRect().bottom
      - parseFloat(win.getComputedStyle(element).borderBottomWidth) - parseFloat(connector.bottom);
    expect(connectorBottom).to.be.closeTo(children.getBoundingClientRect().top - 11, 2);
  });
}

function sampleConnectorAnimation(identifier, edge, targets) {
  return control(identifier, edge).then(async ($button) => {
    const button = $button[0];
    const doc = button.ownerDocument;
    const win = doc.defaultView;
    const chart = button.closest('.orgchart');
    const targetNodes = targets.map((target) => doc.getElementById(target));
    targetNodes.forEach((element) => {
      win.getComputedStyle(element).opacity;
      win.getComputedStyle(element.parentElement, '::after').opacity;
    });
    button.click();
    targetNodes.forEach((element) => {
      win.getComputedStyle(element).opacity;
      win.getComputedStyle(element.parentElement, '::after').opacity;
    });
    const animations = chart.getAnimations({ subtree: true }).filter((animation) => {
      return animation.transitionProperty === 'opacity' || animation.transitionProperty === 'transform';
    });
    const nodeAnimation = targetNodes[0].getAnimations().find((animation) => animation.transitionProperty === 'opacity');
    expect(nodeAnimation, 'node opacity transition').to.exist;
    animations.forEach((animation) => animation.pause());
    const completed = new Promise((resolve) => {
      chart.querySelector('.node.sliding').addEventListener('transitionend', resolve, { once: true });
    });
    try {
      [0.25, 0.75].forEach((progress) => {
        const time = nodeAnimation.effect.getComputedTiming().duration * progress;
        animations.forEach((animation) => { animation.currentTime = time; });
        targetNodes.forEach((element) => {
          const nodeStyle = win.getComputedStyle(element);
          const connector = win.getComputedStyle(element.parentElement, '::after');
          expect(connector.content, element.id + ' connector exists').not.to.equal('none');
          expect(Number(nodeStyle.opacity)).to.be.greaterThan(0).and.lessThan(1);
          expect(Number(connector.opacity), element.id + ' synchronized opacity').to.be.closeTo(Number(nodeStyle.opacity), 0.001);
          expect(connector.transform, element.id + ' synchronized transform').to.equal(nodeStyle.transform);
        });
      });
    } finally {
      animations.forEach((animation) => animation.finish());
    }
    await completed;
  });
}

[[1200, 900], [390, 844]].forEach(([width, height]) => {
  describe('Family tree at ' + width + 'px', () => {
    beforeEach(() => {
      cy.viewport(width, height);
      cy.intercept('https://dabeng.github.io/OrgChart/img/avatar/*.jpg', (request) => {
        const imageName = new URL(request.url).pathname.split('/').pop();
        request.reply({
          fixture: '../../demo/img/avatar/' + imageName,
          headers: { 'access-control-allow-origin': '*' }
        });
      });
      cy.visit('demo/family-tree.html');
    });

    it('renders every member, parent symbol, spouse group and portrait', () => {
      expectStructure();
      cy.get('#chart-container .edge').should('not.exist');
      cy.get('#chart-container .avatar').should('have.length', allIds.length).each(($image) => {
        cy.wrap($image).should(($portrait) => {
          expect($portrait[0].complete).to.equal(true);
          expect($portrait[0].naturalWidth).to.be.greaterThan(0);
        });
      });
      expectVisible(allIds);
      ['8', '1'].forEach((identifier) => {
        node(identifier).trigger('mouseenter').children('.topEdge').should('not.exist');
      });
      leafIds.forEach((identifier) => {
        node(identifier).trigger('mouseenter').children('.bottomEdge').should('not.exist');
      });
      node('8').scrollIntoView();
      cy.screenshot('family-tree-initial-' + width);
    });

    couples.forEach(({ members, descendants, children }) => {
      members.forEach((identifier, memberIndex) => {
        const partner = members[1 - memberIndex];
        it('collapses descendants from ' + identifier + ' and restores them from spouse ' + partner, () => {
          control(identifier, 'bottomEdge').should('have.class', 'oci-chevron-up');
          clickControl(identifier, 'bottomEdge');
          expectHidden(descendants);
          expectVisible(allIds.filter((member) => !descendants.includes(member)));
          control(identifier, 'bottomEdge').should('have.class', 'oci-chevron-down');
          control(partner, 'bottomEdge').should('have.class', 'oci-chevron-down');
          expectStructure();

          clickControl(partner, 'bottomEdge');
          expectVisible(children);
          expectHidden(descendants.filter((member) => !children.includes(member)));
          control(identifier, 'bottomEdge').should('have.class', 'oci-chevron-up');
          control(partner, 'bottomEdge').should('have.class', 'oci-chevron-up');
          expectStructure();
        });
      });
    });

    const siblingCases = [
      { identifier: '8', siblings: ['1'] },
      { identifier: '1', siblings: ['8'] },
      { identifier: '3', siblings: ['2', '9', '10'] },
      { identifier: '9', siblings: ['2', '3', '10'] },
      { identifier: '12', siblings: ['5'] },
      { identifier: '5', siblings: ['12'] },
      { identifier: '7', siblings: ['6'] },
      { identifier: '6', siblings: ['7'] }
    ];
    siblingCases.forEach(({ identifier, siblings }) => {
      ['leftEdge', 'rightEdge'].forEach((edge) => {
        it('restores every sibling of ' + identifier + ' using ' + edge, () => {
          expectHorizontalArrows(identifier, true);
          clickControl(identifier, edge);
          expectHidden(siblings);
          expectVisible(allIds.filter((member) => !siblings.includes(member)));
          expectHorizontalArrows(identifier, false);
          if (parentIds.includes(identifier)) {
            expectSingleSpouseConnector(identifier);
          }
          expectStructure();

          clickControl(identifier, edge);
          expectVisible(allIds);
          expectHorizontalArrows(identifier, true);
          if (parentIds.includes(identifier)) {
            node(identifier).parent().should(($family) => {
              const style = $family[0].ownerDocument.defaultView.getComputedStyle($family[0], '::after');
              expect(style.content).not.to.equal('none');
              expect(style.opacity).to.equal('1');
              expect(style.transform).to.equal('none');
            });
          }
          expectStructure();
        });
      });
    });

    ['leftEdge', 'rightEdge'].forEach((edge) => {
      it('restores both spouses and reopens nested branches after Bo Miao uses ' + edge, () => {
        clickControl('2', edge);
        expectHidden(['3', '9', '10', '12', '5', '7', '6']);
        expectVisible(['8', '1', '2']);
        expectStructure();

        clickControl('2', edge);
        expectVisible(['8', '1', '2', '3', '9', '10']);
        expectHidden(['12', '5', '7', '6']);
        node('3').should(($node) => {
          expect($node[0].ownerDocument.defaultView.getComputedStyle($node[0], '::after').content).to.equal('none');
        });
        node('2').scrollIntoView();
        cy.screenshot('family-tree-restored-siblings-' + edge + '-' + width);

        clickControl('9', 'bottomEdge');
        expectVisible(['12', '5']);
        expectHidden(['7', '6']);
        node('3').should(($node) => {
          expect($node[0].ownerDocument.defaultView.getComputedStyle($node[0], '::after').content).not.to.equal('none');
        });
        clickControl('5', 'bottomEdge');
        expectVisible(allIds);
        expectStructure();
      });
    });

    it('hides the ancestor chain and restores the immediate parent before sibling branches', () => {
      control('2', 'topEdge').should('have.class', 'oci-chevron-down');
      clickControl('2', 'topEdge');
      expectHidden(['1', '3', '9', '10', '12', '5', '7', '6']);
      expectVisible(['8', '2']);
      control('2', 'topEdge').should('have.class', 'oci-chevron-up');
      clickControl('2', 'topEdge');
      expectVisible(['8', '1', '2']);
      expectHidden(['3', '9', '10', '12', '5', '7', '6']);
      control('2', 'topEdge').should('have.class', 'oci-chevron-down');
      clickControl('2', 'rightEdge');
      clickControl('9', 'bottomEdge');
      clickControl('5', 'bottomEdge');
      expectVisible(allIds);
      expectStructure();
    });

    it('recovers all generations after collapsing ancestors from Dan Dan', () => {
      clickControl('7', 'topEdge');
      expectVisible(['8', '7']);
      expectHidden(['1', '2', '3', '9', '10', '12', '5', '6']);
      clickControl('7', 'topEdge');
      expectVisible(['8', '12', '7']);
      expectHidden(['1', '2', '3', '9', '10', '5', '6']);
      clickControl('12', 'topEdge');
      expectVisible(['3', '12', '7']);
      clickControl('3', 'topEdge');
      expectVisible(['8', '1', '3', '12', '7']);
      clickControl('3', 'rightEdge');
      clickControl('12', 'rightEdge');
      clickControl('7', 'rightEdge');
      expectVisible(allIds);
      expectStructure();
    });

    [['8', '{enter}'], ['9', ' '], ['5', '{enter}']].forEach(([identifier, key]) => {
      const couple = couples.find(({ members }) => members.includes(identifier));
      it('supports focus, keyboard activation and blur on shared child control ' + identifier, () => {
        node(identifier).scrollIntoView().focus();
        node(identifier).children('.bottomEdge').should('have.attr', 'aria-label', 'Toggle child nodes')
          .focus().type(key);
        expectHidden(couple.descendants);
        expectVisible(couple.members);
        node(identifier).trigger('mouseleave').children('.bottomEdge').should('exist')
          .and('have.class', 'oci-chevron-down').type(key);
        expectVisible(couple.children);
        expectHidden(couple.descendants.filter((member) => !couple.children.includes(member)));
        node(identifier).children('.bottomEdge').blur();
        node(identifier).trigger('mouseleave').children('.edge').should('not.exist');
        expectStructure();
      });
    });

    it('ignores repeated cross-spouse clicks while child transitions are running', () => {
      control('8', 'bottomEdge').then(($button) => {
        $button[0].click();
        const partner = $button[0].ownerDocument.getElementById('1');
        partner.dispatchEvent(new partner.ownerDocument.defaultView.MouseEvent('mouseenter'));
        partner.querySelector(':scope > .bottomEdge').click();
        $button[0].click();
      });
      expectHidden(couples[0].descendants);
      expectVisible(['8', '1']);
      control('1', 'bottomEdge').then(($button) => {
        $button[0].click();
        $button[0].click();
      });
      expectVisible(couples[0].children);
      expectHidden(['12', '5', '7', '6']);
      expectStructure();
    });

    it('remains consistent after repeated operations at all three family levels', () => {
      for (let cycle = 0; cycle < 2; cycle += 1) {
        couples.slice().reverse().forEach(({ members, descendants, children }) => {
          clickControl(members[0], 'bottomEdge');
          expectHidden(descendants);
          clickControl(members[1], 'bottomEdge');
          expectVisible(children);
        });
        clickControl('9', 'bottomEdge');
        expectVisible(['12', '5']);
        clickControl('5', 'bottomEdge');
        expectVisible(allIds);
        expectStructure();
      }
    });

    [
      { identifier: '8', edge: 'bottomEdge', hiding: ['3', '12'], showing: ['3'], hidden: couples[0].descendants, visible: couples[0].children },
      { identifier: '9', edge: 'bottomEdge', hiding: ['12'], showing: ['12'], hidden: ['12', '5', '7', '6'], visible: ['12', '5'] },
      { identifier: '2', edge: 'rightEdge', hiding: ['3', '12'], showing: ['3'], hidden: ['3', '9', '10', '12', '5', '7', '6'], visible: ['3', '9', '10'] }
    ].forEach(({ identifier, edge, hiding, showing, hidden, visible }) => {
      it('synchronizes spouse connectors with node animation through ' + identifier + ' ' + edge, () => {
        sampleConnectorAnimation(identifier, edge, hiding);
        expectHidden(hidden);
        sampleConnectorAnimation(identifier, edge, showing);
        expectVisible(visible);
        expectStructure();
      });
    });
  });
});