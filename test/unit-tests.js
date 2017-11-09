const should = require('chai').should();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM('<!doctype html><html><body><div id="chart-container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
const $ = require('jquery');
require('../src/js/jquery.orgchart');

describe('orgchart', function () {

  let $container = $('#chart-container'),
  ds = {
    'id': '1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': '2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': '3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': '4', 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'id': '5', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': '6', 'name': 'Pang Pang', 'title': 'engineer',
                'children' : [
                  { 'id': '7', 'name': 'Xiang Xiang', 'title': 'UE engineer' }
                ]
              }
            ]
          }
        ]
      },
      { 'id': '8', 'name': 'Hong Miao', 'title': 'department manager' },
      { 'id': '9', 'name': 'Chun Miao', 'title': 'department manager' }
    ]
  },
  oc = {},
  hierarchy = {
    id: '1',
    children: [
      { id: '2' },
      { id: '3',
        children: [
          { id: '4' },
          { id: '5',
            children: [
              { id: '6',
                children: [
                  { id: '7' }
                ]
              }
            ]
          }
        ]
      },
      { id: '8' },
      { id: '9' }
    ]
  },
  $root,
  $bomiao,
  $sumiao,
  $tiehua,
  $heihei,
  $pangpang,
  $xiangxiang;

  beforeEach(function () {
    oc = $('#chart-container').orgchart({
      'data': ds,
      'nodeContent': 'title',
      'depth': 2
    }),
    $root = $('#1'),
    $bomiao = $('#2'),
    $sumiao = $('#3'),
    $tiehua = $('#4'),
    $heihei = $('#5'),
    $pangpang = $('#6'),
    $xiangxiang = $('#7');
  });
    
  afterEach(function () {
    $root = $bomiao = $sumiao = $tiehua = $heihei = $pangpang = $xiangxiang = null;
    $container.empty();
  });

  it('loopChart() works well', function () {
    oc.loopChart($('.orgchart')).should.deep.equal(hierarchy);
  });

  it('getHierarchy() works well', function () {
    oc.getHierarchy().should.deep.equal(hierarchy);

    let oc2 = $('#chart-container').orgchart({
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

    oc.getNodeState($xiangxiang, 'parent').should.deep.equal({ 'exist': true, 'visible': false });
    oc.getNodeState($xiangxiang, 'children').should.deep.equal({ 'exist': false, 'visible': false });
    oc.getNodeState($xiangxiang, 'siblings').should.deep.equal({ 'exist': false, 'visible': false });
  });

  it('getRelatedNodes() works well', function () {
    oc.getRelatedNodes().should.deep.equal($());
    oc.getRelatedNodes($('td:first'), 'children').should.deep.equal($());
    oc.getRelatedNodes($('.node:first'), 'child').should.deep.equal($());

    oc.getRelatedNodes($root, 'parent').should.deep.equal($());
    oc.getRelatedNodes($root, 'children').toArray().should.members([$bomiao[0], $sumiao[0], $('#8')[0], $('#9')[0]]);
    oc.getRelatedNodes($root, 'siblings').should.deep.equal($());

    oc.getRelatedNodes($bomiao, 'parent').should.deep.equal($root);
    oc.getRelatedNodes($bomiao, 'children').should.have.lengthOf(0);
    oc.getRelatedNodes($bomiao, 'siblings').toArray().should.members([$sumiao[0], $('#8')[0], $('#9')[0]]);
  });

  it('hideParent() works well', function () {
    // oc.hideParent($xiangxiang);

    // $xiangxiang.parents('.nodes').prevAll().each(function () {
    //   $(this).is('.hidden').should.be.true;
    // });
  });

});