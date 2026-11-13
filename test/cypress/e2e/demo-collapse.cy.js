const controls = '.edge, .toggleBtn, .backToCompactSymbol, .backToLooseSymbol';

function hover(node) {
  node.dispatchEvent(new node.ownerDocument.defaultView.MouseEvent('mouseenter'));
}

function leave(node) {
  node.dispatchEvent(new node.ownerDocument.defaultView.MouseEvent('mouseleave'));
}

function sampleClick(node, selector, expanded, key) {
  return cy.then(() => {
    hover(node);
    const button = node.querySelector(':scope > ' + selector);
    const chart = node.closest('.orgchart');
    const win = node.ownerDocument.defaultView;
    let sampled = false;
    let activeAnimations = [];
    button.addEventListener('click', () => {
      const moving = Array.from(chart.querySelectorAll('.node.sliding'));
      expect(moving.length, 'animated nodes').to.be.greaterThan(0);
      moving.forEach((element) => { win.getComputedStyle(element).opacity; });
      const animations = chart.getAnimations({ subtree: true }).filter((animation) =>
        ['opacity', 'transform'].includes(animation.transitionProperty));
      const opacity = animations.find((animation) => animation.effect.target === moving[0]
        && animation.transitionProperty === 'opacity');
      expect(opacity, 'real CSS opacity transition').to.exist;
      expect(animations.some((animation) => animation.effect.target === moving[0]
        && animation.transitionProperty === 'transform'), 'real CSS movement transition').to.equal(true);
      animations.forEach((animation) => animation.pause());
      activeAnimations = animations;
      try {
        const duration = opacity.effect.getComputedTiming().duration;
        const samples = [0.25, 0.75].map((progress) => {
          animations.forEach((animation) => { animation.currentTime = duration * progress; });
          const style = win.getComputedStyle(moving[0]);
          expect(Number(style.opacity), 'intermediate opacity').to.be.greaterThan(0).and.lessThan(1);
          expect(style.transform, 'intermediate movement').not.to.equal('none');
          return { opacity: Number(style.opacity), transform: style.transform };
        });
        expect(samples[0].opacity, 'opacity changes across frames').not.to.equal(samples[1].opacity);
        expect(samples[0].transform, 'position changes across frames').not.to.equal(samples[1].transform);
        if (expanded !== undefined) {
          expect(samples[1].opacity > samples[0].opacity, 'animation follows the requested direction').to.equal(expanded);
        }
        const before = moving.map((element) => element.className);
        button.click();
        expect(moving.map((element) => element.className), 'repeat click cannot reverse an active transition')
          .to.deep.equal(before);
        sampled = true;
      } catch (error) {
        animations.forEach((animation) => animation.finish());
        throw error;
      }
    }, { once: true });
    const control = cy.wrap(Cypress.$(button), { log: false }).should('be.visible');
    const activate = key ? control.focus().trigger('keydown', { key }) : control.click();
    return activate.then(() => {
      expect(sampled, 'animation was sampled on click').to.equal(true);
      leave(node);
      expect(node.querySelector(':scope > .edge, :scope > .toggleBtn'), 'controls leave during animation').to.equal(null);
      hover(node);
      activeAnimations.forEach((animation) => animation.finish());
      cy.get('#chart-container .sliding', { log: false }).should('not.exist');
    });
  });
}

function visible(node) {
  return !!node && !node.closest('.hidden') && node.getBoundingClientRect().width > 0;
}

function childLayer(node) {
  if (node.nextElementSibling && node.nextElementSibling.matches('.nodes')) {
    return node.nextElementSibling;
  }
  return node.parentElement.querySelector(':scope > .nodes');
}

function relatedNodes(node, selector, directional) {
  const hierarchy = node.parentElement;
  if (selector === '.topEdge') {
    const layer = hierarchy.parentElement;
    const parent = layer.matches('.nodes') ? layer.previousElementSibling : null;
    return parent && parent.matches('.node') ? [parent] : [];
  }
  if (selector === '.bottomEdge' || selector === '.toggleBtn') {
    const layer = childLayer(node);
    return layer ? Array.from(layer.children).flatMap((element) =>
      Array.from(element.children).filter((child) => child.matches('.node'))) : [];
  }
  const hierarchies = Array.from(hierarchy.parentElement.children).filter((element) => element.matches('.hierarchy'));
  const index = hierarchies.indexOf(hierarchy);
  const siblings = directional ? hierarchies.filter((element, siblingIndex) =>
    selector === '.leftEdge' ? siblingIndex < index : siblingIndex > index)
    : hierarchies.filter((element) => element !== hierarchy);
  return siblings.flatMap((element) => Array.from(element.children).filter((child) => child.matches('.node')))
    .concat(directional ? [] : Array.from(hierarchy.children).filter((element) => element.matches('.node') && element !== node));
}

function iconNames(page) {
  const custom = ['custom-icons.html', 'options-horizontal-template.html'].includes(page);
  return custom
    ? { up: 'fa-angles-up', down: 'fa-angles-down', left: 'fa-angles-left', right: 'fa-angles-right', open: 'fa-circle-minus', closed: 'fa-circle-plus' }
    : { up: 'oci-chevron-up', down: 'oci-chevron-down', left: 'oci-chevron-left', right: 'oci-chevron-right', open: 'oci-minus-square', closed: 'oci-plus-square' };
}

function assertArrow(node, selector, expanded, page) {
  const icons = iconNames(page);
  const pair = selector === '.topEdge' ? [icons.down, icons.up]
    : selector === '.bottomEdge' ? [icons.up, icons.down]
    : selector === '.toggleBtn' ? [icons.open, icons.closed]
    : selector === '.leftEdge' ? [icons.right, icons.left] : [icons.left, icons.right];
  cy.wrap(Cypress.$(node), { log: false }).children(selector).should('have.class', pair[expanded ? 0 : 1])
    .and('not.have.class', pair[expanded ? 1 : 0]);
}

function assertSettled(node, targets, expanded) {
  cy.wrap(Cypress.$(node), { log: false }).should(($node) => {
    expect(visible($node[0]), 'controlling node remains visible').to.equal(true);
    const failures = [];
    targets.forEach((target) => {
      const label = target.id || target.querySelector(':scope > .title')?.textContent;
      if (visible(target) !== expanded) { failures.push(label + ': visibility'); }
      if (target.classList.contains('sliding')) { failures.push(label + ': transition cleanup'); }
      if (expanded) {
        const style = target.ownerDocument.defaultView.getComputedStyle(target);
        if (style.opacity !== '1') { failures.push(label + ': opacity ' + style.opacity); }
        if (style.transform !== 'none') { failures.push(label + ': transform ' + style.transform); }
        if (target.matches('.slide-up, .slide-down, .slide-left, .slide-right')) { failures.push(label + ': stale slide class'); }
      }
    });
    expect(failures, 'all ' + targets.length + ' related nodes have the correct settled state').to.deep.equal([]);
  });
}

const allPages = Cypress.expose('chartDemoPages');
const pagePattern = Cypress.expose('collapsePagePattern');
const pages = allPages.filter((page) => !pagePattern || new RegExp(pagePattern).test(page));
const directionalPages = ['toggle-sibs-resp.html', 'options-horizontal-template.html', 'options-hybrid-navigation.html'];

function discoverCases(chart, page) {
  const cases = new Map();
  const completeModes = new Set();
  Array.from(chart.querySelectorAll('.node')).forEach((node, index) => {
    if (!visible(node)) { return; }
    const mode = node.matches('.compact') ? 'compact'
      : node.closest('.nodes.vertical') ? 'vertical'
      : node.parentElement.matches('.couple') ? 'couple'
      : childLayer(node)?.matches('.vertical') ? 'hybrid' : 'horizontal';
    const state = childLayer(node)?.matches('.hidden') ? 'closed' : 'open';
    const bucket = mode + ':' + state;
    if (completeModes.has(bucket)) { return; }
    hover(node);
    ['.topEdge', '.bottomEdge', '.leftEdge', '.rightEdge', '.toggleBtn', '.backToLooseSymbol'].forEach((selector) => {
      const button = node.querySelector(':scope > ' + selector);
      if (!button || !visible(button)) { return; }
      if (selector !== '.backToLooseSymbol' && !relatedNodes(node, selector, directionalPages.includes(page)).length) { return; }
      const key = bucket + selector;
      if (!cases.has(key)) {
        expect(button.getAttribute('role'), 'button semantics').to.equal('button');
        expect(button.getAttribute('aria-label'), 'accessible control label').to.be.a('string').and.not.equal('');
        cases.set(key, { index, selector, mode });
      }
    });
    leave(node);
    const expected = mode === 'compact' ? ['.backToLooseSymbol']
      : mode === 'vertical' ? ['.toggleBtn'] : mode === 'hybrid' ? ['.bottomEdge']
      : ['.topEdge', '.bottomEdge', '.leftEdge', '.rightEdge'];
    if (expected.every((selector) => cases.has(bucket + selector))) { completeModes.add(bucket); }
  });
  expect(cases.size, page + ' has interactive chart controls').to.be.greaterThan(0);
  return Array.from(cases.values());
}

function exerciseCase(page, testCase) {
  cy.visit('demo/' + page);
  cy.get('#chart-container .orgchart .node', { timeout: 30000 }).eq(testCase.index).then(($node) => {
    const node = $node[0];
    const selector = testCase.selector;
    cy.log(testCase.mode + ' ' + selector + ' ' + node.textContent.trim().slice(0, 60));
    hover(node);
    if (selector === '.backToLooseSymbol') {
      [true, false, true, false].forEach((loose, iteration) => {
        cy.then(() => hover(node));
        const control = cy.wrap(Cypress.$(node), { log: false }).children(loose ? '.backToLooseSymbol' : '.backToCompactSymbol');
        if (iteration % 2) {
          control.focus().trigger('keydown', { key: iteration === 1 ? 'Enter' : ' ' });
        } else {
          control.click();
        }
        cy.wrap(Cypress.$(node), { log: false }).should(loose ? 'have.class' : 'not.have.class', 'looseMode');
        cy.wrap(Cypress.$(node), { log: false }).children(loose ? '.backToCompactSymbol' : '.backToLooseSymbol').should('be.visible');
        cy.wrap(Cypress.$(node), { log: false }).children(loose ? '.backToLooseSymbol' : '.backToCompactSymbol').should('not.be.visible');
        cy.then(() => leave(node));
        cy.wrap(Cypress.$(node), { log: false }).children(controls).should('not.exist');
      });
      return;
    }
    const targets = relatedNodes(node, selector, directionalPages.includes(page));
    const descendants = selector === '.bottomEdge' || selector === '.toggleBtn'
      ? Array.from(childLayer(node).querySelectorAll('.node'))
      : selector === '.topEdge' ? targets
      : [...new Set(targets.flatMap((target) => target.parentElement === node.parentElement
        ? [target] : Array.from(target.parentElement.querySelectorAll('.node'))))];
    const initiallyExpanded = targets.some(visible);
    assertArrow(node, selector, initiallyExpanded, page);
    [!initiallyExpanded, initiallyExpanded, !initiallyExpanded, initiallyExpanded].forEach((expanded, iteration) => {
      sampleClick(node, selector, expanded, iteration % 2 ? (iteration === 1 ? 'Enter' : ' ') : undefined);
      assertSettled(node, expanded ? targets : descendants, expanded);
      assertArrow(node, selector, expanded, page);
      cy.then(() => leave(node));
      cy.wrap(Cypress.$(node), { log: false }).should('have.class', 'focused').children(controls).should('not.exist');
      cy.then(() => hover(node));
      assertArrow(node, selector, expanded, page);
    });
  });
}

describe('Demo inventory', () => {
  it('covers exactly the chart pages linked by the demo index', () => {
    cy.visit('demo/index.html');
    cy.get('a[href$=".html"]').should(($links) => {
      const linked = [...new Set(Array.from($links, (link) => link.getAttribute('href')))];
      expect(linked.sort()).to.deep.equal(allPages);
    });
  });
});

[1200, 390].forEach((width) => {
  describe('Demo collapse contracts at ' + width + 'px', () => {
    pages.forEach((page) => {
      it('validates controls, animation and repeated toggles in ' + page, () => {
        cy.viewport(width, 844);
        cy.visit('demo/' + page);
        cy.get('#chart-container .orgchart .node', { timeout: 30000 }).should('have.length.at.least', 2);
        cy.get('#chart-container .orgchart').then(($chart) => {
          const cases = discoverCases($chart[0], page);
          cases.forEach((testCase) => exerciseCase(page, testCase));
        });
      });
    });

    it('ignores repeated parent clicks during collapse and expansion', () => {
      cy.viewport(width, 844);
      cy.visit('demo/local-datasource.html');
      cy.contains('.node > .title', 'Su Miao').parent().then(($node) => {
        const node = $node[0];
        sampleClick(node, '.topEdge');
        cy.contains('.node > .title', 'Lao Lao').should('not.be.visible');
        cy.wrap(node).children('.topEdge').should('have.class', 'oci-chevron-up');
        sampleClick(node, '.topEdge');
        cy.contains('.node > .title', 'Lao Lao').should('be.visible');
        cy.wrap(node).children('.topEdge').should('have.class', 'oci-chevron-down');
        cy.then(() => leave(node));
        cy.wrap(node).children(controls).should('not.exist');
      });
    });
  });
});