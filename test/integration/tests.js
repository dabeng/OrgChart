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

function siblingElements(element, selector) {
  if (!element || !element.parentElement) {
    return [];
  }
  return Array.from(element.parentElement.children).filter(function (childEl) {
    return childEl !== element && (!selector || childEl.matches(selector));
  });
}

describe('orgchart -- integration tests', function () {
  let $container;

  const ds = {
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
  };

  let oc = {};

  const hierarchy = {
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
  };

  let $laolao;
  let $bomiao;
  let $sumiao;
  let $hongmiao;
  let $chunmiao;
  let $tiehua;
  let $heihei;
  let $pangpang;
  let $dandan;
  let $erdan;

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-container"></div>';
    $container = document.getElementById('chart-container');
    oc = new OrgChart({
      chartContainer: '#chart-container',
      'data': ds
    }),
    $laolao = document.getElementById('n1'),
    $bomiao = document.getElementById('n2'),
    $sumiao = document.getElementById('n3'),
    $hongmiao = document.getElementById('n4'),
    $tiehua = document.getElementById('n5'),
    $heihei = document.getElementById('n6'),
    $pangpang = document.getElementById('n7'),
    $dandan = document.getElementById('n8'),
    $erdan = document.getElementById('n9'),
    $sandan = document.getElementById('n10');
  });

  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $chunmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = $sandan = null;
    $container.innerHTML = '';
  });

  it('addParent()', function () {
    oc.addParent($laolao, { 'name': 'Lao Ye', 'id': 'n0' });
    siblingElements($laolao.closest('.nodes'), '.node').should.lengthOf(1);
    query('.node', oc.chart).should.equal(query('#n0'));
  });

  it('addAncestors()', function () {
    oc.addAncestors({ 'name': 'Lao Ye', 'id': 'n0', 'relationship': '001' }, 'n0');

    should.exist(query('#n0'));
  });

  describe('addChildren()', function () {
    it('Add child nodes to the leaf node', function () {
      let siblingNodesElement;

      oc.addChildren($bomiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      siblingNodesElement = siblingElements($bomiao, '.nodes')[0];
      siblingElements($bomiao, '.nodes').should.lengthOf(1);
      queryAll('.hierarchy', siblingNodesElement).should.lengthOf(1);
      query('.node', siblingNodesElement).id.should.equal('n11');
    });

    it('Add child nodes to the un-leaf node', function () {
      let siblingNodesElements;
      let hierarchyElements;

      oc.addChildren($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      siblingNodesElements = siblingElements($sumiao, '.nodes');
      hierarchyElements = siblingNodesElements.flatMap(function (nodesElement) {
        return Array.from(nodesElement.children).filter(function (childEl) {
          return childEl.classList && childEl.classList.contains('hierarchy');
        });
      });
      hierarchyElements.should.lengthOf(4);
      query('.node', hierarchyElements[hierarchyElements.length - 1]).id.should.equal('n11');
    });
  });

  describe('addDescendants()', function () {
    it('Add descendant nodes from a native parent node', function () {
      let siblingNodesElement;

      oc.addDescendants([{ 'name': 'Li Xin', 'id': 'n11' }], $bomiao);

      siblingNodesElement = siblingElements($bomiao, '.nodes')[0];
      siblingElements($bomiao, '.nodes').should.lengthOf(1);
      queryAll('.hierarchy', siblingNodesElement).should.lengthOf(1);
      query('.node', siblingNodesElement).id.should.equal('n11');
    });
  });

  describe('addSiblings()', function () {
    it('Just add sibling nodes', function () {
      let siblingNodesElement;
      let hierarchyElements;

      oc.addSiblings($sumiao, [{'name': 'Li Xin', 'id': 'n11' }]);
      siblingNodesElement = siblingElements($laolao, '.nodes')[0];
      hierarchyElements = Array.from(siblingNodesElement.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      });
      hierarchyElements.should.lengthOf(4);
      query('.node', hierarchyElements[hierarchyElements.length - 1]).id.should.equal('n11');
    });

    it('Add sibling nodes as well as parent node', function () {
      let hierarchySiblings;

      oc.addSiblings($laolao, { 'name': 'Lao Ye', 'id': 'n0', 'children': [{'name': 'Li Xin', 'id': 'n11' }] });
      siblingElements($laolao.closest('.nodes'), '.node').should.lengthOf(1);
      query('.node', oc.chart).should.equal(query('#n0'));
      hierarchySiblings = siblingElements($laolao.closest('.hierarchy'));
      hierarchySiblings.should.lengthOf(1);
      query('.node', hierarchySiblings[0]).id.should.equal('n11');
    });
  });

  describe('removeNodes()', function () {
    it('Remove leaf node', function () {
      oc.removeNodes($dandan);
      siblingElements($tiehua, '.nodes').should.lengthOf(0);
    });
    it('Remove parent node', function () {
      const siblingNodesElement = siblingElements($sumiao, '.nodes')[0];

      oc.removeNodes($tiehua);
      Array.from(siblingNodesElement.children).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('hierarchy');
      }).should.lengthOf(2);
      should.not.exist(query('#n5'));
      should.not.exist(query('#n8'));
    });
    it('Remove root node', function () {
      oc.removeNodes($laolao);
      $container.children.length.should.equal(0);
    });
  });
});
