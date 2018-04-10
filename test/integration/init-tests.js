var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var should = chai.should();
chai.use(sinonChai);
require('jsdom-global')();
var $ = require('jquery');
require('../../src/js/jquery.orgchart');

describe('orgchart -- integration tests', function () {
  document.body.innerHTML = '<div id="chart-container"></div>';
  var $container = $('#chart-container'),
  ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao' },
      { 'id': 'n3', 'name': 'Su Miao' }
    ]
  },
  fragment = '<div class="orgchart"><table><tr><td colspan="4"><div id="n1" class="node">' +
    '<div class="title"><i class="fa fa-users symbol"></i>Lao Lao</div><i class="edge verticalEdge bottomEdge fa"></i></div>' +
    '</td></tr><tr class="lines"><td colspan="4"><div class="downLine"></div></td></tr>' +
    '<tr class="lines"><td class="rightLine"></td><td class="leftLine topLine"></td>' +
    '<td class="rightLine topLine"></td><td class="leftLine"></td></tr><tr class="nodes"><td colspan="2"><table><tr><td>' +
    '<div id="n2" data-parent="n1" class="node"><div class="title">Bo Miao</div><i class="edge verticalEdge topEdge fa"></i>' +
    '<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i></div></td></tr></table></td>' +
    '<td colspan="2"><table><tr><td><div id="n3" data-parent="n1" class="node"><div class="title">Su Miao</div>' +
    '<i class="edge verticalEdge topEdge fa"></i><i class="edge horizontalEdge rightEdge fa"></i>' +
    '<i class="edge horizontalEdge leftEdge fa"></i></div></td></tr></table></td></tr></table></div>',
  oc = {};
    
  afterEach(function () {
    $container.empty();
  });

  describe('init()', function () {
    it('initialize chart with json datasource', function () {
      oc = $container.orgchart({
        'data': ds
      });
      $container.html().should.equal(fragment);
    });

    it('initialize chart with <ul> datasource', function () {
      var $ul = $(
        '<ul id="ul-data">' +
          '<li data-id="n1">Lao Lao' +
            '<ul>' +
              '<li data-id="n2">Bo Miao</li>' +
              '<li data-id="n3">Su Miao</li>' +
              '</ul>' +
          '</li>' +
        '</ul>'
      );
      $('body').append($ul);
      oc = $container.orgchart({
        'data': $('#ul-data')
      });
      $container.html().should.equal(fragment);
      $ul.remove();
    });

    it('initialize chart with the given visible level', function () {
      oc = $container.orgchart({
        'data': ds,
        'visibleLevel': 1
      });
      oc.$chart.find('tr').eq(0).is('.hidden').should.be.false;
      oc.$chart.find('tr').eq(1).is('.hidden').should.be.true;
      oc.$chart.find('tr').eq(2).is('.hidden').should.be.true;
      oc.$chart.find('tr').eq(3).is('.hidden').should.be.true;
    });

    it('initialize chart with the given vertical level', function () {
      var fragment = 
        '<tr class="verticalNodes">' +
         '<td>' +
           '<ul>' +
             '<li><div id="n2" data-parent="n1" class="node"><div class="title">Bo Miao</div></div></li>' +
             '<li><div id="n3" data-parent="n1" class="node"><div class="title">Su Miao</div></div></li>' +
            '</ul>'+
          '</td>'+
        '</tr>';
      oc = $container.orgchart({
        'data': ds,
        'verticalLevel': 2
      });
      oc.$chart.find('tr').eq(1).prop('outerHTML').should.equal(fragment);
    });

    context('initialize chart with various combinations of "visibleLevel" and "verticalLevel" ', function () {
      var ds = {
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
        var fragment = '<div class="orgchart"><table><tr><td colspan="4"><div class="node"><div class="title"><i class="fa fa-users symbol"></i>Lao Lao</div>' +
          '<i class="edge verticalEdge bottomEdge fa"></i></div></td></tr><tr class="verticalNodes hidden"><td><ul><li><div class="node slide-up">' +
          '<div class="title">Bo Miao</div></div></li><li><div class="node slide-up"><div class="title">Su Miao</div>' +
          '<i class="toggleBtn fa fa-plus-square"></i></div><ul class="hidden"><li><div class="node slide-up"><div class="title">Tie Hua</div></div></li>' +
          '<li><div class="node slide-up"><div class="title">Hei Hei</div></div></li></ul></li></ul></td></tr></table></div>';
        oc = $container.orgchart({
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 1
        });
        $container.html().should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=2', function () {
        var fragment = '<div class="orgchart"><table><tr><td colspan="4"><div class="node"><div class="title"><i class="fa fa-users symbol"></i>Lao Lao</div>' +
          '<i class="edge verticalEdge bottomEdge fa"></i></div></td></tr><tr class="verticalNodes"><td><ul><li><div class="node">' +
          '<div class="title">Bo Miao</div></div></li><li><div class="node"><div class="title">Su Miao</div><i class="toggleBtn fa fa-plus-square"></i></div>' +
          '<ul class="hidden"><li><div class="node slide-up"><div class="title">Tie Hua</div></div></li><li><div class="node slide-up">' +
          '<div class="title">Hei Hei</div></div></li></ul></li></ul></td></tr></table></div>';
        oc = $container.orgchart({
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 2
        });
        $container.html().should.equal(fragment);
      });

      it('verticalLevel=2 and visibleLevel=3', function () {
        var fragment = '<div class="orgchart"><table><tr><td colspan="4"><div class="node"><div class="title"><i class="fa fa-users symbol"></i>Lao Lao</div>' +
          '<i class="edge verticalEdge bottomEdge fa"></i></div></td></tr><tr class="verticalNodes"><td><ul><li><div class="node">' +
          '<div class="title">Bo Miao</div></div></li><li><div class="node"><div class="title">Su Miao</div><i class="toggleBtn fa fa-minus-square"></i></div>' +
          '<ul><li><div class="node"><div class="title">Tie Hua</div></div></li><li><div class="node"><div class="title">Hei Hei</div></div>' +
          '</li></ul></li></ul></td></tr></table></div>';
        oc = $container.orgchart({
          'data': ds,
          'verticalLevel': 2,
          'visibleLevel': 3
        });
        $container.html().should.equal(fragment);
      });
    });

    it('initCompleted should be invoked immediately after construting one node', function () {
      var spy = sinon.spy();
      oc = $container.orgchart({
        'data': ds,
        'createNode': spy
      });
      spy.should.have.been.callCount(3);
      spy.should.have.been.calledWithMatch($('#n1'),{ 'id': 'n1', 'name': 'Lao Lao' });
      spy.should.have.been.calledWithMatch($('#n2'),{ 'id': 'n2', 'name': 'Bo Miao' });
      spy.should.have.been.calledWithMatch($('#n3'),{ 'id': 'n3', 'name': 'Su Miao' });
      // spy.should.always.have.been.calledOn(oc);
    });

    it('initialize chart with default className', function () {
      oc = $container.orgchart({
        'data': ds,
        'chartClass': 'demo'
      });
      oc.$chart.is('.demo').should.be.true;
    });

    it('initialize chart with export button', function () {
      oc = $container.orgchart({
        'data': ds,
        'exportButton': true
      });
      $container.children('button').prop('outerHTML').should.equal('<button class="oc-export-btn">Export</button>');
    });

    it('initialize chart with "bottom to top" direction', function () {
      oc = $container.orgchart({
        'data': ds,
        'direction': 'b2t'
      });
      oc.$chart.is('.b2t').should.be.true;
    });

    it('reinitialize chart with drggable feature', function () {
      oc = $container.orgchart({
        'data': ds
      });
      var spy = sinon.spy(oc, 'bindDragDrop');
      oc.init({ 'draggable': true });
      spy.should.have.been.callCount(3);
      spy.should.have.been.calledWith($('#n1'));
      spy.should.have.been.calledWithMatch($('#n2'));
      spy.should.have.been.calledWithMatch($('#n3'));
    });

    it('reinitialize chart with pan feature', function () {
      oc = $container.orgchart({
        'data': ds
      });
      var spy = sinon.spy(oc, 'bindPan');
      oc.init({ 'pan': true });
      spy.should.have.been.callCount(1);
    });

    it('reinitialize chart with zoom feature', function () {
      oc = $container.orgchart({
        'data': ds
      });
      var spy = sinon.spy(oc, 'bindZoom');
      oc.init({ 'zoom': true });
      spy.should.have.been.callCount(1);
    });
  });

});