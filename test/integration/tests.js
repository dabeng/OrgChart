const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
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

function siblingElements(element, selector) {
  if (!element || !element.parentElement) {
    return [];
  }
  return Array.from(element.parentElement.children).filter(function (childEl) {
    return childEl !== element && (!selector || childEl.matches(selector));
  });
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function dispatchNativeEvent(element, type, options) {
  const eventOptions = Object.assign({ bubbles: true }, options);
  let event;

  if (/click|mouse/.test(type)) {
    event = new window.MouseEvent(type, eventOptions);
  } else {
    event = new window.Event(type, eventOptions);
  }
  element.dispatchEvent(event);
}

function dispatchEventWithProperties(element, type, properties, options) {
  const event = new window.Event(type, Object.assign({ bubbles: true }, options));

  Object.keys(properties || {}).forEach(function (key) {
    Object.defineProperty(event, key, {
      configurable: true,
      value: properties[key]
    });
  });
  element.dispatchEvent(event);
}

describe('orgchart -- integration tests', function () {
  let $container;

  const ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao' },
      { 'id': 'n3', 'name': 'Su Miao',
        'children': [
          { 'id': 'n5', 'name': 'Tie Hua',
            'children' : [
              { 'id': 'n8', 'name': 'Dan Dan' }
            ]
          },
          { 'id': 'n6', 'name': 'Hei Hei',
            'children': [
              { 'id': 'n9', 'name': 'Er Dan' }
            ]
          },
          { 'id': 'n7', 'name': 'Pang Pang',
            'children': [
              { 'id': 'n10', 'name': 'San Dan' }
            ]
          }
        ]
      },
      { 'id': 'n4', 'name': 'Hong Miao' },
    ]
  };

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
              { id: 'n9'}
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

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-container"></div>';
    $container = document.getElementById('chart-container');
    oc = new OrgChart({
      chartContainer: '#chart-container',
      'data': ds
    }),
    $laolao = document.getElementById('n1'),
    $bomiao = document.getElementById('n2'),
    $sumiao = document.getElementById('n3'),
    $hongmiao = document.getElementById('n4'),
    $tiehua = document.getElementById('n5'),
    $heihei = document.getElementById('n6'),
    $pangpang = document.getElementById('n7'),
    $dandan = document.getElementById('n8'),
    $erdan = document.getElementById('n9'),
    $sandan = document.getElementById('n10');
  });

  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $chunmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = $sandan = null;
    $container.innerHTML = '';
  });

  it('addParent()', function () {
    const expectedHierarchy = {
      id: 'n0',
      children: [cloneValue(hierarchy)]
    };

    oc.addParent($laolao, { 'name': 'Lao Ye', 'id': 'n0' });

    siblingElements($laolao.closest('.nodes'), '.node').should.lengthOf(1);
    query('.node', oc.chart).should.equal(query('#n0'));
    oc.getHierarchy().should.deep.equal(expectedHierarchy);
  });

  it('addAncestors()', function () {
    oc.addAncestors({ 'name': 'Lao Ye', 'id': 'n0', 'relationship': '001' }, 'n0');

    should.exist(query('#n0'));
    query('#n0').closest('.hierarchy').should.not.equal(query('#n1').closest('.hierarchy'));
    oc.getHierarchy().should.deep.equal(hierarchy);
  });

  describe('addChildren()', function () {
    it('Add child nodes to the leaf node', function () {
      let siblingNodesElement;
      const expectedHierarchy = cloneValue(hierarchy);

      expectedHierarchy.children[0].children = [{ id: 'n11' }];

      oc.addChildren($bomiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      siblingNodesElement = siblingElements($bomiao, '.nodes')[0];
      siblingElements($bomiao, '.nodes').should.lengthOf(1);
      queryAll('.hierarchy', siblingNodesElement).should.lengthOf(1);
      query('.node', siblingNodesElement).id.should.equal('n11');
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });

    it('Add child nodes to the un-leaf node', function () {
      let siblingNodesElements;
      let hierarchyElements;
      const expectedHierarchy = cloneValue(hierarchy);

      expectedHierarchy.children[1].children.push({ id: 'n11' });

      oc.addChildren($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      siblingNodesElements = siblingElements($sumiao, '.nodes');
      hierarchyElements = siblingNodesElements.flatMap(function (nodesElement) {
        return Array.from(nodesElement.children).filter(function (childEl) {
          return childEl.classList && childEl.classList.contains('hierarchy');
        });
      });
      hierarchyElements.should.lengthOf(4);
      query('.node', hierarchyElements[hierarchyElements.length - 1]).id.should.equal('n11');
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });
  });

  describe('addDescendants()', function () {
    it('Add descendant nodes from a native parent node', function () {
      let siblingNodesElement;
      const expectedHierarchy = cloneValue(hierarchy);

      expectedHierarchy.children[0].children = [{ id: 'n11' }];

      oc.addDescendants([{ 'name': 'Li Xin', 'id': 'n11' }], $bomiao);

      siblingNodesElement = siblingElements($bomiao, '.nodes')[0];
      siblingElements($bomiao, '.nodes').should.lengthOf(1);
      queryAll('.hierarchy', siblingNodesElement).should.lengthOf(1);
      query('.node', siblingNodesElement).id.should.equal('n11');
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });

    it('Preserves descendant insertion order and nested descendant structure', function () {
      const expectedHierarchy = cloneValue(hierarchy);

      expectedHierarchy.children[0].children = [
        { id: 'n11', children: [{ id: 'n12' }] },
        { id: 'n13' }
      ];

      oc.addDescendants([
        {
          'name': 'Li Xin',
          'id': 'n11',
          'children': [
            { 'name': 'Xiao Xin', 'id': 'n12' }
          ]
        },
        { 'name': 'Li Na', 'id': 'n13' }
      ], $bomiao);

      Array.from($bomiao.nextElementSibling.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).should.lengthOf(2);
      queryAll('#n12', $bomiao.nextElementSibling).should.lengthOf(1);
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });
  });

  describe('addSiblings()', function () {
    it('Just add sibling nodes', function () {
      const expectedHierarchy = cloneValue(hierarchy);
      const rootHierarchyElement = $laolao.closest('.hierarchy');
      const rootChildrenContainer = Array.from(rootHierarchyElement.children).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('nodes');
      });

      expectedHierarchy.children.push({ id: 'n11' });

      oc.addSiblings($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      Array.from(rootChildrenContainer.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).should.lengthOf(4);
      should.exist(query('#n11', rootChildrenContainer));
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });

    it('Add sibling nodes as well as parent node', function () {
      let hierarchySiblings;
      const expectedHierarchy = {
        id: 'n0',
        children: [{ id: 'n11' }, cloneValue(hierarchy)]
      };

      oc.addSiblings($laolao, { 'name': 'Lao Ye', 'id': 'n0', 'children': [{'name': 'Li Xin', 'id': 'n11' }] });
      siblingElements($laolao.closest('.nodes'), '.node').should.lengthOf(1);
      query('.node', oc.chart).should.equal(query('#n0'));
      hierarchySiblings = siblingElements($laolao.closest('.hierarchy'));
      hierarchySiblings.should.lengthOf(1);
      query('.node', hierarchySiblings[0]).id.should.equal('n11');
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });
  });

  describe('removeNodes()', function () {
    it('Remove leaf node', function () {
      const expectedHierarchy = cloneValue(hierarchy);

      delete expectedHierarchy.children[1].children[0].children;

      oc.removeNodes($dandan);
      siblingElements($tiehua, '.nodes').should.lengthOf(0);
      should.not.exist(query('.bottomEdge', $tiehua));
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });

    it('Remove parent node', function () {
      const siblingNodesElement = siblingElements($sumiao, '.nodes')[0];
      const expectedHierarchy = cloneValue(hierarchy);

      expectedHierarchy.children[1].children.splice(0, 1);

      oc.removeNodes($tiehua);
      Array.from(siblingNodesElement.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).should.lengthOf(2);
      should.not.exist(query('#n5'));
      should.not.exist(query('#n8'));
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
    });

    it('Remove a root child node and preserve sibling order', function () {
      const expectedHierarchy = cloneValue(hierarchy);
      const rootHierarchyElement = $laolao.closest('.hierarchy');
      const rootChildrenContainer = Array.from(rootHierarchyElement.children).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('nodes');
      });

      expectedHierarchy.children.splice(0, 1);

      oc.removeNodes($bomiao);

      should.not.exist(query('#n2'));
      oc.getHierarchy().should.deep.equal(expectedHierarchy);
      Array.from(query(':scope > .nodes', oc.chart).children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).map(function (hierarchyEl) {
        return query('.node', hierarchyEl).id;
      }).should.deep.equal(['n1']);
      Array.from(rootChildrenContainer.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).map(function (hierarchyEl) {
        return query('.node', hierarchyEl).id;
      }).should.deep.equal(['n3', 'n4']);
    });

    it('Remove root node', function () {
      oc.removeNodes($laolao);
      $container.children.length.should.equal(0);
    });
  });

  describe('interaction flows', function () {
    it('dispatches hide/show children events through bottom-edge clicks', function () {
      const bottomEdge = query('.bottomEdge', $sumiao);
      const firstChildNode = siblingElements($sumiao, '.nodes')[0].querySelector('.node');
      const events = [];

      $sumiao.addEventListener('hide-children.orgchart', function (event) {
        events.push(event.type);
      });
      $sumiao.addEventListener('show-children.orgchart', function (event) {
        events.push(event.type);
      });

      dispatchNativeEvent(bottomEdge, 'click');
      dispatchNativeEvent(firstChildNode, 'transitionend');
      dispatchNativeEvent(bottomEdge, 'click');
      dispatchNativeEvent(firstChildNode, 'transitionend');

      events.should.deep.equal(['hide-children.orgchart', 'show-children.orgchart']);
    });

    it('dispatches hide/show siblings events through horizontal-edge clicks', function () {
      const leftEdge = query('.leftEdge', $sumiao);
      const firstSiblingNode = query('#n2');
      const events = [];

      $sumiao.addEventListener('hide-siblings.orgchart', function (event) {
        events.push(event.type);
      });
      $sumiao.addEventListener('show-siblings.orgchart', function (event) {
        events.push(event.type);
      });

      dispatchNativeEvent(leftEdge, 'click');
      dispatchNativeEvent(firstSiblingNode, 'transitionend');
      dispatchNativeEvent(leftEdge, 'click');
      dispatchNativeEvent(firstSiblingNode, 'transitionend');

      events.should.deep.equal(['hide-siblings.orgchart', 'show-siblings.orgchart']);
    });

    it('dispatches hide-parent and enters ancestor-collapsed state through top-edge click', function () {
      const topEdge = query('.topEdge', $heihei);
      const hideSpy = sinon.spy();
      const currentHierarchy = $heihei.closest('.hierarchy');
      const leftSiblingHierarchy = currentHierarchy.previousElementSibling;
      const rightSiblingHierarchy = currentHierarchy.nextElementSibling;

      $heihei.addEventListener('hide-parent.orgchart', hideSpy);

      dispatchNativeEvent(topEdge, 'click');

      hideSpy.should.have.been.calledOnce;
      hideSpy.firstCall.args[0].type.should.equal('hide-parent.orgchart');
      currentHierarchy.classList.contains('isAncestorsCollapsed').should.be.true;
      currentHierarchy.classList.contains('isSiblingsCollapsed').should.be.true;
      leftSiblingHierarchy.classList.contains('isCollapsedSibling').should.be.true;
      rightSiblingHierarchy.classList.contains('isCollapsedSibling').should.be.true;
      $sumiao.classList.contains('sliding').should.be.true;
      $sumiao.classList.contains('slide-down').should.be.true;
      $laolao.classList.contains('sliding').should.be.true;
      $laolao.classList.contains('slide-down').should.be.true;

      dispatchNativeEvent($sumiao, 'transitionend');
      dispatchNativeEvent($laolao, 'transitionend');

      $sumiao.classList.contains('sliding').should.be.false;
      $laolao.classList.contains('sliding').should.be.false;
    });

    it('focuses the clicked node and clears focus when clicking chart background', function () {
      dispatchNativeEvent($sumiao, 'click');
      $sumiao.classList.contains('focused').should.be.true;

      dispatchNativeEvent($hongmiao, 'click');
      $sumiao.classList.contains('focused').should.be.false;
      $hongmiao.classList.contains('focused').should.be.true;

      dispatchNativeEvent(oc.chart, 'click');
      queryAll('.node.focused', oc.chart).should.have.lengthOf(0);
    });

    it('toggles children visibility through bottom-edge clicks and transition cleanup', function () {
      const childNodesContainer = siblingElements($sumiao, '.nodes')[0];
      const bottomEdge = query('.bottomEdge', $sumiao);
      const childHierarchies = Array.from(childNodesContainer.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      });
      const visibleChildNodes = childHierarchies.map(function (hierarchyEl) {
        return query('.node', hierarchyEl);
      });

      oc.getNodeState($sumiao, 'children').should.deep.equal({ exist: true, visible: true });

      dispatchNativeEvent(bottomEdge, 'click');
      childNodesContainer.classList.contains('hidden').should.be.false;
      childHierarchies.forEach(function (hierarchyEl) {
        hierarchyEl.classList.contains('isCollapsedDescendant').should.be.true;
      });
      visibleChildNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.true;
        childNodeEl.classList.contains('slide-up').should.be.true;
      });

      dispatchNativeEvent(visibleChildNodes[0], 'transitionend');
      childNodesContainer.classList.contains('hidden').should.be.true;
      oc.getNodeState($sumiao, 'children').should.deep.equal({ exist: true, visible: false });

      dispatchNativeEvent(bottomEdge, 'click');
      childNodesContainer.classList.contains('hidden').should.be.false;
      visibleChildNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.true;
        childNodeEl.classList.contains('slide-up').should.be.false;
      });

      dispatchNativeEvent(visibleChildNodes[0], 'transitionend');
      oc.getNodeState($sumiao, 'children').should.deep.equal({ exist: true, visible: true });
    });

    it('toggles sibling visibility through horizontal-edge clicks and transition cleanup', function () {
      const leftEdge = query('.leftEdge', $sumiao);
      const siblingHierarchies = Array.from($sumiao.closest('.hierarchy').parentElement.children).filter(function (childEl) {
        return childEl !== $sumiao.closest('.hierarchy') && childEl.classList.contains('hierarchy');
      });
      const siblingNodes = siblingHierarchies.map(function (hierarchyEl) {
        return query('.node', hierarchyEl);
      });

      oc.getNodeState($sumiao, 'siblings').should.deep.equal({ exist: true, visible: true });

      dispatchNativeEvent(leftEdge, 'click');
      siblingNodes.forEach(function (siblingNodeEl) {
        siblingNodeEl.classList.contains('sliding').should.be.true;
      });

      dispatchNativeEvent(siblingNodes[0], 'transitionend');
      siblingHierarchies.forEach(function (siblingHierarchyEl) {
        siblingHierarchyEl.classList.contains('hidden').should.be.true;
      });
      oc.getNodeState($sumiao, 'siblings').should.deep.equal({ exist: true, visible: false });

      dispatchNativeEvent(leftEdge, 'click');
      siblingHierarchies.forEach(function (siblingHierarchyEl) {
        siblingHierarchyEl.classList.contains('hidden').should.be.false;
      });
      siblingNodes.forEach(function (siblingNodeEl) {
        siblingNodeEl.classList.contains('sliding').should.be.true;
      });

      dispatchNativeEvent(siblingNodes[0], 'transitionend');
      oc.getNodeState($sumiao, 'siblings').should.deep.equal({ exist: true, visible: true });
    });

    it('shows directional edge icons on hover and clears them on mouseleave', function () {
      const topEdge = query('.topEdge', $sumiao);
      const bottomEdge = query('.bottomEdge', $sumiao);
      const leftEdge = query('.leftEdge', $sumiao);
      const rightEdge = query('.rightEdge', $sumiao);

      dispatchNativeEvent($sumiao, 'mouseenter', { bubbles: false });
      topEdge.classList.contains(oc.options.icons.collapseToDown).should.be.true;
      bottomEdge.classList.contains(oc.options.icons.expandToUp).should.be.true;
      leftEdge.classList.contains(oc.options.icons.expandToRight).should.be.true;
      rightEdge.classList.contains(oc.options.icons.collapseToLeft).should.be.true;

      dispatchNativeEvent($sumiao, 'mouseleave', { bubbles: false });
      topEdge.classList.contains(oc.options.icons.expandToUp).should.be.false;
      topEdge.classList.contains(oc.options.icons.collapseToDown).should.be.false;
      bottomEdge.classList.contains(oc.options.icons.expandToUp).should.be.false;
      bottomEdge.classList.contains(oc.options.icons.collapseToDown).should.be.false;
      leftEdge.classList.contains(oc.options.icons.expandToRight).should.be.false;
      leftEdge.classList.contains(oc.options.icons.collapseToLeft).should.be.false;
      rightEdge.classList.contains(oc.options.icons.expandToRight).should.be.false;
      rightEdge.classList.contains(oc.options.icons.collapseToLeft).should.be.false;
    });
  });

  describe('query methods', function () {
    it('returns current parent, children, and siblings as native nodes', function () {
      oc.getParent($sumiao).should.equal($laolao);
      oc.getChildren($sumiao).map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n5', 'n6', 'n7']);
      oc.getSiblings($sumiao).map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n2', 'n4']);
    });

    it('updates relationship queries after tree mutations', function () {
      oc.addChildren($bomiao, [{ name: 'Li Xin', id: 'n11' }]);
      oc.addSiblings($sumiao, [{ name: 'Li Na', id: 'n12' }]);

      should.exist(query('#n11'));
      should.exist(query('#n12'));
      oc.getChildren($bomiao).map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n11']);
      oc.getSiblings($sumiao).map(function (nodeEl) { return nodeEl.id; }).should.deep.equal(['n2', 'n4', 'n12']);
      oc.getParent(query('#n11')).should.equal($bomiao);
      oc.getParent(query('#n12')).should.equal($laolao);
    });
  });

  describe('hybrid vertical flows', function () {
    it('expands and collapses vertical descendants through toggle button clicks', function () {
      let hybridChart;
      let hybridSumiao;
      let toggleBtn;
      let descendantsWrapper;
      let childNodes;

      $container.innerHTML = '';
      hybridChart = new OrgChart({
        chartContainer: '#chart-container',
        data: {
          id: 'n1',
          name: 'Lao Lao',
          children: [
            { id: 'n2', name: 'Bo Miao' },
            {
              id: 'n3',
              name: 'Su Miao',
              children: [
                { id: 'n5', name: 'Tie Hua' },
                { id: 'n6', name: 'Hei Hei' }
              ]
            }
          ]
        },
        verticalLevel: 2,
        visibleLevel: 2
      });
      hybridSumiao = query('#n3', hybridChart.chart);
      toggleBtn = query('.toggleBtn', hybridSumiao);
      descendantsWrapper = siblingElements(hybridSumiao, '.nodes')[0];
      childNodes = Array.from(descendantsWrapper.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).map(function (hierarchyEl) {
        return query('.node', hierarchyEl);
      });

      should.exist(toggleBtn);
      descendantsWrapper.classList.contains('hidden').should.be.true;
      childNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('slide-up').should.be.true;
      });

      dispatchNativeEvent(toggleBtn, 'click');
      descendantsWrapper.classList.contains('hidden').should.be.false;
      childNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.true;
        childNodeEl.classList.contains('slide-up').should.be.false;
      });

      dispatchNativeEvent(childNodes[0], 'transitionend');
      childNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.false;
      });

      dispatchNativeEvent(toggleBtn, 'click');
      descendantsWrapper.classList.contains('hidden').should.be.false;
      childNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.true;
        childNodeEl.classList.contains('slide-up').should.be.true;
      });

      dispatchNativeEvent(childNodes[0], 'transitionend');
      descendantsWrapper.classList.contains('hidden').should.be.true;
      childNodes.forEach(function (childNodeEl) {
        childNodeEl.classList.contains('sliding').should.be.false;
      });
    });
  });

  describe('drag and drop flows', function () {
    it('filters allowed drop zones through the public dropCriteria option', function () {
      const draggableChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        draggable: true,
        dropCriteria: function (draggedNode, draggedParentNode, dropNode) {
          return draggedNode.id === 'n2' && draggedParentNode.id === 'n1' && dropNode.id === 'n4';
        }
      });
      const draggableBomiao = query('#n2', draggableChart.chart);

      dispatchEventWithProperties(draggableBomiao, 'dragstart', {
        dataTransfer: {
          setData: function () {}
        }
      });

      queryAll('.allowedDrop', draggableChart.chart).map(function (nodeEl) {
        return nodeEl.id;
      }).should.deep.equal(['n4']);

      dispatchNativeEvent(draggableBomiao, 'dragend');
      queryAll('.allowedDrop', draggableChart.chart).should.have.lengthOf(0);
    });

    it('dispatches otherdropped for an external dragged item', async function () {
      const draggableChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        draggable: true
      });
      const draggableBomiao = query('#n2', draggableChart.chart);
      const foreignItem = document.createElement('div');
      const dropSpy = sinon.spy();

      foreignItem.className = 'foreign-item';
      draggableChart.chart.addEventListener('otherdropped.orgchart', dropSpy);

      dispatchEventWithProperties(draggableBomiao, 'dragstart', {
        dataTransfer: {
          setData: function () {}
        }
      });
      setState(draggableChart.chart, 'dragged', foreignItem);

      await draggableChart.dropHandler({
        dropZone: draggableBomiao,
        originalEvent: {
          currentTarget: draggableBomiao
        }
      });

      dropSpy.should.have.been.calledOnce;
      dropSpy.firstCall.args[0].type.should.equal('otherdropped.orgchart');
      dropSpy.firstCall.args[0].detail.draggedItem.should.equal(foreignItem);
      dropSpy.firstCall.args[0].detail.dropZone.should.equal(draggableBomiao);
    });

    it('marks allowed drop zones on native dragstart and clears them on dragend', function () {
      const draggableChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        draggable: true
      });
      const draggableBomiao = query('#n2', draggableChart.chart);
      const draggableHongmiao = query('#n4', draggableChart.chart);

      dispatchEventWithProperties(draggableBomiao, 'dragstart', {
        dataTransfer: {
          setData: function () {}
        }
      });

      draggableHongmiao.classList.contains('allowedDrop').should.be.true;
      queryAll('.allowedDrop', draggableChart.chart).length.should.be.above(0);

      dispatchNativeEvent(draggableBomiao, 'dragend');

      queryAll('.allowedDrop', draggableChart.chart).should.have.lengthOf(0);
    });

    it('dispatches nodedrop and moves the dragged node through native drag/drop events', async function () {
      const originalJSONDigger = global.JSONDigger;
      const draggableChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        draggable: true
      });
      const draggableBomiao = query('#n2', draggableChart.chart);
      const draggableHongmiao = query('#n4', draggableChart.chart);
      const rootChildrenContainer = siblingElements(query('#n1', draggableChart.chart), '.nodes')[0];
      const dropSpy = sinon.spy();

      global.JSONDigger = function () {
        return {
          findOneNode: function () {
            return null;
          }
        };
      };
      draggableChart.chart.addEventListener('nodedrop.orgchart', dropSpy);

      dispatchEventWithProperties(draggableBomiao, 'dragstart', {
        dataTransfer: {
          setData: function () {}
        }
      });
      draggableHongmiao.classList.add('allowedDrop');

      await draggableChart.dropHandler({
        dropZone: draggableHongmiao,
        originalEvent: {
          currentTarget: draggableHongmiao
        }
      });

      dropSpy.should.have.been.calledOnce;
      dropSpy.firstCall.args[0].type.should.equal('nodedrop.orgchart');
      dropSpy.firstCall.args[0].detail.draggedNode.should.equal(draggableBomiao);
      dropSpy.firstCall.args[0].detail.dropZone.should.equal(draggableHongmiao);
      queryAll('#n2', siblingElements(draggableHongmiao, '.nodes')[0]).should.have.lengthOf(1);
      Array.from(rootChildrenContainer.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).map(function (hierarchyEl) {
        return query('.node', hierarchyEl).id;
      }).should.deep.equal(['n3', 'n4']);

      global.JSONDigger = originalJSONDigger;
    });
  });

  describe('compact mode flows', function () {
    it('toggles loose and compact modes through compact-node controls', function () {
      let compactChart;
      let compactNode;
      let backToLooseSymbol;
      let backToCompactSymbol;

      $container.innerHTML = '';
      compactChart = new OrgChart({
        chartContainer: '#chart-container',
        data: {
          id: 'n1',
          name: 'Lao Lao',
          children: [
            {
              id: 'n2',
              name: 'Bo Miao',
              compact: true,
              children: [
                { id: 'n3', name: 'Su Miao' },
                { id: 'n4', name: 'Hong Miao' }
              ]
            }
          ]
        }
      });
      compactNode = query('#n2', compactChart.chart);
      backToLooseSymbol = query('.backToLooseSymbol', compactNode);
      backToCompactSymbol = query('.backToCompactSymbol', compactNode);

      should.exist(backToLooseSymbol);
      should.exist(backToCompactSymbol);
      compactNode.classList.contains('looseMode').should.be.false;
      backToCompactSymbol.classList.contains('hidden').should.be.true;

      dispatchNativeEvent(backToLooseSymbol, 'click');

      compactNode.classList.contains('looseMode').should.be.true;
      backToLooseSymbol.classList.contains('hidden').should.be.true;
      backToCompactSymbol.classList.contains('hidden').should.be.false;

      dispatchNativeEvent(backToCompactSymbol, 'click');

      compactNode.classList.contains('looseMode').should.be.false;
      backToLooseSymbol.classList.contains('hidden').should.be.false;
      backToCompactSymbol.classList.contains('hidden').should.be.true;
    });
  });

  describe('export flows', function () {
    it('invokes export() through the rendered export button click', function () {
      let exportChart;
      let exportButton;
      let exportStub;

      $container.innerHTML = '';
      Array.from(document.querySelectorAll('.oc-export-btn')).forEach(function (buttonEl) {
        buttonEl.remove();
      });
      exportChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        exportButton: true
      });
      exportButton = document.querySelector('.oc-export-btn');
      exportStub = sinon.stub(exportChart, 'export');

      should.exist(exportButton);

      dispatchNativeEvent(exportButton, 'click');

      exportStub.should.have.been.calledOnce;
      exportButton.remove();
      exportStub.restore();
    });
  });

  describe('pan and zoom binding flows', function () {
    it('pans through native mousedown, mousemove, and mouseup bindings', function () {
      let panChart;
      let moveEvent;

      $container.innerHTML = '';
      panChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        pan: true
      });

      dispatchEventWithProperties(panChart.chart, 'mousedown', {
        target: panChart.chart,
        pageX: 10,
        pageY: 20
      });

      getState(panChart.chart, 'panning').should.equal(true);
      moveEvent = new window.Event('mousemove', { bubbles: true });
      Object.defineProperty(moveEvent, 'pageX', { configurable: true, value: 30 });
      Object.defineProperty(moveEvent, 'pageY', { configurable: true, value: 45 });
      panChart.chart.dispatchEvent(moveEvent);
      panChart.chart.style.transform.should.equal('matrix(1, 0, 0, 1, 20, 25)');

      dispatchNativeEvent(document, 'mouseup');

      getState(panChart.chart, 'panning').should.equal(false);
      panChart.chart.style.cursor.should.equal('default');
    });

    it('zooms through the bound wheel listener on the chart container', function () {
      let zoomChart;

      $container.innerHTML = '';
      zoomChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        zoom: true
      });
      zoomChart.chart.getBoundingClientRect = function () {
        return { left: 0, top: 0 };
      };
      zoomChart.chartContainer.getBoundingClientRect = function () {
        return {
          left: 0,
          top: 0,
          right: 200,
          bottom: 100,
          width: 200,
          height: 100
        };
      };

      dispatchEventWithProperties(zoomChart.chartContainer, 'wheel', {
        deltaY: -1,
        clientX: 60,
        clientY: 45,
        preventDefault: function () {}
      });

      zoomChart.chart.style.transform.should.equal('matrix(1.2, 0, 0, 1.2, -12, -9)');
    });

    it('pinch-zooms through bound touchstart, touchmove, and touchend listeners', function () {
      let zoomChart;

      $container.innerHTML = '';
      zoomChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        zoom: true
      });
      zoomChart.chart.getBoundingClientRect = function () {
        return { left: 0, top: 0 };
      };
      zoomChart.chartContainer.getBoundingClientRect = function () {
        return {
          left: 0,
          top: 0,
          right: 200,
          bottom: 100,
          width: 200,
          height: 100
        };
      };

      dispatchEventWithProperties(zoomChart.chartContainer, 'touchstart', {
        touches: [
          { clientX: 40, clientY: 40 },
          { clientX: 80, clientY: 40 }
        ]
      });
      dispatchEventWithProperties(document, 'touchmove', {
        touches: [
          { clientX: 30, clientY: 40 },
          { clientX: 90, clientY: 40 }
        ]
      });
      dispatchNativeEvent(document, 'touchend');

      zoomChart.chart.style.transform.should.equal('matrix(1.2, 0, 0, 1.2, -12, -8)');
    });

    it('toggles pan bindings through setOptions()', function () {
      let panChart;

      $container.innerHTML = '';
      panChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds
      });
      setState(panChart.chart, 'panning', false);

      dispatchEventWithProperties(panChart.chart, 'mousedown', {
        target: panChart.chart,
        pageX: 10,
        pageY: 20
      });
      getState(panChart.chart, 'panning').should.equal(false);

      panChart.setOptions({ pan: true });
      dispatchEventWithProperties(panChart.chart, 'mousedown', {
        target: panChart.chart,
        pageX: 10,
        pageY: 20
      });
      getState(panChart.chart, 'panning').should.equal(true);

      dispatchNativeEvent(document, 'mouseup');
      panChart.setOptions({ pan: false });
      setState(panChart.chart, 'panning', false);

      dispatchEventWithProperties(panChart.chart, 'mousedown', {
        target: panChart.chart,
        pageX: 30,
        pageY: 40
      });
      getState(panChart.chart, 'panning').should.equal(false);
    });

    it('toggles zoom bindings through setOptions()', function () {
      let zoomChart;

      $container.innerHTML = '';
      zoomChart = new OrgChart({
        chartContainer: '#chart-container',
        data: ds
      });
      zoomChart.chart.getBoundingClientRect = function () {
        return { left: 0, top: 0 };
      };
      zoomChart.chartContainer.getBoundingClientRect = function () {
        return {
          left: 0,
          top: 0,
          right: 200,
          bottom: 100,
          width: 200,
          height: 100
        };
      };

      dispatchEventWithProperties(zoomChart.chartContainer, 'wheel', {
        deltaY: -1,
        clientX: 60,
        clientY: 45,
        preventDefault: function () {}
      });
      zoomChart.chart.style.transform.should.equal('');

      zoomChart.setOptions({ zoom: true });
      dispatchEventWithProperties(zoomChart.chartContainer, 'wheel', {
        deltaY: -1,
        clientX: 60,
        clientY: 45,
        preventDefault: function () {}
      });
      zoomChart.chart.style.transform.should.equal('matrix(1.2, 0, 0, 1.2, -12, -9)');

      zoomChart.setOptions({ zoom: false });
      zoomChart.chart.style.transform = 'none';
      dispatchEventWithProperties(zoomChart.chartContainer, 'wheel', {
        deltaY: -1,
        clientX: 60,
        clientY: 45,
        preventDefault: function () {}
      });
      zoomChart.chart.style.transform.should.equal('none');
    });
  });
});
