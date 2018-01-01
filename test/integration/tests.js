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

describe('orgchart -- integration tests', function () {

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

  it("when one node's parent is hidden, its sibling branches are hidden too", function () {
    oc.hideParent($hongmiao);
    $bomiao.is('.slide-right').should.be.true;
    $sumiao.is('.slide-right').should.be.true;
    $chunmiao.is('.slide-left').should.be.true;
    $sumiao.find('.slide-right').should.lengthOf($sumiao.find('.node').length);
  });

});