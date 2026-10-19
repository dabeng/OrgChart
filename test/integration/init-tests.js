const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai').default;
const should = chai.should();
chai.use(sinonChai);
require('jsdom-global')();
const OrgChart = require('../../src/js/orgchart');

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

describe('orgchart -- integration tests', function () {
  let container;

  const ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao' },
      { 'id': 'n3', 'name': 'Su Miao' }
    ]
  };

  const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy"><div id="n1" class="node" tabindex="0"><div clas' +
    's="title"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div></div><ul class="nodes"><li class="hierarc' +
    'hy"><div id="n2" data-parent="n1" class="node" tabindex="0"><div class="title">Bo Miao</div></div></li><li cla' +
    'ss="hierarchy"><div id="n3" data-parent="n1" class="node" tabindex="0"><div class="title">Su Miao</div></div><' +
    '/li></ul></li></ul></div>';

  let oc = {};

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-container"></div>';
    container = document.getElementById('chart-container');
  });

  afterEach(function () {
    container.innerHTML = '';
  });

  describe('init()', function () {
    it('initialize chart with json datasource', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds
      });
      container.innerHTML.should.equal(fragment);
    });

    it('initializes the same chart from unordered flat parent_id rows without modifying them', function () {
      const rows = [
        { id: 'n2', name: 'Bo Miao', parent_id: 'n1' },
        { id: 'n1', name: 'Lao Lao', parent_id: null },
        { id: 'n3', name: 'Su Miao', parent_id: 'n1' }
      ];
      const original = JSON.stringify(rows);
      oc = new OrgChart({ chartContainer: container, data: rows });

      container.innerHTML.should.equal(fragment);
      JSON.stringify(rows).should.equal(original);
      oc.getChildren(query('#n1', oc.chart)).map(function (node) { return node.id; }).should.deep.equal(['n2', 'n3']);
    });

    it('preserves custom flat datasource fields and node identifiers', function () {
      oc = new OrgChart({
        chartContainer: container,
        nodeId: 'key',
        nodeTitle: 'label',
        nodeContent: 'role',
        data: [
          { key: 2, parent_id: '1', label: 'Engineer', role: 'Platform' },
          { key: 1, parent_id: null, label: 'Director', role: 'Operations' }
        ]
      });

      query('[id="1"] .title', oc.chart).textContent.should.equal('Director');
      query('[id="2"] .content', oc.chart).textContent.should.equal('Platform');
      oc.getParent(query('[id="2"]', oc.chart)).id.should.equal('1');
      oc.setOptions({ direction: 'l2r' });
      oc.getParent(query('[id="2"]', oc.chart)).id.should.equal('1');
      oc.chart.classList.contains('l2r').should.be.true;
    });

    it('rejects flat datasource cycles before replacing an existing chart', function () {
      oc = new OrgChart({ chartContainer: container, data: ds });
      const chart = oc.chart;

      (() => oc.init({ data: [
        { id: 'root', name: 'Root', parent_id: null },
        { id: 'a', name: 'A', parent_id: 'b' },
        { id: 'b', name: 'B', parent_id: 'a' }
      ] })).should.throw('Flat datasource contains a cycle');

      oc.chart.should.equal(chart);
      container.innerHTML.should.equal(fragment);
    });

    it('supports zero IDs and an omitted root parent_id in flat datasource rows', function () {
      oc = new OrgChart({ chartContainer: container, data: [
        { id: 1, parent_id: 0, name: 'Child' },
        { id: 0, name: 'Root' }
      ] });

      query('[id="0"] .title', oc.chart).textContent.should.equal('Root');
      query('[id="1"]', oc.chart).getAttribute('data-parent').should.equal('0');
      oc.getParent(query('[id="1"]', oc.chart)).id.should.equal('0');
    });

    it('renders no nodes for an empty flat datasource', function () {
      oc = new OrgChart({ chartContainer: container, data: [] });

      queryAll('.node', oc.chart).should.have.lengthOf(0);
    });

    [
      { direction: 't2b' },
      { direction: 'b2t' },
      { direction: 'l2r' },
      { direction: 'r2l' },
      { verticalLevel: 2, visibleLevel: 1 },
      { compact: true, visibleLevel: 2 }
    ].forEach(function (options) {
      it('renders flat and nested datasource identically with ' + JSON.stringify(options), function () {
        oc = new OrgChart(Object.assign({ chartContainer: container, data: {
          id: 'root', name: 'Root', children: [
            { id: 'a', name: 'A', children: [{ id: 'child', name: 'Child' }] },
            { id: 'b', name: 'B' }
          ]
        } }, options));
        const markup = oc.chart.outerHTML;

        oc.init({ data: [
          { id: 'child', parent_id: 'a', name: 'Child' },
          { id: 'a', parent_id: 'root', name: 'A' },
          { id: 'b', parent_id: 'root', name: 'B' },
          { id: 'root', parent_id: null, name: 'Root' }
        ] });

        oc.chart.outerHTML.should.equal(markup);
      });
    });

    it('retains edits to a normalized flat datasource when options change and accepts replacement rows', function () {
      const rows = [
        { id: 'n1', name: 'Root', parent_id: null },
        { id: 'n2', name: 'Child', parent_id: 'n1' }
      ];
      oc = new OrgChart({ chartContainer: container, data: rows });
      oc.addChildren(query('#n2', oc.chart), [{ id: 'n3', name: 'Grandchild' }]);
      oc.setOptions({ compact: true, direction: 'r2l' });

      oc.getParent(query('#n3', oc.chart)).id.should.equal('n2');
      rows.should.have.lengthOf(2);
      should.not.exist(rows[1].children);

      oc.init({ data: [{ id: 'replacement', name: 'Replacement', parent_id: null }] });
      queryAll('.node', oc.chart).should.have.lengthOf(1);
      should.exist(query('#replacement', oc.chart));
    });

    [
      { name: 'duplicate IDs', rows: [{ id: 1, parent_id: null }, { id: '1', parent_id: 1 }], error: 'Duplicate node ID' },
      { name: 'missing parents', rows: [{ id: 1, parent_id: null }, { id: 2, parent_id: 99 }], error: 'Missing parent' },
      { name: 'multiple roots', rows: [{ id: 1, parent_id: null }, { id: 2, parent_id: null }], error: 'exactly one root' },
      { name: 'no root', rows: [{ id: 1, parent_id: 1 }], error: 'exactly one root' },
      { name: 'missing IDs', rows: [{ name: 'Root', parent_id: null }], error: 'node ID' },
      { name: 'invalid rows', rows: [null], error: 'node ID' },
      { name: 'non-finite IDs', rows: [{ id: NaN, parent_id: null }], error: 'node ID' }
    ].forEach(function (scenario) {
      it('rejects ' + scenario.name + ' in a flat datasource', function () {
        (() => new OrgChart({ chartContainer: container, data: scenario.rows })).should.throw(scenario.error);
        queryAll('.orgchart', container).should.have.lengthOf(0);
      });
    });

    it('initialize chart with <ul> datasource', function () {
      const ulElement = createElementFromHtml(
        '<ul id="ul-data">' +
          '<li data-id="n1">Lao Lao' +
            '<ul>' +
              '<li data-id="n2">Bo Miao</li>' +
              '<li data-id="n3">Su Miao</li>' +
              '</ul>' +
          '</li>' +
        '</ul>'
      );
      document.body.appendChild(ulElement);
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ulElement
      });
      container.innerHTML.should.equal(fragment);
      ulElement.remove();
    });

    it('initialize chart with the given visible level', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'visibleLevel': 1
      });
      query('.hierarchy', oc.chart).classList.contains('hidden').should.be.false;
      queryAll('.nodes', oc.chart)[1].classList.contains('hidden').should.be.true;
      queryAll('.node.slide-up', oc.chart).should.lengthOf(2);
    });

    it('initialize chart with the given vertical level', function () {
      const fragment = '<li class="hierarchy"><div id="n1" class="node" tabindex="0"><div class="title"><i class="oci oci-menu parentN' +
        'odeSymbol"></i>Lao Lao</div></div><ul class="nodes vertical"><li class="hierarchy"><div id="n2" data-parent="n' +
        '1" class="node" tabindex="0"><div class="title">Bo Miao</div></div></li><li class="hierarchy"><div id="n3" dat' +
        'a-parent="n1" class="node" tabindex="0"><div class="title">Su Miao</div></div></li></ul></li>';
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'verticalLevel': 2
      });
      query('.nodes', oc.chart).innerHTML.should.equal(fragment);
    });

    context('initialize chart with various combinations of "visibleLevel" and "verticalLevel" ', function () {
      const ds = {
        'name': 'Lao Lao',
        'children': [
          { 'name': 'Bo Miao'
          },
          { 'name': 'Su Miao',
            'children': [
              { 'name': 'Tie Hua' },
              { 'name': 'Hei Hei' }
            ]
          }
        ]
      };

      it('verticalLevel=2 and visibleLevel=1', function () {
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy"><div class="node" tabindex="0"><div class="title' +
          '"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div></div><ul class="nodes hidden vertical"><li class=' +
          '"hierarchy"><div class="node slide-up" tabindex="0"><div class="title">Bo Miao</div></div></li><li class="hier' +
          'archy"><div class="node slide-up" tabindex="0"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i' +
          '>Su Miao</div></div><ul class="nodes hidden"><li class="hierarchy"><div class="node slide-up" tabindex="0"><di' +
          'v class="title">Tie Hua</div></div></li><li class="hierarchy"><div class="node slide-up" tabindex="0"><div cla' +
          'ss="title">Hei Hei</div></div></li></ul></li></ul></li></ul></div>';
        oc = new OrgChart({
          chartContainer: '#chart-container',
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 1
        });
        container.innerHTML.should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=2', function () {
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy"><div class="node" tabindex="0"><div class="title' +
          '"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div></div><ul class="nodes vertical"><li class="hierar' +
          'chy"><div class="node" tabindex="0"><div class="title">Bo Miao</div></div></li><li class="hierarchy"><div clas' +
          's="node" tabindex="0"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Su Miao</div></div><ul c' +
          'lass="nodes hidden"><li class="hierarchy"><div class="node slide-up" tabindex="0"><div class="title">Tie Hua</' +
          'div></div></li><li class="hierarchy"><div class="node slide-up" tabindex="0"><div class="title">Hei Hei</div><' +
          '/div></li></ul></li></ul></li></ul></div>';
        oc = new OrgChart({
          chartContainer: '#chart-container',
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 2
        });
        container.innerHTML.should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=3', function () {
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy"><div class="node" tabindex="0"><div class="title' +
          '"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div></div><ul class="nodes vertical"><li class="hierar' +
          'chy"><div class="node" tabindex="0"><div class="title">Bo Miao</div></div></li><li class="hierarchy"><div clas' +
          's="node" tabindex="0"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Su Miao</div></div><ul c' +
          'lass="nodes"><li class="hierarchy"><div class="node" tabindex="0"><div class="title">Tie Hua</div></div></li><' +
          'li class="hierarchy"><div class="node" tabindex="0"><div class="title">Hei Hei</div></div></li></ul></li></ul>' +
          '</li></ul></div>';
        oc = new OrgChart({
          chartContainer: '#chart-container',
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 3
        });
        container.innerHTML.should.equal(fragment);
      });
    });

    it('initCompleted should be invoked immediately after construting one node', function () {
      const spy = sinon.spy();
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'createNode': spy
      });
      spy.should.have.been.callCount(3);
      spy.getCall(0).args[0].id.should.equal('n1');
      spy.getCall(0).args[1].id.should.equal('n1');
      spy.getCall(1).args[0].id.should.equal('n2');
      spy.getCall(1).args[1].id.should.equal('n2');
      spy.getCall(2).args[0].id.should.equal('n3');
      spy.getCall(2).args[1].id.should.equal('n3');
      // spy.should.always.have.been.calledOn(oc);
    });

    it('renders custom data fields and invokes createNode after the node markup is built', function () {
      const createNode = sinon.spy(function (nodeElement, data) {
        nodeElement.setAttribute('data-role', data.role);
      });

      oc = new OrgChart({
        chartContainer: '#chart-container',
        data: {
          key: 'n1',
          label: 'Director',
          role: 'Operations',
          children: [{ key: 'n2', label: 'Engineer', role: 'Platform' }]
        },
        nodeId: 'key',
        nodeTitle: 'label',
        nodeContent: 'role',
        createNode: createNode
      });

      query('#n1 .title', oc.chart).textContent.should.equal('Director');
      query('#n1 .content', oc.chart).textContent.should.equal('Operations');
      query('#n2', oc.chart).getAttribute('data-role').should.equal('Platform');
      createNode.should.have.been.calledTwice;
      createNode.firstCall.args[0].querySelector('.title').textContent.should.equal('Director');
    });

    it('renders custom node templates instead of the default title and content markup', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        nodeTemplate: function (data) {
          return '<section class="employee-card" data-name="' + data.name + '">' + data.name + '</section>';
        }
      });

      query('#n1 .employee-card', oc.chart).getAttribute('data-name').should.equal('Lao Lao');
      query('#n2 .employee-card', oc.chart).textContent.should.equal('Bo Miao');
      should.not.exist(query('#n1 > .title', oc.chart));
    });

    it('dispatches init.orgchart after initCompleted receives the rendered chart', function (done) {
      const initCompleted = sinon.spy(function (chartElement) {
        chartElement.addEventListener('init.orgchart', function () {
          initCompleted.should.have.been.calledOnce;
          initCompleted.firstCall.args[0].should.equal(chartElement);
          done();
        }, { once: true });
      });

      oc = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        initCompleted: initCompleted
      });
    });

    it('initialize chart with default className', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'chartClass': 'demo'
      });
      oc.chart.classList.contains('demo').should.be.true;
    });

    it('initialize chart with export button', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'exportButton': true
      });
      query('.oc-export-btn').outerHTML.should.equal('<button class="oc-export-btn">Export</button>');
    });

    it('initialize chart with "bottom to top" direction', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds,
        'direction': 'b2t'
      });
      oc.chart.classList.contains('b2t').should.be.true;
    });

    it('applies horizontal direction classes', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        data: ds,
        direction: 'l2r'
      });
      oc.chart.classList.contains('l2r').should.be.true;

      oc.init({ direction: 'r2l' });
      oc.chart.classList.contains('r2l').should.be.true;
      oc.chart.classList.contains('l2r').should.be.false;
    });

    it('reinitialize chart with drggable feature', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds
      });
      const spy = sinon.spy(oc, 'bindDragDrop');
      oc.init({ 'draggable': true });
      spy.should.have.been.callCount(3);
      spy.getCall(0).args[0].id.should.equal('n1');
      spy.getCall(1).args[0].id.should.equal('n2');
      spy.getCall(2).args[0].id.should.equal('n3');
    });

    it('reinitialize chart with pan feature', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds
      });
      const spy = sinon.spy(oc, 'bindPan');
      oc.init({ 'pan': true });
      spy.should.have.been.callCount(1);
    });

    it('reinitialize chart with zoom feature', function () {
      oc = new OrgChart({
        chartContainer: '#chart-container',
        'data': ds
      });
      const spy = sinon.spy(oc, 'bindZoom');
      oc.init({ 'zoom': true });
      spy.should.have.been.callCount(1);
    });
  });
});
