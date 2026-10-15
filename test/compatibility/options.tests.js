const chai = require('chai');
const sinon = require('sinon');

require('jsdom-global')();

const OrgChart = require('../../src/js/orgchart');
const getState = OrgChart.__testing__.getState;
const defaultOptions = new OrgChart().defaultOptions;
const customIcons = Object.fromEntries(Object.entries(defaultOptions.icons).map(function (entry) {
  return [entry[0], 'compat-' + entry[1]];
}));
const optionValues = {
  icons: [defaultOptions.icons, customIcons],
  nodeTitle: ['name', 'label'],
  nodeId: ['id', 'key'],
  toggleSiblingsResp: [false, true],
  visibleLevel: [1, 2, 999],
  chartClass: ['', 'compat-chart', 'compat-chart secondary-chart'],
  exportButton: [false, true],
  exportButtonName: ['Export', 'Save Chart'],
  exportFilename: ['OrgChart', 'compat-export'],
  exportFileextension: ['png', 'pdf', 'PDF'],
  exportScale: [1, 2, 3],
  draggable: [false, true],
  direction: ['t2b', 'b2t', 'l2r', 'r2l'],
  pan: [false, true],
  minimap: [false, true],
  zoom: [false, true],
  zoominLimit: [2.5, 7],
  zoomoutLimit: [0.5, 0.6]
};

function createData() {
  const createPerson = function (identifier, children) {
    const person = {
      id: identifier,
      key: 'key-' + identifier,
      name: 'Name ' + identifier,
      label: 'Label ' + identifier
    };

    if (children) {
      person.children = children;
    }
    return person;
  };

  return createPerson('root', [
    createPerson('first'),
    createPerson('middle', [createPerson('grandchild-one'), createPerson('grandchild-two')]),
    createPerson('last')
  ]);
}

function createSourceFixture(sourceType, large) {
  const tree = createData();
  if (large) {
    tree.children.push({ id: 'extra', key: 'key-extra', name: 'Name extra', label: 'Label extra' });
  }
  let model = tree;
  if (sourceType === 'family') {
    const convertChildren = function (person) {
      if (person.children) {
        person.children.forEach(convertChildren);
        person.children = person.children.map(function (child) { return [child]; });
      }
    };
    convertChildren(tree);
    tree.children[0].push({ id: 'first-partner', key: 'key-first-partner', name: 'First partner', label: 'Partner label' });
    model = [[tree, { id: 'root-partner', key: 'key-root-partner', name: 'Root partner', label: 'Root partner label' }]];
  }
  const records = [];
  const collect = function (data, parent) {
    if (Array.isArray(data)) {
      data.forEach(function (item) { collect(item, parent); });
      return;
    }
    records.push({ data: data, parent: parent });
    (data.children || []).forEach(function (child) { collect(child, data); });
  };
  collect(model, null);
  let datasource = model;
  if (sourceType === 'ul') {
    const buildList = function (person) {
      const list = document.createElement('ul');
      const item = document.createElement('li');
      Object.keys(person).filter(function (key) { return key !== 'children'; }).forEach(function (key) {
        item.dataset[key] = person[key];
      });
      item.appendChild(document.createTextNode(person.name));
      if (person.children) {
        const childList = document.createElement('ul');
        person.children.forEach(function (child) { childList.appendChild(buildList(child).firstElementChild); });
        item.appendChild(childList);
      }
      list.appendChild(item);
      return list;
    };
    datasource = buildList(tree);
  }
  return { data: datasource, records: records };
}

function assertSourceHierarchy(chart, fixture) {
  const nodeId = chart.options.nodeId;
  const expectedIds = fixture.records.map(function (record) { return record.data[nodeId]; }).sort();
  const nodes = Array.from(chart.chart.querySelectorAll('.node'));
  chai.expect(nodes.map(function (node) { return node.id; }).sort()).to.deep.equal(expectedIds);
  fixture.records.forEach(function (record) {
    const node = nodes.find(function (element) { return element.id === record.data[nodeId]; });
    const parent = chart.getParent(node);
    chai.expect(parent && parent.id, 'parent of ' + node.id).to.equal(record.parent ? record.parent[nodeId] : null);
    const expectedChildren = fixture.records.filter(function (child) { return child.parent === record.data; })
      .map(function (child) { return child.data[nodeId]; }).sort();
    chai.expect(chart.getChildren(node).map(function (child) { return child.id; }).sort(), 'children of ' + node.id).to.deep.equal(expectedChildren);
    chai.expect(node.draggable).to.equal(chart.options.draggable);
  });
  const exportedIds = [];
  const visitHierarchy = function (hierarchy) {
    if (Array.isArray(hierarchy)) {
      hierarchy.forEach(visitHierarchy);
      return;
    }
    exportedIds.push(hierarchy.id);
    (hierarchy.children || []).forEach(visitHierarchy);
  };
  visitHierarchy(chart.getHierarchy());
  chai.expect(exportedIds.sort()).to.deep.equal(expectedIds);
}

function dispatchMouse(element, type, clientX, clientY) {
  element.dispatchEvent(new window.MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: clientX || 0,
    clientY: clientY || 0
  }));
}

function dispatchWheel(element, deltaY) {
  element.dispatchEvent(new window.WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    deltaY: deltaY === undefined ? -100 : deltaY,
    clientX: 0,
    clientY: 0
  }));
}

function finishTransition(element) {
  element.dispatchEvent(new window.Event('transitionend', { bubbles: true }));
}

function describeValue(value) {
  return typeof value === 'object' ? value.theme : JSON.stringify(value);
}

describe('orgchart option compatibility', function () {
  let container;
  let chart;
  let createdCharts;
  let captureSpy;
  let originalHtml2canvas;
  let originalJSONDigger;

  function mount(options, targetContainer) {
    chart = new OrgChart(targetContainer || container, Object.assign({ data: createData() }, options));
    createdCharts.push({ instance: chart, element: chart.chart });
    return chart;
  }

  beforeEach(function () {
    document.body.innerHTML = '<div id="chart-host"><div id="chart-container"></div></div>';
    container = document.getElementById('chart-container');
    createdCharts = [];
    originalHtml2canvas = global.html2canvas;
    originalJSONDigger = global.JSONDigger;
    global.JSONDigger = require('json-digger');
    captureSpy = sinon.spy(function (element, options) {
      return Promise.resolve({
        width: 640 * options.scale,
        height: 320 * options.scale,
        toDataURL: function () { return 'data:image/png;base64,fake'; }
      });
    });
    global.html2canvas = captureSpy;
  });

  afterEach(function () {
    createdCharts.forEach(function (createdChart) {
      createdChart.instance.unbindPan();
      createdChart.instance.unbindZoom();
      createdChart.instance.detachMinimap();
      if (createdChart.element !== createdChart.instance.chart) {
        container.removeEventListener('wheel', getState(createdChart.element, 'zoomWheelBoundHandler'));
        container.removeEventListener('touchstart', getState(createdChart.element, 'zoomStartBoundHandler'));
        document.removeEventListener('touchmove', getState(createdChart.element, 'zoomingBoundHandler'));
        document.removeEventListener('touchend', getState(createdChart.element, 'zoomEndBoundHandler'));
        document.removeEventListener('mouseup', getState(createdChart.element, 'panEndBoundHandler'));
        document.removeEventListener('touchend', getState(createdChart.element, 'panEndBoundHandler'));
      }
    });
    global.html2canvas = originalHtml2canvas;
    global.JSONDigger = originalJSONDigger;
    sinon.restore();
    document.body.innerHTML = '';
    chart = null;
  });

  describe('pairwise configuration and supported workflows', function () {
    const optionNames = Object.keys(defaultOptions);

    it('covers every defaultOptions key and all 153 unordered pairs', function () {
      chai.expect(Object.keys(optionValues)).to.have.members(optionNames);
      chai.expect(optionNames.length * (optionNames.length - 1) / 2).to.equal(153);
    });

    optionNames.forEach(function (firstOption, firstIndex) {
      optionNames.slice(firstIndex + 1).forEach(function (secondOption) {
        describe(firstOption + ' + ' + secondOption, function () {
          optionValues[firstOption].forEach(function (firstValue) {
            optionValues[secondOption].forEach(function (secondValue) {
              it(describeValue(firstValue) + ' / ' + describeValue(secondValue), async function () {
                const selectedOptions = { [firstOption]: firstValue, [secondOption]: secondValue };
                const expectedOptions = Object.assign({}, defaultOptions, selectedOptions);
                const currentChart = mount(selectedOptions);
                const nodeFor = function (identifier) {
                  return currentChart.chart.querySelector('[id="' + (expectedOptions.nodeId === 'key' ? 'key-' : '') + identifier + '"]');
                };
                const rootNode = nodeFor('root');
                const firstNode = nodeFor('first');
                const middleNode = nodeFor('middle');
                const lastNode = nodeFor('last');
                const nodeElements = Array.from(currentChart.chart.querySelectorAll('.node'));
                const scaleSpy = sinon.spy(currentChart, 'setChartScale');

                Object.keys(defaultOptions).forEach(function (optionName) {
                  chai.expect(currentChart.options[optionName], optionName).to.deep.equal(expectedOptions[optionName]);
                });
                chai.expect(nodeElements.length).to.equal(6);
                chai.expect(rootNode.querySelector('.title').textContent).to.equal(expectedOptions.nodeTitle === 'label' ? 'Label root' : 'Name root');
                expectedOptions.chartClass.split(' ').filter(Boolean).forEach(function (className) {
                  chai.expect(currentChart.chart.classList.contains(className)).to.equal(true);
                });
                chai.expect(currentChart.chart.classList.contains(expectedOptions.direction)).to.equal(expectedOptions.direction !== 't2b');
                nodeElements.forEach(function (nodeElement) {
                  chai.expect(nodeElement.getAttribute('draggable')).to.equal(expectedOptions.draggable ? 'true' : null);
                  Array.from(nodeElement.querySelectorAll('.edge, .parentNodeSymbol')).forEach(function (iconElement) {
                    chai.expect(iconElement.classList.contains(expectedOptions.icons.theme)).to.equal(true);
                  });
                });
                chai.expect(currentChart.getNodeState(rootNode, 'children').visible).to.equal(expectedOptions.visibleLevel > 1);
                chai.expect(!!container.querySelector('.orgchart-minimap')).to.equal(expectedOptions.minimap);
                const exportButton = document.querySelector('.oc-export-btn');
                chai.expect(!!exportButton).to.equal(expectedOptions.exportButton);
                if (exportButton) {
                  chai.expect(exportButton.textContent).to.equal(expectedOptions.exportButtonName);
                }

                dispatchMouse(currentChart.chart, 'mousedown', 20, 20);
                dispatchMouse(currentChart.chart, 'mousemove', 50, 30);
                chai.expect(!!getState(currentChart.chart, 'panning')).to.equal(expectedOptions.pan);
                dispatchMouse(document, 'mouseup', 50, 30);
                chai.expect(!!getState(currentChart.chart, 'panning')).to.equal(false);
                dispatchWheel(container);
                chai.expect(scaleSpy.callCount).to.equal(expectedOptions.zoom ? 1 : 0);

                if (!currentChart.getNodeState(rootNode, 'children').visible) {
                  dispatchMouse(rootNode, 'mouseenter');
                  dispatchMouse(rootNode.querySelector('.bottomEdge'), 'click');
                  finishTransition(firstNode);
                }
                dispatchMouse(middleNode, 'mouseenter');
                chai.expect(middleNode.querySelector('.topEdge').classList.contains(expectedOptions.icons.collapseToDown)).to.equal(true);
                dispatchMouse(middleNode.querySelector('.leftEdge'), 'click');
                finishTransition(firstNode);
                chai.expect(firstNode.closest('.hierarchy').classList.contains('hidden')).to.equal(true);
                chai.expect(lastNode.closest('.hierarchy').classList.contains('hidden')).to.equal(!expectedOptions.toggleSiblingsResp);
                dispatchMouse(middleNode.querySelector('.leftEdge'), 'click');
                finishTransition(firstNode);
                chai.expect(firstNode.closest('.hierarchy').classList.contains('hidden')).to.equal(false);
                chai.expect(lastNode.closest('.hierarchy').classList.contains('hidden')).to.equal(false);

                if (expectedOptions.draggable) {
                  currentChart.filterAllowedDropNodes(middleNode);
                  chai.expect(firstNode.classList.contains('allowedDrop')).to.equal(true);
                  chai.expect(middleNode.classList.contains('allowedDrop')).to.equal(false);
                  await currentChart.dropHandler({ dropZone: firstNode });
                  chai.expect(currentChart.getParent(middleNode)).to.equal(firstNode);
                  currentChart.hideDropZones();
                }

                const pngSpy = sinon.stub(currentChart, 'exportPNG');
                const pdfSpy = sinon.stub(currentChart, 'exportPDF');
                if (exportButton) {
                  dispatchMouse(exportButton, 'click');
                } else {
                  currentChart.export();
                }
                await Promise.resolve();
                chai.expect(captureSpy.callCount).to.equal(1);
                chai.expect(captureSpy.firstCall.args[0]).to.equal(currentChart.chart);
                chai.expect(captureSpy.firstCall.args[1].scale).to.equal(expectedOptions.exportScale);
                const exportSpy = expectedOptions.exportFileextension.toLowerCase() === 'pdf' ? pdfSpy : pngSpy;
                chai.expect(exportSpy.callCount).to.equal(1);
                chai.expect(exportSpy.firstCall.args[1]).to.equal(expectedOptions.exportFilename);
                chai.expect(container.classList.contains('canvasContainer')).to.equal(false);
                chai.expect(container.querySelector('.mask').classList.contains('hidden')).to.equal(true);
              });
            });
          });
        });
      });
    });
  });

  describe('all switch combinations across datasource types', function () {
    const switches = ['pan', 'zoom', 'minimap', 'draggable', 'compact', 'toggleSiblingsResp', 'exportButton'];
    ['json', 'ul', 'family'].forEach(function (sourceType) {
      ['t2b', 'b2t', 'l2r', 'r2l'].forEach(function (direction) {
        [1, 2, 3].forEach(function (visibleLevel) {
          for (let mask = 0; mask < 128; mask += 1) {
            it(sourceType + ' / ' + direction + ' / depth ' + visibleLevel + ' / mask ' + mask, function () {
              const fixture = createSourceFixture(sourceType);
              const options = { data: fixture.data, direction: direction, visibleLevel: visibleLevel, nodeId: mask % 2 ? 'key' : 'id' };
              switches.forEach(function (key, index) { options[key] = !!(mask & (1 << index)); });
              mount(options);
              assertSourceHierarchy(chart, fixture);
              switches.forEach(function (key) { chai.expect(chart.options[key]).to.equal(options[key]); });
              chai.expect(!!container.querySelector('.orgchart-minimap')).to.equal(options.minimap);
              chai.expect(!!chart.exportButtonElement).to.equal(options.exportButton);
            });
          }
        });
      });
    });
  });

  describe('three-option covering profiles for all public options', function () {
    const publicOptions = Object.keys(defaultOptions).concat(['data', 'nodeContent', 'nodeTemplate', 'createNode', 'dropCriteria', 'initCompleted', 'compact', 'verticalLevel']);
    const enabled = function (profile, index) {
      let bits = profile & (32 + index);
      let count = 0;
      while (bits) {
        count += bits & 1;
        bits >>>= 1;
      }
      return count % 2 === 1;
    };
    it('covers all eight assignments for every triple of 26 public options', function () {
      chai.expect(publicOptions).to.have.length(26);
      for (let first = 0; first < publicOptions.length; first += 1) {
        for (let second = first + 1; second < publicOptions.length; second += 1) {
          for (let third = second + 1; third < publicOptions.length; third += 1) {
            const assignments = new Set();
            for (let profile = 0; profile < 64; profile += 1) {
              assignments.add(Number(enabled(profile, first)) * 4 + Number(enabled(profile, second)) * 2 + Number(enabled(profile, third)));
            }
            chai.expect(assignments.size, [publicOptions[first], publicOptions[second], publicOptions[third]].join(' + ')).to.equal(8);
          }
        }
      }
    });

    ['json', 'ul', 'family'].forEach(function (sourceType) {
      for (let profile = 0; profile < 64; profile += 1) {
        it(sourceType + ' profile ' + profile, async function () {
          const active = Object.fromEntries(publicOptions.map(function (key, index) { return [key, enabled(profile, index)]; }));
          const fixture = createSourceFixture(sourceType, active.data);
          const nodeTitle = active.nodeTitle ? 'label' : 'name';
          mount({
            data: fixture.data,
            icons: active.icons ? { parentNode: 'oci-plus-square' } : defaultOptions.icons,
            nodeTitle: nodeTitle,
            nodeId: active.nodeId ? 'key' : 'id',
            toggleSiblingsResp: active.toggleSiblingsResp,
            visibleLevel: active.visibleLevel ? 3 : 1,
            chartClass: active.chartClass ? 'profile-chart secondary' : '',
            exportButton: active.exportButton,
            exportButtonName: active.exportButtonName ? 'Save Chart' : 'Export',
            exportFilename: active.exportFilename ? 'Profile' : 'OrgChart',
            exportFileextension: active.exportFileextension ? 'pdf' : 'png',
            exportScale: active.exportScale ? 3 : 1,
            draggable: active.draggable,
            direction: active.direction ? 'l2r' : 't2b',
            pan: active.pan, minimap: active.minimap, zoom: active.zoom,
            zoominLimit: active.zoominLimit ? 2.5 : 7,
            zoomoutLimit: active.zoomoutLimit ? 0.6 : 0.5,
            nodeContent: active.nodeContent ? 'name' : undefined,
            nodeTemplate: active.nodeTemplate ? function (data) { return '<div class="title">' + data[nodeTitle] + '</div><div class="content">' + data.name + '</div>'; } : undefined,
            createNode: active.createNode ? function (node) { node.dataset.custom = 'true'; } : undefined,
            dropCriteria: active.dropCriteria ? function (source, parent, target) { return target.id.endsWith('first'); } : undefined,
            initCompleted: active.initCompleted ? function (element) { element.dataset.initialized = 'true'; } : undefined,
            compact: active.compact ? function (data) { return (data.children || []).length > 1; } : false,
            verticalLevel: active.verticalLevel ? 3 : undefined
          });
          assertSourceHierarchy(chart, fixture);
          await Promise.resolve();
          chai.expect(chart.chart.dataset.initialized === 'true').to.equal(active.initCompleted);
          const node = chart.chart.querySelector('.node');
          chai.expect(node.dataset.custom === 'true').to.equal(active.createNode);
          const nodeData = getState(node, 'nodeData');
          chai.expect(node.querySelector('.title').textContent).to.equal(nodeData[nodeTitle]);
        });
      }
    });
  });

  describe('datasource edits survive option reconfiguration', function () {
    ['json', 'ul', 'family'].forEach(function (sourceType) {
      ['addChildren', 'addDescendants', 'addParent', 'addSiblings', 'removeNodes'].forEach(function (operation) {
        it(sourceType + ' / ' + operation, function () {
          const fixture = createSourceFixture(sourceType);
          mount({ data: fixture.data, nodeId: 'key' });
          const nodeFor = function (id) { return chart.chart.querySelector('[id="key-' + id + '"]'); };
          const added = { id: 'added', key: 'key-added', name: 'Added', label: 'Label added' };
          if (operation === 'addChildren') {
            chart.addChildren(nodeFor('middle'), [added]);
          } else if (operation === 'addDescendants') {
            chart.addDescendants([added], nodeFor('middle'));
          } else if (operation === 'addParent') {
            chart.addParent(nodeFor('first'), added);
          } else if (operation === 'addSiblings') {
            chart.addSiblings(nodeFor('first'), [added]);
          } else {
            chart.removeNodes(nodeFor('first'));
          }
          const expectedCount = fixture.records.length + (operation === 'removeNodes' ? -1 : 1);
          chai.expect(chart.chart.querySelectorAll('.node').length).to.equal(expectedCount);
          const hierarchy = chart.getHierarchy();
          const ids = [];
          const collect = function (value) {
            if (Array.isArray(value)) {
              value.forEach(collect);
            } else {
              ids.push(value.id);
              (value.children || []).forEach(collect);
            }
          };
          collect(hierarchy);
          chai.expect(ids).to.have.length(expectedCount);
          if (operation !== 'removeNodes') {
            chai.expect(ids).to.include('key-added');
          }
          chart.setOptions({ chartClass: 'edited-chart', compact: true });
          chai.expect(chart.getHierarchy()).to.deep.equal(hierarchy);
          chai.expect(chart.chart.querySelectorAll('.node').length).to.equal(expectedCount);
        });
      });
    });
  });

  ['zoom', 'minimap'].forEach(function (navigationOption) {
    [
      { zoomoutLimit: 0.8, zoominLimit: 1.2, label: 'exact wheel-step boundaries' },
      { zoomoutLimit: 0.9, zoominLimit: 1.1, label: 'narrow interval' }
    ].forEach(function (limits) {
      it(navigationOption + ' + zoom limits reaches both bounds for ' + limits.label, function () {
        mount({ [navigationOption]: true, zoomoutLimit: limits.zoomoutLimit, zoominLimit: limits.zoominLimit });
        const target = navigationOption === 'minimap' ? container.querySelector('.orgchart-minimap') : container;

        dispatchWheel(target, -100);
        chai.expect(Number(chart.chart.style.transform.slice(7, -1).split(',')[0])).to.equal(limits.zoominLimit);
        chart.chart.style.transform = '';
        dispatchWheel(target, 100);
        chai.expect(Number(chart.chart.style.transform.slice(7, -1).split(',')[0])).to.equal(limits.zoomoutLimit);
      });
    });
    it(navigationOption + ' + zoom limits rejects reversed bounds before initialization', function () {
      chai.expect(function () {
        mount({ [navigationOption]: true, zoomoutLimit: 2, zoominLimit: 1 });
      }).to.throw(RangeError);
    });
  });

  Object.keys(defaultOptions.icons).forEach(function (iconName) {
    it('partial icons.' + iconName + ' + toggleSiblingsResp preserves other icon defaults', function () {
      mount({ icons: { [iconName]: 'custom-icon' }, toggleSiblingsResp: true });

      Object.keys(defaultOptions.icons).forEach(function (otherIconName) {
        chai.expect(chart.options.icons[otherIconName], otherIconName).to.equal(otherIconName === iconName ? 'custom-icon' : defaultOptions.icons[otherIconName]);
      });
    });
  });

  [1, 2].forEach(function (visibleLevel) {
    it('visibleLevel=' + visibleLevel + ' + minimap excludes hidden descendants', function () {
      mount({ visibleLevel: visibleLevel, minimap: true });

      const visibleNodes = Array.from(chart.chart.querySelectorAll('.node')).filter(function (nodeElement) {
        return !nodeElement.closest('.hidden');
      });
      chai.expect(container.querySelectorAll('.orgchart-minimap-node').length).to.equal(visibleNodes.length);
    });
  });

  it('pan + minimap refreshes the viewport on the first mouse move', function () {
    mount({ pan: true, minimap: true });
    const updateSpy = sinon.spy(chart, 'updateMinimap');

    dispatchMouse(chart.chart, 'mousedown', 100, 100);
    dispatchMouse(chart.chart, 'mousemove', 70, 80);

    chai.expect(updateSpy.callCount).to.equal(1);
  });

  it('zoom + visibleLevel handles one wheel event once after init', function () {
    mount({ zoom: true, visibleLevel: 1 });
    chart.init({ data: createData(), visibleLevel: 2 });
    const scaleSpy = sinon.spy(chart, 'setChartScale');

    dispatchWheel(container);

    chai.expect(scaleSpy.callCount).to.equal(1);
  });

  it('zoom + zoominLimit stops wheel zoom when disabled during init', function () {
    mount({ zoom: true, zoominLimit: 2.5 });
    chart.init({ data: createData(), zoom: false });
    const scaleSpy = sinon.spy(chart, 'setChartScale');

    dispatchWheel(container);

    chai.expect(scaleSpy.callCount).to.equal(0);
  });

  it('chartClass + exportButton provides an export button for each chart instance', function () {
    mount({ chartClass: 'first-chart', exportButton: true });
    const secondContainer = document.createElement('div');
    document.getElementById('chart-host').appendChild(secondContainer);
    mount({ chartClass: 'second-chart', exportButton: true }, secondContainer);

    chai.expect(document.querySelectorAll('.oc-export-btn').length).to.equal(2);
  });

  it('exportButton + exportButtonName updates the button label during init', function () {
    mount({ exportButton: true, exportButtonName: 'First Export' });
    chart.init({ data: createData(), exportButtonName: 'Second Export' });

    chai.expect(document.querySelector('.oc-export-btn').textContent).to.equal('Second Export');
  });

  it('exportButton + visibleLevel removes a disabled export button during init', function () {
    mount({ exportButton: true, visibleLevel: 1 });
    chart.init({ data: createData(), exportButton: false, visibleLevel: 2 });

    chai.expect(document.querySelector('.oc-export-btn')).to.equal(null);
  });

  it('chartClass with multiple tokens + exportFilename reuses the download anchor', function () {
    mount({ chartClass: 'compat-chart secondary-chart', exportFilename: 'First Export' });
    sinon.stub(window.HTMLAnchorElement.prototype, 'click');
    document.documentElement.style.WebkitAppearance = 'none';
    const canvas = { toDataURL: function () { return 'data:image/png;base64,fake'; } };

    chart.exportPNG(canvas, chart.options.exportFilename);
    chart.exportPNG(canvas, 'Second Export');

    chai.expect(container.querySelectorAll('.download-btn').length).to.equal(1);
  });

  it('zoom + minimap applies one scale increment per wheel event', function () {
    mount({
      data: {
        id: 'root',
        name: 'Root',
        children: [{ id: 'child', name: 'Child' }]
      },
      zoom: true,
      minimap: true
    });
    const scaleSpy = sinon.spy(chart, 'setChartScale');

    container.querySelector('.orgchart-minimap').dispatchEvent(new window.WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -100,
      clientX: 0,
      clientY: 0
    }));

    chai.expect(scaleSpy.callCount).to.equal(1);
    chai.expect(Number(chart.chart.style.transform.slice(7, -1).split(',')[0])).to.be.closeTo(1.2, 0.000001);
  });

  it('exportButton + loading isolates buttons between chart instances', function () {
    const firstChart = mount({ exportButton: true, chartClass: 'first' });
    const secondContainer = document.createElement('div');
    document.getElementById('chart-host').appendChild(secondContainer);
    const secondChart = mount({ exportButton: true, chartClass: 'second' }, secondContainer);
    firstChart.chart.querySelector('#root').dispatchEvent(new window.MouseEvent('mouseenter'));
    const edge = firstChart.chart.querySelector('#root > .bottomEdge');

    firstChart.startLoading(edge);
    chai.expect(firstChart.exportButtonElement.disabled).to.equal(true);
    chai.expect(secondChart.exportButtonElement.disabled).to.equal(false);
    firstChart.endLoading(edge);
    chai.expect(firstChart.exportButtonElement.disabled).to.equal(false);
  });

  it('createNode styles survive startLoading and endLoading', function () {
    mount({
      createNode: function (nodeElement) {
        nodeElement.querySelector('.title').style.color = 'rgb(10, 20, 30)';
        nodeElement.querySelector('.title').style.opacity = '0.8';
      }
    });
    const title = chart.chart.querySelector('#root > .title');
    chart.chart.querySelector('#root').dispatchEvent(new window.MouseEvent('mouseenter'));
    const edge = chart.chart.querySelector('#root > .bottomEdge');

    chart.startLoading(edge);
    chart.endLoading(edge);
    chai.expect(title.style.color).to.equal('rgb(10, 20, 30)');
    chai.expect(title.style.opacity).to.equal('0.8');
  });

  it('initCompleted + reconfiguration completes only the current chart', async function () {
    const completed = sinon.spy();
    mount({ initCompleted: completed });
    chart.setOptions('chartClass', 'reconfigured');
    await Promise.resolve();

    chai.expect(completed.callCount).to.equal(1);
    chai.expect(completed.firstCall.args[0]).to.equal(chart.chart);
    chai.expect(chart.chart.isConnected).to.equal(true);
  });
});