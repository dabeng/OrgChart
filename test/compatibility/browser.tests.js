const chai = require('chai');
const path = require('node:path');
const puppeteer = require('puppeteer');

const repositoryRoot = path.resolve(__dirname, '../..');
const directions = ['t2b', 'b2t', 'l2r', 'r2l'];
const markerColors = [[240, 30, 30], [25, 180, 75], [250, 180, 25], [45, 90, 240], [170, 55, 210], [25, 190, 200]];

describe('orgchart browser option compatibility', function () {
  this.timeout(30000);

  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({
      headless: true,
      args: process.platform === 'linux' && process.env.GITHUB_ACTIONS === 'true' ? ['--no-sandbox'] : []
    });
  });

  after(async function () {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async function () {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setContent('<!doctype html><html><head></head><body><div id="chart-host"><div id="chart-container"></div></div></body></html>');
    await page.addStyleTag({ path: path.join(repositoryRoot, 'src/css/orgchart.css') });
    await page.addStyleTag({ content: '#chart-container { position: relative; width: 640px; max-width: calc(100vw - 16px); height: 280px; overflow: auto; } .orgchart.r2l { left: 260px; }' });
    await page.addScriptTag({ path: path.join(repositoryRoot, 'src/js/orgchart.js') });
  });

  afterEach(async function () {
    if (page) {
      await page.close();
    }
  });

  describe('family datasource compatibility', function () {
    async function mountFamilyChart(configuration) {
      await page.evaluate(function (settings) {
        const nodeId = settings.nodeId || 'key';
        const person = function (identifier, children) {
          const data = { [nodeId]: identifier, name: identifier };
          if (children) {
            data.children = children;
          }
          return data;
        };
        window.compatFamilyChart = new OrgChart(document.getElementById('chart-container'), {
          data: [[
            person('parent-one', [
              [person('child-one'), person('child-partner')],
              [person('child-two', [[person('grandchild')]])]
            ]),
            person('parent-two', settings.bothParents ? [[person('second-child')]] : undefined)
          ]],
          nodeId: nodeId,
          compact: !!settings.compact,
          visibleLevel: settings.visibleLevel === undefined ? 3 : settings.visibleLevel,
          direction: settings.direction || 't2b',
          draggable: true,
          pan: true,
          zoom: true,
          minimap: true,
          verticalLevel: settings.verticalLevel
        });
      }, configuration || {});
    }

    ['id', 'key'].forEach(function (nodeId) {
      [false, true].forEach(function (compact) {
        it('family couple renders both partners with nodeId=' + nodeId + ' and compact=' + compact, async function () {
          const result = await page.evaluate(function (settings) {
            const chart = new OrgChart(document.getElementById('chart-container'), {
              data: [[
                { [settings.nodeId]: 'partner-one', name: 'Partner one' },
                { [settings.nodeId]: 'partner-two', name: 'Partner two' }
              ]],
              nodeId: settings.nodeId,
              compact: settings.compact,
              draggable: true
            });
            return Array.from(chart.chart.querySelectorAll('.node')).map(function (node) {
              return { id: node.id, draggable: node.draggable };
            });
          }, { nodeId: nodeId, compact: compact });
          chai.expect(result).to.deep.equal([
            { id: 'partner-one', draggable: true },
            { id: 'partner-two', draggable: true }
          ]);
        });
      });
    });

    it('family descendants have actual parents and complete grouped hierarchy', async function () {
      await mountFamilyChart();
      const result = await page.evaluate(function () {
        const chart = window.compatFamilyChart;
        const parent = chart.chart.querySelector('#parent-one');
        const child = chart.chart.querySelector('#child-one');
        const grandchild = chart.chart.querySelector('#grandchild');
        return {
          nodes: chart.chart.querySelectorAll('.node').length,
          parent: chart.getParent(child).id,
          grandparent: chart.getParent(grandchild).id,
          children: chart.getChildren(parent).map(function (node) { return node.id; }),
          hierarchy: chart.getHierarchy()
        };
      });
      chai.expect(result.nodes).to.equal(6);
      chai.expect(result.parent).to.equal('parent-one');
      chai.expect(result.grandparent).to.equal('child-two');
      chai.expect(result.children).to.deep.equal(['child-one', 'child-partner', 'child-two']);
      chai.expect(result.hierarchy).to.deep.equal([[
        { id: 'parent-one', children: [[{ id: 'child-one' }, { id: 'child-partner' }], [{ id: 'child-two', children: [[{ id: 'grandchild' }]] }]] },
        { id: 'parent-two' }
      ]]);
    });

    [false, true].forEach(function (compact) {
      it('family depth limits and expand controls work with compact=' + compact, async function () {
        await mountFamilyChart({ compact: compact, visibleLevel: 1 });
        const result = await page.evaluate(async function () {
          const chart = window.compatFamilyChart;
          const parent = chart.chart.querySelector('#parent-one');
          const child = chart.chart.querySelector('#child-one');
          const grandchild = chart.chart.querySelector('#grandchild');
          const initiallyHidden = child.getClientRects().length === 0 || getComputedStyle(child).opacity === '0';
          parent.dispatchEvent(new MouseEvent('mouseenter'));
          const button = parent.querySelector(':scope > .bottomEdge, :scope > .toggleBtn, :scope > .backToLooseSymbol');
          if (button) {
            button.click();
            await Promise.all(child.getAnimations().map(function (animation) { return animation.finished; }));
          }
          return {
            initiallyHidden: initiallyHidden,
            hasButton: !!button,
            childVisible: child.getClientRects().length > 0 && getComputedStyle(child).opacity !== '0',
            allChildrenVisible: chart.getChildren(parent).every(function (node) { return node.getClientRects().length > 0 && getComputedStyle(node).opacity !== '0'; }),
            grandchildHidden: grandchild.getClientRects().length === 0 || getComputedStyle(grandchild).opacity === '0'
          };
        });
        chai.expect(result).to.deep.equal({ initiallyHidden: true, hasButton: true, childVisible: true, allChildrenVisible: true, grandchildHidden: true });
      });
    });

    [false, true].forEach(function (compact) {
      it('family parents expand only their own child container with compact=' + compact, async function () {
        await mountFamilyChart({ bothParents: true, visibleLevel: 1, compact: compact });
        const result = await page.evaluate(async function () {
          const chart = window.compatFamilyChart;
          const parent = chart.chart.querySelector('#parent-two');
          const ownChild = chart.chart.querySelector('#second-child');
          parent.dispatchEvent(new MouseEvent('mouseenter'));
          parent.querySelector(':scope > .bottomEdge, :scope > .backToLooseSymbol').click();
          await Promise.all(ownChild.getAnimations().map(function (animation) { return animation.finished; }));
          return {
            ownVisible: ownChild.getClientRects().length > 0 && getComputedStyle(ownChild).opacity !== '0',
            otherHidden: chart.chart.querySelector('#child-one').getClientRects().length === 0
          };
        });
        chai.expect(result).to.deep.equal({ ownVisible: true, otherHidden: true });
      });
    });

    it('family sibling queries include all nodes with the same chart parent', async function () {
      await mountFamilyChart();
      const siblings = await page.evaluate(function () {
        const chart = window.compatFamilyChart;
        return chart.getSiblings(chart.chart.querySelector('#child-one')).map(function (node) { return node.id; }).sort();
      });
      chai.expect(siblings).to.deep.equal(['child-partner', 'child-two']);
    });

    [false, true].forEach(function (compact) {
      it('family addChildren and removeNodes retain other group members with compact=' + compact, async function () {
        await mountFamilyChart({ compact: compact });
        const result = await page.evaluate(function () {
          const chart = window.compatFamilyChart;
          chart.addChildren(chart.chart.querySelector('#parent-one'), [{ key: 'added-one', name: 'Added one' }]);
          chart.addChildren(chart.chart.querySelector('#parent-two'), [{ key: 'added-two', name: 'Added two' }]);
          chart.removeNodes(chart.chart.querySelector('#child-one'));
          return {
            firstParent: chart.getParent(chart.chart.querySelector('#added-one')).id,
            secondParent: chart.getParent(chart.chart.querySelector('#added-two')).id,
            partnerParent: chart.getParent(chart.chart.querySelector('#child-partner')).id,
            count: chart.chart.querySelectorAll('.node').length,
            hierarchy: chart.getHierarchy()
          };
        });
        chai.expect(result.firstParent).to.equal('parent-one');
        chai.expect(result.secondParent).to.equal('parent-two');
        chai.expect(result.partnerParent).to.equal('parent-one');
        chai.expect(result.count).to.equal(7);
        chai.expect(result.hierarchy).to.be.an('array');
      });

      it('family addSiblings and addParent reparent only the selected member with compact=' + compact, async function () {
        await mountFamilyChart({ compact: compact });
        const result = await page.evaluate(function () {
          const chart = window.compatFamilyChart;
          chart.addSiblings(chart.chart.querySelector('#child-one'), [{ key: 'added-sibling', name: 'Added sibling' }]);
          chart.addParent(chart.chart.querySelector('#child-one'), { key: 'added-parent', name: 'Added parent' });
          return {
            childParent: chart.getParent(chart.chart.querySelector('#child-one')).id,
            parentParent: chart.getParent(chart.chart.querySelector('#added-parent')).id,
            partnerParent: chart.getParent(chart.chart.querySelector('#child-partner')).id,
            siblingParent: chart.getParent(chart.chart.querySelector('#added-sibling')).id,
            count: chart.chart.querySelectorAll('.node').length,
            hierarchy: chart.getHierarchy()
          };
        });
        chai.expect(result).to.include({ childParent: 'added-parent', parentParent: 'parent-one', partnerParent: 'parent-one', siblingParent: 'parent-one', count: 8 });
        chai.expect(result.hierarchy).to.be.an('array');
      });
    });
  });

  describe('extended browser workflows across datasource types', function () {
    this.timeout(120000);
    ['json', 'ul', 'family', 'hybrid', 'compact-data'].forEach(function (sourceType) {
      directions.forEach(function (direction) {
        it(sourceType + ' / ' + direction + ' / all 128 switch masks', async function () {
          await page.addStyleTag({ content: '.orgchart .node { transition: none !important; }' });
          const completed = await page.evaluate(async function (settings) {
            const switches = ['pan', 'zoom', 'minimap', 'draggable', 'compact', 'toggleSiblingsResp', 'exportButton'];
            const assert = function (condition, message, mask) {
              if (!condition) {
                throw new Error(settings.sourceType + ' / ' + settings.direction + ' / mask ' + mask + ': ' + message);
              }
            };
            const makePerson = function (id, children) {
              const person = { id: id, key: 'key-' + id, name: id, label: 'Label ' + id };
              if (children) {
                person.children = children;
              }
              return person;
            };
            const makeList = function (data) {
              const list = document.createElement('ul');
              const item = document.createElement('li');
              ['id', 'key', 'label'].forEach(function (key) { item.dataset[key] = data[key]; });
              item.appendChild(document.createTextNode(data.name));
              if (data.children) {
                const children = document.createElement('ul');
                data.children.forEach(function (child) { children.appendChild(makeList(child).firstElementChild); });
                item.appendChild(children);
              }
              list.appendChild(item);
              return list;
            };
            const basis = function (element) {
              const matrix = new DOMMatrix(getComputedStyle(element).transform);
              const scale = Math.hypot(matrix.m11, matrix.m12, matrix.m13);
              return [matrix.m11, matrix.m12, matrix.m21, matrix.m22].map(function (value) { return Math.round(value / scale * 1000000); }).join(',');
            };
            const finish = function (chart) {
              Array.from(chart.chart.querySelectorAll('.sliding')).forEach(function (node) {
                node.dispatchEvent(new Event('transitionend', { bubbles: true }));
              });
            };
            const expand = function (chart, node) {
              if (node.classList.contains('compact')) {
                chart.backToLooseHandler({ compactNode: node });
              } else if (!chart.getNodeState(node, 'children').visible) {
                chart.showChildren(node);
                finish(chart);
              }
            };
            let total = 0;
            for (let mask = 0; mask < 128; mask += 1) {
              document.body.innerHTML = '<div id="chart-host"><div id="chart-container"></div></div>';
              const root = makePerson('root', [makePerson('first'), makePerson('middle', [makePerson('grandchild')]), makePerson('last')]);
              let data = root;
              let expectedCount = 5;
              if (settings.sourceType === 'family') {
                root.children[1].children = root.children[1].children.map(function (person) { return [person]; });
                root.children = root.children.map(function (person) { return [person]; });
                root.children[0].push(makePerson('first-partner'));
                data = [[root, makePerson('root-partner')]];
                expectedCount = 7;
              } else if (settings.sourceType === 'ul') {
                data = makeList(root);
              } else if (settings.sourceType === 'hybrid') {
                root.hybrid = true;
              } else if (settings.sourceType === 'compact-data') {
                root.compact = true;
              }
              const options = {
                data: data, direction: settings.direction, visibleLevel: mask % 3 + 1,
                nodeId: mask % 2 ? 'key' : 'id', nodeTitle: mask % 2 ? 'label' : 'name',
                nodeContent: 'name', icons: { parentNode: 'oci-plus-square' },
                exportFilename: 'Workflow', exportScale: 2, exportFileextension: mask % 2 ? 'pdf' : 'png',
                createNode: function (node) { node.dataset.custom = 'true'; }
              };
              switches.forEach(function (key, index) { options[key] = !!(mask & (1 << index)); });
              const container = document.getElementById('chart-container');
              const chart = new OrgChart(container, options);
              const nodeFor = function (id) { return chart.chart.querySelector('[id="' + (options.nodeId === 'key' ? 'key-' : '') + id + '"]'); };
              const rootNode = nodeFor('root');
              const originalBasis = basis(chart.chart);
              assert(chart.chart.querySelectorAll('.node').length === expectedCount, 'initial nodes missing', mask);
              expand(chart, rootNode);
              const source = nodeFor('first');
              const target = nodeFor('middle');
              assert(source.getClientRects().length > 0 && getComputedStyle(source).opacity !== '0', 'source cannot expand', mask);
              if (options.zoom) {
                const rect = container.getBoundingClientRect();
                container.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100, clientX: rect.left + 80, clientY: rect.top + 80 }));
                assert(basis(chart.chart) === originalBasis, 'zoom changed direction', mask);
              }
              if (options.minimap) {
                const minimap = container.querySelector('.orgchart-minimap');
                const before = new DOMMatrix(getComputedStyle(chart.chart).transform);
                const scale = Math.hypot(before.m11, before.m12, before.m13);
                const rect = minimap.getBoundingClientRect();
                minimap.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100, clientX: rect.left + 5, clientY: rect.top + 5 }));
                const after = new DOMMatrix(getComputedStyle(chart.chart).transform);
                assert(Math.abs(Math.hypot(after.m11, after.m12, after.m13) - scale * 1.2) < 0.000001, 'minimap wheel repeated', mask);
                assert(basis(chart.chart) === originalBasis, 'minimap changed direction', mask);
              }
              if (options.pan) {
                chart.chart.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
                chart.chart.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 120, clientY: 110 }));
                document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                assert(basis(chart.chart) === originalBasis, 'pan changed direction', mask);
              }
              if (options.draggable) {
                chart.filterAllowedDropNodes(source);
                assert(target.classList.contains('allowedDrop'), 'valid target excluded', mask);
                await chart.dropHandler({ dropZone: target });
                assert(chart.getParent(nodeFor('first')).id === nodeFor('middle').id, 'wrong drop parent', mask);
                assert(nodeFor('first').getClientRects().length > 0 && getComputedStyle(nodeFor('first')).opacity !== '0', 'drop target stayed collapsed', mask);
                if (settings.sourceType === 'family') {
                  assert(chart.getParent(nodeFor('first-partner')).id === nodeFor('root').id, 'drag moved spouse too', mask);
                }
                chart.setOptions('chartClass', 'workflow-chart secondary');
                assert(chart.getParent(nodeFor('first')).id === nodeFor('middle').id, 'reconfiguration lost drop', mask);
              }
              assert(chart.chart.querySelectorAll('.node').length === expectedCount, 'nodes lost after workflow', mask);
              assert(chart.chart.querySelectorAll('[data-custom=true]').length === expectedCount, 'createNode lost', mask);
              if (options.exportButton) {
                let exported = false;
                window.html2canvas = function () { return Promise.resolve({ width: 640, height: 320 }); };
                chart.exportPNG = chart.exportPDF = function (canvas, filename) { exported = filename === 'Workflow'; };
                chart.exportButtonElement.click();
                await Promise.resolve();
                assert(exported, 'export routing failed', mask);
              }
              chart.unbindPan();
              chart.unbindZoom();
              chart.detachMinimap();
              total += 1;
            }
            return total;
          }, { sourceType: sourceType, direction: direction });
          chai.expect(completed).to.equal(128);
        });
      });
    });
  });

  async function mountCompactChart(configuration) {
    await page.evaluate(function (settings) {
      const identifierField = settings.nodeId || 'id';
      const person = function (identifier, children) {
        const data = { [identifierField]: identifier, name: identifier };
        if (children) {
          data.children = children;
        }
        return data;
      };
      const data = person('root', [
        person('manager', Array.from({ length: 10 }, function (unused, index) {
          return person('child-' + index, settings.nested && index === 0 ? [person('grandchild')] : undefined);
        })),
        person('target', [person('target-child')]),
        person('other')
      ]);
      const options = {
        data: data,
        nodeId: identifierField,
        draggable: settings.mode !== 'literal',
        visibleLevel: settings.visibleLevel === undefined ? 3 : settings.visibleLevel,
        direction: settings.direction || 't2b',
        verticalLevel: settings.verticalLevel,
        pan: !!settings.navigation,
        zoom: !!settings.navigation,
        minimap: !!settings.navigation
      };
      if (settings.hybrid) {
        data.children[0].hybrid = true;
      }
      if (settings.mode === 'data') {
        data.children[0].compact = true;
      } else if (settings.mode === 'boolean' || settings.mode === 'literal') {
        options.compact = true;
        if (settings.mode === 'literal') {
          delete options.draggable;
          options.drag = true;
        }
      } else if (settings.mode === 'normal') {
        options.compact = false;
      } else {
        options.compact = function (nodeData) { return (nodeData.children || []).length >= 5; };
      }
      window.compatCompactChart = new OrgChart(document.getElementById('chart-container'), options);
    }, configuration || {});
  }

  async function expandCompactManager() {
    await page.evaluate(function () {
      const chart = window.compatCompactChart;
      const root = chart.chart.querySelector('#root');
      root.dispatchEvent(new MouseEvent('mouseenter'));
      if (!chart.getNodeState(root, 'children').visible) {
        root.querySelector(':scope > .bottomEdge').click();
      }
    });
    await page.waitForFunction(function () { return !window.compatCompactChart.chart.querySelector('.sliding'); });
    await page.evaluate(function () {
      window.compatCompactChart.chart.querySelector('#manager').dispatchEvent(new MouseEvent('mouseenter'));
      window.compatCompactChart.chart.querySelector('#manager > .backToLooseSymbol').click();
    });
  }

  describe('compact layout compatibility', function () {
    ['callback', 'data'].forEach(function (mode) {
      it('compact layout relations include every real child with ' + mode, async function () {
        await mountCompactChart({ mode: mode });
        const result = await page.evaluate(function () {
          const chart = window.compatCompactChart;
          const source = chart.chart.querySelector('#child-0');
          const manager = chart.chart.querySelector('#manager');
          const hierarchy = chart.getHierarchy();
          return {
            parent: chart.getParent(source).id,
            children: chart.getChildren(manager).map(function (node) { return node.id; }),
            siblings: chart.getSiblings(source).length,
            hierarchyChildren: (hierarchy.children[0].children || []).length
          };
        });
        chai.expect(result.parent).to.equal('manager');
        chai.expect(result.children).to.deep.equal(Array.from({ length: 10 }, function (unused, index) { return 'child-' + index; }));
        chai.expect(result.siblings).to.equal(9);
        chai.expect(result.hierarchyChildren).to.equal(10);
      });

      ['id', 'key'].forEach(function (nodeId) {
        it('compact layout drag moves only the selected child with ' + mode + ' and ' + nodeId, async function () {
          await mountCompactChart({ mode: mode, nodeId: nodeId });
          await expandCompactManager();
          const result = await page.evaluate(async function () {
            const chart = window.compatCompactChart;
            const source = chart.chart.querySelector('#child-0');
            const manager = chart.chart.querySelector('#manager');
            const target = chart.chart.querySelector('#target');
            const peer = chart.chart.querySelector('#child-1');
            let oldParent;
            chart.chart.addEventListener('nodedrop.orgchart', function (event) { oldParent = event.detail.dragZone.id; });
            source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
            const peerAllowed = peer.classList.contains('allowedDrop');
            await chart.dropHandler({ dropZone: target });
            const movedSource = chart.chart.querySelector('#child-0');
            const movedManager = chart.chart.querySelector('#manager');
            const movedTarget = chart.chart.querySelector('#target');
            return {
              oldParent: oldParent, peerAllowed: peerAllowed,
              sourceParent: chart.getParent(movedSource).id,
              managerParent: chart.getParent(movedManager).id,
              managerChildren: chart.getChildren(movedManager).length,
              targetChildren: chart.getChildren(movedTarget).map(function (node) { return node.id; }),
              sourceNestedInManager: movedManager.contains(movedSource)
            };
          });
          chai.expect(result.oldParent).to.equal('manager');
          chai.expect(result.peerAllowed).to.equal(true);
          chai.expect(result.sourceParent).to.equal('target');
          chai.expect(result.managerParent).to.equal('root');
          chai.expect(result.managerChildren).to.equal(9);
          chai.expect(result.targetChildren).to.deep.equal(['target-child', 'child-0']);
          chai.expect(result.sourceNestedInManager).to.equal(false);
        });
      });
    });

    [1, 2, 3].forEach(function (visibleLevel) {
      it('compact layout expands children after visibleLevel=' + visibleLevel, async function () {
        await mountCompactChart({ visibleLevel: visibleLevel });
        await expandCompactManager();
        const visible = await page.evaluate(function () {
          const source = window.compatCompactChart.chart.querySelector('#child-0');
          return source.getClientRects().length > 0 && getComputedStyle(source).opacity !== '0' && !source.classList.contains('slide-up');
        });
        chai.expect(visible).to.equal(true);
      });
    });

    it('compact layout supports literal visibleLevel=true, drag=true, compact=true', async function () {
      await mountCompactChart({ mode: 'literal', visibleLevel: true });
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        chart.chart.querySelector('#root').dispatchEvent(new MouseEvent('mouseenter'));
        chart.chart.querySelector('#root > .backToLooseSymbol').click();
        chart.chart.querySelector('#manager').dispatchEvent(new MouseEvent('mouseenter'));
        chart.chart.querySelector('#manager > .backToLooseSymbol').click();
        const source = chart.chart.querySelector('#child-0');
        return { draggable: source.draggable, visible: getComputedStyle(source).opacity !== '0' && source.getClientRects().length > 0 };
      });
      chai.expect(result).to.deep.equal({ draggable: true, visible: true });
    });

    [
      { source: 'target-child', target: 'manager', expectedParent: 'manager', parent: 'target', remaining: 0 },
      { source: 'child-1', target: 'child-2', expectedParent: 'child-2', parent: 'manager', remaining: 9 },
      { source: 'child-0', target: 'target', expectedParent: 'target', parent: 'manager', remaining: 9, nested: true },
      { source: 'manager', target: 'target', expectedParent: 'target', parent: 'root', remaining: 2 }
    ].forEach(function (scenario) {
      it('compact layout moves ' + scenario.source + ' into ' + scenario.target + ' without losing descendants', async function () {
        await mountCompactChart({ nested: scenario.nested });
        await expandCompactManager();
        const result = await page.evaluate(async function (settings) {
          const chart = window.compatCompactChart;
          const source = chart.chart.querySelector('#' + settings.source);
          const target = chart.chart.querySelector('#' + settings.target);
          chart.filterAllowedDropNodes(source);
          const sourceAllowed = source.classList.contains('allowedDrop');
          const descendantsAllowed = Array.from(source.querySelectorAll('.node')).some(function (node) { return node.classList.contains('allowedDrop'); });
          await chart.dropHandler({ dropZone: target });
          const movedSource = chart.chart.querySelector('#' + settings.source);
          const parent = chart.chart.querySelector('#' + settings.parent);
          const grandchild = chart.chart.querySelector('#grandchild');
          return {
            parent: chart.getParent(movedSource).id,
            remaining: chart.getChildren(parent).length,
            grandchildParent: grandchild ? chart.getParent(grandchild).id : null,
            total: chart.chart.querySelectorAll('.node').length,
            sourceAllowed: sourceAllowed, descendantsAllowed: descendantsAllowed
          };
        }, scenario);
        chai.expect(result.parent).to.equal(scenario.expectedParent);
        chai.expect(result.remaining).to.equal(scenario.remaining);
        chai.expect(result.total).to.equal(scenario.nested ? 16 : 15);
        chai.expect(result.sourceAllowed).to.equal(false);
        chai.expect(result.descendantsAllowed).to.equal(false);
        if (scenario.nested) {
          chai.expect(result.grandchildParent).to.equal('child-0');
        }
      });
    });

    it('compact layout keeps the last child visible when the source manager becomes a leaf', async function () {
      await mountCompactChart();
      await expandCompactManager();
      const result = await page.evaluate(async function () {
        const chart = window.compatCompactChart;
        for (let index = 0; index < 10; index += 1) {
          const source = chart.chart.querySelector('#child-' + index);
          const target = chart.chart.querySelector('#target');
          chart.filterAllowedDropNodes(source);
          await chart.dropHandler({ dropZone: target });
        }
        const source = chart.chart.querySelector('#child-9');
        const manager = chart.chart.querySelector('#manager');
        return {
          total: chart.chart.querySelectorAll('.node').length,
          children: chart.getChildren(manager).length,
          targetChildren: chart.getChildren(chart.chart.querySelector('#target')).length,
          parent: chart.getParent(source).id,
          visible: getComputedStyle(source).opacity !== '0' && source.getClientRects().length > 0
        };
      });
      chai.expect(result).to.deep.equal({ total: 15, children: 0, targetChildren: 11, parent: 'target', visible: true });
    });

    it('compact layout preserves a prior normal-layout drop when enabled later', async function () {
      await mountCompactChart({ mode: 'normal' });
      const result = await page.evaluate(async function () {
        const chart = window.compatCompactChart;
        chart.filterAllowedDropNodes(chart.chart.querySelector('#child-0'));
        await chart.dropHandler({ dropZone: chart.chart.querySelector('#target') });
        chart.setOptions('compact', true);
        return { parent: chart.getParent(chart.chart.querySelector('#child-0')).id, total: chart.chart.querySelectorAll('.node').length };
      });
      chai.expect(result).to.deep.equal({ parent: 'target', total: 15 });
    });

    it('compact layout permits addChildren and removeNodes without changing sibling branches', async function () {
      await mountCompactChart();
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        chart.addChildren(chart.chart.querySelector('#manager'), [{ id: 'added', name: 'Added' }]);
        const afterAdd = chart.getChildren(chart.chart.querySelector('#manager')).map(function (node) { return node.id; });
        chart.removeNodes(chart.chart.querySelector('#child-0'));
        const manager = chart.chart.querySelector('#manager');
        return {
          afterAdd: afterAdd,
          managerExists: !!manager,
          managerChildren: manager ? chart.getChildren(manager).length : 0,
          targetExists: !!chart.chart.querySelector('#target'),
          total: chart.chart.querySelectorAll('.node').length
        };
      });
      chai.expect(result.afterAdd).to.have.length(11);
      chai.expect(result.afterAdd).to.include('added');
      chai.expect(result.managerExists).to.equal(true);
      chai.expect(result.managerChildren).to.equal(10);
      chai.expect(result.targetExists).to.equal(true);
      chai.expect(result.total).to.equal(15);
    });

    it('compact layout can be disabled without leaving inherited compact flags', async function () {
      await mountCompactChart({ mode: 'boolean', nested: true });
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        chart.setOptions('compact', false);
        return {
          compactNodes: chart.chart.querySelectorAll('.node.compact').length,
          parent: chart.getParent(chart.chart.querySelector('#child-0')).id,
          grandchildParent: chart.getParent(chart.chart.querySelector('#grandchild')).id,
          total: chart.chart.querySelectorAll('.node').length
        };
      });
      chai.expect(result).to.deep.equal({ compactNodes: 0, parent: 'manager', grandchildParent: 'child-0', total: 16 });
    });

    directions.forEach(function (direction) {
      [2, 3].forEach(function (verticalLevel) {
        it('compact layout + verticalLevel=' + verticalLevel + ' + direction=' + direction + ' supports drag and expansion', async function () {
          await mountCompactChart({ mode: 'boolean', direction: direction, verticalLevel: verticalLevel, visibleLevel: 1, navigation: true });
          const result = await page.evaluate(async function () {
            const chart = window.compatCompactChart;
            const root = chart.chart.querySelector('#root');
            const manager = chart.chart.querySelector('#manager');
            const child = chart.chart.querySelector('#child-0');
            root.dispatchEvent(new MouseEvent('mouseenter'));
            const rootButton = root.querySelector(':scope > .backToLooseSymbol, :scope > .bottomEdge, :scope > .toggleBtn');
            rootButton.click();
            manager.dispatchEvent(new Event('transitionend', { bubbles: true }));
            manager.dispatchEvent(new MouseEvent('mouseenter'));
            const managerButton = manager.querySelector(':scope > .backToLooseSymbol, :scope > .bottomEdge, :scope > .toggleBtn');
            managerButton.click();
            child.dispatchEvent(new Event('transitionend', { bubbles: true }));
            await Promise.all(child.getAnimations().map(function (animation) { return animation.finished; }));
            const expanded = child.getClientRects().length > 0 && getComputedStyle(child).opacity !== '0';
            chart.filterAllowedDropNodes(child);
            await chart.dropHandler({ dropZone: chart.chart.querySelector('#target') });
            const movedChild = chart.chart.querySelector('#child-0');
            const movedManager = chart.chart.querySelector('#manager');
            return {
              expanded: expanded,
              parent: chart.getParent(movedChild).id,
              managerParent: chart.getParent(movedManager).id,
              total: chart.chart.querySelectorAll('.node').length,
              children: chart.getChildren(movedManager).length,
              direction: chart.options.direction,
              minimap: !!document.querySelector('.orgchart-minimap')
            };
          });
          chai.expect(result.expanded).to.equal(true);
          chai.expect(result.parent).to.equal('target');
          chai.expect(result.managerParent).to.equal('root');
          chai.expect(result.total).to.equal(15);
          chai.expect(result.children).to.equal(9);
          chai.expect(result.direction).to.equal(direction);
          chai.expect(result.minimap).to.equal(true);
        });
      });
    });

    it('compact layout + hybrid data uses matching child containers and toggle controls', async function () {
      await mountCompactChart({ mode: 'boolean', hybrid: true, visibleLevel: 2 });
      const result = await page.evaluate(async function () {
        const chart = window.compatCompactChart;
        chart.chart.querySelector('#root').dispatchEvent(new MouseEvent('mouseenter'));
        chart.chart.querySelector('#root > .backToLooseSymbol').click();
        const manager = chart.chart.querySelector('#manager');
        const source = chart.chart.querySelector('#child-0');
        manager.dispatchEvent(new MouseEvent('mouseenter'));
        const bottomEdge = manager.querySelector(':scope > .bottomEdge');
        const initiallyHidden = source.getClientRects().length === 0 || getComputedStyle(source).opacity === '0';
        bottomEdge.click();
        source.dispatchEvent(new Event('transitionend', { bubbles: true }));
        await Promise.all(source.getAnimations().map(function (animation) { return animation.finished; }));
        return {
          initiallyHidden: initiallyHidden,
          expanded: source.getClientRects().length > 0 && getComputedStyle(source).opacity !== '0',
          verticalContainer: manager.nextElementSibling.classList.contains('vertical'),
          children: chart.getChildren(manager).length
        };
      });
      chai.expect(result).to.deep.equal({ initiallyHidden: true, expanded: true, verticalContainer: true, children: 10 });
    });

    it('compact layout supports adding siblings and an intermediate parent', async function () {
      await mountCompactChart();
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        chart.addSiblings(chart.chart.querySelector('#child-0'), [{ id: 'added-sibling', name: 'Sibling' }]);
        chart.addParent(chart.chart.querySelector('#child-0'), { id: 'added-parent', name: 'Parent' });
        const child = chart.chart.querySelector('#child-0');
        const addedParent = chart.chart.querySelector('#added-parent');
        return {
          childParent: chart.getParent(child).id,
          parentParent: chart.getParent(addedParent).id,
          addedSiblingParent: chart.getParent(chart.chart.querySelector('#added-sibling')).id,
          managerChildren: chart.getChildren(chart.chart.querySelector('#manager')).length,
          total: chart.chart.querySelectorAll('.node').length
        };
      });
      chai.expect(result).to.deep.equal({ childParent: 'added-parent', parentParent: 'manager', addedSiblingParent: 'manager', managerChildren: 11, total: 17 });
    });

    it('compact layout honors dropCriteria and cancelable drop events', async function () {
      await mountCompactChart();
      const result = await page.evaluate(async function () {
        const chart = window.compatCompactChart;
        let callbackParent;
        chart.options.dropCriteria = function (source, parent, target) {
          callbackParent = parent.id;
          return target.id === 'target';
        };
        const source = chart.chart.querySelector('#child-0');
        const target = chart.chart.querySelector('#target');
        chart.filterAllowedDropNodes(source);
        const allowed = Array.from(chart.chart.querySelectorAll('.allowedDrop')).map(function (node) { return node.id; });
        chart.chart.addEventListener('nodedrop.orgchart', function (event) { event.preventDefault(); }, { once: true });
        await chart.dropHandler({ dropZone: target });
        return { allowed: allowed, callbackParent: callbackParent, parent: chart.getParent(source).id, total: chart.chart.querySelectorAll('.node').length };
      });
      chai.expect(result).to.deep.equal({ allowed: ['target'], callbackParent: 'manager', parent: 'manager', total: 15 });
    });

    it('compact layout retains nodeTemplate, nodeContent, createNode and custom icons during rebuild', async function () {
      await mountCompactChart();
      const result = await page.evaluate(async function () {
        const chart = window.compatCompactChart;
        chart.setOptions({
          nodeContent: 'name',
          nodeTemplate: function (data) { return '<div class="title">' + data.name + '</div><div class="content">' + data.name + '</div>'; },
          createNode: function (node) { node.setAttribute('data-custom', 'true'); },
          icons: { parentNode: 'oci-plus-square' }
        });
        chart.filterAllowedDropNodes(chart.chart.querySelector('#child-0'));
        await chart.dropHandler({ dropZone: chart.chart.querySelector('#target') });
        const source = chart.chart.querySelector('#child-0');
        return {
          parent: chart.getParent(source).id,
          customNodes: chart.chart.querySelectorAll('[data-custom=true]').length,
          title: source.querySelector('.title').textContent,
          content: source.querySelector('.content').textContent,
          icon: chart.options.icons.parentNode,
          theme: chart.options.icons.theme
        };
      });
      chai.expect(result).to.deep.equal({ parent: 'target', customNodes: 15, title: 'child-0', content: 'child-0', icon: 'oci-plus-square', theme: 'oci' });
    });

    it('compact layout hides vertical descendants when the compact parent is closed', async function () {
      await mountCompactChart({ mode: 'boolean', verticalLevel: 3, visibleLevel: true });
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        chart.chart.querySelector('#root').dispatchEvent(new MouseEvent('mouseenter'));
        chart.chart.querySelector('#root > .backToLooseSymbol').click();
        chart.chart.querySelector('#root > .backToCompactSymbol').click();
        return chart.chart.querySelector('#child-0').getClientRects().length;
      });
      chai.expect(result).to.equal(0);
    });

    it('compact layout + minimap refreshes after depth-limited children finish expanding', async function () {
      await mountCompactChart({ visibleLevel: 2, navigation: true });
      await expandCompactManager();
      await page.waitForFunction(function () {
        return Array.from(window.compatCompactChart.chart.querySelectorAll('.node')).every(function (node) {
          return node.getAnimations().length === 0;
        });
      });
      const result = await page.evaluate(function () {
        const chart = window.compatCompactChart;
        return {
          visible: Array.from(chart.chart.querySelectorAll('.node')).filter(function (node) {
            return node.getClientRects().length > 0 && getComputedStyle(node).opacity !== '0';
          }).length,
          preview: document.querySelectorAll('.orgchart-minimap-node').length
        };
      });
      chai.expect(result.preview).to.equal(result.visible);
    });
  });

  it('pan + zoom preserves fractional translations during the next drag', async function () {
    const result = await page.evaluate(function () {
      const chart = new OrgChart(document.getElementById('chart-container'), {
        data: { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] },
        pan: true, zoom: true
      });
      chart.setChartScale(chart.chart, 1.2, { x: 50.25, y: 40.5 });
      const before = chart.chart.getBoundingClientRect();
      chart.chart.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
      chart.chart.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 130, clientY: 110 }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      const after = chart.chart.getBoundingClientRect();
      return { deltaX: after.left - before.left, deltaY: after.top - before.top };
    });
    chai.expect(result.deltaX).to.be.closeTo(30, 0.0001);
    chai.expect(result.deltaY).to.be.closeTo(10, 0.0001);
  });

  it('zoom + draggable tolerates pinch gestures losing a finger and resets pinch state', async function () {
    const result = await page.evaluate(function () {
      const chart = new OrgChart(document.getElementById('chart-container'), {
        data: { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] },
        zoom: true, pan: true, draggable: true, minimap: true
      });
      const touches = [{ clientX: 10, clientY: 10 }, { clientX: 110, clientY: 10 }];
      chart.zoomStartHandler({ orgChart: chart, touches: touches });
      chart.zoomingHandler({ orgChart: chart, touches: [touches[0]] });
      chart.zoomEndHandler({ orgChart: chart });
      chart.zoomStartHandler({ orgChart: chart, touches: touches });
      chart.zoomingHandler({ orgChart: chart, touches: [{ clientX: 10, clientY: 10 }, { clientX: 130, clientY: 10 }] });
      chart.zoomEndHandler({ orgChart: chart });
      const afterPinch = chart.chart.style.transform;
      chart.zoomStartHandler({ orgChart: chart, touches: touches });
      chart.zoomEndHandler({ orgChart: chart });
      return { afterPinch: afterPinch, afterNoMove: chart.chart.style.transform };
    });
    chai.expect(result.afterPinch).to.not.equal('');
    chai.expect(result.afterNoMove).to.equal(result.afterPinch);
  });

  ['id', 'key'].forEach(function (nodeId) {
    it('nodeId=' + nodeId + ' + draggable reparents hybrid data using the configured identifier', async function () {
      const result = await page.evaluate(async function (identifierField) {
        const chart = new OrgChart(document.getElementById('chart-container'), {
          data: {
            [identifierField]: 'root', name: 'Root', hybrid: true,
            children: [
              { [identifierField]: 'source', name: 'Source' },
              { [identifierField]: 'target', name: 'Target' }
            ]
          },
          nodeId: identifierField,
          draggable: true
        });
        const sourceNode = chart.chart.querySelector('#source');
        const targetNode = chart.chart.querySelector('#target');
        chart.filterAllowedDropNodes(sourceNode);
        try {
          await chart.dropHandler({ dropZone: targetNode });
          const movedNode = chart.chart.querySelector('#source');
          return { error: null, parent: chart.getParent(movedNode).id };
        } catch (error) {
          return { error: error.message, parent: chart.getParent(sourceNode).id };
        }
      }, nodeId);

      chai.expect(result.error, JSON.stringify(result)).to.equal(null);
      chai.expect(result.parent).to.equal('target');
    });
  });

  [1280, 390].forEach(function (viewportWidth) {
    it('pan + zoom + minimap handles one wheel event once at viewport ' + viewportWidth, async function () {
      await page.setViewport({ width: viewportWidth, height: 844 });
      const result = await page.evaluate(function () {
        const container = document.getElementById('chart-container');
        const chart = new OrgChart(container, {
          data: { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] },
          pan: true, zoom: true, minimap: true
        });
        const minimap = container.querySelector('.orgchart-minimap');
        const minimapRect = minimap.getBoundingClientRect();
        minimap.dispatchEvent(new WheelEvent('wheel', {
          bubbles: true, cancelable: true, deltaY: -100,
          clientX: minimapRect.left + 10, clientY: minimapRect.top + 10
        }));
        return new DOMMatrix(getComputedStyle(chart.chart).transform).m11;
      });

      chai.expect(result).to.be.closeTo(1.2, 0.000001);
    });

    [1, 2].forEach(function (visibleLevel) {
      it('visibleLevel=' + visibleLevel + ' + minimap matches visible nodes at viewport ' + viewportWidth, async function () {
        await page.setViewport({ width: viewportWidth, height: 844 });
        const result = await page.evaluate(function (level) {
          const container = document.getElementById('chart-container');
          const chart = new OrgChart(container, {
            data: {
              id: 'root', name: 'Root', children: [
                { id: 'first', name: 'First' },
                { id: 'middle', name: 'Middle', children: [{ id: 'grandchild-one', name: 'One' }, { id: 'grandchild-two', name: 'Two' }] },
                { id: 'last', name: 'Last' }
              ]
            },
            visibleLevel: level, minimap: true
          });
          const visibleNodes = Array.from(chart.chart.querySelectorAll('.node')).filter(function (nodeElement) {
            return nodeElement.getClientRects().length > 0 && getComputedStyle(nodeElement).opacity !== '0';
          });
          return { visible: visibleNodes.length, minimap: container.querySelectorAll('.orgchart-minimap-node').length };
        }, visibleLevel);

        chai.expect(result.minimap, JSON.stringify(result)).to.equal(result.visible);
      });
    });
  });

  it('toggleSiblingsResp + minimap removes collapsed siblings from the preview', async function () {
    const result = await page.evaluate(async function () {
      const container = document.getElementById('chart-container');
      const chart = new OrgChart(container, {
        data: {
          id: 'root', name: 'Root', children: [
            { id: 'first', name: 'First' }, { id: 'middle', name: 'Middle' }, { id: 'last', name: 'Last' }
          ]
        },
        toggleSiblingsResp: true, minimap: true
      });
      chart.chart.querySelector('#middle').dispatchEvent(new MouseEvent('mouseenter'));
      chart.chart.querySelector('#middle .leftEdge').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      chart.chart.querySelector('#first').dispatchEvent(new Event('transitionend', { bubbles: true }));
      await new Promise(requestAnimationFrame);
      return {
        visible: Array.from(chart.chart.querySelectorAll('.node')).filter(function (nodeElement) { return nodeElement.getClientRects().length > 0; }).length,
        minimap: container.querySelectorAll('.orgchart-minimap-node').length
      };
    });

    chai.expect(result.minimap, JSON.stringify(result)).to.equal(result.visible);
  });

  it('pan + minimap keeps the viewport synchronized on the first movement', async function () {
    const result = await page.evaluate(function () {
      const container = document.getElementById('chart-container');
      const chart = new OrgChart(container, {
        data: {
          id: 'root', name: 'Root',
          children: Array.from({ length: 10 }, function (unused, index) { return { id: 'child-' + index, name: 'Child ' + index }; })
        },
        pan: true, minimap: true
      });
      const viewport = container.querySelector('.orgchart-minimap-viewport');
      chart.chart.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
      chart.chart.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 70, clientY: 80 }));
      const after = viewport.style.transform;
      chart.updateMinimap();
      return { after: after, expected: viewport.style.transform, chartTransform: chart.chart.style.transform };
    });

    chai.expect(result.after, JSON.stringify(result)).to.equal(result.expected);
  });

  it('pan=false + minimap synchronizes the viewport after native scrolling', async function () {
    const result = await page.evaluate(async function () {
      const container = document.getElementById('chart-container');
      const chart = new OrgChart(container, {
        data: {
          id: 'root', name: 'Root',
          children: Array.from({ length: 10 }, function (unused, index) { return { id: 'child-' + index, name: 'Child ' + index }; })
        },
        pan: false, minimap: true
      });
      container.scrollLeft = 100;
      container.dispatchEvent(new Event('scroll'));
      await new Promise(requestAnimationFrame);
      const viewport = container.querySelector('.orgchart-minimap-viewport');
      const after = viewport.style.transform;
      chart.updateMinimap();
      return { scrollLeft: container.scrollLeft, after: after, expected: viewport.style.transform };
    });

    chai.expect(result.scrollLeft).to.equal(100);
    chai.expect(result.after, JSON.stringify(result)).to.equal(result.expected);
  });

  describe('actual PNG and PDF export pixels', function () {
    const configurations = ['json', 'ul', 'family'].flatMap(function (sourceType) {
      return directions.map(function (direction) { return { sourceType: sourceType, direction: direction }; });
    });
    configurations.forEach(function (settings) {
      const direction = settings.direction;
      [1, 2, 3].forEach(function (exportScale) {
        ['png', 'pdf'].forEach(function (extension) {
          it(settings.sourceType + ' / direction=' + direction + ' + exportScale=' + exportScale + ' + exportFileextension=' + extension + (exportScale === 3 ? ' + all options' : '') + ' exports every node', async function () {
            await page.addScriptTag({ path: path.join(repositoryRoot, 'node_modules/html2canvas/dist/html2canvas.min.js') });
            if (extension === 'pdf') {
              await page.addScriptTag({ path: path.join(repositoryRoot, 'node_modules/jspdf/dist/jspdf.umd.min.js') });
            }
            const result = await page.evaluate(async function (configuration) {
              const container = document.getElementById('chart-container');
              const root = {
                  id: 'root', key: 'key-root', name: 'Root', label: 'Root label', color: configuration.colors[0],
                  children: configuration.colors.slice(1).map(function (color, index) {
                    return { id: 'child-' + index, key: 'key-child-' + index, name: 'Child ' + index, label: 'Label ' + index, color: color };
                  })
              };
              let datasource = root;
              if (configuration.sourceType === 'family') {
                const partner = root.children.shift();
                const grandchild = root.children.pop();
                root.children[2].children = [[grandchild]];
                root.children = [[root.children[0], root.children[1]], [root.children[2]]];
                datasource = [[root, partner]];
              } else if (configuration.sourceType === 'ul') {
                const buildList = function (data) {
                  const list = document.createElement('ul');
                  const item = document.createElement('li');
                  Object.keys(data).filter(function (key) { return key !== 'children'; }).forEach(function (key) {
                    item.dataset[key] = Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key];
                  });
                  item.appendChild(document.createTextNode(data.name));
                  if (data.children) {
                    const children = document.createElement('ul');
                    data.children.forEach(function (child) { children.appendChild(buildList(child).firstElementChild); });
                    item.appendChild(children);
                  }
                  list.appendChild(item);
                  return list;
                };
                datasource = buildList(root);
              }
              const chart = new OrgChart(container, {
                data: datasource,
                compact: configuration.allOptions && configuration.sourceType === 'family',
                icons: Object.assign({}, new OrgChart().defaultOptions.icons, configuration.allOptions ? { parentNode: 'oci-plus-square', expandToUp: 'oci-chevron-down', collapseToDown: 'oci-chevron-up' } : {}),
                nodeTitle: configuration.allOptions ? 'label' : 'name',
                nodeId: configuration.allOptions ? 'key' : 'id',
                toggleSiblingsResp: configuration.allOptions,
                visibleLevel: configuration.allOptions ? 2 : 999,
                chartClass: configuration.allOptions ? 'compat-chart secondary-chart' : '',
                exportButton: configuration.allOptions,
                exportButtonName: 'Save Chart',
                draggable: configuration.allOptions,
                pan: configuration.allOptions,
                zoom: configuration.allOptions,
                minimap: configuration.allOptions,
                zoominLimit: configuration.allOptions ? 2.5 : 7,
                zoomoutLimit: configuration.allOptions ? 0.6 : 0.5,
                direction: configuration.direction,
                exportScale: configuration.exportScale,
                exportFileextension: configuration.extension,
                exportFilename: 'compatibility-export',
                createNode: function (nodeElement, data) {
                  const color = typeof data.color === 'string' ? JSON.parse(data.color) : data.color;
                  nodeElement.querySelector('.title').style.backgroundColor = 'rgb(' + color.join(',') + ')';
                }
              });
              if (configuration.sourceType === 'family') {
                Array.from(chart.chart.querySelectorAll('.node')).forEach(function (node) {
                  if (node.classList.contains('compact')) {
                    chart.backToLooseHandler({ compactNode: node });
                  }
                });
                await Promise.all(Array.from(chart.chart.querySelectorAll('.node')).flatMap(function (node) {
                  return node.getAnimations().map(function (animation) { return animation.finished; });
                }));
              }
              const isHorizontal = configuration.direction === 'l2r' || configuration.direction === 'r2l';
              const expectedWidth = (isHorizontal ? chart.chart.clientHeight : chart.chart.clientWidth) * configuration.exportScale;
              const expectedHeight = (isHorizontal ? chart.chart.clientWidth : chart.chart.clientHeight) * configuration.exportScale;
              if (configuration.allOptions) {
                chart.chart.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
                chart.chart.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 70, clientY: 80 }));
                document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                const containerRect = container.getBoundingClientRect();
                container.dispatchEvent(new WheelEvent('wheel', {
                  bubbles: true, cancelable: true, deltaY: -100,
                  clientX: containerRect.left + 100, clientY: containerRect.top + 100
                }));
              }
              let pdf = null;
              if (configuration.extension === 'pdf') {
                window.jsPDF = function (options) {
                  const pdfDocument = new window.jspdf.jsPDF(options);
                  pdfDocument.save = function (filename) {
                    const bytes = new Uint8Array(pdfDocument.output('arraybuffer'));
                    pdf = {
                      filename: filename, length: bytes.length,
                      header: new TextDecoder().decode(bytes.slice(0, 5)),
                      width: pdfDocument.internal.pageSize.getWidth(), height: pdfDocument.internal.pageSize.getHeight()
                    };
                  };
                  return pdfDocument;
                };
              }
              const capture = await new Promise(function (resolve, reject) {
                const originalHtml2canvas = window.html2canvas;
                window.html2canvas = function (element, options) {
                  return originalHtml2canvas(element, options).catch(function (error) { reject(error); throw error; });
                };
                const originalExportPDF = chart.exportPDF;
                chart.exportPNG = function (canvas, filename) { resolve({ canvas: canvas, filename: filename + '.png' }); };
                chart.exportPDF = function (canvas, filename, scale) {
                  try {
                    originalExportPDF.call(chart, canvas, filename, scale);
                    resolve({ canvas: canvas, filename: pdf.filename });
                  } catch (error) {
                    reject(error);
                  }
                };
                if (configuration.allOptions) {
                  container.nextElementSibling.click();
                } else {
                  chart.export();
                }
              });
              const pixelCounts = configuration.colors.map(function () { return 0; });
              const colorIndexes = new Map(configuration.colors.map(function (color, index) {
                return [color[0] * 65536 + color[1] * 256 + color[2], index];
              }));
              const pixels = capture.canvas.getContext('2d').getImageData(0, 0, capture.canvas.width, capture.canvas.height).data;
              for (let offset = 0; offset < pixels.length; offset += 4) {
                const index = colorIndexes.get(pixels[offset] * 65536 + pixels[offset + 1] * 256 + pixels[offset + 2]);
                if (index !== undefined) {
                  pixelCounts[index] += 1;
                }
              }
              return {
                width: capture.canvas.width, height: capture.canvas.height,
                expectedWidth: expectedWidth, expectedHeight: expectedHeight,
                filename: capture.filename, pixelCounts: pixelCounts, pdf: pdf,
                maskHidden: container.querySelector('.mask').classList.contains('hidden'),
                exporting: container.classList.contains('canvasContainer')
              };
            }, { sourceType: settings.sourceType, direction: direction, exportScale: exportScale, extension: extension, colors: markerColors, allOptions: exportScale === 3 });

            chai.expect(result.width).to.be.closeTo(result.expectedWidth, 1);
            chai.expect(result.height).to.be.closeTo(result.expectedHeight, 1);
            chai.expect(result.filename).to.equal('compatibility-export.' + extension);
            chai.expect(result.maskHidden).to.equal(true);
            chai.expect(result.exporting).to.equal(false);
            result.pixelCounts.forEach(function (pixelCount, index) {
              chai.expect(pixelCount, 'node ' + index + ': ' + JSON.stringify(result)).to.be.greaterThan(50 * exportScale * exportScale);
            });
            if (extension === 'pdf') {
              chai.expect(result.pdf.header).to.equal('%PDF-');
              chai.expect(result.pdf.length).to.be.greaterThan(500);
              chai.expect(result.pdf.width).to.be.closeTo(result.width / exportScale, 1);
              chai.expect(result.pdf.height).to.be.closeTo(result.height / exportScale, 1);
            }
          });
        });
      });
    });
  });

  directions.forEach(function (direction) {
    it('direction=' + direction + ' + pan preserves orientation and follows the pointer', async function () {
      const result = await page.evaluate(function (selectedDirection) {
        const chart = new OrgChart(document.getElementById('chart-container'), {
          data: { id: 'root', name: 'Root', children: [{ id: 'child', name: 'Child' }] },
          direction: selectedDirection, pan: true
        });
        const beforeMatrix = new DOMMatrix(getComputedStyle(chart.chart).transform);
        const beforeRect = chart.chart.getBoundingClientRect();
        chart.chart.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }));
        chart.chart.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 130, clientY: 110 }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        const afterMatrix = new DOMMatrix(getComputedStyle(chart.chart).transform);
        const afterRect = chart.chart.getBoundingClientRect();
        return {
          before: [beforeMatrix.m11, beforeMatrix.m12, beforeMatrix.m21, beforeMatrix.m22],
          after: [afterMatrix.m11, afterMatrix.m12, afterMatrix.m21, afterMatrix.m22],
          deltaX: afterRect.left - beforeRect.left, deltaY: afterRect.top - beforeRect.top
        };
      }, direction);

      chai.expect(result.after).to.deep.equal(result.before);
      chai.expect(result.deltaX).to.be.closeTo(30, 0.001);
      chai.expect(result.deltaY).to.be.closeTo(10, 0.001);
    });

    [false, true].forEach(function (zoom) {
      it('direction=' + direction + ' + draggable + zoom=' + zoom + ' creates a visible ghost and reparents the node', async function () {
        const result = await page.evaluate(async function (configuration) {
          const container = document.getElementById('chart-container');
          const chart = new OrgChart(container, {
            data: { id: 'root', name: 'Root', children: [{ id: 'source', name: 'Source' }, { id: 'target', name: 'Target' }] },
            direction: configuration.direction, draggable: true, zoom: configuration.zoom
          });
          if (configuration.zoom) {
            const containerRect = container.getBoundingClientRect();
            container.dispatchEvent(new WheelEvent('wheel', {
              bubbles: true, cancelable: true, deltaY: -100,
              clientX: containerRect.left + 100, clientY: containerRect.top + 100
            }));
          }
          const sourceNode = chart.chart.querySelector('#source');
          sourceNode.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
          const ghost = chart.chart.querySelector('.ghost-node rect');
          const ghostWidth = ghost ? Number(ghost.getAttribute('width')) : null;
          const ghostHeight = ghost ? Number(ghost.getAttribute('height')) : null;
          await chart.dropHandler({ dropZone: chart.chart.querySelector('#target') });
          chart.dragendHandler();
          return { ghostWidth: ghostWidth, ghostHeight: ghostHeight, parent: chart.getParent(sourceNode).id };
        }, { direction: direction, zoom: zoom });

        chai.expect(result.parent).to.equal('target');
        if (direction !== 't2b' || zoom) {
          chai.expect(result.ghostWidth, JSON.stringify(result)).to.be.greaterThan(0);
          chai.expect(result.ghostHeight, JSON.stringify(result)).to.be.greaterThan(0);
        }
      });
    });

    it('direction=' + direction + ' + zoom preserves rotation and reflection', async function () {
      const result = await page.evaluate(function (selectedDirection) {
        const container = document.getElementById('chart-container');
        const chart = new OrgChart(container, {
          data: {
            id: 'root', name: 'Root',
            children: [{ id: 'first', name: 'First' }, { id: 'last', name: 'Last' }]
          },
          direction: selectedDirection,
          zoom: true
        });
        const orientation = function () {
          const matrix = new DOMMatrix(getComputedStyle(chart.chart).transform);
          const scale = Math.hypot(matrix.m11, matrix.m12);
          return [matrix.m11, matrix.m12, matrix.m21, matrix.m22].map(function (value) {
            return Math.round(value / scale * 1000000) / 1000000;
          });
        };
        const before = orientation();
        const containerRect = container.getBoundingClientRect();
        container.dispatchEvent(new WheelEvent('wheel', {
          bubbles: true, cancelable: true, deltaY: -100,
          clientX: containerRect.left + 100, clientY: containerRect.top + 100
        }));
        return { before: before, after: orientation(), transform: chart.chart.style.transform };
      }, direction);

      chai.expect(result.after, JSON.stringify(result)).to.deep.equal(result.before);
    });

    it('direction=' + direction + ' + minimap preserves rotation during viewport drag', async function () {
      const result = await page.evaluate(function (selectedDirection) {
        const container = document.getElementById('chart-container');
        const chart = new OrgChart(container, {
          data: {
            id: 'root', name: 'Root',
            children: [{ id: 'first', name: 'First' }, { id: 'last', name: 'Last' }]
          },
          direction: selectedDirection,
          minimap: true
        });
        const orientation = function () {
          const matrix = new DOMMatrix(getComputedStyle(chart.chart).transform);
          const scale = Math.hypot(matrix.m11, matrix.m12);
          return [matrix.m11, matrix.m12, matrix.m21, matrix.m22].map(function (value) {
            return Math.round(value / scale * 1000000) / 1000000;
          });
        };
        const before = orientation();
        const viewport = container.querySelector('.orgchart-minimap-viewport');
        const viewportRect = viewport.getBoundingClientRect();
        viewport.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true, cancelable: true,
          clientX: viewportRect.left + 5, clientY: viewportRect.top + 5
        }));
        document.dispatchEvent(new MouseEvent('mousemove', {
          bubbles: true, clientX: viewportRect.left + 25, clientY: viewportRect.top + 15
        }));
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        return { before: before, after: orientation(), transform: chart.chart.style.transform };
      }, direction);

      chai.expect(result.after, JSON.stringify(result)).to.deep.equal(result.before);
    });
  });
});