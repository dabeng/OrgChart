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
    oc = $container.orgchart({
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

  it('addParent()', function () {
    oc.addParent($laolao, { 'name': 'Lao Ye', 'id': 'n0' });
    $laolao.closest('.nodes').prevAll().should.lengthOf(3);
    oc.$chart.find('.node:first').should.deep.equal($('#n0'));
  });

  describe('addChildren()', function () {
    it('Add child nodes to the leaf node', function () {
      oc.addChildren($bomiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      $bomiao.closest('tr').siblings().should.lengthOf(3);
      $bomiao.closest('tr').siblings('.nodes').find('.node').attr('id').should.equal('n11');
    });

    it('Add child nodes to the un-leaf node', function () {
      oc.addChildren($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      $sumiao.closest('tr').siblings('.nodes').children().should.lengthOf(4);
      $sumiao.closest('tr').siblings('.nodes').children(':last').find('.node').attr('id').should.equal('n11');
    });
  });

  describe('addSiblings()', function () {
    it('Just add sibling nodes', function () {
      oc.addSiblings($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      $laolao.closest('tr').siblings('.nodes').children().should.lengthOf(4);
      $laolao.closest('tr').siblings('.nodes').children(':last').find('.node').attr('id').should.equal('n11');
    });

    it('Add sibling nodes as well as parent node', function () {
      oc.addSiblings($laolao, { 'name': 'Lao Ye', 'id': 'n0', 'children': [{'name': 'Li Xin', 'id': 'n11' }] });
      $laolao.closest('.nodes').prevAll().should.lengthOf(3);
      oc.$chart.find('.node:first').should.deep.equal($('#n0'));
      $laolao.closest('table').parent().siblings().should.lengthOf(1);
      $laolao.closest('table').parent().siblings().find('.node').attr('id').should.equal('n11');
    });
  });

  describe('removeNodes()', function () {
    it('Remove leaf node', function () {
      oc.removeNodes($dandan);
      $tiehua.closest('tr').siblings().should.lengthOf(0);
    });
    it('Remove parent node', function () {
      oc.removeNodes($tiehua);
      $sumiao.closest('tr').siblings('.nodes').children().should.lengthOf(2);
      $('#n5').should.lengthOf(0);
      $('#n8').should.lengthOf(0);
    });
    it('Remove parent node', function () {
      oc.removeNodes($laolao);
      oc.$chartContainer.is(':empty').should.be.true;
    });
  });

});