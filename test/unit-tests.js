var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);
var jsdom = require("jsdom");
var { JSDOM } = jsdom;
var dom = new JSDOM('<!doctype html><html><body><div id="chart-container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
var $ = require('jquery');
require('../src/js/jquery.orgchart');

describe('orgchart -- unit tests', function () {

  var $container = $('#chart-container'),
  ds = {
    'id': '1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': '2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': '3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': '6', 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'id': '7', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': '9', 'name': 'Dan Dan', 'title': 'engineer',
                'children' : [
                  { 'id': '10', 'name': 'Er Dan', 'title': 'intern' }
                ]
              }
            ]
          },
          { 'id': '8', 'name': 'Pang Pang', 'title': 'senior engineer' }
        ]
      },
      { 'id': '4', 'name': 'Hong Miao', 'title': 'department manager' },
      { 'id': '5', 'name': 'Chun Miao', 'title': 'department manager' }
    ]
  },
  oc = {},
  hierarchy = {
    id: '1',
    children: [
      { id: '2' },
      { id: '3',
        children: [
          { id: '6' },
          { id: '7',
            children: [
              { id: '9',
                children: [
                  { id: '10' }
                ]
              }
            ]
          },
          { id: '8' }
        ]
      },
      { id: '4' },
      { id: '5' }
    ]
  },
  $root,
  $bomiao,
  $sumiao,
  $hongmiao,
  $chunmiao,
  $tiehua,
  $heihei,
  $pangpang,
  $dandan,
  $erdan;

  beforeEach(function () {
    oc = $('#chart-container').orgchart({
      'data': ds,
      'nodeContent': 'title'
    }),
    $root = $('#1'),
    $bomiao = $('#2'),
    $sumiao = $('#3'),
    $hongmiao = $('#4'),
    $chunmiao = $('#5'),
    $tiehua = $('#6'),
    $heihei = $('#7'),
    $pangpang = $('#8'),
    $dandan = $('#9'),
    $erdan = $('#10');
  });
    
  afterEach(function () {
    $root = $bomiao = $sumiao = $hongmiao = $chunmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = null;
    $container.empty();
  });

  it('loopChart() works well', function () {
    oc.loopChart($('.orgchart')).should.deep.equal(hierarchy);
  });

  it('getHierarchy() works well', function () {
    oc.getHierarchy().should.deep.equal(hierarchy);

    var oc2 = $('#chart-container').orgchart({
      'data': { name: 'Lao Lao',
        'children': [
          { name: 'Bo Miao' }
        ]
      }
    });
    oc2.getHierarchy().should.include('Error');
    oc2.$chart.empty();
    oc2.getHierarchy().should.include('Error');
    oc2.$chart = undefined;
    oc2.getHierarchy().should.include('Error');
  });

  it('getNodeState() works well', function () {
    oc.init({ 'depth': 2 }).$chart.on('init.orgchart', function () {
      oc.getNodeState($root, 'parent').should.deep.equal({ 'exist': false, 'visible': false });
      oc.getNodeState($root, 'children').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($root, 'siblings').should.deep.equal({ 'exist': false, 'visible': false });

      oc.getNodeState($bomiao, 'parent').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($bomiao, 'children').should.deep.equal({ 'exist': false, 'visible': false });
      oc.getNodeState($bomiao, 'siblings').should.deep.equal({ 'exist': true, 'visible': true });

      oc.getNodeState($sumiao, 'parent').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($sumiao, 'children').should.deep.equal({ 'exist': true, 'visible': false });
      oc.getNodeState($sumiao, 'siblings').should.deep.equal({ 'exist': true, 'visible': true });

      oc.getNodeState($tiehua, 'parent').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($tiehua, 'children').should.deep.equal({ 'exist': false, 'visible': false });
      oc.getNodeState($tiehua, 'siblings').should.deep.equal({ 'exist': true, 'visible': false });

      oc.getNodeState($heihei, 'parent').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($heihei, 'children').should.deep.equal({ 'exist': true, 'visible': false });
      oc.getNodeState($heihei, 'siblings').should.deep.equal({ 'exist': true, 'visible': false });

      oc.getNodeState($pangpang, 'parent').should.deep.equal({ 'exist': true, 'visible': false });
      oc.getNodeState($pangpang, 'children').should.deep.equal({ 'exist': true, 'visible': false });
      oc.getNodeState($pangpang, 'siblings').should.deep.equal({ 'exist': false, 'visible': false });

      oc.getNodeState($dandan, 'parent').should.deep.equal({ 'exist': true, 'visible': false });
      oc.getNodeState($dandan, 'children').should.deep.equal({ 'exist': false, 'visible': false });
      oc.getNodeState($dandan, 'siblings').should.deep.equal({ 'exist': false, 'visible': false });
    });
  });

  it('getRelatedNodes() works well', function () {
    oc.getRelatedNodes().should.deep.equal($());
    oc.getRelatedNodes($('td:first'), 'children').should.deep.equal($());
    oc.getRelatedNodes($('.node:first'), 'child').should.deep.equal($());

    oc.getRelatedNodes($root, 'parent').should.deep.equal($());
    oc.getRelatedNodes($root, 'children').toArray().should.members([$bomiao[0], $sumiao[0], $hongmiao[0], $chunmiao[0]]);
    oc.getRelatedNodes($root, 'siblings').should.deep.equal($());

    oc.getRelatedNodes($bomiao, 'parent').should.deep.equal($root);
    oc.getRelatedNodes($bomiao, 'children').should.have.lengthOf(0);
    oc.getRelatedNodes($bomiao, 'siblings').toArray().should.members([$sumiao[0], $hongmiao[0], $chunmiao[0]]);
  });

  it('hideParent() works well', function () {
    var spy = sinon.spy(oc, 'hideSiblings');
    oc.hideParent($heihei);
    spy.should.have.been.callCount(2);
    oc.hideParentEnd({ 'target': $sumiao[0], 'data': { 'upperLevel': $heihei.closest('.nodes').siblings() } });
    oc.hideParentEnd({ 'target': $root[0], 'data': { 'upperLevel': $sumiao.closest('.nodes').siblings() } });

    $heihei.parents('.nodes').each(function () {
      $(this).siblings().filter('.hidden').should.lengthOf(3);
    });
    $sumiao.is('.slide-down').should.be.true;
    $root.is('.slide-down').should.be.true;
  });

  it('showParent() works well', function () {
    var spy = sinon.spy(oc, 'repaint');
    $root.add($sumiao).closest('tr').nextUntil('.nodes').addBack().addClass('hidden');
    oc.showParent($heihei);
    spy.should.have.been.called;
    var $upperLevel = $heihei.closest('.nodes').siblings();
    $upperLevel.filter('.hidden').should.lengthOf(0);
    var $lines = $upperLevel.eq(2).children();
    $lines.first().is('.hidden').should.be.false;
    $lines.last().is('.hidden').should.be.false;
    $lines.filter('.hidden').should.lengthOf($lines.length - 2);
    $sumiao.is('.sliding').should.be.true;
    $sumiao.is('.slide-down').should.be.false;

    oc.showParentEnd({ 'target': $sumiao[0], 'data': { 'node': $heihei } });
    $sumiao.is('.sliding').should.be.false;
  });

  it('hideChildren() works well', function () {
    oc.hideChildren($heihei);
    $heihei.closest('table').find('.lines').filter('[style*="visibility: hidden"]').should.lengthOf(4);
    $dandan.is('.sliding,.slide-up').should.be.true;
    $erdan.is('.sliding,.slide-up').should.be.true;
    oc.hideChildrenEnd({ 'data': { 'visibleNodes': $dandan.add($erdan), 'lowerLevel': $heihei.closest('tr').siblings(), 'isVerticalDesc': false, 'node': $heihei } });
    $dandan.is('.sliding').should.be.false;
    $erdan.is('.sliding').should.be.false;
  });

});