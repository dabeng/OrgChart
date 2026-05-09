const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const should = chai.should();
chai.use(sinonChai);
require('jsdom-global')();
process.env.ORGCHART_TEST = '1';
const OrgChart = require('../../src/js/orgchart');
const getState = OrgChart.__testing__.getState;
const setState = OrgChart.__testing__.setState;

function query(selector, root) {
  return (root || document).querySelector(selector);
}

function queryAll(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function createElementFromHtml(html) {
  const template = document.createElement('template');

  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function siblingElements(element, selector) {
  if (!element || !element.parentElement) {
    return [];
  }
  return Array.from(element.parentElement.children).filter(function (childEl) {
    return childEl !== element && (!selector || childEl.matches(selector));
  });
}

function childElements(element, selector) {
  return Array.from(element ? element.children : []).filter(function (childEl) {
    return !selector || childEl.matches(selector);
  });
}

function closestElement(element, selector) {
  return element ? element.closest(selector) : null;
}

function firstSibling(element, selector) {
  return siblingElements(element, selector)[0] || null;
}

function previousSiblings(element, selector) {
  const siblings = [];
  let current = element ? element.previousElementSibling : null;

  while (current) {
    if (!selector || current.matches(selector)) {
      siblings.push(current);
    }
    current = current.previousElementSibling;
  }

  return siblings;
}

function nextSiblings(element, selector) {
  const siblings = [];
  let current = element ? element.nextElementSibling : null;

  while (current) {
    if (!selector || current.matches(selector)) {
      siblings.push(current);
    }
    current = current.nextElementSibling;
  }

  return siblings;
}

function addClasses(element, classNames) {
  if (!element) {
    return element;
  }

  classNames.split(/\s+/).filter(Boolean).forEach(function (className) {
    element.classList.add(className);
  });

  return element;
}

function removeClasses(element, classNames) {
  if (!element) {
    return element;
  }

  classNames.split(/\s+/).filter(Boolean).forEach(function (className) {
    element.classList.remove(className);
  });

  return element;
}

function matchesSelector(element, selector) {
  return !!(element && element.matches(selector));
}

function setOneTimeListener(element, type, data, listener) {
  function once(event) {
    event.data = data;
    element.removeEventListener(type, once);
    listener.call(element, event);
  }

  element.addEventListener(type, once);
}

function triggerEvent(element, type) {
  element.dispatchEvent(new window.Event(type, { bubbles: true }));
}

function refreshNodeReferences(chartEl) {
  $laolao = query('#n1', chartEl);
  $bomiao = query('#n2', chartEl);
  $sumiao = query('#n3', chartEl);
  $hongmiao = query('#n4', chartEl);
  $tiehua = query('#n5', chartEl);
  $heihei = query('#n6', chartEl);
  $pangpang = query('#n7', chartEl);
  $dandan = query('#n8', chartEl);
  $erdan = query('#n9', chartEl);
  $sandan = query('#n10', chartEl);
}

describe('orgchart -- unit tests', function () {
  let $container;

  const ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': 'n3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': 'n5', 'name': 'Tie Hua', 'title': 'senior engineer',
            'children': [
              { 'id': 'n8', 'name': 'Dan Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n6', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': 'n9', 'name': 'Er Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n7', 'name': 'Pang Pang', 'title': 'senior engineer',
            'children': [
              { 'id': 'n10', 'name': 'San Dan', 'title': 'engineer' }
            ]
          }
        ]
      },
      { 'id': 'n4', 'name': 'Hong Miao', 'title': 'department manager' }
    ]
  };

  const baseDs = JSON.stringify({
    'id': 'n1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': 'n3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': 'n5', 'name': 'Tie Hua', 'title': 'senior engineer',
            'children': [
              { 'id': 'n8', 'name': 'Dan Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n6', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': 'n9', 'name': 'Er Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n7', 'name': 'Pang Pang', 'title': 'senior engineer',
            'children': [
              { 'id': 'n10', 'name': 'San Dan', 'title': 'engineer' }
            ]
          }
        ]
      },
      { 'id': 'n4', 'name': 'Hong Miao', 'title': 'department manager' }
    ]
  });

  let oc = {};

  const hierarchy = {
    id: 'n1',
    children: [
      { id: 'n2' },
      { id: 'n3',
        children: [
          { id: 'n5',
            children: [
              { id: 'n8' }
            ]
          },
          { id: 'n6',
            children: [
              { id: 'n9' }
            ]
          },
          { id: 'n7',
            children: [
              { id: 'n10' }
            ]
          }
        ]
      },
      { id: 'n4' }
    ]
  };

  let $laolao;
  let $bomiao;
  let $sumiao;
  let $hongmiao;
  let $chunmiao;
  let $tiehua;
  let $heihei;
  let $pangpang;
  let $dandan;
  let $erdan;
  let $sandan;

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-container"></div>';
    $container = document.getElementById('chart-container');
    oc = new OrgChart({
      chartContainer: '#chart-container',
      'data': ds,
      'nodeContent': 'title'
    }),
    $laolao = document.getElementById('n1'),
    $bomiao = document.getElementById('n2'),
    $sumiao = document.getElementById('n3'),
    $hongmiao = document.getElementById('n4'),
    $tiehua = document.getElementById('n5'),
    $heihei = document.getElementById('n6'),
    $pangpang = document.getElementById('n7'),
    $dandan = document.getElementById('n8');
    $erdan = document.getElementById('n9');
    $sandan = document.getElementById('n10');
  });

  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = $sandan = null;
    $container.innerHTML = '';
  });

  it('loopChart()', function () {
    oc.loopChart(query('.orgchart')).should.deep.equal(hierarchy);
  });

  it('exposes native chartContainer and chart instance properties', function () {
    oc.chartContainer.should.equal($container);
    oc.chartContainer.firstElementChild.should.equal(oc.chart);
    oc.chart.should.have.property('nodeType', 1);
  });

  it('buildJsonDS() accepts a native li element', function () {
    const ulContainer = document.createElement('ul');

    ulContainer.innerHTML = '<li data-id="root" data-title="chief">Root<ul><li data-id="child">Child</li></ul></li>';

    oc.buildJsonDS(ulContainer.firstElementChild).should.deep.equal({
      id: 'root',
      title: 'chief',
      name: 'Root',
      relationship: '001',
      children: [
        {
          id: 'child',
          name: 'Child',
          relationship: '100'
        }
      ]
    });
  });

  it('getHierarchy()', function () {
    oc.getHierarchy().should.deep.equal(hierarchy);

    const oc2 = new OrgChart({
      chartContainer: '#chart-container',
      'data': { name: 'Lao Lao',
        'children': [
          { name: 'Bo Miao' }
        ]
      }
    });
    oc2.getHierarchy().should.include('Error');
    oc2.chart.innerHTML = "";
    oc2.getHierarchy().should.include('Error');
    oc2.chart = null;
    oc2.getHierarchy().should.include('Error');
  });

  it('triggerShowEvent() accepts a native node', function () {
    const eventSpy = sinon.spy();

    $sumiao.addEventListener('show-children.orgchart', eventSpy);

    oc.triggerShowEvent($sumiao, 'children');

    eventSpy.should.have.been.calledOnce;
    eventSpy.firstCall.args[0].type.should.equal('show-children.orgchart');
  });

  it('triggerHideEvent() accepts a native node', function () {
    const eventSpy = sinon.spy();

    $sumiao.addEventListener('hide-children.orgchart', eventSpy);

    oc.triggerHideEvent($sumiao, 'children');

    eventSpy.should.have.been.calledOnce;
    eventSpy.firstCall.args[0].type.should.equal('hide-children.orgchart');
  });

  it('getNodeState()', function () {
    const stateDs = JSON.parse(baseDs);
    let chartEl;
    let laolaoEl;
    let bomiaoEl;
    let sumiaoEl;
    let tiehuaEl;
    let heiheiEl;
    let pangpangEl;
    let dandanEl;

    $container.innerHTML = '';
    oc = new OrgChart({
      chartContainer: '#chart-container',
      data: stateDs,
      nodeContent: 'title',
      visibleLevel: 2,
      verticalLevel: 3
    });
    chartEl = oc.chart;
    laolaoEl = query('#n1', chartEl);
    bomiaoEl = query('#n2', chartEl);
    sumiaoEl = query('#n3', chartEl);
    tiehuaEl = query('#n5', chartEl);
    heiheiEl = query('#n6', chartEl);
    pangpangEl = query('#n7', chartEl);
    dandanEl = query('#n8', chartEl);

    oc.getNodeState(laolaoEl).should.deep.equal({ 'exist': true, 'visible': true }, 'laolao->self');
    oc.getNodeState(laolaoEl, 'parent').should.deep.equal({ 'exist': false, 'visible': false }, 'laolao->parent');
    oc.getNodeState(laolaoEl, 'children').should.deep.equal({ 'exist': true, 'visible': true }, 'laolao->children');
    oc.getNodeState(laolaoEl, 'siblings').should.deep.equal({ 'exist': false, 'visible': false }, 'laolao->siblings');

    oc.getNodeState(bomiaoEl).should.deep.equal({ 'exist': true, 'visible': true }, 'bomiao->self');
    oc.getNodeState(bomiaoEl, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, 'bomiao->parent');
    oc.getNodeState(bomiaoEl, 'children').should.deep.equal({ 'exist': false, 'visible': false }, 'bomiao->children');
    oc.getNodeState(bomiaoEl, 'siblings').should.deep.equal({ 'exist': true, 'visible': true }, 'bomiao->siblings');

    oc.getNodeState(sumiaoEl).should.deep.equal({ 'exist': true, 'visible': true }, 'sumiao->self');
    oc.getNodeState(sumiaoEl, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, 'sumiao->parent');
    oc.getNodeState(sumiaoEl, 'children').should.deep.equal({ 'exist': true, 'visible': false }, 'sumiao->children');
    oc.getNodeState(sumiaoEl, 'siblings').should.deep.equal({ 'exist': true, 'visible': true }, 'sumiao->siblings');

    oc.getNodeState(tiehuaEl).should.deep.equal({ 'exist': true, 'visible': false }, 'tiehua->self');
    oc.getNodeState(tiehuaEl, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, 'tiehua->parent');
    oc.getNodeState(tiehuaEl, 'children').should.deep.equal({ 'exist': true, 'visible': false }, 'tiehua->children');
    oc.getNodeState(tiehuaEl, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, 'tiehua->siblings');

    oc.getNodeState(heiheiEl).should.deep.equal({ 'exist': true, 'visible': false }, 'heihei->self');
    oc.getNodeState(heiheiEl, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, 'heihei->parent');
    oc.getNodeState(heiheiEl, 'children').should.deep.equal({ 'exist': true, 'visible': false }, 'heihei->children');
    oc.getNodeState(heiheiEl, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, 'heihei->siblings');

    oc.getNodeState(pangpangEl).should.deep.equal({ 'exist': true, 'visible': false }, 'pangpang->self');
    oc.getNodeState(pangpangEl, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, 'pangpang->parent');
    oc.getNodeState(pangpangEl, 'children').should.deep.equal({ 'exist': true, 'visible': false }, 'pangpang->children');
    oc.getNodeState(pangpangEl, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, 'pangpang->siblings');

    oc.getNodeState(dandanEl).should.deep.equal({ 'exist': true, 'visible': false }, 'dandan->self');
    oc.getNodeState(dandanEl, 'parent').should.deep.equal({ 'exist': true, 'visible': false }, 'dandan->parent');
    oc.getNodeState(dandanEl, 'children').should.deep.equal({ 'exist': false, 'visible': false }, 'dandan->children');
    oc.getNodeState(dandanEl, 'siblings').should.deep.equal({ 'exist': false, 'visible': false }, 'dandan->siblings');
  });

  it('triggerInitEvent() calls initCompleted with the native chart element', function () {
    const originalMutationObserver = global.MutationObserver;
    const originalWindowMutationObserver = window.MutationObserver;
    const observeSpy = sinon.spy();
    const disconnectSpy = sinon.spy();
    const initCompletedSpy = sinon.spy();

    const fakeMutationObserver = function (callback) {
      this.observe = function (target, options) {
        observeSpy(target, options);
        callback([
          {
            addedNodes: [oc.chart]
          }
        ]);
      };
      this.disconnect = disconnectSpy;
    };

    global.MutationObserver = fakeMutationObserver;
    window.MutationObserver = fakeMutationObserver;

    oc.options.initCompleted = initCompletedSpy;
    oc.triggerInitEvent();

    observeSpy.should.have.been.calledOnce;
    observeSpy.firstCall.args[0].should.equal($container);
    observeSpy.firstCall.args[1].should.deep.equal({ childList: true });
    disconnectSpy.should.have.been.calledOnce;
    initCompletedSpy.should.have.been.calledOnce;
    initCompletedSpy.firstCall.args[0].should.equal(oc.chart);

    global.MutationObserver = originalMutationObserver;
    window.MutationObserver = originalWindowMutationObserver;
  });

  it('triggerInitEvent() triggers init.orgchart on the chart collection', function () {
    const originalMutationObserver = global.MutationObserver;
    const originalWindowMutationObserver = window.MutationObserver;
    const eventSpy = sinon.spy();

    const fakeMutationObserver = function (callback) {
      this.observe = function () {
        callback([
          {
            addedNodes: [oc.chart]
          }
        ]);
      };
      this.disconnect = function () {};
    };

    global.MutationObserver = fakeMutationObserver;
    window.MutationObserver = fakeMutationObserver;
    oc.chart.addEventListener('init.orgchart', eventSpy);

    oc.triggerInitEvent();

    eventSpy.should.have.been.calledOnce;
    eventSpy.firstCall.args[0].type.should.equal('init.orgchart');

    global.MutationObserver = originalMutationObserver;
    window.MutationObserver = originalWindowMutationObserver;
  });

  it('handleCompactNodes() tags compact nodes by compact-ancestor parity', function () {
    const compactRootEl = document.createElement('div');
    const compactChildEl = document.createElement('div');
    const compactGrandchildEl = document.createElement('div');

    compactRootEl.className = 'node compact';
    compactChildEl.className = 'node compact';
    compactGrandchildEl.className = 'node compact';
    compactRootEl.appendChild(compactChildEl);
    compactChildEl.appendChild(compactGrandchildEl);
    oc.chart.appendChild(compactRootEl);

    oc.handleCompactNodes();

    compactRootEl.classList.contains('even').should.equal(true);
    compactChildEl.classList.contains('odd').should.equal(true);
    compactGrandchildEl.classList.contains('even').should.equal(true);
  });

  it('getRelatedNodes()', function () {
    oc.getRelatedNodes().should.deep.equal([]);
    oc.getRelatedNodes({}, 'children').should.deep.equal([]);
    oc.getRelatedNodes(query('.hierarchy', oc.chart), 'children').should.deep.equal([]);
    oc.getRelatedNodes(query('.node', oc.chart), 'child').should.deep.equal([]);

    should.equal(oc.getRelatedNodes($laolao, 'parent'), null);
    oc.getRelatedNodes($laolao, 'children').should.have.members([$bomiao, $sumiao, $hongmiao]);
    oc.getRelatedNodes($laolao, 'siblings').should.deep.equal([]);

    oc.getRelatedNodes($bomiao, 'parent').should.equal($laolao);
    oc.getRelatedNodes($bomiao, 'children').should.have.lengthOf(0);
    oc.getRelatedNodes($bomiao, 'siblings').should.have.members([$sumiao, $hongmiao]);
  });

  it('getParent()', function () {
    should.equal(oc.getParent(), null);
    should.equal(oc.getParent({}), null);
    should.equal(oc.getParent(query('.hierarchy', oc.chart)), null);

    should.equal(oc.getParent($laolao), null);
    oc.getParent($bomiao).should.equal($laolao);
    oc.getParent($sandan).should.equal($pangpang);
  });

  it('getSiblings()', function () {
    oc.getSiblings().should.deep.equal([]);
    oc.getSiblings({}).should.deep.equal([]);
    oc.getSiblings(query('.hierarchy', oc.chart)).should.deep.equal([]);

    oc.getSiblings($laolao).should.deep.equal([]);
    oc.getSiblings($bomiao).should.have.members([$sumiao, $hongmiao]);
    oc.getSiblings($sandan).should.deep.equal([]);
  });

  it('getChildren()', function () {
    oc.getChildren().should.deep.equal([]);
    oc.getChildren({}).should.deep.equal([]);
    oc.getChildren(query('.hierarchy', oc.chart)).should.deep.equal([]);

    oc.getChildren($laolao).should.have.members([$bomiao, $sumiao, $hongmiao]);
    oc.getChildren($bomiao).should.deep.equal([]);
    oc.getChildren($sumiao).should.have.members([$tiehua, $heihei, $pangpang]);
    oc.getChildren($sandan).should.deep.equal([]);
  });

  it('hideParent()', function () {
    const spy  = sinon.spy(oc, 'hideParent');
    const spy2  = sinon.spy(oc, 'hideSiblings');

    oc.hideParent($heihei);
    setOneTimeListener($sumiao, 'transitionend', null, function (event) {
      event.parent = parentEl;
      spy.call(oc, event);
    });
    spy.should.have.been.callCount(2);
    spy.getCall(0).args[0].should.equal($heihei);
    spy.getCall(1).args[0].should.equal($sumiao);
    spy2.should.have.been.callCount(2);
    spy2.getCall(0).args[0].should.equal($heihei);
    spy2.getCall(1).args[0].should.equal($sumiao);
  });

  it('hideParent() clears inAjax when the parent node contains a spinner', function () {
    const spinnerEl = document.createElement('i');

    spinnerEl.className = 'spinner';
    $sumiao.appendChild(spinnerEl);
    setState(oc.chart, 'inAjax', true);

    oc.hideParent($heihei);

    getState(oc.chart, 'inAjax').should.be.false;
    spinnerEl.remove();
  });

  it('hideParentEnd()', function () {
    const parentEl = firstSibling(closestElement($heihei, '.nodes'), '.node');

    addClasses($sumiao, 'sliding slide-down');
    oc.hideParentEnd({ animatedNode: $sumiao, parent: parentEl });
    matchesSelector($sumiao, 'sliding').should.be.false;
    matchesSelector(parentEl, '.hidden').should.be.true;
  });

  it('hideParentEnd() accepts native animated and parent payloads', function () {
    addClasses($sumiao, 'sliding');
    removeClasses($sumiao, 'hidden');

    oc.hideParentEnd({
      animatedNode: $sumiao,
      parent: $sumiao
    });

    $sumiao.classList.contains('sliding').should.equal(false);
    $sumiao.classList.contains('hidden').should.equal(true);
  });

  it('hideParentEnd() accepts wrapped native animated and parent payloads', function () {
    addClasses($sumiao, 'sliding');

    oc.hideParentEnd({
      originalEvent: {
        target: $sumiao,
        parent: $heihei
      }
    });

    $sumiao.classList.contains('sliding').should.equal(false);
    $heihei.classList.contains('hidden').should.equal(true);
  });

  it('showParent()', function () {
    const spy = sinon.spy(oc, 'repaint');

    addClasses(closestElement($heihei, '.hierarchy'), 'isAncestorsCollapsed');
    addClasses($sumiao, 'slide-down hidden');
    addClasses(closestElement($sumiao, '.hierarchy'), 'isAncestorsCollapsed');
    addClasses($laolao, 'slide-down hidden');
    oc.showParent($heihei);
    spy.should.have.been.called;
    matchesSelector(closestElement($heihei, '.hierarchy'), '.isAncestorsCollapsed').should.be.false;
    matchesSelector($sumiao, '.slide-down, .hidden').should.be.false;
    matchesSelector(closestElement($sumiao, '.hierarchy'), '.isAncestorsCollapsed').should.be.true;
    matchesSelector($laolao, '.slide-down.hidden').should.be.true;
    matchesSelector($sumiao, '.sliding').should.be.true;
    matchesSelector($sumiao, '.slide-down').should.be.false;
  });

  it('showParentEnd()', function () {
    const spy = sinon.spy(oc, 'showParentEnd');
    const spy2 = sinon.spy(oc, 'isInAction');
    const spy3 = sinon.spy(oc, 'switchVerticalArrow');

    addClasses($sumiao, 'sliding');
    removeClasses($sumiao, 'slide-down');
    setOneTimeListener($sumiao, 'transitionend', null, function (event) {
      event.node = $heihei;
      spy.call(oc, event);
    });
    triggerEvent($sumiao, 'transitionend');
    spy.should.have.been.called;
    matchesSelector($sumiao, '.sliding').should.be.false;
    spy2.should.have.been.calledWith($heihei);
    spy3.should.not.have.been.called;
  });

  it('showParentEnd() accepts native animated and node payloads', function () {
    addClasses($sumiao, 'sliding');

    oc.showParentEnd({
      animatedNode: $sumiao,
      node: $heihei
    });

    $sumiao.classList.contains('sliding').should.equal(false);
  });

  it('showParentEnd() accepts wrapped native animated and node payloads', function () {
    addClasses($sumiao, 'sliding');

    oc.showParentEnd({
      originalEvent: {
        target: $sumiao,
        node: $heihei
      }
    });

    $sumiao.classList.contains('sliding').should.equal(false);
  });

  it('hideChildren()', function () {
    const spy = sinon.spy(oc, 'repaint');

    oc.hideChildren($sumiao);

    spy.should.have.been.called;
    matchesSelector(closestElement($sumiao, '.hierarchy'), '.isChildrenCollapsed').should.be.true;
    childElements(firstSibling($sumiao, '.nodes'), '.isCollapsedDescendant').should.lengthOf(3);
    matchesSelector($tiehua, '.sliding.slide-up').should.be.true;
    matchesSelector($heihei, '.sliding.slide-up').should.be.true;
    matchesSelector($pangpang, '.sliding.slide-up').should.be.true;
    matchesSelector($erdan, '.sliding.slide-up').should.be.true;
  });

  it('hideChildrenEnd()', function () {
    const spy2 = sinon.spy(oc, 'isInAction');
    const spy3 = sinon.spy(oc, 'switchVerticalArrow');

    addClasses($tiehua, 'sliding slide-up');
    oc.hideChildrenEnd({ animatedNodes: $tiehua, node: $sumiao });
    matchesSelector($tiehua, '.sliding').should.be.false;
    matchesSelector(closestElement($tiehua, '.nodes'), '.hidden').should.be.true;
    spy2.should.have.been.calledWith($sumiao);
    spy3.should.not.have.been.called;
  });

  it('hideChildrenEnd() accepts direct animated and node payloads', function () {
    const bottomEdgeEl = query('.bottomEdge', $sumiao);
    const verticalSpy = sinon.spy(oc, 'switchVerticalArrow');

    removeClasses($tiehua, 'hidden');
    addClasses($tiehua, 'sliding');
    removeClasses(closestElement($tiehua, '.nodes'), 'hidden');
    bottomEdgeEl.classList.add(oc.options.icons.collapseToDown);

    oc.hideChildrenEnd({ animatedNodes: [$tiehua], node: $sumiao });

    $tiehua.classList.contains('sliding').should.equal(false);
    closestElement($tiehua, '.nodes').classList.contains('hidden').should.equal(true);
    verticalSpy.should.have.been.calledWith(bottomEdgeEl);

    verticalSpy.restore();
  });

  it('hideChildrenEnd() accepts wrapped native animated and node payloads', function () {
    const bottomEdgeEl = query('.bottomEdge', $sumiao);
    const verticalSpy = sinon.spy(oc, 'switchVerticalArrow');

    removeClasses($tiehua, 'hidden');
    addClasses($tiehua, 'sliding');
    removeClasses(closestElement($tiehua, '.nodes'), 'hidden');
    bottomEdgeEl.classList.add(oc.options.icons.collapseToDown);

    oc.hideChildrenEnd({
      originalEvent: {
        animatedNodes: [$tiehua],
        node: $sumiao
      }
    });

    $tiehua.classList.contains('sliding').should.equal(false);
    closestElement($tiehua, '.nodes').classList.contains('hidden').should.equal(true);
    verticalSpy.should.have.been.calledWith(bottomEdgeEl);

    verticalSpy.restore();
  });

  it('showChildren()', function () {
    const spy = sinon.spy(oc, 'repaint');
    const descendantsWrapperEl = firstSibling($sumiao, '.nodes');

    queryAll('.node', descendantsWrapperEl).forEach(function (nodeEl) {
      addClasses(nodeEl, 'slide-up');
    });
    queryAll('.nodes', descendantsWrapperEl).forEach(function (nodeEl) {
      addClasses(nodeEl, 'hidden');
    });
    addClasses(descendantsWrapperEl, 'hidden');
    oc.showChildren($sumiao);
    spy.should.have.been.calledWith($tiehua);
    matchesSelector($tiehua, '.sliding:not(.slide-up)').should.be.true;
    matchesSelector($heihei, '.sliding:not(.slide-up)').should.be.true;
    matchesSelector($pangpang, '.sliding:not(.slide-up)').should.be.true;
    matchesSelector($erdan, '.slide-up:not(.sliding)').should.be.true;
  });

  it('showChildrenEnd()', function () {
    const spy2 = sinon.spy(oc, 'isInAction');
    const spy3 = sinon.spy(oc, 'switchVerticalArrow');

    addClasses($tiehua, 'sliding');
    oc.showChildrenEnd({ node: $sumiao, animatedNodes: $tiehua });
    matchesSelector($tiehua, '.sliding').should.be.false;
    spy2.should.have.been.calledWith($sumiao);
    spy3.should.not.have.been.called;
  });

  it('showChildrenEnd() accepts direct animated and node payloads', function () {
    addClasses($tiehua, 'sliding');

    oc.showChildrenEnd({
      node: $sumiao,
      animatedNodes: [$tiehua]
    });

    $tiehua.classList.contains('sliding').should.equal(false);
  });

  it('showChildrenEnd() accepts wrapped native animated and node payloads', function () {
    addClasses($tiehua, 'sliding');

    oc.showChildrenEnd({
      originalEvent: {
        node: $sumiao,
        animatedNodes: [$tiehua]
      }
    });

    $tiehua.classList.contains('sliding').should.equal(false);
  });

  it('showSiblingsEnd() accepts direct visible and node payloads', function () {
    const topEdgeEl = query('.topEdge', $heihei);
    const switchSpy = sinon.spy(oc, 'switchHorizontalArrow');

    addClasses($tiehua, 'sliding');
    addClasses($pangpang, 'sliding');
    topEdgeEl.classList.add(oc.options.icons.expandToUp);

    oc.showSiblingsEnd({
      node: $heihei,
      visibleNodes: [$tiehua, $pangpang]
    });

    $tiehua.classList.contains('sliding').should.equal(false);
    $pangpang.classList.contains('sliding').should.equal(false);
    switchSpy.should.have.been.calledWith($heihei);
    topEdgeEl.classList.contains(oc.options.icons.expandToUp).should.equal(false);
    topEdgeEl.classList.contains(oc.options.icons.collapseToDown).should.equal(true);

    switchSpy.restore();
  });

  it('showSiblingsEnd() accepts wrapped native visible and node payloads', function () {
    const topEdgeEl = query('.topEdge', $heihei);
    const switchSpy = sinon.spy(oc, 'switchHorizontalArrow');

    addClasses($tiehua, 'sliding');
    addClasses($pangpang, 'sliding');
    topEdgeEl.classList.add(oc.options.icons.expandToUp);

    oc.showSiblingsEnd({
      originalEvent: {
        node: $heihei,
        visibleNodes: [$tiehua, $pangpang]
      }
    });

    $tiehua.classList.contains('sliding').should.equal(false);
    $pangpang.classList.contains('sliding').should.equal(false);
    switchSpy.should.have.been.calledWith($heihei);
    topEdgeEl.classList.contains(oc.options.icons.expandToUp).should.equal(false);
    topEdgeEl.classList.contains(oc.options.icons.collapseToDown).should.equal(true);

    switchSpy.restore();
  });

  it('showRelatedParentEnd() removes sliding from a native animated node payload', function () {
    addClasses($sumiao, 'sliding');

    oc.showRelatedParentEnd({ animatedNode: $sumiao });

    $sumiao.classList.contains('sliding').should.equal(false);
  });

  it('showRelatedParentEnd() accepts a wrapped native animated node payload', function () {
    addClasses($sumiao, 'sliding');

    oc.showRelatedParentEnd({
      originalEvent: {
        target: $sumiao
      }
    });

    $sumiao.classList.contains('sliding').should.equal(false);
  });

  it('showSiblings() accepts a native node and reveals the requested side with animation', function () {
    const repaintSpy = sinon.spy(oc, 'repaint');

    addClasses(closestElement($tiehua, '.hierarchy'), 'hidden isCollapsedSibling left-sibs');
    addClasses($tiehua, 'slide-right');
    addClasses(closestElement($heihei, '.hierarchy'), 'isSiblingsCollapsed left-sibs isAncestorsCollapsed');
    addClasses($sumiao, 'hidden slide-down');

    oc.showSiblings($heihei, 'left');

    repaintSpy.should.have.been.calledWith($sumiao);
    closestElement($tiehua, '.hierarchy').classList.contains('hidden').should.equal(false);
    closestElement($tiehua, '.hierarchy').classList.contains('isCollapsedSibling').should.equal(false);
    closestElement($heihei, '.hierarchy').classList.contains('left-sibs').should.equal(false);
    closestElement($heihei, '.hierarchy').classList.contains('isSiblingsCollapsed').should.equal(false);
    $tiehua.classList.contains('sliding').should.equal(true);
    $tiehua.classList.contains('slide-right').should.equal(false);
    $sumiao.classList.contains('hidden').should.equal(false);
    $sumiao.classList.contains('sliding').should.equal(true);
    $sumiao.classList.contains('slide-down').should.equal(false);

    repaintSpy.restore();
  });

  describe('hideSiblings()', function () {
    context('when passing only one parameter -- node', function () {
      it('should hide all the sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei);
        matchesSelector($tiehua, '.sliding.slide-right').should.be.true;
        matchesSelector($dandan, '.sliding.slide-right').should.be.true;
        matchesSelector($pangpang, '.sliding.slide-left').should.be.true;
        matchesSelector($sandan, '.sliding.slide-left').should.be.true;
        matchesSelector(closestElement($heihei, '.hierarchy'), '.isSiblingsCollapsed').should.be.true;
        siblingElements(closestElement($heihei, '.hierarchy'), '.isChildrenCollapsed.isCollapsedSibling').should.lengthOf(2);
      });

      it('clears inAjax when a sibling hierarchy contains a spinner', function () {
        const spinnerEl = document.createElement('i');

        spinnerEl.className = 'spinner';
        closestElement($tiehua, '.hierarchy').appendChild(spinnerEl);
        setState(oc.chart, 'inAjax', true);

        oc.hideSiblings($heihei);

        getState(oc.chart, 'inAjax').should.be.false;
        spinnerEl.remove();
      });
    });

    context('when passing two parameters -- node and direction', function () {
      it('hide the left side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'left');
        matchesSelector(closestElement($heihei, '.hierarchy'), '.isSiblingsCollapsed.left-sibs').should.be.true;
        matchesSelector(closestElement($heihei, '.hierarchy').previousElementSibling, '.isChildrenCollapsed.isCollapsedSibling').should.be.true;
        matchesSelector(closestElement($heihei, '.hierarchy').nextElementSibling, '.isChildrenCollapsed, .isCollapsedSibling').should.be.false;
        matchesSelector($tiehua, '.sliding.slide-right').should.be.true;
        matchesSelector($dandan, '.sliding.slide-right').should.be.true;
        matchesSelector($pangpang, '.sliding').should.be.false;
      });
      it('hide the right side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'right');
        matchesSelector(closestElement($heihei, '.hierarchy'), '.isSiblingsCollapsed.right-sibs').should.be.true;
        matchesSelector(closestElement($heihei, '.hierarchy').nextElementSibling, '.isChildrenCollapsed.isCollapsedSibling').should.be.true;
        matchesSelector(closestElement($heihei, '.hierarchy').previousElementSibling, '.isChildrenCollapsed, .isCollapsedSibling').should.be.false;
        matchesSelector($pangpang, '.sliding.slide-left').should.be.true;
        matchesSelector($sandan, '.sliding.slide-left').should.be.true;
        matchesSelector($tiehua, '.sliding').should.be.false;
      });
    });
  });

  describe('hideSiblingsEnd()', function () {
    context('when invoking transitionend event without specifying direction', function () {
      it('clean up final classList for hidden siblings', function () {
        const spy = sinon.spy(oc, 'hideSiblingsEnd');
        const spy2 = sinon.spy(oc, 'isInAction');
        const spy3 = sinon.spy(oc, 'switchVerticalArrow');
        const nodeContainerEl = closestElement($heihei, '.hierarchy');

        oc.hideSiblings($heihei);

        setOneTimeListener($tiehua, 'transitionend', {
          'node': $heihei,
          'nodeContainer': nodeContainerEl,
          'direction': undefined,
          'animatedNodes': $tiehua
        }, spy.bind(oc));
        triggerEvent($tiehua, 'transitionend');
        spy.should.have.been.called;
        matchesSelector($tiehua, '.slide-right:not(.sliding)').should.be.true;
        matchesSelector($dandan, '.slide-up:not(.sliding, .slide-right)').should.be.true;
        matchesSelector($pangpang, '.slide-left:not(.sibling)').should.be.true;
        matchesSelector($sandan, '.slide-up:not(.sliding, .slide-left)').should.be.true;
        siblingElements(nodeContainerEl, '.hidden').should.lengthOf(2);
        siblingElements(nodeContainerEl).reduce(function (count, siblingEl) {
          return count + queryAll('.nodes.hidden', siblingEl).length;
        }, 0).should.equal(2);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });
    });

    context('when invoking transitionend event with specifying direction', function () {
      it('clean up final classList for left side hidden siblings', function () {
        const spy = sinon.spy(oc, 'hideSiblingsEnd');
        const spy2 = sinon.spy(oc, 'isInAction');
        const spy3 = sinon.spy(oc, 'switchVerticalArrow');
        const nodeContainerEl = closestElement($heihei, '.hierarchy');

        oc.hideSiblings($heihei, 'left');

        setOneTimeListener($tiehua, 'transitionend', {
          'node': $heihei,
          'nodeContainer': nodeContainerEl,
          'direction': 'left',
          'animatedNodes': $tiehua
        }, spy.bind(oc));
        triggerEvent($tiehua, 'transitionend');
        spy.should.have.been.called;
        matchesSelector($tiehua, '.slide-right:not(.sliding)').should.be.true;
        matchesSelector($dandan, '.slide-up:not(.slide-right)').should.be.true;
        matchesSelector($pangpang, '.slide-left').should.be.false;
        matchesSelector($sandan, '.slide-up').should.be.false;
        previousSiblings(nodeContainerEl, '.hidden').should.lengthOf(1);
        previousSiblings(nodeContainerEl).reduce(function (count, siblingEl) {
          return count + queryAll('.nodes.hidden', siblingEl).length;
        }, 0).should.equal(1);
        nextSiblings(nodeContainerEl).reduce(function (count, siblingEl) {
          return count + queryAll('.nodes.hidden', siblingEl).length;
        }, 0).should.equal(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });

      it('clean up final classList for right side hidden siblings', function () {
        const spy2 = sinon.spy(oc, 'isInAction');
        const spy3 = sinon.spy(oc, 'switchVerticalArrow');
        const nodeContainerEl = closestElement($heihei, '.hierarchy');

        oc.hideSiblings($heihei, 'right');

        oc.hideSiblingsEnd({
          node: $heihei,
          nodeContainer: nodeContainerEl,
          direction: 'right',
          animatedNodes: $tiehua
        });
        matchesSelector($tiehua, '.slide-right').should.be.false;
        matchesSelector($dandan, '.slide-up').should.be.false;
        matchesSelector($pangpang, '.slide-left:not(.slidiing)').should.be.true;
        matchesSelector($sandan, '.slide-up:not(.slide-left)').should.be.true;
        nextSiblings(nodeContainerEl, '.hidden').should.lengthOf(1);
        nextSiblings(nodeContainerEl).reduce(function (count, siblingEl) {
          return count + queryAll('.nodes.hidden', siblingEl).length;
        }, 0).should.equal(1);
        previousSiblings(nodeContainerEl).reduce(function (count, siblingEl) {
          return count + queryAll('.nodes.hidden', siblingEl).length;
        }, 0).should.equal(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });

      it('accepts direct node, container, and animated payloads', function () {
        const horizontalSpy = sinon.spy(oc, 'switchHorizontalArrow');
        const nodeContainerEl = closestElement($heihei, '.hierarchy');

        oc.hideSiblings($heihei, 'left');
        addClasses($tiehua, 'sliding');
        removeClasses(closestElement($tiehua, '.nodes'), 'hidden');
        query('.leftEdge', $heihei).classList.add(oc.options.icons.collapseToLeft);

        oc.hideSiblingsEnd({
          node: $heihei,
          nodeContainer: nodeContainerEl,
          direction: 'left',
          animatedNodes: [$tiehua]
        });

        $tiehua.classList.contains('sliding').should.equal(false);
        nodeContainerEl.previousElementSibling.classList.contains('hidden').should.equal(true);
        horizontalSpy.should.have.been.calledWith($heihei);

        horizontalSpy.restore();
      });

      it('accepts wrapped native node, container, and animated payloads', function () {
        const horizontalSpy = sinon.spy(oc, 'switchHorizontalArrow');
        const nodeContainerEl = closestElement($heihei, '.hierarchy');

        oc.hideSiblings($heihei, 'left');
        addClasses($tiehua, 'sliding');
        removeClasses(closestElement($tiehua, '.nodes'), 'hidden');
        query('.leftEdge', $heihei).classList.add(oc.options.icons.collapseToLeft);

        oc.hideSiblingsEnd({
          originalEvent: {
            node: $heihei,
            nodeContainer: nodeContainerEl,
            direction: 'left',
            animatedNodes: [$tiehua]
          }
        });

        $tiehua.classList.contains('sliding').should.equal(false);
        nodeContainerEl.previousElementSibling.classList.contains('hidden').should.equal(true);
        horizontalSpy.should.have.been.calledWith($heihei);

        horizontalSpy.restore();
      });
    });    
  });

  it('nodeEnterLeaveHandler() accepts a native node payload for relationship checks', function () {
    const spy = sinon.spy(oc, 'switchHorizontalArrow');
    oc.nodeEnterLeaveHandler({ type: 'mouseenter', node: $sumiao });
    spy.should.have.been.calledWith($sumiao);
  });

  it('nodeEnterLeaveHandler() removes arrow classes from a native node payload on mouseleave', function () {
    const nodeEl = $sumiao;

    Array.from(nodeEl.querySelectorAll('.edge')).forEach(function (edgeEl) {
      edgeEl.classList.add(
        oc.options.icons.expandToUp,
        oc.options.icons.collapseToDown,
        oc.options.icons.collapseToLeft,
        oc.options.icons.expandToRight
      );
    });

    oc.nodeEnterLeaveHandler({ type: 'mouseleave', node: nodeEl });

    Array.from(nodeEl.querySelectorAll('.edge')).forEach(function (edgeEl) {
      edgeEl.classList.contains(oc.options.icons.expandToUp).should.equal(false);
      edgeEl.classList.contains(oc.options.icons.collapseToDown).should.equal(false);
      edgeEl.classList.contains(oc.options.icons.collapseToLeft).should.equal(false);
      edgeEl.classList.contains(oc.options.icons.expandToRight).should.equal(false);
    });
  });

  it('nodeEnterLeaveHandler() accepts wrapped native node payloads', function () {
    const spy = sinon.spy(oc, 'switchHorizontalArrow');

    oc.nodeEnterLeaveHandler({
      originalEvent: {
        type: 'mouseenter',
        currentTarget: $sumiao
      }
    });

    spy.should.have.been.calledWith($sumiao);
    spy.restore();
  });

  it('HideFirstParentEnd() accepts a native top edge payload', function () {
    const topEdgeEl = query('.topEdge', $heihei);
    const verticalSpy = sinon.spy(oc, 'switchVerticalArrow');
    const horizontalSpy = sinon.spy(oc, 'switchHorizontalArrow');

    topEdgeEl.classList.add(oc.options.icons.expandToUp);
    oc.HideFirstParentEnd({ topEdge: topEdgeEl });

    verticalSpy.should.have.been.calledWith(topEdgeEl);
    horizontalSpy.should.have.been.calledWith($heihei);

    verticalSpy.restore();
    horizontalSpy.restore();
  });

  it('HideFirstParentEnd() accepts a wrapped native top edge payload', function () {
    const topEdgeEl = query('.topEdge', $heihei);
    const verticalSpy = sinon.spy(oc, 'switchVerticalArrow');
    const horizontalSpy = sinon.spy(oc, 'switchHorizontalArrow');

    topEdgeEl.classList.add(oc.options.icons.expandToUp);
    oc.HideFirstParentEnd({
      originalEvent: {
        topEdge: topEdgeEl
      }
    });

    verticalSpy.should.have.been.calledWith(topEdgeEl);
    horizontalSpy.should.have.been.calledWith($heihei);

    verticalSpy.restore();
    horizontalSpy.restore();
  });

  it('nodeClickHandler() focuses the native node payload and clears previous focus', function () {
    addClasses($bomiao, 'focused');

    oc.nodeClickHandler({ node: $sumiao });

    $bomiao.classList.contains('focused').should.equal(false);
    $sumiao.classList.contains('focused').should.equal(true);
  });

  it('nodeClickHandler() focuses a wrapped native node payload', function () {
    addClasses($bomiao, 'focused');

    oc.nodeClickHandler({
      originalEvent: {
        currentTarget: $sumiao
      }
    });

    $bomiao.classList.contains('focused').should.equal(false);
    $sumiao.classList.contains('focused').should.equal(true);
  });

  it('init() clears focused nodes when clicking the chart background', function () {
    addClasses($bomiao, 'focused');
    addClasses($sumiao, 'focused');

    oc.chart.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    $bomiao.classList.contains('focused').should.equal(false);
    $sumiao.classList.contains('focused').should.equal(false);
  });

  it('init() clears focused nodes from a wrapped native background click payload', function () {
    const wrappedClickEvent = new window.Event('click', { bubbles: true });

    addClasses($bomiao, 'focused');
    addClasses($sumiao, 'focused');

    wrappedClickEvent.originalEvent = {
      target: oc.chart
    };
    oc.chart.dispatchEvent(wrappedClickEvent);

    $bomiao.classList.contains('focused').should.equal(false);
    $sumiao.classList.contains('focused').should.equal(false);
  });

  it('init() appends the export button only once', function () {
    let oc2;

    Array.from(document.querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
      exportButtonEl.remove();
    });

    oc2 = new OrgChart({
      chartContainer: '#chart-container',
      data: ds,
      exportButton: true
    });

    document.querySelectorAll('.oc-export-btn').length.should.equal(1);

    oc2.init();

    document.querySelectorAll('.oc-export-btn').length.should.equal(1);
    Array.from(document.querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
      exportButtonEl.remove();
    });
  });

  it('attachExportButton() creates a native export button that calls export()', function () {
    const exportStub = sinon.stub(oc, 'export');

    Array.from(document.querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
      exportButtonEl.remove();
    });

    oc.attachExportButton();
    document.querySelectorAll('.oc-export-btn').length.should.equal(1);
    document.querySelector('.oc-export-btn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    exportStub.should.have.been.calledOnce;

    exportStub.restore();
    Array.from(document.querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
      exportButtonEl.remove();
    });
  });

  it('topEdgeClickHandler() passes a native node to hideParent()', function () {
    const spy = sinon.spy(oc, 'hideParent');
    const spy2 = sinon.spy(oc, 'triggerHideEvent');

    oc.topEdgeClickHandler({ edge: query('.topEdge', $heihei), node: $heihei });

    spy.should.have.been.calledWith($heihei);
    spy2.should.have.been.called;
  });

  it('topEdgeClickHandler() accepts wrapped native edge payloads', function () {
    const spy = sinon.spy(oc, 'hideParent');

    oc.topEdgeClickHandler({
      originalEvent: {
        currentTarget: $heihei,
        target: query('.topEdge', $heihei)
      }
    });

    spy.should.have.been.calledWith($heihei);
    spy.restore();
  });

  it('bottomEdgeClickHandler() passes a native node to hideChildren()', function () {
    const spy = sinon.spy(oc, 'hideChildren');
    const spy2 = sinon.spy(oc, 'triggerHideEvent');

    oc.bottomEdgeClickHandler({ edge: query('.bottomEdge', $sumiao), node: $sumiao });

    spy.should.have.been.calledWith($sumiao);
    spy2.should.have.been.called;
  });

  it('bottomEdgeClickHandler() accepts wrapped native node payloads', function () {
    const spy = sinon.spy(oc, 'hideChildren');

    oc.bottomEdgeClickHandler({
      originalEvent: {
        currentTarget: $sumiao
      }
    });

    spy.should.have.been.calledWith($sumiao);
    spy.restore();
  });

  it('hEdgeClickHandler() passes a native node to hideSiblings()', function () {
    const spy = sinon.spy(oc, 'hideSiblings');
    const spy2 = sinon.spy(oc, 'triggerHideEvent');

    oc.hEdgeClickHandler({ edge: query('.leftEdge', $sumiao), node: $sumiao });

    spy.should.have.been.calledWith($sumiao);
    spy2.should.have.been.called;
  });

  it('hEdgeClickHandler() accepts wrapped native edge payloads', function () {
    const spy = sinon.spy(oc, 'hideSiblings');

    oc.hEdgeClickHandler({
      originalEvent: {
        currentTarget: $sumiao,
        target: query('.leftEdge', $sumiao)
      }
    });

    spy.should.have.been.calledWith($sumiao);
    spy.restore();
  });

  it('startLoading() and endLoading() accept a native edge node', function () {
    const edgeEl = query('.bottomEdge', $sumiao);

    oc.startLoading(edgeEl).should.be.true;
    matchesSelector(edgeEl, '.hidden').should.be.true;
    queryAll('.spinner', edgeEl.parentElement).should.have.lengthOf(1);
    getState(oc.chart, 'inAjax').should.be.true;

    oc.endLoading(edgeEl);
    matchesSelector(edgeEl, '.hidden').should.be.false;
    queryAll('.spinner', edgeEl.parentElement).should.have.lengthOf(0);
    getState(oc.chart, 'inAjax').should.be.false;
  });

  it('startLoading() and endLoading() toggle native export buttons', function () {
    const edgeEl = query('.bottomEdge', $sumiao);
    const exportButtonEl = document.createElement('button');

    exportButtonEl.className = 'oc-export-btn';
    document.body.appendChild(exportButtonEl);

    oc.startLoading(edgeEl);
    exportButtonEl.disabled.should.equal(true);

    oc.endLoading(edgeEl);
    exportButtonEl.disabled.should.equal(false);

    exportButtonEl.remove();
  });

  it('stopAjax() accepts a native node level element', function () {
    const nodeLevelEl = oc.getChildren($sumiao)[0].closest('.nodes');
    const spinnerEl = document.createElement('i');

    spinnerEl.className = 'spinner';
    nodeLevelEl.appendChild(spinnerEl);
    setState(oc.chart, 'inAjax', true);

    oc.stopAjax(nodeLevelEl);

    getState(oc.chart, 'inAjax').should.be.false;
    spinnerEl.remove();
  });

  it('backToLooseHandler() and backToCompactHandler() toggle compact mode classes', function () {
    const compactNodeEl = createElementFromHtml('<div class="node compact"><i class="backToCompactSymbol hidden"></i><i class="backToLooseSymbol"></i></div>');

    $container.appendChild(compactNodeEl);

    oc.backToLooseHandler({ compactNode: compactNodeEl });
    matchesSelector(compactNodeEl, '.looseMode').should.be.true;
    matchesSelector(query('.backToLooseSymbol', compactNodeEl), '.hidden').should.be.true;
    matchesSelector(query('.backToCompactSymbol', compactNodeEl), '.hidden').should.be.false;

    oc.backToCompactHandler({ compactNode: compactNodeEl });
    matchesSelector(compactNodeEl, '.looseMode').should.be.false;
    matchesSelector(query('.backToCompactSymbol', compactNodeEl), '.hidden').should.be.true;
    matchesSelector(query('.backToLooseSymbol', compactNodeEl), '.hidden').should.be.false;
  });

  it('backToLooseHandler() and backToCompactHandler() accept wrapped native compact-node payloads', function () {
    const compactNodeEl = createElementFromHtml('<div class="node compact"><i class="backToCompactSymbol hidden"></i><i class="backToLooseSymbol"></i></div>');

    $container.appendChild(compactNodeEl);

    oc.backToLooseHandler({
      originalEvent: {
        currentTarget: compactNodeEl
      }
    });
    matchesSelector(compactNodeEl, '.looseMode').should.be.true;

    oc.backToCompactHandler({
      originalEvent: {
        currentTarget: compactNodeEl
      }
    });
    matchesSelector(compactNodeEl, '.looseMode').should.be.false;
  });

  it('toggleVNodes() expands vertical descendants from a native toggle button payload', function () {
    const spy = sinon.spy(oc, 'repaint');
    const toggleHostEl = createElementFromHtml('<div class="node"><i class="toggleBtn"></i></div>');
    const descWrapperEl = createElementFromHtml('<ul class="nodes hidden"><li class="hierarchy"><div class="node slide-up">child</div></li></ul>');
    let childNodeEl;

    $container.appendChild(toggleHostEl);
    $container.appendChild(descWrapperEl);
    childNodeEl = query('.node', descWrapperEl);

    oc.toggleVNodes({ toggleButton: query('.toggleBtn', toggleHostEl) });

    spy.should.have.been.calledWith(childNodeEl);
    matchesSelector(descWrapperEl, '.hidden').should.be.false;
    matchesSelector(childNodeEl, '.sliding').should.be.true;
    matchesSelector(childNodeEl, '.slide-up').should.be.false;
  });

  it('toggleVNodes() accepts a wrapped native toggle button payload', function () {
    const toggleHostEl = createElementFromHtml('<div class="node"><i class="toggleBtn"></i></div>');
    const descWrapperEl = createElementFromHtml('<ul class="nodes hidden"><li class="hierarchy"><div class="node slide-up">child</div></li></ul>');

    $container.appendChild(toggleHostEl);
    $container.appendChild(descWrapperEl);

    oc.toggleVNodes({
      originalEvent: {
        target: query('.toggleBtn', toggleHostEl)
      }
    });

    matchesSelector(descWrapperEl, '.hidden').should.be.false;
  });

  it('toggleVNodes() collapses vertical descendants from a native toggle button payload', function () {
    const toggleHostEl = createElementFromHtml('<div class="node"><i class="toggleBtn"></i></div>');
    const descWrapperEl = createElementFromHtml('<ul class="nodes"><li class="hierarchy"><div class="node">child<i class="toggleBtn oci-plus-square oci-minus-square"></i></div></li></ul>');
    let nestedToggleBtnEl;
    let childNodeEl;

    $container.appendChild(toggleHostEl);
    $container.appendChild(descWrapperEl);
    nestedToggleBtnEl = query('.node .toggleBtn', descWrapperEl);
    childNodeEl = query('.node', descWrapperEl);

    oc.toggleVNodes({ toggleButton: query('.toggleBtn', toggleHostEl) });

    matchesSelector(childNodeEl, '.sliding.slide-up').should.be.true;
    nestedToggleBtnEl.classList.contains('oci-plus-square').should.be.false;
    nestedToggleBtnEl.classList.contains('oci-minus-square').should.be.false;
  });

  it('expandVNodesEnd() accepts direct vNodes payloads', function () {
    const descWrapperEl = createElementFromHtml('<ul class="nodes"><li class="hierarchy"><div class="node sliding">child</div></li></ul>');
    const childNodeEl = query('.node', descWrapperEl);

    $container.appendChild(descWrapperEl);

    oc.expandVNodesEnd({ vNodes: [childNodeEl] });

    childNodeEl.classList.contains('sliding').should.equal(false);
  });

  it('expandVNodesEnd() accepts wrapped native vNodes payloads', function () {
    const descWrapperEl = createElementFromHtml('<ul class="nodes"><li class="hierarchy"><div class="node sliding">child</div></li></ul>');
    const childNodeEl = query('.node', descWrapperEl);

    $container.appendChild(descWrapperEl);

    oc.expandVNodesEnd({
      originalEvent: {
        vNodes: [childNodeEl]
      }
    });

    childNodeEl.classList.contains('sliding').should.equal(false);
  });

  it('collapseVNodesEnd() accepts direct vNodes payloads', function () {
    const descWrapperEl = createElementFromHtml('<ul class="nodes"><li class="hierarchy"><div class="node sliding">child</div></li></ul>');
    const childNodeEl = query('.node', descWrapperEl);

    $container.appendChild(descWrapperEl);

    oc.collapseVNodesEnd({ vNodes: [childNodeEl] });

    childNodeEl.classList.contains('sliding').should.equal(false);
    descWrapperEl.classList.contains('hidden').should.equal(true);
  });

  it('collapseVNodesEnd() accepts wrapped native vNodes payloads', function () {
    const descWrapperEl = createElementFromHtml('<ul class="nodes"><li class="hierarchy"><div class="node sliding">child</div></li></ul>');
    const childNodeEl = query('.node', descWrapperEl);

    $container.appendChild(descWrapperEl);

    oc.collapseVNodesEnd({
      originalEvent: {
        vNodes: [childNodeEl]
      }
    });

    childNodeEl.classList.contains('sliding').should.equal(false);
    descWrapperEl.classList.contains('hidden').should.equal(true);
  });

  it('filterAllowedDropNodes() accepts a native dragged node', function () {
    oc.filterAllowedDropNodes($heihei);

    getState(oc.chart, 'dragged').should.equal($heihei);
    $laolao.classList.contains('allowedDrop').should.be.true;
    queryAll('.allowedDrop', oc.chart).length.should.be.above(0);
  });

  it('filterAllowedDropNodes() passes native node arguments to dropCriteria', function () {
    const dropCriteria = sinon.stub().returns(true);

    oc.options.dropCriteria = dropCriteria;

    oc.filterAllowedDropNodes($heihei);

    dropCriteria.should.have.been.called;
    dropCriteria.firstCall.args[0].should.equal($heihei);
    dropCriteria.firstCall.args[1].should.equal($sumiao);
    dropCriteria.firstCall.args[2].should.have.property('nodeType', 1);
  });

  it('dragstartHandler() passes a native dragged node payload to filterAllowedDropNodes()', function () {
    const spy = sinon.spy(oc, 'filterAllowedDropNodes');
    const dataTransfer = { setData: sinon.spy() };

    oc.dragstartHandler({ draggedNode: $heihei, originalEvent: { dataTransfer: dataTransfer } });

    dataTransfer.setData.should.have.been.called;
    spy.should.have.been.calledWith($heihei);
  });

  it('dragstartHandler() accepts a wrapped native dragged node payload', function () {
    const spy = sinon.spy(oc, 'filterAllowedDropNodes');
    const dataTransfer = { setData: sinon.spy() };

    oc.dragstartHandler({
      originalEvent: {
        target: $heihei,
        dataTransfer: dataTransfer
      }
    });

    dataTransfer.setData.should.have.been.called;
    spy.should.have.been.calledWith($heihei);
    spy.restore();
  });

  it('createGhostNode() accepts a native source node payload and creates a ghost image', function () {
    const setDragImageSpy = sinon.spy();
    const sourceNodeEl = $heihei;

    oc.chart.style.transform = 'matrix(1, 0, 0, 1, 10, 20)';
    sourceNodeEl.getBoundingClientRect = function () {
      return { width: 120, height: 40, left: 10, top: 20 };
    };

    oc.createGhostNode({
      sourceNode: sourceNodeEl,
      originalEvent: {
        offsetX: 5,
        offsetY: 6,
        dataTransfer: { setDragImage: setDragImageSpy }
      }
    });

    const ghostNodeEl = oc.chart.querySelector('.ghost-node');
    should.exist(ghostNodeEl);
    ghostNodeEl.getAttribute('width').should.equal('120');
    ghostNodeEl.getAttribute('height').should.equal('40');
    setDragImageSpy.should.have.been.calledOnce;
    setDragImageSpy.firstCall.args[0].should.equal(ghostNodeEl);
  });

  it('createGhostNode() accepts a wrapped native source node payload', function () {
    const setDragImageSpy = sinon.spy();
    const sourceNodeEl = $heihei;

    oc.chart.style.transform = 'matrix(1, 0, 0, 1, 10, 20)';
    sourceNodeEl.getBoundingClientRect = function () {
      return { width: 120, height: 40, left: 10, top: 20 };
    };

    oc.createGhostNode({
      originalEvent: {
        target: sourceNodeEl,
        offsetX: 5,
        offsetY: 6,
        dataTransfer: { setDragImage: setDragImageSpy }
      }
    });

    should.exist(oc.chart.querySelector('.ghost-node'));
    setDragImageSpy.should.have.been.calledOnce;
  });

  it('dragoverHandler() accepts a native drop zone payload', function () {
    const disallowedEvent = {
      dropZone: $bomiao,
      originalEvent: { dataTransfer: { dropEffect: 'move' } },
      preventDefault: sinon.spy()
    };
    disallowedEvent.originalEvent.preventDefault = disallowedEvent.preventDefault;
    const allowedEvent = {
      dropZone: addClasses($hongmiao, 'allowedDrop'),
      originalEvent: { dataTransfer: { dropEffect: 'move' } },
      preventDefault: sinon.spy()
    };
    allowedEvent.originalEvent.preventDefault = allowedEvent.preventDefault;

    oc.dragoverHandler(disallowedEvent);
    oc.dragoverHandler(allowedEvent);

    disallowedEvent.originalEvent.dataTransfer.dropEffect.should.equal('none');
    disallowedEvent.preventDefault.should.not.have.been.called;
    allowedEvent.preventDefault.should.have.been.calledOnce;
  });

  it('dragoverHandler() accepts wrapped native drop-zone payloads', function () {
    const wrappedEvent = {
      originalEvent: {
        currentTarget: addClasses($hongmiao, 'allowedDrop'),
        dataTransfer: { dropEffect: 'move' },
        preventDefault: sinon.spy()
      }
    };

    oc.dragoverHandler(wrappedEvent);

    wrappedEvent.originalEvent.preventDefault.should.have.been.calledOnce;
  });

  it('dragendHandler() removes allowedDrop from all nodes', function () {
    addClasses($bomiao, 'allowedDrop');
    addClasses($hongmiao, 'allowedDrop');

    oc.dragendHandler({});

    queryAll('.allowedDrop', oc.chart).should.have.lengthOf(0);
  });

  it('dropHandler() accepts a native drop zone for non-node drags', async function () {
    const spy = sinon.spy();
    const foreignEl = createElementFromHtml('<div class="foreign-item"></div>');

    oc.chart.addEventListener('otherdropped.orgchart', spy);
    setState(oc.chart, 'dragged', foreignEl);

    await oc.dropHandler({ dropZone: $bomiao });

    spy.should.have.been.calledOnce;
    spy.firstCall.args[0].type.should.equal('otherdropped.orgchart');
    spy.firstCall.args[0].detail.dropZone.should.equal($bomiao);
  });

  it('dropHandler() accepts a wrapped native drop zone for non-node drags', async function () {
    const spy = sinon.spy();
    const foreignEl = createElementFromHtml('<div class="foreign-item"></div>');

    oc.chart.addEventListener('otherdropped.orgchart', spy);
    setState(oc.chart, 'dragged', foreignEl);

    await oc.dropHandler({
      originalEvent: {
        currentTarget: $bomiao
      }
    });

    spy.should.have.been.calledOnce;
    spy.firstCall.args[0].detail.dropZone.should.equal($bomiao);
  });

  it('dropHandler() accepts a native drop zone for node drags', async function () {
    const originalJSONDigger = global.JSONDigger;

    global.JSONDigger = function () {
      return {
        findOneNode: function () {
          return null;
        }
      };
    };
    setState(oc.chart, 'dragged', $bomiao);
    addClasses($hongmiao, 'allowedDrop');

    await oc.dropHandler({ dropZone: $hongmiao });

    queryAll('#n2', firstSibling($hongmiao, '.nodes')).should.lengthOf(1);
    childElements(firstSibling($laolao, '.nodes'), '.hierarchy').should.lengthOf(2);
    global.JSONDigger = originalJSONDigger;
  });

  it('dropHandler() keeps nodedrop payloads as native nodes', async function () {
    const originalJSONDigger = global.JSONDigger;
    const spy = sinon.spy();

    global.JSONDigger = function () {
      return {
        findOneNode: function () {
          return null;
        }
      };
    };
    oc.chart.addEventListener('nodedrop.orgchart', spy);
    setState(oc.chart, 'dragged', $bomiao);
    addClasses($hongmiao, 'allowedDrop');

    await oc.dropHandler({ dropZone: $hongmiao });

    spy.should.have.been.calledOnce;
    spy.firstCall.args[0].type.should.equal('nodedrop.orgchart');
    spy.firstCall.args[0].detail.draggedNode.should.equal($bomiao);
    spy.firstCall.args[0].detail.dragZone.should.equal($laolao);
    spy.firstCall.args[0].detail.dropZone.should.equal($hongmiao);
    global.JSONDigger = originalJSONDigger;
  });

  it('dropHandler() removes source child container when dragged node was the only child', async function () {
    const originalJSONDigger = global.JSONDigger;

    global.JSONDigger = function () {
      return {
        findOneNode: function () {
          return null;
        }
      };
    };
    setState(oc.chart, 'dragged', $dandan);
    addClasses($hongmiao, 'allowedDrop');

    await oc.dropHandler({ dropZone: $hongmiao });

    queryAll('#n8', firstSibling($hongmiao, '.nodes')).should.lengthOf(1);
    siblingElements($tiehua, '.nodes').should.lengthOf(0);
    childElements($tiehua, '.bottomEdge, .parentNodeSymbol').should.lengthOf(0);
    global.JSONDigger = originalJSONDigger;
  });

  it('touchmoveHandler() passes a native dragged node payload to filterAllowedDropNodes()', function () {
    const spy = sinon.spy(oc, 'filterAllowedDropNodes');
    const createDragImageStub = sinon.stub(oc, 'createDragImage').returns(document.createElement('div'));
    const moveDragImageStub = sinon.stub(oc, 'moveDragImage');
    const originalElementFromPoint = document.elementFromPoint;

    document.elementFromPoint = function () {
      return $bomiao;
    };

    oc.touchHandled = true;
    oc.touchMoved = false;
    oc.touchmoveHandler({
      draggedNode: $heihei,
      touches: [{ clientX: 0, clientY: 0 }],
      preventDefault: function () {}
    });

    spy.should.have.been.calledWith($heihei);
    createDragImageStub.should.have.been.called;
    moveDragImageStub.should.have.been.called;
    oc.touchTargetNode.should.equal($bomiao);

    document.elementFromPoint = originalElementFromPoint;
    moveDragImageStub.restore();
    createDragImageStub.restore();
  });

  it('touchmoveHandler() accepts wrapped native touch payloads', function () {
    const spy = sinon.spy(oc, 'filterAllowedDropNodes');
    const createDragImageStub = sinon.stub(oc, 'createDragImage').returns(document.createElement('div'));
    const moveDragImageStub = sinon.stub(oc, 'moveDragImage');
    const originalElementFromPoint = document.elementFromPoint;

    document.elementFromPoint = function () {
      return $bomiao;
    };

    oc.touchHandled = true;
    oc.touchMoved = false;
    oc.touchmoveHandler({
      originalEvent: {
        currentTarget: $heihei,
        touches: [{ clientX: 0, clientY: 0 }],
        preventDefault: function () {}
      }
    });

    spy.should.have.been.calledWith($heihei);
    createDragImageStub.should.have.been.called;
    moveDragImageStub.should.have.been.called;
    oc.touchTargetNode.should.equal($bomiao);

    document.elementFromPoint = originalElementFromPoint;
    moveDragImageStub.restore();
    createDragImageStub.restore();
    spy.restore();
  });

  it('touchstartHandler() accepts a wrapped native touch payload', function () {
    const preventDefaultSpy = sinon.spy();

    oc.touchHandled = false;
    oc.touchMoved = true;

    oc.touchstartHandler({
      originalEvent: {
        touches: [{ clientX: 0, clientY: 0 }],
        preventDefault: preventDefaultSpy
      }
    });

    oc.touchHandled.should.equal(true);
    oc.touchMoved.should.equal(false);
    preventDefaultSpy.should.have.been.calledOnce;
  });

  it('getTouchPoint() accepts a wrapped native touch payload', function () {
    const touchPoint = oc.getTouchPoint({
      originalEvent: {
        touches: [{ clientX: 12, clientY: 34 }]
      }
    });

    touchPoint.x.should.equal(12);
    touchPoint.y.should.equal(34);
  });

  it('touchendHandler() passes a native drop zone to dropHandler() after touch drag', function () {
    const destroyDragImageStub = sinon.stub(oc, 'destroyDragImage');
    const dropHandlerStub = sinon.stub(oc, 'dropHandler');
    const dragendHandlerStub = sinon.stub(oc, 'dragendHandler');

    oc.touchHandled = true;
    oc.touchMoved = true;
    oc.touchTargetNode = $bomiao;

    oc.touchendHandler({});

    destroyDragImageStub.should.have.been.calledOnce;
    dropHandlerStub.should.have.been.calledOnce;
    dropHandlerStub.firstCall.args[0].dropZone.should.equal($bomiao);
    dragendHandlerStub.should.have.been.calledOnce;
    should.equal(oc.touchTargetNode, null);
    oc.touchHandled.should.equal(false);

    dragendHandlerStub.restore();
    dropHandlerStub.restore();
    destroyDragImageStub.restore();
  });

  it('touchendHandler() dispatches a native click when touch did not move', function () {
    const destroyDragImageStub = sinon.stub(oc, 'destroyDragImage');
    const clickSpy = sinon.spy();
    const targetEl = document.createElement('div');

    targetEl.addEventListener('click', clickSpy);
    oc.touchHandled = true;
    oc.touchMoved = false;

    oc.touchendHandler({
      target: targetEl,
      changedTouches: [{ screenX: 1, screenY: 2, clientX: 3, clientY: 4 }],
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false
    });

    destroyDragImageStub.should.have.been.calledOnce;
    clickSpy.should.have.been.calledOnce;
    clickSpy.firstCall.args[0].type.should.equal('click');
    clickSpy.firstCall.args[0].clientX.should.equal(3);
    clickSpy.firstCall.args[0].clientY.should.equal(4);
    oc.touchHandled.should.equal(false);

    destroyDragImageStub.restore();
  });

  it('touchendHandler() accepts wrapped native touchend payloads', function () {
    const destroyDragImageStub = sinon.stub(oc, 'destroyDragImage');
    const clickSpy = sinon.spy();
    const targetEl = document.createElement('div');

    targetEl.addEventListener('click', clickSpy);
    oc.touchHandled = true;
    oc.touchMoved = false;

    oc.touchendHandler({
      originalEvent: {
        target: targetEl,
        changedTouches: [{ screenX: 1, screenY: 2, clientX: 3, clientY: 4 }],
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false
      }
    });

    destroyDragImageStub.should.have.been.calledOnce;
    clickSpy.should.have.been.calledOnce;
    oc.touchHandled.should.equal(false);

    destroyDragImageStub.restore();
  });

  it('getUpperLevel() and getLowerLevel() accept native nodes', function () {
    oc.getUpperLevel($laolao).should.equal(1);
    oc.getUpperLevel($dandan).should.equal(4);
    oc.getLowerLevel($laolao).should.equal(4);
    oc.getLowerLevel($dandan).should.equal(1);
  });

  it('getLevelOrderNodes() accepts a native root node', function () {
    const levels = oc.getLevelOrderNodes($laolao);

    levels.should.have.lengthOf(4);
    levels[0][0].should.equal($laolao);
    levels[1].map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n2', 'n3', 'n4']);
    levels[2].map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n5', 'n6', 'n7']);
    levels[3].map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n8', 'n9', 'n10']);
  });

  it('isInAction() accepts a native node and inspects native edge classes', function () {
    const nodeEl = $sumiao;
    const topEdgeEl = nodeEl.querySelector('.topEdge');

    should.exist(topEdgeEl);
    topEdgeEl.classList.add(oc.options.icons.expandToUp);
    oc.isInAction(nodeEl).should.equal(true);

    topEdgeEl.classList.remove(oc.options.icons.expandToUp);
    oc.isInAction(nodeEl).should.equal(false);
  });

  it('switchHorizontalArrow() accepts a native node and toggles edge classes from native siblings', function () {
    const nodeEl = $sumiao;
    const leftEdgeEl = nodeEl.querySelector('.leftEdge');
    const rightEdgeEl = nodeEl.querySelector('.rightEdge');

    oc.switchHorizontalArrow(nodeEl);
    leftEdgeEl.classList.contains(oc.options.icons.expandToRight).should.equal(true);
    leftEdgeEl.classList.contains(oc.options.icons.collapseToLeft).should.equal(false);
    rightEdgeEl.classList.contains(oc.options.icons.collapseToLeft).should.equal(true);
    rightEdgeEl.classList.contains(oc.options.icons.expandToRight).should.equal(false);

    siblingElements(closestElement($sumiao, '.hierarchy')).forEach(function (siblingEl) {
      addClasses(siblingEl, 'hidden');
    });
    oc.switchHorizontalArrow(nodeEl);

    leftEdgeEl.classList.contains(oc.options.icons.expandToRight).should.equal(false);
    leftEdgeEl.classList.contains(oc.options.icons.collapseToLeft).should.equal(true);
    rightEdgeEl.classList.contains(oc.options.icons.collapseToLeft).should.equal(false);
    rightEdgeEl.classList.contains(oc.options.icons.expandToRight).should.equal(true);
  });

  it('switchVerticalArrow() accepts a native edge element and toggles vertical arrow classes', function () {
    const bottomEdgeEl = $sumiao.querySelector('.bottomEdge');

    should.exist(bottomEdgeEl);
    bottomEdgeEl.classList.add(oc.options.icons.expandToUp);

    oc.switchVerticalArrow(bottomEdgeEl);
    bottomEdgeEl.classList.contains(oc.options.icons.expandToUp).should.equal(false);
    bottomEdgeEl.classList.contains(oc.options.icons.collapseToDown).should.equal(true);

    oc.switchVerticalArrow(bottomEdgeEl);
    bottomEdgeEl.classList.contains(oc.options.icons.expandToUp).should.equal(true);
    bottomEdgeEl.classList.contains(oc.options.icons.collapseToDown).should.equal(false);
  });

  it('panStartHandler() accepts a native chart element and updates transform on mousemove', function () {
    let moveEvent;

    oc.chart.style.transform = 'none';

    oc.panStartHandler({
      chart: oc.chart,
      target: oc.chart,
      pageX: 10,
      pageY: 20
    });

    getState(oc.chart, 'panning').should.equal(true);
    moveEvent = new window.Event('mousemove', { bubbles: true });
    Object.defineProperty(moveEvent, 'pageX', { value: 30 });
    Object.defineProperty(moveEvent, 'pageY', { value: 45 });
    oc.chart.dispatchEvent(moveEvent);

    oc.chart.style.transform.should.equal('matrix(1, 0, 0, 1, 20, 25)');
  });

  it('panStartHandler() accepts wrapped native event payloads', function () {
    oc.chart.style.transform = 'none';

    oc.panStartHandler({
      chart: oc.chart,
      originalEvent: {
        target: oc.chart,
        pageX: 10,
        pageY: 20
      }
    });

    getState(oc.chart, 'panning').should.equal(true);
  });

  it('panEndHandler() accepts a native chart element', function () {
    setState(oc.chart, 'panning', true);
    oc.chart.style.cursor = 'move';

    oc.panEndHandler({ chart: oc.chart });

    getState(oc.chart, 'panning').should.equal(false);
    oc.chart.style.cursor.should.equal('default');
  });

  it('panEndHandler() accepts wrapped native chart payloads', function () {
    setState(oc.chart, 'panning', true);
    oc.chart.style.cursor = 'move';

    oc.panEndHandler({
      originalEvent: {
        currentTarget: oc.chart
      }
    });

    getState(oc.chart, 'panning').should.equal(false);
    oc.chart.style.cursor.should.equal('default');
  });

  it('panEndHandler() removes both mousemove and touchmove listeners', function () {
    const removedTypes = [];
    const originalRemoveEventListener = oc.chart.removeEventListener;

    oc.chart.removeEventListener = function (type, listener, options) {
      removedTypes.push(type);
      return originalRemoveEventListener.call(this, type, listener, options);
    };

    oc.panStartHandler({
      chart: oc.chart,
      target: oc.chart,
      pageX: 10,
      pageY: 20
    });
    oc.panEndHandler({ chart: oc.chart });

    removedTypes.should.include('mousemove');
    removedTypes.should.include('touchmove');

    oc.chart.removeEventListener = originalRemoveEventListener;
  });

  it('bindPan() wires document pan-end events with the native chart element', function () {
    const panChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds
    });
    const panEndSpy = sinon.stub(panChart, 'panEndHandler');

    panChart.bindPan();
    document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));

    panEndSpy.should.have.been.called;
    panEndSpy.lastCall.args[0].chart.should.equal(panChart.chart);
  });

  it('unbindPan() removes the native document pan-end listeners', function () {
    const panChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds
    });
    const panEndSpy = sinon.stub(panChart, 'panEndHandler');

    panChart.bindPan();
    panChart.unbindPan();
    document.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));

    panEndSpy.should.not.have.been.called;
  });

  it('setChartScale() accepts a native chart element', function () {
    oc.chart.style.transform = 'none';
    oc.setChartScale(oc.chart, 1.2);

    oc.chart.style.transform.should.equal('scale(1.2,1.2)');
  });

  it('zoomStartHandler() stores pinch state on the native chart element', function () {
    const pinchDistStub = sinon.stub(oc, 'getPinchDist').returns(12);

    oc.zoomStartHandler({
      orgChart: oc,
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 }]
    });

    getState(oc.chart, 'pinching').should.equal(true);
    getState(oc.chart, 'pinchDistStart').should.equal(12);

    pinchDistStub.restore();
  });

  it('zoomStartHandler() accepts wrapped native touch payloads', function () {
    const pinchDistStub = sinon.stub(oc, 'getPinchDist').returns(12);

    oc.zoomStartHandler({
      orgChart: oc,
      originalEvent: {
        touches: [{ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 }]
      }
    });

    getState(oc.chart, 'pinching').should.equal(true);
    getState(oc.chart, 'pinchDistStart').should.equal(12);

    pinchDistStub.restore();
  });

  it('zoomingHandler() stores pinch distance on the native chart element', function () {
    const pinchDistStub = sinon.stub(oc, 'getPinchDist').returns(18);

    setState(oc.chart, 'pinching', true);
    oc.zoomingHandler({ orgChart: oc });

    getState(oc.chart, 'pinchDistEnd').should.equal(18);

    pinchDistStub.restore();
  });

  it('zoomingHandler() accepts wrapped native touch payloads', function () {
    const pinchDistStub = sinon.stub(oc, 'getPinchDist').returns(18);

    setState(oc.chart, 'pinching', true);
    oc.zoomingHandler({
      orgChart: oc,
      originalEvent: {
        touches: [{ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 }]
      }
    });

    getState(oc.chart, 'pinchDistEnd').should.equal(18);

    pinchDistStub.restore();
  });

  it('getPinchDist() accepts a native touch payload', function () {
    const distance = oc.getPinchDist({
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 }]
    });

    distance.should.equal(5);
  });

  it('zoomWheelHandler() passes a native chart element to setChartScale()', function () {
    const spy = sinon.spy(oc, 'setChartScale');
    const preventDefaultSpy = sinon.spy();

    oc.zoomWheelHandler({
      orgChart: oc,
      originalEvent: {
        deltaY: -1,
        preventDefault: preventDefaultSpy
      }
    });

    preventDefaultSpy.should.have.been.calledOnce;
    spy.should.have.been.calledWith(oc.chart, 1.2);
  });

  it('zoomWheelHandler() accepts wrapped native wheel payloads without an explicit preventDefault wrapper', function () {
    const spy = sinon.spy(oc, 'setChartScale');
    const preventDefaultSpy = sinon.spy();

    oc.zoomWheelHandler({
      orgChart: oc,
      originalEvent: {
        deltaY: -1,
        preventDefault: preventDefaultSpy
      }
    });

    preventDefaultSpy.should.have.been.calledOnce;
    spy.should.have.been.calledWith(oc.chart, 1.2);
  });

  it('bindZoom() wires wheel events with the native chart container', function () {
    const zoomChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds
    });
    const zoomWheelSpy = sinon.stub(zoomChart, 'zoomWheelHandler');

    zoomChart.bindZoom();
    zoomChart.chartContainer.dispatchEvent(new window.Event('wheel', { bubbles: true }));

    zoomWheelSpy.should.have.been.called;
    zoomWheelSpy.lastCall.args[0].orgChart.should.equal(zoomChart);
  });

  it('unbindZoom() removes native zoom listeners', function () {
    const zoomChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds
    });
    const zoomWheelSpy = sinon.stub(zoomChart, 'zoomWheelHandler');

    zoomChart.bindZoom();
    zoomChart.unbindZoom();
    zoomChart.chartContainer.dispatchEvent(new window.Event('wheel', { bubbles: true }));

    zoomWheelSpy.should.not.have.been.called;
  });

  it('zoomEndHandler() passes a native chart element to setChartScale()', function () {
    const spy = sinon.spy(oc, 'setChartScale');

    setState(oc.chart, 'pinching', true);
    setState(oc.chart, 'pinchDistStart', 10);
    setState(oc.chart, 'pinchDistEnd', 20);
    oc.zoomEndHandler({ orgChart: oc });

    spy.should.have.been.calledWith(oc.chart, 1.2);
  });

  it('createNode() passes a native node to bindDragDrop() when draggable is enabled', function () {
    const draggableChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds,
      draggable: true
    });
    const spy = sinon.spy(draggableChart, 'bindDragDrop');

    draggableChart.createNode({ id: 'n11', name: 'Li Xin', relationship: '000', level: 0 });

    spy.should.have.been.called;
    spy.firstCall.args[0].nodeType.should.equal(1);
  });

  it('buildInferiorNodes() accepts native hierarchy and node elements for vertical children', function () {
    const verticalChart = new OrgChart({
      chartContainer: '#chart-container',
      data: ds,
      verticalLevel: 2,
      visibleLevel: 1
    });
    const hierarchyEl = document.createElement('li');
    let nodeEl;
    let verticalNodesEl;

    hierarchyEl.className = 'hierarchy';
    nodeEl = verticalChart.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 1 });
    hierarchyEl.appendChild(nodeEl);

    verticalChart.buildInferiorNodes(hierarchyEl, nodeEl, {
      collapsed: true,
      children: [{ id: 'n12', name: 'Child', relationship: '000' }]
    }, 1);

    verticalNodesEl = Array.from(hierarchyEl.children).find(function (childEl) {
      return childEl.classList && childEl.classList.contains('nodes');
    });

    should.exist(verticalNodesEl);
    verticalNodesEl.classList.contains('vertical').should.equal(true);
    verticalNodesEl.classList.contains('hidden').should.equal(true);
    verticalNodesEl.querySelector('#n12').should.not.equal(null);
  });

  it('buildInferiorNodes() keeps compact descendants on the native node element', function () {
    const hierarchyEl = document.createElement('li');
    const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });

    hierarchyEl.className = 'hierarchy';
    hierarchyEl.appendChild(nodeEl);

    oc.buildInferiorNodes(hierarchyEl, nodeEl, {
      compact: true,
      children: [{ id: 'n12', name: 'Child', relationship: '000' }]
    }, 0);

    nodeEl.classList.contains('compact').should.equal(true);
    should.equal(hierarchyEl.querySelector('.nodes'), null);
    nodeEl.querySelector('#n12').should.not.equal(null);
  });

  it('buildHierarchy() accepts a native hierarchy element for family tree spouse layout', function () {
    const hierarchyEl = document.createElement('li');
    let wrapperEl;

    hierarchyEl.className = 'hierarchy';

    oc.buildHierarchy(hierarchyEl, [[
      { id: 'n11', name: 'Spouse A', relationship: '001', outsider: false },
      {
        id: 'n12',
        name: 'Spouse B',
        relationship: '001',
        outsider: true,
        children: [[{ id: 'n13', name: 'Child', relationship: '000' }]]
      }
    ]]);

    wrapperEl = hierarchyEl.firstElementChild;

    should.exist(wrapperEl);
    wrapperEl.classList.contains('couple').should.equal(true);
    Array.from(wrapperEl.children).filter(function (childEl) {
      return childEl.classList && childEl.classList.contains('node');
    }).length.should.equal(2);
    wrapperEl.querySelector('#n12').should.not.equal(null);
    wrapperEl.querySelector('.nodes').should.not.equal(null);
  });

  it('addAncestors() wraps the original root content into a different hierarchy from the new ancestor', function () {
    let ancestorNodeEl;
    let originalRootNodeEl;

    oc.addAncestors({ id: 'n0', name: 'Lao Ye', relationship: '001' }, 'n0');

    ancestorNodeEl = document.getElementById('n0');
    originalRootNodeEl = document.getElementById('n1');

    should.exist(ancestorNodeEl);
    should.exist(originalRootNodeEl);
    originalRootNodeEl.closest('.hierarchy').should.not.equal(ancestorNodeEl.closest('.hierarchy'));
  });

  it('addDescendants() accepts a native parent element and appends descendant hierarchy nodes', function () {
    oc.addDescendants([{ id: 'n11', name: 'Li Xin' }], $bomiao);

    should.exist($bomiao.nextElementSibling);
    matchesSelector($bomiao.nextElementSibling, '.nodes').should.be.true;
    childElements($bomiao.nextElementSibling, '.hierarchy').should.have.lengthOf(1);
    queryAll('#n11', $bomiao.nextElementSibling).should.have.lengthOf(1);
  });

  it('showDropZones() accepts a native dragged node', function () {
    oc.showDropZones($heihei);

    getState(oc.chart, 'dragged').should.equal($heihei);
    queryAll('.allowedDrop', oc.chart).length.should.equal(queryAll('.node', oc.chart).length);
  });

  it('hideDropZones() clears all allowedDrop classes', function () {
    oc.showDropZones($heihei);

    oc.hideDropZones();

    queryAll('.allowedDrop', oc.chart).should.have.lengthOf(0);
  });

  it('processExternalDrop() accepts native drop and dragged nodes', function () {
    const dropSpy = sinon.spy();

    $bomiao.addEventListener('drop', dropSpy);

    oc.processExternalDrop($bomiao, $heihei);

    getState(oc.chart, 'dragged').should.equal($heihei);
    dropSpy.should.have.been.calledOnce;
    dropSpy.firstCall.args[0].type.should.equal('drop');
  });

  it('exportPNG() creates and reuses a native download anchor', function () {
    const originalNavigator = window.navigator;
    const originalClick = window.HTMLAnchorElement.prototype.click;
    const originalWebkitAppearance = document.documentElement.style.WebkitAppearance;
    const clickSpy = sinon.spy();
    const fakeCanvas = {
      toDataURL: function () {
        return 'data:image/png;base64,fake';
      }
    };

    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        appName: 'Netscape',
        appVersion: 'Chrome'
      }
    });
    document.documentElement.style.WebkitAppearance = 'none';
    window.HTMLAnchorElement.prototype.click = clickSpy;

    oc.exportPNG(fakeCanvas, 'UnitExportPng');
    oc.exportPNG(fakeCanvas, 'UnitExportPng2');

    queryAll('.download-btn', $container).should.have.lengthOf(1);
    query('.download-btn', $container).getAttribute('download').should.equal('UnitExportPng2.png');
    query('.download-btn', $container).getAttribute('href').should.equal('data:image/png;base64,fake');
    clickSpy.callCount.should.equal(2);

    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: originalNavigator
    });
    document.documentElement.style.WebkitAppearance = originalWebkitAppearance;
    window.HTMLAnchorElement.prototype.click = originalClick;
  });

  it('export() passes the visible chart element to html2canvas and exports png by default', function (done) {
    const originalHtml2canvas = global.html2canvas;
    const originalWindowHtml2canvas = window.html2canvas;
    const exportPNGStub = sinon.stub(oc, 'exportPNG');
    const fakeCanvas = {
      toDataURL: function () {
        return 'data:image/png;base64,fake';
      }
    };

    global.html2canvas = function (element, options) {
      try {
        element.should.equal(oc.chart);
        options.width.should.equal(oc.chart.clientWidth);
        options.height.should.equal(oc.chart.clientHeight);
      } catch (error) {
        done(error);
        return {
          then: function () {}
        };
      }

      return {
        then: function (resolve) {
          resolve(fakeCanvas);
          return {
            then: function () {}
          };
        }
      };
    };

    window.html2canvas = global.html2canvas;

    oc.export('UnitExport');

    setTimeout(function () {
      try {
        exportPNGStub.should.have.been.calledOnce;
        exportPNGStub.firstCall.args[0].should.equal(fakeCanvas);
        exportPNGStub.firstCall.args[1].should.equal('UnitExport');
        $container.classList.contains('canvasContainer').should.be.false;
        query('.mask', $container).classList.contains('hidden').should.be.true;
        global.html2canvas = originalHtml2canvas;
        window.html2canvas = originalWindowHtml2canvas;
        exportPNGStub.restore();
        done();
      } catch (error) {
        global.html2canvas = originalHtml2canvas;
        window.html2canvas = originalWindowHtml2canvas;
        exportPNGStub.restore();
        done(error);
      }
    }, 0);
  });

  it('export() returns false when the chart container already has a spinner', function () {
    const html2canvasStub = sinon.stub(global, 'html2canvas');
    const spinnerEl = document.createElement('i');

    spinnerEl.className = 'spinner';
    $container.appendChild(spinnerEl);

    oc.export('BlockedExport').should.equal(false);
    html2canvasStub.should.not.have.been.called;

    spinnerEl.remove();
    html2canvasStub.restore();
  });

  it('export() routes pdf exports to exportPDF()', function (done) {
    const originalHtml2canvas = global.html2canvas;
    const originalWindowHtml2canvas = window.html2canvas;
    const exportPDFStub = sinon.stub(oc, 'exportPDF');
    const fakeCanvas = {
      toDataURL: function () {
        return 'data:image/png;base64,fake';
      }
    };

    global.html2canvas = function () {
      return {
        then: function (resolve) {
          resolve(fakeCanvas);
          return {
            then: function () {}
          };
        }
      };
    };

    window.html2canvas = global.html2canvas;

    oc.export('UnitExportPdf', 'pdf');

    setTimeout(function () {
      try {
        exportPDFStub.should.have.been.calledOnce;
        exportPDFStub.firstCall.args[0].should.equal(fakeCanvas);
        exportPDFStub.firstCall.args[1].should.equal('UnitExportPdf');
        global.html2canvas = originalHtml2canvas;
        window.html2canvas = originalWindowHtml2canvas;
        exportPDFStub.restore();
        done();
      } catch (error) {
        global.html2canvas = originalHtml2canvas;
        window.html2canvas = originalWindowHtml2canvas;
        exportPDFStub.restore();
        done(error);
      }
    }, 0);
  });
});
