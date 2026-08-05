const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai').default;

chai.use(sinonChai);
require('jsdom-global')();
process.env.ORGCHART_TEST = '1';

const OrgChart = require('../../src/js/orgchart');

function query(selector, root) {
  return (root || document).querySelector(selector);
}

function setClientSize(element, width, height) {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: function () {
      return width;
    }
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    get: function () {
      return height;
    }
  });
}

function stubRect(element, rect) {
  return sinon.stub(element, 'getBoundingClientRect').callsFake(function () {
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height
    };
  });
}

function parseMatrix(transform) {
  return transform.slice(7, -1).split(',').map(function (value) {
    return parseFloat(value.trim());
  });
}

describe('orgchart minimap unit tests', function () {
  let container;
  let chart;
  let restorableDoubles;
  const ds = {
    id: 'n1',
    name: 'Lao Lao',
    title: 'general manager',
    children: [
      { id: 'n2', name: 'Bo Miao', title: 'department manager' },
      {
        id: 'n3',
        name: 'Su Miao',
        title: 'department manager',
        children: [
          { id: 'n5', name: 'Tie Hua', title: 'senior engineer' },
          { id: 'n6', name: 'Hei Hei', title: 'senior engineer' }
        ]
      }
    ]
  };

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-container"></div>';
    container = document.getElementById('chart-container');
    restorableDoubles = [];
    chart = new OrgChart({
      chartContainer: '#chart-container',
      data: JSON.parse(JSON.stringify(ds)),
      nodeContent: 'title'
    });
  });

  afterEach(function () {
    restorableDoubles.forEach(function (double) {
      if (double && typeof double.restore === 'function') {
        double.restore();
      }
    });
    document.body.innerHTML = '';
    chart = null;
    container = null;
  });

  it('keeps minimap disabled by default', function () {
    chai.expect(chart.options.minimap).to.equal(false);
    chai.expect(query('.orgchart-minimap', container)).to.equal(null);
  });

  it('mounts a minimap overlay when minimap is enabled', function () {
    chart.init({
      data: JSON.parse(JSON.stringify(ds)),
      nodeContent: 'title',
      minimap: true
    });

    chai.expect(query('.orgchart-minimap', container)).to.not.equal(null);
    chai.expect(query('.orgchart-minimap-stage', container)).to.not.equal(null);
    chai.expect(query('.orgchart-minimap-viewport', container)).to.not.equal(null);
    chai.expect(query('.orgchart-minimap-node', container)).to.not.equal(null);
    chai.expect(query('.orgchart-minimap .orgchart', container)).to.equal(null);
  });

  it('toggles the minimap overlay through setOptions()', function () {
    chart.setOptions('minimap', true);
    chai.expect(query('.orgchart-minimap', container)).to.not.equal(null);
    chai.expect(container.style.position).to.equal('relative');

    chart.setOptions({ minimap: false });
    chai.expect(query('.orgchart-minimap', container)).to.equal(null);
    chai.expect(container.style.position).to.equal('');
  });

  it('updates the minimap viewport from the current chart transform', function () {
    let stage;
    let viewport;

    chart.setOptions('minimap', true);
    stage = query('.orgchart-minimap-stage', container);
    viewport = query('.orgchart-minimap-viewport', container);
    setClientSize(container, 400, 240);
    setClientSize(stage, 180, 104);
    restorableDoubles.push(stubRect(container, { left: 0, top: 0, width: 400, height: 240 }));
    restorableDoubles.push(stubRect(chart.chart, { left: -100, top: -50, width: 1000, height: 600 }));
    chart.chart.style.transform = 'matrix(1, 0, 0, 1, -100, -50)';

    chart.updateMinimap(true);

    chai.expect(parseFloat(viewport.style.width)).to.be.closeTo(69.33333333333333, 0.000001);
    chai.expect(parseFloat(viewport.style.height)).to.be.closeTo(41.6, 0.000001);
    chai.expect(viewport.style.transform).to.equal('translate(20.666666666666664px, 8.666666666666668px)');
  });

  it('renders simplified minimap color blocks from the chart nodes', function () {
    let stage;
    let minimapNode;
    const nodeElements = Array.from(chart.chart.querySelectorAll('.node'));

    nodeElements[0].querySelector('.title').style.backgroundColor = 'rgba(200, 100, 50, 0.4)';
    chart.setOptions('minimap', true);
    stage = query('.orgchart-minimap-stage', container);
    setClientSize(container, 400, 240);
    setClientSize(stage, 180, 104);
    restorableDoubles.push(stubRect(container, { left: 0, top: 0, width: 400, height: 240 }));
    restorableDoubles.push(stubRect(chart.chart, { left: 0, top: 0, width: 1000, height: 600 }));
    nodeElements.forEach(function (nodeElement, index) {
      restorableDoubles.push(stubRect(nodeElement, {
        left: 20 + (index * 40),
        top: 10 + (index * 30),
        width: 130,
        height: 40
      }));
    });

    chart.updateMinimap(true);
    minimapNode = query('.orgchart-minimap-node', container);

    chai.expect(query('.orgchart-minimap .orgchart', container)).to.equal(null);
    chai.expect(container.querySelectorAll('.orgchart-minimap-node').length).to.equal(nodeElements.length);
    chai.expect(minimapNode.style.backgroundColor).to.equal('rgb(136, 68, 34)');
    chai.expect(minimapNode.style.height).to.equal('18px');
  });

  it('moves the main chart when the minimap viewport is dragged', function () {
    let stage;
    let viewport;

    chart.setOptions('minimap', true);
    stage = query('.orgchart-minimap-stage', container);
    viewport = query('.orgchart-minimap-viewport', container);
    setClientSize(container, 400, 240);
    setClientSize(stage, 180, 104);
    restorableDoubles.push(stubRect(container, { left: 0, top: 0, width: 400, height: 240 }));
    restorableDoubles.push(stubRect(chart.chart, { left: -100, top: -50, width: 1000, height: 600 }));
    chart.chart.style.transform = 'matrix(1, 0, 0, 1, -100, -50)';

    chart.updateMinimap(true);
    chart.moveChartFromMinimap(31.333333333333336, 14.666666666666664, parseFloat(viewport.style.width), parseFloat(viewport.style.height));

    chai.expect(parseMatrix(chart.chart.style.transform)[4]).to.be.closeTo(-161.53846153846158, 0.000001);
    chai.expect(parseMatrix(chart.chart.style.transform)[5]).to.be.closeTo(-84.6153846153846, 0.000001);
  });

  it('routes minimap wheel zoom through setChartScale()', function () {
    const scaleSpy = sinon.spy(chart, 'setChartScale');

    restorableDoubles.push(scaleSpy);
    chart.setOptions('minimap', true);
    setClientSize(container, 400, 240);
    restorableDoubles.push(stubRect(container, { left: 10, top: 20, width: 400, height: 240 }));

    chart.minimapWheelHandler({
      deltaY: -100,
      preventDefault: function () {}
    });

    chai.expect(scaleSpy.calledOnce).to.equal(true);
    chai.expect(scaleSpy.firstCall.args[0]).to.equal(chart.chart);
    chai.expect(scaleSpy.firstCall.args[1]).to.equal(1.2);
    chai.expect(scaleSpy.firstCall.args[2]).to.deep.equal({ x: 210, y: 140 });
  });
});