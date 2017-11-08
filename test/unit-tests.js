const should = require('chai').should();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM('<!doctype html><html><body><div id="chart-container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
const $ = require('jquery');
require('../src/js/jquery.orgchart');

describe('orgchart', function () {

  let $container = $('#chart-container');
  let datascource = {
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
  };
  let oc = null;

  beforeEach(function () {
    oc = $('#chart-container').orgchart({
      'data': datascource,
      'nodeContent': 'title',
      'depth': 2
    });
  });
    
  afterEach(function () {
    $container.empty();
  });

  it('There will be an orgchart embeded in the container div after initialization', function () {
    let $chart = $container.find('.orgchart');

    $chart.length.should.equal(1);
  });

  it('Mthod getNodeState() works well', function () {
    let $root = $('#1'),
      $bomiao = $('#2'),
      $sumiao = $('#3'),
      $tiehua = $('#4'),
      $heihei = $('#5'),
      $pangpang = $('#6'),
      $xiangxiang = $('#7');

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
});