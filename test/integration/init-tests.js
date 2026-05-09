const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
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

  const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy">' +
    '<div id="n1" class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol">' +
    '</i>Lao Lao</div><i class="edge verticalEdge bottomEdge oci"></i></div><ul class="nodes">' +
    '<li class="hierarchy"><div id="n2" data-parent="n1" class="node">' +
    '<div class="title">Bo Miao</div><i class="edge verticalEdge topEdge oci"></i>' +
    '<i class="edge horizontalEdge rightEdge oci"></i><i class="edge horizontalEdge leftEdge oci">' +
    '</i></div></li><li class="hierarchy"><div id="n3" data-parent="n1" class="node">' +
    '<div class="title">Su Miao</div><i class="edge verticalEdge topEdge oci"></i>' +
    '<i class="edge horizontalEdge rightEdge oci"></i><i class="edge horizontalEdge leftEdge oci">' +
    '</i></div></li></ul></li></ul></div>';

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
      const fragment = '<li class="hierarchy"><div id="n1" class="node"><div class="title">' +
        '<i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div><i class="edge verticalEdge bottomEdge oci">' +
        '</i></div><ul class="nodes vertical"><li class="hierarchy"><div id="n2" data-parent="n1" class="node">' +
        '<div class="title">Bo Miao</div></div></li><li class="hierarchy"><div id="n3" data-parent="n1" class="node">' +
        '<div class="title">Su Miao</div></div></li></ul></li>';
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
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy">' +
          '<div class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol">' +
          '</i>Lao Lao</div><i class="edge verticalEdge bottomEdge oci"></i></div>' +
          '<ul class="nodes hidden vertical"><li class="hierarchy"><div class="node slide-up">' +
          '<div class="title">Bo Miao</div></div></li><li class="hierarchy">' +
          '<div class="node slide-up"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Su Miao</div>' +
          '<i class="toggleBtn oci"></i></div><ul class="nodes hidden">' +
          '<li class="hierarchy"><div class="node slide-up"><div class="title">Tie Hua</div>' +
          '</div></li><li class="hierarchy"><div class="node slide-up">' +
          '<div class="title">Hei Hei</div></div></li></ul></li></ul></li></ul></div>';
        oc = new OrgChart({
          chartContainer: '#chart-container',
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 1
        });
        container.innerHTML.should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=2', function () {
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy">' +
          '<div class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div>' +
          '<i class="edge verticalEdge bottomEdge oci"></i></div><ul class="nodes vertical">' +
          '<li class="hierarchy"><div class="node"><div class="title">Bo Miao</div></div></li>' +
          '<li class="hierarchy"><div class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Su Miao</div>' +
          '<i class="toggleBtn oci"></i></div><ul class="nodes hidden">' +
          '<li class="hierarchy"><div class="node slide-up"><div class="title">Tie Hua</div></div>' +
          '</li><li class="hierarchy"><div class="node slide-up"><div class="title">Hei Hei</div>' +
          '</div></li></ul></li></ul></li></ul></div>';
        oc = new OrgChart({
          chartContainer: '#chart-container',
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 2
        });
        container.innerHTML.should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=3', function () {
        const fragment = '<div class="orgchart"><ul class="nodes"><li class="hierarchy">' +
          '<div class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Lao Lao</div>' +
          '<i class="edge verticalEdge bottomEdge oci"></i></div><ul class="nodes vertical">' +
          '<li class="hierarchy"><div class="node"><div class="title">Bo Miao</div></div></li>' +
          '<li class="hierarchy"><div class="node"><div class="title"><i class="oci oci-menu parentNodeSymbol"></i>Su Miao</div>' +
          '<i class="toggleBtn oci"></i></div><ul class="nodes">' +
          '<li class="hierarchy"><div class="node"><div class="title">Tie Hua</div></div>' +
          '</li><li class="hierarchy"><div class="node"><div class="title">Hei Hei</div></div>' +
          '</li></ul></li></ul></li></ul></div>';
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
