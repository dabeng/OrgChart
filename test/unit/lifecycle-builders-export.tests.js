const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai').default;
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

describe('orgchart -- init and builder unit tests', function () {
  let $container;
  let oc;

  const ds = {
    id: 'n1',
    name: 'Lao Lao',
    title: 'general manager',
    children: [
      { id: 'n2', name: 'Bo Miao', title: 'department manager' },
      {
        id: 'n3',
        name: 'Su Miao',
        title: 'department manager',
        children: [
          { id: 'n5', name: 'Tie Hua', title: 'senior engineer' },
          { id: 'n6', name: 'Hei Hei', title: 'senior engineer' }
        ]
      },
      { id: 'n4', name: 'Hong Miao', title: 'department manager' }
    ]
  };

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-host"><div id="chart-container"></div></div>';
    $container = document.getElementById('chart-container');
    oc = new OrgChart({
      chartContainer: '#chart-container',
      data: JSON.parse(JSON.stringify(ds)),
      nodeContent: 'title'
    });
  });

  afterEach(function () {
    document.body.innerHTML = '';
    oc = null;
    $container = null;
  });

  describe('constructor() and init()', function () {
    it('supports invoking OrgChart without new', function () {
      const chart = OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds))
      });

      chart.should.be.instanceOf(OrgChart);
      should.exist(chart.chart);
      chart.chartContainer.should.equal($container);
    });

    it('accepts the container alias in the options object', function () {
      const chart = new OrgChart({
        container: '#chart-container',
        data: JSON.parse(JSON.stringify(ds))
      });

      chart.chartContainer.should.equal($container);
      should.exist(chart.chart);
    });

    it('does not initialize when the container cannot be resolved', function () {
      const initSpy = sinon.spy(OrgChart.prototype, 'init');
      const chart = new OrgChart({
        chartContainer: '#missing-container',
        data: JSON.parse(JSON.stringify(ds))
      });

      should.equal(chart.chartContainer, null);
      should.equal(chart.chart, null);
      initSpy.should.not.have.been.called;

      initSpy.restore();
    });

    it('stores merged options on the chart state during init', function () {
      let chart;

      $container.innerHTML = '';
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        chartClass: 'alpha',
        direction: 'l2r',
        zoom: true,
        visibleLevel: 3
      });

      getState(chart.chart, 'options').chartClass.should.equal('alpha');
      getState(chart.chart, 'options').direction.should.equal('l2r');
      getState(chart.chart, 'options').zoom.should.equal(true);
      getState(chart.chart, 'options').visibleLevel.should.equal(3);
      getState(chart.chart, 'options').nodeId.should.equal('id');
    });

    it('replaces the previous chart element when init() runs again', function () {
      const oldChart = oc.chart;

      oc.init({ data: JSON.parse(JSON.stringify(ds)), chartClass: 'reloaded' });

      should.exist(oc.chart);
      oc.chart.should.not.equal(oldChart);
      oldChart.isConnected.should.equal(false);
      oc.chart.classList.contains('reloaded').should.equal(true);
      $container.querySelectorAll('.orgchart').length.should.equal(1);
    });

    it('applies chartClass and non-default direction classes during init', function () {
      let chart;

      $container.innerHTML = '';
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        chartClass: 'custom-chart',
        direction: 'b2t'
      });

      chart.chart.classList.contains('custom-chart').should.equal(true);
      chart.chart.classList.contains('b2t').should.equal(true);
    });

    it('uses the root nodes container directly for grouped family-tree arrays', function () {
      let chart;

      $container.innerHTML = '';
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: [[
          { id: 'n1', name: 'Lao Lao', relationship: '001' },
          { id: 'n2', name: 'Bo Miao', relationship: '001' }
        ]]
      });

      queryAll(':scope > ul.nodes > li.hierarchy', chart.chart).length.should.equal(1);
      query(':scope > ul.nodes > li.hierarchy.spouse.couple', chart.chart).should.not.equal(null);
      query('#n1', chart.chart).should.not.equal(null);
      query('#n2', chart.chart).should.not.equal(null);
    });

    it('builds a chart from a UL datasource during init()', function () {
      let chart;
      let ulElement;

      $container.innerHTML = '';
      ulElement = createElementFromHtml(
        '<ul id="org-data">' +
          '<li data-id="n1" data-title="chief">Lao Lao' +
            '<ul>' +
              '<li data-id="n2" data-title="manager">Bo Miao</li>' +
              '<li data-id="n3" data-title="manager">Su Miao</li>' +
            '</ul>' +
          '</li>' +
        '</ul>'
      );
      document.body.appendChild(ulElement);
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: ulElement,
        nodeContent: 'title'
      });

      query('#n1', chart.chart).should.not.equal(null);
      query('#n2', chart.chart).should.not.equal(null);
      query('#n3', chart.chart).should.not.equal(null);
      query('.content', query('#n1', chart.chart)).textContent.should.equal('chief');

      ulElement.remove();
    });

    it('routes plain object data through attachRel() before building', function () {
      const attachRelSpy = sinon.spy(oc, 'attachRel');

      oc.init({
        data: {
          id: 'r1',
          name: 'Root',
          children: [{ id: 'c1', name: 'Child' }]
        }
      });

      attachRelSpy.should.have.been.called;
      attachRelSpy.firstCall.args[1].should.equal('00');
      attachRelSpy.restore();
    });

    it('keeps explicit relationship data untouched during init()', function () {
      const attachRelSpy = sinon.spy(oc, 'attachRel');

      oc.init({
        data: {
          id: 'r1',
          name: 'Root',
          relationship: '001',
          children: [{ id: 'c1', name: 'Child', relationship: '100' }]
        }
      });

      attachRelSpy.should.not.have.been.called;
      attachRelSpy.restore();
      query('#r1', oc.chart).should.not.equal(null);
      query('#c1', oc.chart).should.not.equal(null);
    });

    it('calls attachExportButton() only when exportButton is enabled', function () {
      const attachSpy = sinon.spy(oc, 'attachExportButton');

      oc.init({ data: JSON.parse(JSON.stringify(ds)), exportButton: false });
      attachSpy.should.not.have.been.called;

      oc.init({ data: JSON.parse(JSON.stringify(ds)), exportButton: true });
      attachSpy.should.have.been.calledOnce;

      attachSpy.restore();
    });

    it('binds pan and zoom during init() when the options are enabled', function () {
      const panSpy = sinon.spy(oc, 'bindPan');
      const zoomSpy = sinon.spy(oc, 'bindZoom');

      oc.init({ data: JSON.parse(JSON.stringify(ds)), pan: true, zoom: true });

      panSpy.should.have.been.calledOnce;
      zoomSpy.should.have.been.calledOnce;
      panSpy.restore();
      zoomSpy.restore();
    });
  });

  describe('setOptions()', function () {
    it('binds pan when called with the string form and true', function () {
      const bindSpy = sinon.spy(oc, 'bindPan');

      oc.setOptions('pan', true).should.equal(oc);

      bindSpy.should.have.been.calledOnce;
      bindSpy.restore();
    });

    it('unbinds pan when called with the string form and false', function () {
      const unbindSpy = sinon.spy(oc, 'unbindPan');

      oc.setOptions('pan', false).should.equal(oc);

      unbindSpy.should.have.been.calledOnce;
      unbindSpy.restore();
    });

    it('binds zoom when called with the string form and true', function () {
      const bindSpy = sinon.spy(oc, 'bindZoom');

      oc.setOptions('zoom', true).should.equal(oc);

      bindSpy.should.have.been.calledOnce;
      bindSpy.restore();
    });

    it('unbinds zoom when called with the string form and false', function () {
      const unbindSpy = sinon.spy(oc, 'unbindZoom');

      oc.setOptions('zoom', false).should.equal(oc);

      unbindSpy.should.have.been.calledOnce;
      unbindSpy.restore();
    });

    it('reinitializes when called with an object that contains data', function () {
      const initSpy = sinon.spy(oc, 'init');

      oc.setOptions({ data: { id: 'x1', name: 'Reloaded Root' } }).should.equal(oc);

      initSpy.should.have.been.calledOnce;
      initSpy.firstCall.args[0].should.have.property('data');
      initSpy.firstCall.args[0].data.id.should.equal('x1');
      initSpy.firstCall.args[0].data.name.should.equal('Reloaded Root');
      initSpy.firstCall.args[0].data.relationship.should.equal('000');
      initSpy.firstCall.args[0].data.level.should.equal(1);
      initSpy.restore();
    });

    it('toggles pan and zoom independently when called with an object', function () {
      const bindPanSpy = sinon.spy(oc, 'bindPan');
      const unbindPanSpy = sinon.spy(oc, 'unbindPan');
      const bindZoomSpy = sinon.spy(oc, 'bindZoom');
      const unbindZoomSpy = sinon.spy(oc, 'unbindZoom');

      oc.setOptions({ pan: true, zoom: false }).should.equal(oc);
      bindPanSpy.should.have.been.calledOnce;
      unbindZoomSpy.should.have.been.calledOnce;
      unbindPanSpy.should.have.been.calledOnce;
      bindZoomSpy.should.not.have.been.called;

      bindPanSpy.restore();
      unbindPanSpy.restore();
      bindZoomSpy.restore();
      unbindZoomSpy.restore();
    });

    it('ignores unrelated option names in string form', function () {
      const bindPanSpy = sinon.spy(oc, 'bindPan');
      const bindZoomSpy = sinon.spy(oc, 'bindZoom');

      oc.setOptions('visibleLevel', 2).should.equal(oc);

      bindPanSpy.should.not.have.been.called;
      bindZoomSpy.should.not.have.been.called;
      bindPanSpy.restore();
      bindZoomSpy.restore();
    });
  });

  describe('attachRel()', function () {
    it('assigns root and child relationship flags recursively', function () {
      const tree = {
        id: 'n1',
        name: 'Root',
        children: [
          { id: 'n2', name: 'Left' },
          { id: 'n3', name: 'Right', children: [{ id: 'n4', name: 'Leaf' }] }
        ]
      };

      oc.attachRel(tree, '00');

      tree.relationship.should.equal('001');
      tree.children[0].relationship.should.equal('110');
      tree.children[1].relationship.should.equal('111');
      tree.children[1].children[0].relationship.should.equal('100');
    });

    it('marks compact nodes when the compact option predicate returns true', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        compact: function (nodeData) {
          return nodeData.id === 'n3';
        }
      });
      const tree = {
        id: 'n1',
        name: 'Root',
        children: [
          { id: 'n2', name: 'Left' },
          {
            id: 'n3',
            name: 'Right',
            children: [{ id: 'n4', name: 'Leaf' }]
          }
        ]
      };

      chart.attachRel(tree, '00');

      should.equal(tree.compact, undefined);
      tree.children[1].compact.should.equal(true);
      tree.children[1].children[0].associatedCompact.should.equal(true);
    });

    it('marks all descendants vertical under a hybrid node', function () {
      const tree = {
        id: 'n1',
        name: 'Root',
        hybrid: true,
        children: [
          {
            id: 'n2',
            name: 'Child',
            children: [{ id: 'n3', name: 'Grandchild' }]
          }
        ]
      };

      oc.attachRel(tree, '00');

      tree.children[0].vertical.should.equal(true);
      tree.children[0].children[0].vertical.should.equal(true);
    });

    it('marks compact descendants and compact leaves differently', function () {
      const tree = {
        id: 'n1',
        name: 'Root',
        compact: true,
        children: [
          {
            id: 'n2',
            name: 'Has Children',
            children: [{ id: 'n4', name: 'Leaf' }]
          },
          { id: 'n3', name: 'Leaf' }
        ]
      };

      oc.attachRel(tree, '00');

      tree.children[0].compact.should.equal(true);
      tree.children[1].associatedCompact.should.equal(true);
      tree.children[0].children[0].associatedCompact.should.equal(true);
    });

    it('returns the same data object after mutating relationships', function () {
      const tree = { id: 'n1', name: 'Root' };

      oc.attachRel(tree, '00').should.equal(tree);
      tree.relationship.should.equal('000');
    });
  });

  describe('createNode()', function () {
    it('renders the standard title, content, and edges from relationship flags', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        title: 'architect',
        relationship: '111',
        level: 1
      });

      nodeEl.classList.contains('node').should.equal(true);
      nodeEl.id.should.equal('n11');
      query('.title', nodeEl).textContent.trim().should.equal('Li Xin');
      query('.content', nodeEl).textContent.should.equal('architect');
      should.exist(query('.topEdge', nodeEl));
      should.exist(query('.leftEdge', nodeEl));
      should.exist(query('.rightEdge', nodeEl));
      should.exist(query('.bottomEdge', nodeEl));
      should.exist(query('.parentNodeSymbol', nodeEl));
    });

    it('propagates parentId to direct children when a node id exists', function () {
      const data = {
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        children: [{ id: 'n12', name: 'Child' }]
      };

      oc.createNode(data);

      data.children[0].parentId.should.equal('n11');
    });

    it('stores nodeData on the created element without the children array', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        children: [{ id: 'n12', name: 'Child' }]
      });

      getState(nodeEl, 'nodeData').id.should.equal('n11');
      getState(nodeEl, 'nodeData').name.should.equal('Li Xin');
      should.equal(getState(nodeEl, 'nodeData').children, undefined);
      nodeEl.__ocNodeData.id.should.equal('n11');
    });

    it('adds the slide-up class when the node level exceeds visibleLevel', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        visibleLevel: 1
      });
      const nodeEl = chart.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '000',
        level: 2
      });

      nodeEl.classList.contains('slide-up').should.equal(true);
    });

    it('renders custom className and outsider classes', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '000',
        level: 0,
        className: 'custom-node',
        outsider: true
      });

      nodeEl.classList.contains('custom-node').should.equal(true);
      nodeEl.classList.contains('outsider').should.equal(true);
    });

    it('renders custom nodeTemplate output instead of the default title/content markup', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        nodeTemplate: function (data) {
          return '<section class="custom-template">' + data.name + '</section>';
        }
      });
      const nodeEl = chart.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0
      });

      should.exist(query('.custom-template', nodeEl));
      should.equal(query('.title', nodeEl), null);
      should.equal(query('.content', nodeEl), null);
    });

    it('omits the content block when nodeContent is undefined', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds))
      });
      const nodeEl = chart.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        title: 'architect'
      });

      should.equal(query('.content', nodeEl), null);
    });

    it('renders a vertical toggle button at or beyond verticalLevel', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        verticalLevel: 2
      });
      const nodeEl = chart.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 2
      });

      should.exist(query('.toggleBtn', nodeEl));
      should.equal(query('.bottomEdge', nodeEl), null);
    });

    it('renders a toggle button for explicitly vertical nodes', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        vertical: true
      });

      should.exist(query('.toggleBtn', nodeEl));
    });

    it('renders a bottom edge for hybrid nodes with children', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        hybrid: true
      });

      should.exist(query('.bottomEdge', nodeEl));
      should.equal(query('.toggleBtn', nodeEl), null);
    });

    it('renders compact mode controls and grid columns for compact nodes', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0,
        compact: true,
        children: [
          { id: 'n12', name: 'A' },
          { id: 'n13', name: 'B' },
          { id: 'n14', name: 'C' }
        ]
      });

      should.exist(query('.backToCompactSymbol', nodeEl));
      should.exist(query('.backToLooseSymbol', nodeEl));
      nodeEl.style.gridTemplateColumns.should.equal('repeat(2, auto)');
    });

    it('suppresses default directional edges for associatedCompact nodes', function () {
      const nodeEl = oc.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '111',
        level: 1,
        associatedCompact: true
      });

      should.equal(query('.topEdge', nodeEl), null);
      should.equal(query('.leftEdge', nodeEl), null);
      should.equal(query('.rightEdge', nodeEl), null);
      should.equal(query('.bottomEdge', nodeEl), null);
    });

    it('marks a created node draggable and initializes touch drag state when draggable is enabled', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        draggable: true
      });
      const bindSpy = sinon.spy(chart, 'bindDragDrop');
      const nodeEl = chart.createNode({
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0
      });

      nodeEl.getAttribute('draggable').should.equal('true');
      bindSpy.should.have.been.calledOnce;
      bindSpy.firstCall.args[0].should.equal(nodeEl);
      chart.touchHandled.should.equal(false);
      chart.touchMoved.should.equal(false);
      should.equal(chart.touchTargetNode, null);
      bindSpy.restore();
    });

    it('calls the createNode callback with the native node element and data', function () {
      const createNodeSpy = sinon.spy();
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        createNode: createNodeSpy
      });
      const nodeData = {
        id: 'n11',
        name: 'Li Xin',
        relationship: '001',
        level: 0
      };

      createNodeSpy.resetHistory();
      const nodeEl = chart.createNode(nodeData);

      createNodeSpy.should.have.been.calledOnce;
      createNodeSpy.firstCall.args[0].should.equal(nodeEl);
      createNodeSpy.firstCall.args[1].should.equal(nodeData);
    });
  });

  describe('buildInferiorNodes()', function () {
    it('creates a hidden vertical nodes layer at the vertical cutoff', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        verticalLevel: 2,
        visibleLevel: 1
      });
      const hierarchyEl = document.createElement('li');
      const nodeEl = chart.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 1 });

      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      chart.buildInferiorNodes(hierarchyEl, nodeEl, {
        collapsed: true,
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      }, 1);

      should.exist(query(':scope > .nodes.vertical.hidden', hierarchyEl));
      should.exist(query('#n12', hierarchyEl));
    });

    it('creates a vertical layer for hybrid nodes outside an existing vertical context', function () {
      const hierarchyEl = document.createElement('li');
      const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });

      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      oc.buildInferiorNodes(hierarchyEl, nodeEl, {
        hybrid: true,
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      }, 0);

      should.exist(query(':scope > .nodes.vertical', hierarchyEl));
      should.exist(query('#n12', hierarchyEl));
    });

    it('does not add a second vertical class when already inside a vertical branch', function () {
      const verticalWrapper = document.createElement('ul');
      const hierarchyEl = document.createElement('li');
      const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 1 });
      let nodesEl;

      verticalWrapper.className = 'nodes vertical';
      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      verticalWrapper.appendChild(hierarchyEl);
      $container.appendChild(verticalWrapper);

      oc.buildInferiorNodes(hierarchyEl, nodeEl, {
        hybrid: true,
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      }, 1);
      nodesEl = query(':scope > .nodes', hierarchyEl);

      nodesEl.classList.contains('vertical').should.equal(false);
    });

    it('marks the hierarchy as children-collapsed for hidden horizontal children', function () {
      const chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        visibleLevel: 0
      });
      const hierarchyEl = document.createElement('li');
      const nodeEl = chart.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });

      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      chart.buildInferiorNodes(hierarchyEl, nodeEl, {
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      }, 0);

      hierarchyEl.classList.contains('isChildrenCollapsed').should.equal(true);
      should.exist(query(':scope > .nodes.hidden', hierarchyEl));
    });

    it('keeps compact descendants inside the compact node element', function () {
      const hierarchyEl = document.createElement('li');
      const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });

      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      oc.buildInferiorNodes(hierarchyEl, nodeEl, {
        compact: true,
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      }, 0);

      nodeEl.classList.contains('compact').should.equal(true);
      should.equal(query('.nodes', hierarchyEl), null);
      should.exist(query('#n12', nodeEl));
    });

    it('handles grouped family-tree children arrays', function () {
      const hierarchyEl = document.createElement('li');
      const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });

      hierarchyEl.className = 'hierarchy';
      hierarchyEl.appendChild(nodeEl);
      oc.buildInferiorNodes(hierarchyEl, nodeEl, {
        children: [[
          { id: 'n12', name: 'Spouse A', relationship: '001' },
          {
            id: 'n13',
            name: 'Spouse B',
            relationship: '001',
            outsider: true,
            children: [[{ id: 'n14', name: 'Child', relationship: '000' }]]
          }
        ]]
      }, 0);

      should.exist(query('.couple', hierarchyEl));
      should.exist(query('#n12', hierarchyEl));
      should.exist(query('#n13', hierarchyEl));
      should.exist(query('#n14', hierarchyEl));
    });

    it('returns early when the hierarchy element cannot be resolved', function () {
      should.equal(oc.buildInferiorNodes(null, null, { children: [] }, 0), undefined);
    });
  });

  describe('buildHierarchy()', function () {
    it('creates a single node and its descendants for plain object data', function () {
      const hierarchyEl = document.createElement('li');

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, {
        id: 'n11',
        name: 'Parent',
        relationship: '001',
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      });

      should.exist(query('#n11', hierarchyEl));
      should.exist(query('#n12', hierarchyEl));
      should.exist(query('.nodes', hierarchyEl));
    });

    it('derives the level from ancestor nodes layers when level is absent', function () {
      const chartEl = document.createElement('div');
      const outerNodesEl = document.createElement('ul');
      const outerHierarchyEl = document.createElement('li');
      const innerNodesEl = document.createElement('ul');
      const hierarchyEl = document.createElement('li');
      const data = { id: 'n11', name: 'Parent', relationship: '000' };

      chartEl.className = 'orgchart';
      outerNodesEl.className = 'nodes';
      outerHierarchyEl.className = 'hierarchy';
      innerNodesEl.className = 'nodes';
      hierarchyEl.className = 'hierarchy';
      outerHierarchyEl.appendChild(innerNodesEl);
      innerNodesEl.appendChild(hierarchyEl);
      outerNodesEl.appendChild(outerHierarchyEl);
      chartEl.appendChild(outerNodesEl);
      $container.appendChild(chartEl);

      oc.buildHierarchy(hierarchyEl, data);

      data.level.should.equal(2);
      should.exist(query('#n11', hierarchyEl));
    });

    it('preserves an explicit data.level value', function () {
      const hierarchyEl = document.createElement('li');
      const data = { id: 'n11', name: 'Parent', relationship: '000', level: 7 };

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, data);

      data.level.should.equal(7);
    });

    it('propagates a derived level into grouped family-tree arrays', function () {
      const hierarchyEl = document.createElement('li');
      const familyData = [[
        { id: 'n11', name: 'Spouse A', relationship: '001' },
        { id: 'n12', name: 'Spouse B', relationship: '001', outsider: true }
      ]];

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, familyData);

      familyData[0][0].level.should.equal(0);
      familyData[0][1].level.should.equal(0);
    });

    it('creates spouse, couple, and insider wrappers for family trees', function () {
      const hierarchyEl = document.createElement('li');

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, [[
        { id: 'n11', name: 'Spouse A', relationship: '001', outsider: false },
        { id: 'n12', name: 'Spouse B', relationship: '001', outsider: true },
        { id: 'n13', name: 'Spouse C', relationship: '001', outsider: true }
      ]]);

      queryAll(':scope > .spouse', hierarchyEl).length.should.equal(3);
      queryAll(':scope > .insider', hierarchyEl).length.should.equal(1);
      should.exist(query('#n11', hierarchyEl));
      should.exist(query('#n12', hierarchyEl));
      should.exist(query('#n13', hierarchyEl));
    });

    it('inserts the second spouse after the first one for a couple wrapper', function () {
      const hierarchyEl = document.createElement('li');

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, [[
        { id: 'n11', name: 'Spouse A', relationship: '001', outsider: false },
        { id: 'n12', name: 'Spouse B', relationship: '001', outsider: true }
      ]]);

      queryAll('.node', hierarchyEl).map(function (nodeEl) {
        return nodeEl.id;
      }).should.deep.equal(['n11', 'n12']);
    });

    it('creates descendant nodes when data only contains children metadata', function () {
      const hierarchyEl = document.createElement('li');

      hierarchyEl.className = 'hierarchy';
      oc.buildHierarchy(hierarchyEl, {
        children: [{ id: 'n12', name: 'Child', relationship: '000' }]
      });

      should.equal(query('.node', hierarchyEl).id, 'n12');
      should.exist(query('#n12', hierarchyEl));
    });

    it('returns early when the hierarchy element cannot be resolved', function () {
      should.equal(oc.buildHierarchy(null, { id: 'n11', name: 'Parent' }), undefined);
    });
  });

  describe('buildChildNode()', function () {
    it('returns early when the append target is missing', function () {
      should.equal(oc.buildChildNode(null, [{ id: 'n11', name: 'Child' }]), undefined);
    });

    it('delegates to buildHierarchy() when the parent has no child nodes container', function () {
      const hierarchyEl = document.createElement('li');
      const buildSpy = sinon.spy(oc, 'buildHierarchy');

      hierarchyEl.className = 'hierarchy';
      oc.buildChildNode(hierarchyEl, [{ id: 'n11', name: 'Child' }]);

      buildSpy.should.have.callCount(2);
      buildSpy.firstCall.args[0].should.equal(hierarchyEl);
      buildSpy.firstCall.args[1].should.have.property('children');
      buildSpy.secondCall.args[1].id.should.equal('n11');
      buildSpy.restore();
    });

    it('appends new child hierarchies into an existing child nodes container', function () {
      const hierarchyEl = document.createElement('li');
      const nodeEl = oc.createNode({ id: 'n11', name: 'Parent', relationship: '001', level: 0 });
      const nodesEl = document.createElement('ul');

      hierarchyEl.className = 'hierarchy';
      nodesEl.className = 'nodes';
      hierarchyEl.appendChild(nodeEl);
      hierarchyEl.appendChild(nodesEl);
      oc.buildChildNode(hierarchyEl, [
        { id: 'n12', name: 'Child A', relationship: '000' },
        { id: 'n13', name: 'Child B', relationship: '000' }
      ]);

      queryAll(':scope > .hierarchy', nodesEl).length.should.equal(2);
      should.exist(query('#n12', nodesEl));
      should.exist(query('#n13', nodesEl));
    });
  });

  describe('buildParentNode()', function () {
    it('returns early when the current root cannot be resolved', function () {
      should.equal(oc.buildParentNode(null, { id: 'n0', name: 'Ancestor' }), undefined);
    });

    it('wraps the current root list with a new ancestor hierarchy', function () {
      const currentRootEl = query('#n1', oc.chart);

      oc.buildParentNode(currentRootEl, { id: 'n0', name: 'Ancestor' });

      should.exist(query('#n0', oc.chart));
      query('#n1', oc.chart).closest('.nodes').previousElementSibling.id.should.equal('n0');
      query(':scope > .nodes > .hierarchy > #n0', oc.chart).should.not.equal(null);
    });

    it('defaults the new parent relationship to 001 when absent', function () {
      const currentRootEl = query('#n1', oc.chart);

      oc.buildParentNode(currentRootEl, { id: 'n0', name: 'Ancestor' });

      getState(query('#n0', oc.chart), 'nodeData').relationship.should.equal('001');
    });
  });

  describe('attachExportButton()', function () {
    it('returns early when the chart container has no parent element', function () {
      const detachedContainer = document.createElement('div');
      const chart = new OrgChart({
        data: JSON.parse(JSON.stringify(ds))
      });

      chart.chartContainer = detachedContainer;
      chart.options = Object.assign({}, chart.defaultOptions);

      should.equal(chart.attachExportButton(), undefined);
      should.equal(document.querySelector('.oc-export-btn'), null);
    });

    it('uses exportButtonName as the rendered button text', function () {
      let chart;

      $container.innerHTML = '';
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        exportButton: true,
        exportButtonName: 'Download Chart'
      });

      document.querySelector('.oc-export-btn').textContent.should.equal('Download Chart');
      document.querySelector('.oc-export-btn').remove();
    });
  });

  describe('export helpers', function () {
    it('exportPDF() uses the jsPDF constructor for wide canvases', function () {
      const originalJsPDF = global.jsPDF;
      const originalWindowJsPDF = window.jsPDF;
      const addImageSpy = sinon.spy();
      const saveSpy = sinon.spy();
      const jsPDFSpy = sinon.spy(function () {
        this.addImage = addImageSpy;
        this.save = saveSpy;
      });
      const canvas = {
        width: 500,
        height: 200,
        toDataURL: function () {
          return 'data:image/png;base64,fake';
        }
      };

      global.jsPDF = jsPDFSpy;
      window.jsPDF = jsPDFSpy;

      oc.exportPDF(canvas, 'WideChart');

      jsPDFSpy.should.have.been.calledOnce;
      jsPDFSpy.firstCall.args[0].orientation.should.equal('landscape');
      jsPDFSpy.firstCall.args[0].format.should.deep.equal([500, 200]);
      addImageSpy.should.have.been.calledOnce;
      addImageSpy.should.have.been.calledWith('data:image/png;base64,fake', 'png', 0, 0, 500, 200);
      saveSpy.should.have.been.calledOnce;
      saveSpy.firstCall.args[0].should.equal('WideChart.pdf');

      global.jsPDF = originalJsPDF;
      window.jsPDF = originalWindowJsPDF;
    });

    it('exportPDF() uses portrait for tall canvases', function () {
      const originalJsPDF = global.jsPDF;
      const originalWindowJsPDF = window.jsPDF;
      const addImageSpy = sinon.spy();
      const saveSpy = sinon.spy();
      const jsPDFSpy = sinon.spy(function () {
        this.addImage = addImageSpy;
        this.save = saveSpy;
      });
      const canvas = {
        width: 200,
        height: 500,
        toDataURL: function () {
          return 'data:image/png;base64,fake';
        }
      };

      global.jsPDF = jsPDFSpy;
      window.jsPDF = jsPDFSpy;

      oc.exportPDF(canvas, 'TallChart');

      jsPDFSpy.should.have.been.calledOnce;
      jsPDFSpy.firstCall.args[0].orientation.should.equal('portrait');
      jsPDFSpy.firstCall.args[0].format.should.deep.equal([500, 200]);
      addImageSpy.should.have.been.calledOnce;
      addImageSpy.should.have.been.calledWith('data:image/png;base64,fake', 'png', 0, 0, 200, 500);
      saveSpy.should.have.been.calledOnce;

      global.jsPDF = originalJsPDF;
      window.jsPDF = originalWindowJsPDF;
    });

    it('exportPDF() preserves logical dimensions for high-resolution canvases', function () {
      const originalJsPDF = global.jsPDF;
      const originalWindowJsPDF = window.jsPDF;
      const addImageSpy = sinon.spy();
      const jsPDFSpy = sinon.spy(function () {
        this.addImage = addImageSpy;
        this.save = sinon.spy();
      });
      const canvas = {
        width: 1000,
        height: 400,
        toDataURL: function () {
          return 'data:image/png;base64,fake';
        }
      };

      global.jsPDF = jsPDFSpy;
      window.jsPDF = jsPDFSpy;

      oc.exportPDF(canvas, 'HighResolutionChart', 2);

      jsPDFSpy.firstCall.args[0].format.should.deep.equal([500, 200]);
      addImageSpy.should.have.been.calledWith('data:image/png;base64,fake', 'png', 0, 0, 500, 200);

      global.jsPDF = originalJsPDF;
      window.jsPDF = originalWindowJsPDF;
    });

    it('exportPNG() returns early when the chart container is missing', function () {
      const chart = new OrgChart({ data: JSON.parse(JSON.stringify(ds)) });

      chart.chartContainer = null;
      should.equal(chart.exportPNG({ toDataURL: function () { return ''; } }, 'Missing'), undefined);
    });

    it('exportPNG() uses msSaveBlob on Edge and IE code paths', function () {
      const originalNavigator = window.navigator;
      const canvas = {
        msToBlob: sinon.stub().returns('blob-data')
      };
      const msSaveBlobSpy = sinon.spy();

      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {
          appName: 'Microsoft Internet Explorer',
          appVersion: '11.0',
          msSaveBlob: msSaveBlobSpy
        }
      });

      oc.exportPNG(canvas, 'LegacyExport');

      canvas.msToBlob.should.have.been.calledOnce;
      msSaveBlobSpy.should.have.been.calledOnce;
      msSaveBlobSpy.firstCall.args[1].should.equal('LegacyExport.png');

      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: originalNavigator
      });
    });

    it('exportPNG() creates and reuses a chartClass-scoped download anchor', function () {
      const originalNavigator = window.navigator;
      const originalClick = window.HTMLAnchorElement.prototype.click;
      const originalSidebar = window.sidebar;
      const originalWebkitAppearance = document.documentElement.style.WebkitAppearance;
      const canvas = {
        toDataURL: function () {
          return 'data:image/png;base64,fake';
        }
      };
      const clickSpy = sinon.spy();
      let chart;

      $container.innerHTML = '';
      chart = new OrgChart({
        chartContainer: '#chart-container',
        data: JSON.parse(JSON.stringify(ds)),
        chartClass: 'blue'
      });

      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {
          appName: 'Netscape',
          appVersion: 'Chrome 123'
        }
      });
      Object.defineProperty(window, 'sidebar', {
        configurable: true,
        value: false
      });
      document.documentElement.style.WebkitAppearance = 'none';
      window.HTMLAnchorElement.prototype.click = clickSpy;

      chart.exportPNG(canvas, 'ChartOne');
      chart.exportPNG(canvas, 'ChartTwo');

      queryAll('.download-btn.blue', chart.chartContainer).length.should.equal(1);
      query('.download-btn.blue', chart.chartContainer).getAttribute('download').should.equal('ChartTwo.png');
      clickSpy.callCount.should.equal(2);

      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: originalNavigator
      });
      Object.defineProperty(window, 'sidebar', {
        configurable: true,
        value: originalSidebar
      });
      document.documentElement.style.WebkitAppearance = originalWebkitAppearance;
      window.HTMLAnchorElement.prototype.click = originalClick;
    });

    it('export() returns false when there is no chart container', function () {
      const chart = new OrgChart({ data: JSON.parse(JSON.stringify(ds)) });

      chart.chartContainer = null;
      chart.options = Object.assign({}, chart.defaultOptions);
      chart.export('MissingChart').should.equal(false);
    });

    it('export() creates a mask when one is missing and routes png exports to exportPNG()', function (done) {
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
          options.scale.should.equal(2);
          options.useCORS.should.equal(true);
        } catch (error) {
          global.html2canvas = originalHtml2canvas;
          window.html2canvas = originalWindowHtml2canvas;
          exportPNGStub.restore();
          done(error);
          return { then: function () {} };
        }

        return {
          then: function (resolve) {
            resolve(fakeCanvas);
            return { then: function () {} };
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
          query('.mask', $container).classList.contains('hidden').should.equal(true);
          $container.classList.contains('canvasContainer').should.equal(false);

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

    it('export() reuses an existing mask by unhiding it', function (done) {
      const originalHtml2canvas = global.html2canvas;
      const originalWindowHtml2canvas = window.html2canvas;
      const exportPNGStub = sinon.stub(oc, 'exportPNG');
      const maskEl = document.createElement('div');
      const fakeCanvas = { toDataURL: function () { return 'data:image/png;base64,fake'; } };

      maskEl.className = 'mask hidden';
      $container.appendChild(maskEl);
      global.html2canvas = function () {
        return {
          then: function (resolve) {
            resolve(fakeCanvas);
            return { then: function () {} };
          }
        };
      };
      window.html2canvas = global.html2canvas;

      oc.export('ReuseMask');

      setTimeout(function () {
        try {
          maskEl.classList.contains('hidden').should.equal(true);
          exportPNGStub.should.have.been.calledOnce;

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

    it('export() swaps width and height for horizontal charts', function (done) {
      const originalHtml2canvas = global.html2canvas;
      const originalWindowHtml2canvas = window.html2canvas;
      const exportPNGStub = sinon.stub(oc, 'exportPNG');
      const fakeCanvas = { toDataURL: function () { return 'data:image/png;base64,fake'; } };

      Object.defineProperty(oc.chart, 'clientWidth', { configurable: true, value: 300 });
      Object.defineProperty(oc.chart, 'clientHeight', { configurable: true, value: 120 });
      oc.options.direction = 'l2r';
      global.html2canvas = function (element, options) {
        try {
          options.width.should.equal(120);
          options.height.should.equal(300);
        } catch (error) {
          global.html2canvas = originalHtml2canvas;
          window.html2canvas = originalWindowHtml2canvas;
          exportPNGStub.restore();
          done(error);
          return { then: function () {} };
        }

        return {
          then: function (resolve) {
            resolve(fakeCanvas);
            return { then: function () {} };
          }
        };
      };
      window.html2canvas = global.html2canvas;

      oc.export('Horizontal');

      setTimeout(function () {
        try {
          exportPNGStub.should.have.been.calledOnce;

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

    it('export() clears cloned chart transforms inside onclone()', function (done) {
      const originalHtml2canvas = global.html2canvas;
      const originalWindowHtml2canvas = window.html2canvas;
      const exportPNGStub = sinon.stub(oc, 'exportPNG');
      const fakeCanvas = { toDataURL: function () { return 'data:image/png;base64,fake'; } };
      const clonedContainer = document.createElement('div');
      const clonedChart = document.createElement('div');

      clonedContainer.className = 'canvasContainer';
      clonedChart.className = 'orgchart';
      clonedChart.style.transform = 'matrix(1, 0, 0, 1, 10, 20)';
      clonedContainer.appendChild(clonedChart);

      global.html2canvas = function (element, options) {
        options.onclone({ querySelector: function (selector) {
          return selector === '.canvasContainer' ? clonedContainer : null;
        } });
        return {
          then: function (resolve) {
            resolve(fakeCanvas);
            return { then: function () {} };
          }
        };
      };
      window.html2canvas = global.html2canvas;

      oc.export('CloneCleanup');

      setTimeout(function () {
        try {
          clonedContainer.style.overflow.should.equal('visible');
          clonedChart.style.transform.should.equal('');
          exportPNGStub.should.have.been.calledOnce;

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

    it('export() routes pdf exports to exportPDF()', function (done) {
      const originalHtml2canvas = global.html2canvas;
      const originalWindowHtml2canvas = window.html2canvas;
      const exportPDFStub = sinon.stub(oc, 'exportPDF');
      const fakeCanvas = { toDataURL: function () { return 'data:image/png;base64,fake'; } };

      global.html2canvas = function () {
        return {
          then: function (resolve) {
            resolve(fakeCanvas);
            return { then: function () {} };
          }
        };
      };
      window.html2canvas = global.html2canvas;

      oc.export('PdfExport', 'pdf');

      setTimeout(function () {
        try {
          exportPDFStub.should.have.been.calledOnce;
          exportPDFStub.firstCall.args[0].should.equal(fakeCanvas);
          exportPDFStub.firstCall.args[1].should.equal('PdfExport');

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
});
