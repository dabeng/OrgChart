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

  it('getNodeState()', function () {
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

  it('getRelatedNodes()', function () {
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
    var $upperLevel = $heihei.closest('.nodes').siblings();
    $sumiao.addClass('sliding slide-down').one('transitionend', { 'upperLevel': $upperLevel }, spy.bind(oc));
    $sumiao.trigger('transitionend');
    spy.should.have.been.called;
    $sumiao.is('sliding').should.be.false;
    $upperLevel.filter('.hidden').should.lengthOf(3);
    should.equal($upperLevel.eq(1).attr('style'), undefined);
    should.equal($upperLevel.eq(2).attr('style'), undefined);
  });

  it('showParent()', function () {
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
    $sumiao.closest('table').find('.lines').filter('[style*="visibility: hidden"]').should.lengthOf(8);
    $tiehua.is('.sliding,.slide-up').should.be.true;
    $heihei.is('.sliding,.slide-up').should.be.true;
    $pangpang.is('.sliding,.slide-up').should.be.true;
    $erdan.is('.sliding,.slide-up').should.be.true;
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
    var $lines = $tiehua.closest('.nodes').prevAll('.lines');
    should.equal($lines.eq(0).attr('style'), undefined);
    $lines.eq(0).is('.hidden').should.be.true;
    should.equal($lines.eq(1).attr('style'), undefined);
    $lines.eq(1).is('.hidden').should.be.true;
    spy2.should.have.been.calledWith($sumiao);
    spy3.should.not.have.been.called;
  });

  it('showChildren()', function () {
    var spy = sinon.spy(oc, 'repaint');
    $sumiao.closest('tr').siblings('.nodes').find('.node').addClass('sliding slide-up');
    $sumiao.closest('tr').nextUntil('.nodes').addBack().addClass('hidden');
    oc.showChildren($sumiao);
    spy.should.have.been.calledWith($tiehua[0]);
    $tiehua.is('.sliding:not(.slide-up)').should.be.true;
    $heihei.is('.sliding:not(.slide-up)').should.be.true;
    $pangpang.is('.sliding:not(.slide-up)').should.be.true;
    $erdan.is('.sliding,.slide-up').should.be.true;

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
        $heihei.closest('.nodes').prevAll('.lines').filter(function () {
          return $(this).css('visibility') === 'hidden';
        }).should.lengthOf(2);
      });
    });

    context('when passing two parameters -- node and direction', function () {
      it('hide the left side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'left');
        $tiehua.is('.sliding.slide-right').should.be.true;
        $dandan.is('.sliding.slide-right').should.be.true;
        $pangpang.is('.sliding').should.be.false;
      });
      it('hide the right side sibling nodes and their descendants', function () {
        oc.hideSiblings($heihei, 'right');
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
        var $lines = $heihei.closest('.nodes').prevAll('.lines');
        var $nodeContainer = $heihei.closest('table').parent();
        oc.hideSiblings($heihei);
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': undefined,
          'animatedNodes': $tiehua,
          'lines': $lines
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $lines.filter(function () {
          return $(this).attr('style') === undefined;
        }).should.lengthOf(2);
        $lines.eq(0).children().slice(1, -1).filter(function () {
          return $(this).is('.hidden');
        }).should.lengthOf(4);
        $tiehua.is('.slide-right:not(.sliding)').should.be.true;
        $dandan.is('.slide-up:not(.sliding, .slide-right)').should.be.true;
        $pangpang.is('.slide-left:not(.sibling)').should.be.true;
        $sandan.is('.slide-up:not(.sliding, .slide-left)').should.be.true;
        $nodeContainer.siblings('.hidden').should.lengthOf(2);
        $nodeContainer.siblings().find('.lines.hidden, .nodes.hidden').should.lengthOf(6);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });
    });


    context('when invoking transitionend event with specifying direction', function () {
      it('clean up final classList for left side hidden siblings', function () {
        var spy = sinon.spy(oc, 'hideSiblingsEnd');
        var spy2 = sinon.spy(oc, 'isInAction');
        var spy3 = sinon.spy(oc, 'switchVerticalArrow');
        var $lines = $heihei.closest('.nodes').prevAll('.lines');
        var $nodeContainer = $heihei.closest('table').parent();
        oc.hideSiblings($heihei, 'left');
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': 'left',
          'animatedNodes': $tiehua,
          'lines': $lines
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $lines.filter(function () {
          return $(this).attr('style') === undefined;
        }).should.lengthOf(2);
        $lines.eq(0).children().slice(1, 3).filter(function () {
          return $(this).is('.hidden');
        }).should.lengthOf(2);
        $tiehua.is('.slide-right:not(.sliding)').should.be.true;
        $dandan.is('.slide-up:not(.slide-right)').should.be.true;
        $pangpang.is('.slide-left').should.be.false;
        $sandan.is('.slide-up').should.be.false;
        $nodeContainer.prevAll('.hidden').should.lengthOf(1);
        $nodeContainer.prevAll().find('.lines.hidden, .nodes.hidden').should.lengthOf(3);
        $nodeContainer.nextAll().find('.lines.hidden, .nodes.hidden').should.lengthOf(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });

      it('clean up final classList for right side hidden siblings', function () {
        var spy = sinon.spy(oc, 'hideSiblingsEnd');
        var spy2 = sinon.spy(oc, 'isInAction');
        var spy3 = sinon.spy(oc, 'switchVerticalArrow');
        var $lines = $heihei.closest('.nodes').prevAll('.lines');
        var $nodeContainer = $heihei.closest('table').parent();
        oc.hideSiblings($heihei, 'right');
        $tiehua.one('transitionend', {
          'node': $heihei,
          'nodeContainer': $nodeContainer,
          'direction': 'right',
          'animatedNodes': $tiehua,
          'lines': $lines
        }, spy.bind(oc));
        $tiehua.trigger('transitionend');
        spy.should.have.been.called;
        $lines.filter(function () {
          return $(this).attr('style') === undefined;
        }).should.lengthOf(2);
        $lines.eq(0).children().slice(1, 3).filter(function () {
          return $(this).is('.hidden');
        }).should.lengthOf(2);
        $tiehua.is('.slide-right').should.be.false;
        $dandan.is('.slide-up').should.be.false;
        $pangpang.is('.slide-left:not(.slidiing)').should.be.true;
        $sandan.is('.slide-up:not(.slide-left)').should.be.true;
        $nodeContainer.nextAll('.hidden').should.lengthOf(1);
        $nodeContainer.nextAll().find('.lines.hidden, .nodes.hidden').should.lengthOf(3);
        $nodeContainer.prevAll().find('.lines.hidden, .nodes.hidden').should.lengthOf(0);
        spy2.should.have.been.calledWith($heihei);
        spy3.should.not.have.been.called;
      });
    });    
  });

});