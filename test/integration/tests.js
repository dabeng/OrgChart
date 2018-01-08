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
    'id': 'n1',
    'name': 'Lao Lao',
    'title': 'general manager',
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
  },
  oc = {},
  hierarchy = {
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
  },
  $laolao,
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
      'data': ds
    }),
    $laolao = $('#n1'),
    $bomiao = $('#n2'),
    $sumiao = $('#n3'),
    $hongmiao = $('#n4'),
    $tiehua = $('#n5'),
    $heihei = $('#n6'),
    $pangpang = $('#n7'),
    $dandan = $('#n8'),
    $erdan = $('#n9'),
    $sandan = $('#n10');
  });
    
  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $chunmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = $sandan = null;
    $container.empty();
  });

  it("Adding new root node", function () {
    oc.addParent($laolao, { 'name': 'Lao Ye', 'id': 'n0' });
    $laolao.closest('.nodes').prevAll().should.lengthOf(3);
    oc.$chart.find('.node:first').should.deep.equal($('#n0'));
  });

  it("when one node's parent is hidden, its sibling branches are hidden too", function () {
    oc.hideParent($hongmiao);
    $bomiao.is('.slide-right').should.be.true;
    $sumiao.is('.slide-right').should.be.true;
    $sumiao.find('.slide-right').should.lengthOf($sumiao.find('.node').length);
  });

});