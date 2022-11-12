var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var should = chai.should();
chai.use(sinonChai);
require('jsdom-global')();
var $ = require('jquery');
require('../../src/js/jquery.orgchart');

describe('orgchart -- unit tests', function () {
  document.body.innerHTML = '<div id="chart-container"></div>';
  var $container = $('#chart-container'),
  ds = {
    'id': 'n1',
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'id': 'n2', 'name': 'Bo Miao', 'title': 'department manager' },
      { 'id': 'n3', 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'id': 'n5', 'name': 'Tie Hua', 'title': 'senior engineer',
            'children': [
              { 'id': 'n8', 'name': 'Dan Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n6', 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'id': 'n9', 'name': 'Er Dan', 'title': 'engineer' }
            ]
          },
          { 'id': 'n7', 'name': 'Pang Pang', 'title': 'senior engineer',
            'children': [
              { 'id': 'n10', 'name': 'San Dan', 'title': 'engineer' }
            ]
          }
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
          { id: 'n5',
            children: [
              { id: 'n8' }
            ]
          },
          { id: 'n6',
            children: [
              { id: 'n9' }
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
  $erdan,
  $sandan;

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
    $erdan = $('#n9');
    $sandan = $('#n10');
  });
    
  afterEach(function () {
    $laolao = $bomiao = $sumiao = $hongmiao = $tiehua = $heihei = $pangpang = $dandan = $erdan = $sandan = null;
    $container.empty();
  });

  it('loopChart()', function () {
    oc.loopChart($('.orgchart')).should.deep.equal(hierarchy);
  });

  it('getHierarchy()', function () {
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

  it('getNodeState()', function (done) {
    var check = function () {
      try {
        $laolao = $('#n1');
        $bomiao = $('#n2');
        $sumiao = $('#n3');
        $hongmiao = $('#n4');
        $tiehua = $('#n5');
        $heihei = $('#n6');
        $pangpang = $('#n7');
        $dandan = $('#n8');
        $erdan = $('#n9');
        $sandan = $('#n10');

        oc.getNodeState($laolao).should.deep.equal({ 'exist': true, 'visible': true }, "laolao->self");
        oc.getNodeState($laolao, 'parent').should.deep.equal({ 'exist': false, 'visible': false }, "laolao->parent");
        oc.getNodeState($laolao, 'children').should.deep.equal({ 'exist': true, 'visible': true }, "laolao->children");
        oc.getNodeState($laolao, 'siblings').should.deep.equal({ 'exist': false, 'visible': false }, "laolao->siblings");

        oc.getNodeState($bomiao).should.deep.equal({ 'exist': true, 'visible': true }, "bomiao->self");
        oc.getNodeState($bomiao, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, "bomiao->parent");
        oc.getNodeState($bomiao, 'children').should.deep.equal({ 'exist': false, 'visible': false }, "bomiao->children");
        oc.getNodeState($bomiao, 'siblings').should.deep.equal({ 'exist': true, 'visible': true }, "bomiao->siblings");

        oc.getNodeState($sumiao).should.deep.equal({ 'exist': true, 'visible': true }, "sumiao->self");
        oc.getNodeState($sumiao, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, "sumiao->parent");
        oc.getNodeState($sumiao, 'children').should.deep.equal({ 'exist': true, 'visible': false }, "sumiao->children");
        oc.getNodeState($sumiao, 'siblings').should.deep.equal({ 'exist': true, 'visible': true }, "sumiao->siblings");

        oc.getNodeState($tiehua).should.deep.equal({ 'exist': true, 'visible': false }, "tiehua->self");
        oc.getNodeState($tiehua, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, "tiehua->parent");
        oc.getNodeState($tiehua, 'children').should.deep.equal({ 'exist': true, 'visible': false }, "tiehua->children");
        oc.getNodeState($tiehua, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, "tiehua->siblings");

        oc.getNodeState($heihei).should.deep.equal({ 'exist': true, 'visible': false }, "heihei->self");
        oc.getNodeState($heihei, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, "heihei->parent");
        oc.getNodeState($heihei, 'children').should.deep.equal({ 'exist': true, 'visible': false }, "heihei->children");
        oc.getNodeState($heihei, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, "heihei->siblings");

        oc.getNodeState($pangpang).should.deep.equal({ 'exist': true, 'visible': false }, "pangpang->self");
        oc.getNodeState($pangpang, 'parent').should.deep.equal({ 'exist': true, 'visible': true }, "pangpang->parent");
        oc.getNodeState($pangpang, 'children').should.deep.equal({ 'exist': true, 'visible': false }, "pangpang->children");
        oc.getNodeState($pangpang, 'siblings').should.deep.equal({ 'exist': true, 'visible': false }, "pangpang->siblings");

        oc.getNodeState($dandan).should.deep.equal({ 'exist': true, 'visible': false }, "dandan->self");
        oc.getNodeState($dandan, 'parent').should.deep.equal({ 'exist': true, 'visible': false }, "dandan->parent");
        oc.getNodeState($dandan, 'children').should.deep.equal({ 'exist': false, 'visible': false }, "dandan->children");
        oc.getNodeState($dandan, 'siblings').should.deep.equal({ 'exist': false, 'visible': false }, "dandan->siblings");

        done();
      } catch(err) {
        done(err);
      }
    };
    if (typeof MutationObserver !== 'undefined') {
      oc.init({ 'visibleLevel': 2, 'verticalLevel': 3 }).$chart.one('init.orgchart', check);
    } else {
      oc.init({ 'visibleLevel': 2, 'verticalLevel': 3 });
      setTimeout(check, 0);
    }
  });

  it('getRelatedNodes()', function () {
    oc.getRelatedNodes().should.deep.equal($());
    oc.getRelatedNodes({}, 'children').should.deep.equal($());
    oc.getRelatedNodes($('.hierarchy:first'), 'children').should.deep.equal($());
    oc.getRelatedNodes($('.node:first'), 'child').should.deep.equal($());

    oc.getRelatedNodes($laolao, 'parent').should.deep.equal($());
    oc.getRelatedNodes($laolao, 'children').toArray().should.members([$bomiao[0], $sumiao[0], $hongmiao[0]]);
    oc.getRelatedNodes($laolao, 'siblings').should.deep.equal($());

    oc.getRelatedNodes($bomiao, 'parent').should.deep.equal($laolao);
    oc.getRelatedNodes($bomiao, 'children').should.have.lengthOf(0);
    oc.getRelatedNodes($bomiao, 'siblings').toArray().should.members([$sumiao[0], $hongmiao[0]]);
  });

  it('getParent()', function () {
    oc.getParent().should.deep.equal($());
    oc.getParent({}).should.deep.equal($());
    oc.getParent($('.hierarchy:first')).should.deep.equal($());

    oc.getParent($laolao).should.deep.equal($());
    oc.getParent($bomiao).should.deep.equal($laolao);
    oc.getParent($sandan).should.deep.equal($pangpang);
  });

  it('getSiblings()', function () {
    oc.getSiblings().should.deep.equal($());
    oc.getSiblings({}).should.deep.equal($());
    oc.getSiblings($('.hierarchy:first')).should.deep.equal($());

    oc.getSiblings($laolao).should.deep.equal($());
    oc.getSiblings($bomiao).toArray().should.members([$sumiao[0], $hongmiao[0]]);
    oc.getSiblings($sandan).should.deep.equal($());
  });

  it('getChildren()', function () {
    oc.getChildren().should.deep.equal($());
    oc.getChildren({}).should.deep.equal($());
    oc.getChildren($('.hierarchy:first')).should.deep.equal($());

    oc.getChildren($laolao).toArray().should.members([$bomiao[0], $sumiao[0], $hongmiao[0]]);
    oc.getChildren($bomiao).should.deep.equal($());
    oc.getChildren($sumiao).toArray().should.members([$tiehua[0], $heihei[0], $pangpang[0]]);
    oc.getChildren($sandan).should.deep.equal($());
  });

  it('hideParent()', function () {
    var spy  = sinon.spy(oc, 'hideParent');
    var spy2  = sinon.spy(oc, 'hideSiblings');
    oc.hideParent($heihei);
    spy.should.have.been.callCount(2);
    spy.getCall(0).should.have.been.calledWithMatch($heihei);
    spy.getCall(1).should.have.been.calledWithMatch($sumiao);
    spy2.should.have.been.callCount(2);
    spy2.getCall(0).should.have.been.calledWithMatch($heihei);
    spy2.getCall(1).should.have.been.calledWithMatch($sumiao);
  });

  it('hideParentEnd()', function () {
    var spy = sinon.spy(oc, 'hideParentEnd');
    var $parent = $heihei.closest('.nodes').siblings('.node');
    $sumiao.addClass('sliding slide-down').one('transitionend', { 'parent': $parent }, spy.bind(oc));
    $sumiao.trigger('transitionend');
    spy.should.have.been.called;
    $sumiao.is('sliding').should.be.false;
    $parent.is('.hidden').should.be.true;
  });

  it('showParent()', function () {
    var spy = sinon.spy(oc, 'repaint');
    $heihei.closest('.hierarchy').addClass('isAncestorsCollapsed');
    $sumiao.addClass('slide-down hidden').closest('.hierarchy').addClass('isAncestorsCollapsed');
    $laolao.addClass('slide-down hidden');
    oc.showParent($heihei);
    spy.should.have.been.called;
    $heihei.closest('.hierarchy').is('.isAncestorsCollapsed').should.be.false;
    $sumiao.is('.slide-down, .hidden').should.be.false;
    $sumiao.closest('.hierarchy').is('.isAncestorsCollapsed').should.be.true;
    $laolao.is('.slide-down.hidden').should.be.true;
    $sumiao.is('.sliding').should.be.true;
    $sumiao.is('.slide-down').should.be.false;
  });

  it('showParentEnd()', function () {
    var spy = sinon.spy(oc, 'showParentEnd');
    var spy2 = sinon.spy(oc, 'isInAction');
    var spy3 = sinon.spy(oc, 'switchVerticalArrow');
    $sumiao.addClass('sliding').removeClass('slide-down').one('transitionend', { 'node': $heihei }, spy.bind(oc));
    $sumiao.trigger('transitionend');
    spy.should.have.been.called;
    $sumiao.is('.sliding').should.be.false;
    spy2.should.have.been.calledWith($heihei);
    spy3.should.not.have.been.called;
  });

  it('hideChildren()', function () {
    var spy = sinon.spy(oc, 'repaint');
    oc.hideChildren($sumiao);
    spy.should.have.been.called;
    $sumiao.closest('.hierarchy').is('.isChildrenCollapsed').should.be.true;
    $sumiao.siblings('.nodes').children('.isCollapsedDescendant').should.lengthOf(3);
    $tiehua.is('.sliding.slide-up').should.be.true;
    $heihei.is('.sliding.slide-up').should.be.true;
    $pangpang.is('.sliding.slide-up').should.be.true;
    $erdan.is('.sliding.slide-up').should.be.true;
  });

  it('hideChildrenEnd()', function () {
    var spy = sinon.spy(oc, 'hideChildrenEnd');
    var spy2 = sinon.spy(oc, 'isInAction');
    var spy3 = sinon.spy(oc, 'switchVerticalArrow');
    $tiehua.addClass('sliding slide-up').one('transitionend', { 'animatedNodes': $tiehua, 'lowerLevel': $sumiao.closest('tr').siblings(), 'isVerticalDesc': false, 'node': $sumiao }, spy.bind(oc));
    $tiehua.trigger('transitionend');
    spy.should.have.been.called;
    $tiehua.is('.sliding').should.be.false;
    $tiehua.closest('.nodes').is('.hidden').should.be.true;
    spy2.should.have.been.calledWith($sumiao);
    spy3.should.not.have.been.called;
  });

  it('showChildren()', function () {
    var spy = sinon.spy(oc, 'repaint');
    $sumiao.siblings('.nodes').find('.node').addClass('slide-up');
    $sumiao.siblings('.nodes').find('.nodes').addBack().addClass('hidden');
    oc.showChildren($sumiao);
    spy.should.have.been.calledWith($tiehua[0]);
    $tiehua.is('.sliding:not(.slide-up)').should.be.true;
    $heihei.is('.sliding:not(.slide-up)').should.be.true;
    $pangpang.is('.sliding:not(.slide-up)').should.be.true;
    $erdan.is('.slide-up:not(.sliding)').should.be.true;
  });

  it('showChildrenEnd()', function () {
    var spy = sinon.spy(oc, 'showChildrenEnd');
    var spy2 = sinon.spy(oc, 'isInAction');
    var spy3 = sinon.spy(oc, 'switchVerticalArrow');
    $tiehua.addClass('sliding').one('transitionend', { 'node': $sumiao, 'animatedNodes': $tiehua }, spy.bind(oc));
    $tiehua.trigger('transitionend');
    spy.should.have.been.called;
    $tiehua.is('.sliding').should.be.false;
    spy2.should.have.been.calledWith($sumiao);
    spy3.should.not.have.been.called;
  });

  describe('hideSiblings()', function () {
    context('when passing only one parameter -- node', function () {
      it('should hide all the sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei);
        $tiehua.is('.sliding.slide-right').should.be.true;
        $dandan.is('.sliding.slide-right').should.be.true;
        $pangpang.is('.sliding.slide-left').should.be.true;
        $sandan.is('.sliding.slide-left').should.be.true;
        $heihei.closest('.hierarchy').is('.isSiblingsCollapsed').should.be.true;
        $heihei.closest('.hierarchy').siblings('.isChildrenCollapsed.isCollapsedSibling').should.lengthOf(2);
      });
    });

    context('when passing two parameters -- node and direction', function () {
      it('hide the left side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'left');
        $heihei.closest('.hierarchy').is('.isSiblingsCollapsed.left-sibs').should.be.true;
        $heihei.closest('.hierarchy').prev().is('.isChildrenCollapsed.isCollapsedSibling').should.be.true;
        $heihei.closest('.hierarchy').next().is('.isChildrenCollapsed, .isCollapsedSibling').should.be.false;
        $tiehua.is('.sliding.slide-right').should.be.true;
        $dandan.is('.sliding.slide-right').should.be.true;
        $pangpang.is('.sliding').should.be.false;
      });
      it('hide the right side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'right');
        $heihei.closest('.hierarchy').is('.isSiblingsCollapsed.right-sibs').should.be.true;
        $heihei.closest('.hierarchy').next().is('.isChildrenCollapsed.isCollapsedSibling').should.be.true;
        $heihei.closest('.hierarchy').prev().is('.isChildrenCollapsed, .isCollapsedSibling').should.be.false;
        $pangpang.is('.sliding.slide-left').should.be.true;
        $sandan.is('.sliding.slide-left').should.be.true;
        $tiehua.is('.sliding').should.be.false;
      });
    });
  });

  describe('hideSiblingsEnd()', function () {
    context('when invoking transitionend event without specifying direction', function () {
      it('clean up final classList for hidden siblings', function () {
        var spy = sinon.spy(oc, 'hideSiblingsEnd');
        var spy2 = sinon.spy(oc, 'isInAction');
        var spy3 = sinon.spy(oc, 'switchVerticalArrow');
        var $nodeContainer = $heihei.closest('.hierarchy');
        oc.hideSiblings($heihei);
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': undefined,
          'animatedNodes': $tiehua
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $tiehua.is('.slide-right:not(.sliding)').should.be.true;
        $dandan.is('.slide-up:not(.sliding, .slide-right)').should.be.true;
        $pangpang.is('.slide-left:not(.sibling)').should.be.true;
        $sandan.is('.slide-up:not(.sliding, .slide-left)').should.be.true;
        $nodeContainer.siblings('.hidden').should.lengthOf(2);
        $nodeContainer.siblings().find('.nodes.hidden').should.lengthOf(2);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });
    });

    context('when invoking transitionend event with specifying direction', function () {
      it('clean up final classList for left side hidden siblings', function () {
        var spy = sinon.spy(oc, 'hideSiblingsEnd');
        var spy2 = sinon.spy(oc, 'isInAction');
        var spy3 = sinon.spy(oc, 'switchVerticalArrow');
        var $nodeContainer = $heihei.closest('.hierarchy');
        oc.hideSiblings($heihei, 'left');
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': 'left',
          'animatedNodes': $tiehua
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $tiehua.is('.slide-right:not(.sliding)').should.be.true;
        $dandan.is('.slide-up:not(.slide-right)').should.be.true;
        $pangpang.is('.slide-left').should.be.false;
        $sandan.is('.slide-up').should.be.false;
        $nodeContainer.prevAll('.hidden').should.lengthOf(1);
        $nodeContainer.prevAll().find('.nodes.hidden').should.lengthOf(1);
        $nodeContainer.nextAll().find('.nodes.hidden').should.lengthOf(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });

      it('clean up final classList for right side hidden siblings', function () {
        var spy = sinon.spy(oc, 'hideSiblingsEnd');
        var spy2 = sinon.spy(oc, 'isInAction');
        var spy3 = sinon.spy(oc, 'switchVerticalArrow');
        var $nodeContainer = $heihei.closest('.hierarchy');
        oc.hideSiblings($heihei, 'right');
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': 'right',
          'animatedNodes': $tiehua
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $tiehua.is('.slide-right').should.be.false;
        $dandan.is('.slide-up').should.be.false;
        $pangpang.is('.slide-left:not(.slidiing)').should.be.true;
        $sandan.is('.slide-up:not(.slide-left)').should.be.true;
        $nodeContainer.nextAll('.hidden').should.lengthOf(1);
        $nodeContainer.nextAll().find('.nodes.hidden').should.lengthOf(1);
        $nodeContainer.prevAll().find('.nodes.hidden').should.lengthOf(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });
    });    
  });

});