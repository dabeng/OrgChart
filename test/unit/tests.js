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
require('../../src/js/jquery.orgchart');

describe('orgchart -- unit tests', function () {

  var $container = $('#chart-container'),
  ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': 'n3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': 'n5', 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'id': 'n6', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': 'n8', 'name': 'Dan Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n7', 'name': 'Pang Pang', 'title': 'senior engineer' }
        ]
      },
      { 'id': 'n4', 'name': 'Hong Miao', 'title': 'department manager' }
    ]
  },
  oc = {},
  hierarchy = {
    id: 'n1',
    children: [
      { id: 'n2' },
      { id: 'n3',
        children: [
          { id: 'n5' },
          { id: 'n6',
            children: [
              { id: 'n8' }
            ]
          },
          { id: 'n7' }
        ]
      },
      { id: 'n4' }
    ]
  },
  $laolao,
  $bomiao,
  $sumiao,
  $hongmiao,
  $chunmiao,
  $tiehua,
  $heihei,
  $pangpang,
  $dandan;

  beforeEach(function () {
    oc = $('#chart-container').orgchart({
      'data': ds,
      'nodeContent': 'title'
    }),
    $laolao = $('#n1'),
    $bomiao = $('#n2'),
    $sumiao = $('#n3'),
    $hongmiao = $('#n4'),
    $tiehua = $('#n5'),
    $heihei = $('#n6'),
    $pangpang = $('#n7'),
    $dandan = $('#n8');
  });
    
  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $tiehua = $heihei = $pangpang = $dandan = null;
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
      oc.getNodeState($laolao, 'parent').should.deep.equal({ 'exist': false, 'visible': false });
      oc.getNodeState($laolao, 'children').should.deep.equal({ 'exist': true, 'visible': true });
      oc.getNodeState($laolao, 'siblings').should.deep.equal({ 'exist': false, 'visible': false });

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

    oc.getRelatedNodes($laolao, 'parent').should.deep.equal($());
    oc.getRelatedNodes($laolao, 'children').toArray().should.members([$bomiao[0], $sumiao[0], $hongmiao[0]]);
    oc.getRelatedNodes($laolao, 'siblings').should.deep.equal($());

    oc.getRelatedNodes($bomiao, 'parent').should.deep.equal($laolao);
    oc.getRelatedNodes($bomiao, 'children').should.have.lengthOf(0);
    oc.getRelatedNodes($bomiao, 'siblings').toArray().should.members([$sumiao[0], $hongmiao[0]]);
  });

  it('hideParent() works well', function () {
    var spy = sinon.spy(oc, 'hideSiblings');
    oc.hideParent($heihei);
    spy.should.have.been.callCount(2);
    oc.hideParentEnd({ 'target': $sumiao[0], 'data': { 'upperLevel': $heihei.closest('.nodes').siblings() } });
    oc.hideParentEnd({ 'target': $laolao[0], 'data': { 'upperLevel': $sumiao.closest('.nodes').siblings() } });

    $heihei.parents('.nodes').each(function () {
      $(this).siblings().filter('.hidden').should.lengthOf(3);
    });
    $sumiao.is('.slide-down').should.be.true;
    $laolao.is('.slide-down').should.be.true;
  });

  it('showParent() works well', function () {
    var spy = sinon.spy(oc, 'repaint');
    $laolao.add($sumiao).closest('tr').nextUntil('.nodes').addBack().addClass('hidden');
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
    oc.hideChildren($sumiao);
    $sumiao.closest('table').find('.lines').filter('[style*="visibility: hidden"]').should.lengthOf(4);
    $tiehua.is('.sliding,.slide-up').should.be.true;
    $heihei.is('.sliding,.slide-up').should.be.true;
    $pangpang.is('.sliding,.slide-up').should.be.true;
    $dandan.is('.sliding,.slide-up').should.be.true;
    oc.hideChildrenEnd({ 'data': { 'visibleNodes': $([$tiehua[0], $heihei[0], $pangpang[0], $dandan[0]]), 'lowerLevel': $sumiao.closest('tr').siblings(), 'isVerticalDesc': false, 'node': $sumiao } });
    $tiehua.is('.sliding').should.be.false;
    $heihei.is('.sliding').should.be.false;
    $pangpang.is('.sliding').should.be.false;
    $dandan.is('.sliding').should.be.false;
  });

});