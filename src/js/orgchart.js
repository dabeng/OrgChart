/*
 * jQuery OrgChart Plugin
 * https://github.com/dabeng/OrgChart
 *
 * Copyright 2016, dabeng
 * https://github.com/dabeng
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(window, document);
  } else {
    window.OrgChart = factory(window, document);
  }
}(function (window, document, undefined) {
  const elementDataStore = new WeakMap();
  const getWindow = () => (typeof globalThis !== 'undefined' && globalThis.window ? globalThis.window : window);
  const getDocument = () => {
    const currentWindow = getWindow();
    return currentWindow && currentWindow.document
      ? currentWindow.document
      : (typeof globalThis !== 'undefined' && globalThis.document ? globalThis.document : document);
  };

  const isElement = (value) => value && (value.nodeType === 1 || value.nodeType === 9 || value === getWindow());
  const isNode = (value) => value && typeof value.nodeType === 'number';
  const isNodeList = (value) => value && typeof value.length === 'number' && typeof value !== 'string' && !isNode(value);
  const isHtmlString = (value) => typeof value === 'string' && value.trim().startsWith('<') && value.trim().endsWith('>');
  const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
  const unique = (elements) => Array.from(new Set(elements.filter(Boolean)));

  function getElement(input, context) {
    return normalizeInput(input, context || getDocument())[0] || null;
  }

  function getElements(input, context) {
    return normalizeInput(input, context || getDocument());
  }

  function mergeObjects() {
    return Object.assign.apply(Object, [{}].concat(Array.from(arguments)));
  }

  function forEachValue(collection, callback) {
    if (Array.isArray(collection) || isNodeList(collection)) {
      for (let index = 0; index < collection.length; index += 1) {
        if (callback.call(collection[index], index, collection[index]) === false) {
          break;
        }
      }
      return collection;
    }
    Object.keys(collection || {}).some((key) => callback.call(collection[key], key, collection[key]) === false);
    return collection;
  }

  function createEventLike(type) {
    return {
      type,
      defaultPrevented: false,
      preventDefault: function () {
        this.defaultPrevented = true;
      },
      isDefaultPrevented: function () {
        return this.defaultPrevented;
      }
    };
  }

  function normalizeSelector(selector) {
    if (!selector) {
      return selector;
    }
    return selector.replace(/:not\("([^"]+)"\)/g, ':not($1)');
  }

  function parseSelector(selector) {
    const normalizedSelector = normalizeSelector(selector || '*');
    const meta = {
      selector: normalizedSelector,
      first: false,
      last: false,
      gt: null,
      hidden: false,
      visible: false
    };
    meta.selector = meta.selector.replace(/:first\b/g, function () {
      meta.first = true;
      return '';
    });
    meta.selector = meta.selector.replace(/:last\b/g, function () {
      meta.last = true;
      return '';
    });
    meta.selector = meta.selector.replace(/:gt\((\d+)\)/g, function (_, index) {
      meta.gt = Number(index);
      return '';
    });
    meta.selector = meta.selector.replace(/:hidden\b/g, function () {
      meta.hidden = true;
      return '';
    });
    meta.selector = meta.selector.replace(/:visible\b/g, function () {
      meta.visible = true;
      return '';
    });
    meta.selector = meta.selector.trim() || '*';
    return meta;
  }

  function isVisibleElement(element) {
    if (!element || element.nodeType !== 1) {
      return false;
    }
    const style = getWindow().getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function matchesSelector(element, selector) {
    if (!selector || selector === '*') {
      return true;
    }
    if (!element || element.nodeType !== 1) {
      return false;
    }
    try {
      return element.matches(selector);
    } catch (error) {
      return false;
    }
  }

  function filterBySelector(elements, selector) {
    const meta = parseSelector(selector);
    let filtered = elements.filter((element) => matchesSelector(element, meta.selector));
    if (meta.hidden) {
      filtered = filtered.filter((element) => !isVisibleElement(element));
    }
    if (meta.visible) {
      filtered = filtered.filter((element) => isVisibleElement(element));
    }
    if (meta.gt !== null) {
      filtered = filtered.filter((_, index) => index > meta.gt);
    }
    if (meta.first) {
      filtered = filtered.slice(0, 1);
    }
    if (meta.last) {
      filtered = filtered.slice(-1);
    }
    return filtered;
  }

  function createNodesFromHtml(html) {
    const template = getDocument().createElement('template');
    template.innerHTML = html.trim();
    return Array.from(template.content.childNodes);
  }

  function toDataKey(key) {
    return String(key).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  function getStoredState(element) {
    if (!elementDataStore.has(element)) {
      elementDataStore.set(element, {});
    }
    return elementDataStore.get(element);
  }

  function setState(element, key, value) {
    const store = getStoredState(element);
    store[toDataKey(key)] = value;
  }

  function getState(element, key) {
    const store = getStoredState(element);
    const normalizedKey = toDataKey(key);
    if (Object.prototype.hasOwnProperty.call(store, normalizedKey)) {
      return store[normalizedKey];
    }
    return undefined;
  }

  function getDatasetSnapshot(element) {
    return element.dataset ? Object.assign({}, element.dataset) : {};
  }

  function normalizeInput(input, context) {
    if (input === null || input === undefined) {
      return [];
    }
    if (Array.isArray(input)) {
      return unique(input.flatMap((item) => normalizeInput(item, context)));
    }
    if (isNode(input)) {
      return [input];
    }
    if (isNodeList(input)) {
      return Array.from(input).flatMap((item) => normalizeInput(item, context));
    }
    if (typeof input === 'string') {
      if (isHtmlString(input)) {
        return createNodesFromHtml(input);
      }
      const currentDocument = getDocument();
      const parents = normalizeInput(context || currentDocument, currentDocument);
      const selected = parents.length
        ? parents.flatMap((parent) => {
            if (parent.nodeType !== 1 && parent.nodeType !== 9) {
              return [];
            }
            return filterBySelector(Array.from(parent.querySelectorAll(parseSelector(input).selector)), input);
          })
        : filterBySelector(Array.from(currentDocument.querySelectorAll(parseSelector(input).selector)), input);
      return unique(selected);
    }
    return [];
  }

  function toNodeArray(content) {
    if (content instanceof DocumentFragment) {
      return Array.from(content.childNodes);
    }
    if (Array.isArray(content)) {
      return content.flatMap((item) => toNodeArray(item));
    }
    if (isNode(content)) {
      return [content];
    }
    if (typeof content === 'string') {
      return isHtmlString(content) ? createNodesFromHtml(content) : [getDocument().createTextNode(content)];
    }
    return [];
  }

  function cloneNodesForTarget(nodes, needsClone) {
    return nodes.map((node) => (needsClone ? node.cloneNode(true) : node));
  }

  function createTriggeredEvent(eventLike, extraData) {
    const type = typeof eventLike === 'string' ? eventLike : eventLike.type;
    const event = new (getWindow().CustomEvent)(type, {
      bubbles: true,
      cancelable: true,
      detail: extraData
    });
    event.originalEvent = event;
    event.data = extraData;
    event.delegateTarget = null;
    return event;
  }

  const OrgChart = function (elem, opts) {
    if (!(this instanceof OrgChart)) {
      return new OrgChart(elem, opts);
    }
    if (isPlainObject(elem) && !opts) {
      this.opts = elem;
      this.chartContainer = getElement(elem.chartContainer || elem.container);
    } else {
      this.chartContainer = getElement(elem);
      this.opts = opts || {};
    }
    this.chart = null;
    this.defaultOptions = {
      'icons': {
        'theme': 'oci',
        'parentNode': 'oci-menu',
        'expandToUp': 'oci-chevron-up',
        'collapseToDown': 'oci-chevron-down',
        'collapseToLeft': 'oci-chevron-left',
        'expandToRight': 'oci-chevron-right',
        'backToCompact': 'oci-corner-top-left',
        'backToLoose': 'oci-corner-bottom-right',
        'collapsed': 'oci-plus-square',
        'expanded': 'oci-minus-square',
        'spinner': 'oci-spinner'
      },
      'nodeTitle': 'name',
      'nodeId': 'id',
      'toggleSiblingsResp': false,
      'visibleLevel': 999,
      'chartClass': '',
      'exportButton': false,
      'exportButtonName': 'Export',
      'exportFilename': 'OrgChart',
      'exportFileextension': 'png',
      'draggable': false,
      'direction': 't2b',
      'pan': false,
      'zoom': false,
      'zoominLimit': 7,
      'zoomoutLimit': 0.5
    };
    if (this.chartContainer) {
      this.init();
    }
  };

  if (typeof process === 'object' && process && process.env && process.env.ORGCHART_TEST === '1') {
    Object.defineProperty(OrgChart, '__testing__', {
      value: {
        getState: getState,
        setState: setState
      }
    });
  }
  //
  OrgChart.prototype = {
    //
    init: function (opts) {
      this.options = mergeObjects({}, this.defaultOptions, this.opts, opts);
      // build the org-chart
      const chartContainerElement = this.chartContainer;
      let chartElement;
      let rootElement;
      let rootNodesContainerElement;
      let rootHierarchyElement;

      if (this.chart) {
        this.chart.remove();
      }
      const data = this.options.data;
      chartElement = getDocument().createElement('div');
      chartElement.className = 'orgchart' + (this.options.chartClass !== '' ? ' ' + this.options.chartClass : '') + (this.options.direction !== 't2b' ? ' ' + this.options.direction : '');
      setState(chartElement, 'options', this.options);
      this.chart = chartElement;
      chartElement.addEventListener('click', function (event) {
        const nativeEvent = event.originalEvent || event;
        const clickTargetElement = getElement(nativeEvent.target);

        if (!clickTargetElement || !(typeof clickTargetElement.closest === 'function' && clickTargetElement.closest('.node'))) {
          Array.from(chartElement.querySelectorAll('.node.focused')).forEach(function (focusedNodeEl) {
            focusedNodeEl.classList.remove('focused');
          });
        }
      });
      if (typeof getWindow().MutationObserver !== 'undefined') {
        this.triggerInitEvent();
      }
      const isListElementData = isElement(data) && data.tagName === 'UL';
      rootNodesContainerElement = getDocument().createElement('ul');
      rootNodesContainerElement.className = 'nodes';
      chartElement.appendChild(rootNodesContainerElement);

      if (!isListElementData && Array.isArray(data)) {
        rootElement = rootNodesContainerElement;
      } else {
        rootHierarchyElement = getDocument().createElement('li');
        rootHierarchyElement.className = 'hierarchy';
        rootNodesContainerElement.appendChild(rootHierarchyElement);
        rootElement = rootHierarchyElement;
      }

        if (isListElementData) { // ul datasource
          this.buildHierarchy(rootElement, this.buildJsonDS(data.firstElementChild));
        } else { // local json datasource
          if (data.relationship) {
            this.buildHierarchy(rootElement, data);
          } else {
            this.buildHierarchy(rootElement, Array.isArray(data) ? data : this.attachRel(data, '00'));
          }
        }

      if (chartContainerElement) {
        chartContainerElement.appendChild(chartElement);
      }

      // append the export button
      if (this.options.exportButton && !getDocument().querySelector('.oc-export-btn')) {
        this.attachExportButton();
      }

      if (this.options.pan) {
        this.bindPan();
      }

      if (this.options.zoom) {
        this.bindZoom();
      }

      return this;
    },
    handleCompactNodes: function () {
      const chartElement = this.chart;

      if (!chartElement) {
        return;
      }
      // caculate the compact nodes' level which is used to add different styles
      Array.from(chartElement.querySelectorAll('.node.compact')).forEach(function (compactNodeEl) {
        let compactAncestorCount = 0;
        let currentAncestorElement = compactNodeEl.parentElement;

        while (currentAncestorElement) {
          if (currentAncestorElement.classList && currentAncestorElement.classList.contains('compact')) {
            compactAncestorCount += 1;
          }
          currentAncestorElement = currentAncestorElement.parentElement;
        }

        compactNodeEl.classList.add(compactAncestorCount % 2 === 0 ? 'even' : 'odd');
      }); // the following code snippets are kept only as a reminder for a future native-DOM approach
        // that would add direction arrows for the top compact node once the styles are corrected.
    },
    //
    triggerInitEvent: function () {
      const orgChart = this;
      const MutationObserverCtor = getWindow().MutationObserver;
      const mo = new MutationObserverCtor(function (mutations) {
        mo.disconnect();
        initTime:
        for (let i = 0; i < mutations.length; i++) {
          for (let j = 0; j < mutations[i].addedNodes.length; j++) {
            if (mutations[i].addedNodes[j].classList && mutations[i].addedNodes[j].classList.contains('orgchart')) {
              orgChart.handleCompactNodes();
              if (!orgChart.chart) {
                break initTime;
              }
              if (orgChart.options.initCompleted && typeof orgChart.options.initCompleted === 'function') {
                orgChart.options.initCompleted(orgChart.chart);
              }
              mutations[i].addedNodes[j].dispatchEvent(createTriggeredEvent('init.orgchart'));
              break initTime;
            }
          }
        }
      });
      mo.observe(this.chartContainer, { childList: true });
    },
    triggerShowEvent: function (targetEl, rel) {
      if (targetEl && typeof targetEl.dispatchEvent === 'function') {
        targetEl.dispatchEvent(createTriggeredEvent('show-' + rel + '.orgchart'));
      }
    },
    triggerHideEvent: function (targetEl, rel) {
      if (targetEl && typeof targetEl.dispatchEvent === 'function') {
        targetEl.dispatchEvent(createTriggeredEvent('hide-' + rel + '.orgchart'));
      }
    },
    // add export button for orgchart
    attachExportButton: function () {
      const orgChart = this;
      const chartContainerElement = this.chartContainer;
      let exportButtonElement;

      if (!chartContainerElement || !chartContainerElement.parentElement) {
        return;
      }

      exportButtonElement = getDocument().createElement('button');
      exportButtonElement.className = 'oc-export-btn';
      exportButtonElement.textContent = this.options.exportButtonName;
      exportButtonElement.addEventListener('click', function (event) {
        event.preventDefault();
        orgChart.export();
      });
      chartContainerElement.insertAdjacentElement('afterend', exportButtonElement);
    },
    setOptions: function (opts, val) {
      if (typeof opts === 'string') {
        if (opts === 'pan') {
          if (val) {
            this.bindPan();
          } else {
            this.unbindPan();
          }
        }
        if (opts === 'zoom') {
          if (val) {
            this.bindZoom();
          } else {
            this.unbindZoom();
          }
        }
      }
      if (typeof opts === 'object') {
        if (opts.data) {
          this.init(opts);
        } else {
          if (typeof opts.pan !== 'undefined') {
            if (opts.pan) {
              this.bindPan();
            } else {
              this.unbindPan();
            }
          }
          if (typeof opts.zoom !== 'undefined') {
            if (opts.zoom) {
              this.bindZoom();
            } else {
              this.unbindZoom();
            }
          }
        }
      }

      return this;
    },
    //
    panStartHandler: function (e) {
      const nativeEvent = e.originalEvent || e;
      const chartElement = getElement(e.chart || nativeEvent.currentTarget);
      const targetElement = getElement(nativeEvent.target);
      let lastTf;
      let existingPanMoveHandler;
      let panMoveHandler;

      if (!chartElement) {
        return;
      }

      if ((targetElement && typeof targetElement.closest === 'function' && targetElement.closest('.node')) || (nativeEvent.touches && nativeEvent.touches.length > 1)) {
        setState(chartElement, 'panning', false);
        return;
      } else {
        chartElement.style.cursor = 'move';
        setState(chartElement, 'panning', true);
      }
      let lastX = 0;
      let lastY = 0;
      lastTf = chartElement.style.transform || getWindow().getComputedStyle(chartElement).transform || 'none';
      if (lastTf !== 'none') {
        const temp = lastTf.split(',');
        if (lastTf.indexOf('3d') === -1) {
          lastX = parseInt(temp[4]);
          lastY = parseInt(temp[5]);
        } else {
          lastX = parseInt(temp[12]);
          lastY = parseInt(temp[13]);
        }
      }
      let startX = 0;
      let startY = 0;
      if (!nativeEvent.targetTouches) { // pand on desktop
        startX = (typeof nativeEvent.pageX === 'number' ? nativeEvent.pageX : nativeEvent.clientX) - lastX;
        startY = (typeof nativeEvent.pageY === 'number' ? nativeEvent.pageY : nativeEvent.clientY) - lastY;
      } else if (nativeEvent.targetTouches.length === 1) { // pan on mobile device
        startX = nativeEvent.targetTouches[0].pageX - lastX;
        startY = nativeEvent.targetTouches[0].pageY - lastY;
      } else if (nativeEvent.targetTouches.length > 1) {
        return;
      }

      existingPanMoveHandler = getState(chartElement, 'panMoveHandler');
      if (existingPanMoveHandler) {
        chartElement.removeEventListener('mousemove', existingPanMoveHandler);
        chartElement.removeEventListener('touchmove', existingPanMoveHandler);
      }

      panMoveHandler = function (e) {
        let currentTransform;
        let matrix;

        if (!getState(chartElement, 'panning')) {
          return;
        }
        let newX = 0;
        let newY = 0;
        if (!e.targetTouches) { // pand on desktop
          newX = (typeof e.pageX === 'number' ? e.pageX : e.clientX) - startX;
          newY = (typeof e.pageY === 'number' ? e.pageY : e.clientY) - startY;
        } else if (e.targetTouches.length === 1) { // pan on mobile device
          newX = e.targetTouches[0].pageX - startX;
          newY = e.targetTouches[0].pageY - startY;
        } else if (e.targetTouches.length > 1) {
          return;
        }
        currentTransform = chartElement.style.transform || getWindow().getComputedStyle(chartElement).transform || 'none';
        if (currentTransform === 'none') {
          if (currentTransform.indexOf('3d') === -1) {
            chartElement.style.transform = 'matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')';
          } else {
            chartElement.style.transform = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + newX + ', ' + newY + ', 0, 1)';
          }
        } else {
          matrix = currentTransform.split(',');
          if (currentTransform.indexOf('3d') === -1) {
            matrix[4] = ' ' + newX;
            matrix[5] = ' ' + newY + ')';
          } else {
            matrix[12] = ' ' + newX;
            matrix[13] = ' ' + newY;
          }
          chartElement.style.transform = matrix.join(',');
        }
      };

      setState(chartElement, 'panMoveHandler', panMoveHandler);
      chartElement.addEventListener('mousemove', panMoveHandler);
      chartElement.addEventListener('touchmove', panMoveHandler);
    },
    //
    panEndHandler: function (e) {
      const nativeEvent = e.originalEvent || e;
      const chartElement = getElement(e.chart || nativeEvent.chart || nativeEvent.currentTarget);
      let panMoveHandler;

      if (!chartElement) {
        return;
      }

      if (getState(chartElement, 'panning')) {
        panMoveHandler = getState(chartElement, 'panMoveHandler');
        setState(chartElement, 'panning', false);
        chartElement.style.cursor = 'default';
        if (panMoveHandler) {
          chartElement.removeEventListener('mousemove', panMoveHandler);
          chartElement.removeEventListener('touchmove', panMoveHandler);
          setState(chartElement, 'panMoveHandler', null);
        }
      }
    },
    //
    bindPan: function () {
      const orgChart = this;
      const chartContainerElement = this.chartContainer;
      const chartElement = this.chart;
      let panStartBoundHandler;
      let panEndBoundHandler;

      if (!chartContainerElement || !chartElement) {
        return;
      }

      this.unbindPan();
      chartContainerElement.style.overflow = 'hidden';
      panStartBoundHandler = function (event) {
        orgChart.panStartHandler({
          chart: chartElement,
          originalEvent: event
        });
      };
      panEndBoundHandler = function () {
        orgChart.panEndHandler({
          chart: chartElement
        });
      };

      setState(chartElement, 'panStartBoundHandler', panStartBoundHandler);
      setState(chartElement, 'panEndBoundHandler', panEndBoundHandler);
      chartElement.addEventListener('mousedown', panStartBoundHandler);
      chartElement.addEventListener('touchstart', panStartBoundHandler);
      getDocument().addEventListener('mouseup', panEndBoundHandler);
      getDocument().addEventListener('touchend', panEndBoundHandler);
    },
    //
    unbindPan: function () {
      const chartContainerElement = this.chartContainer;
      const chartElement = this.chart;
      let panStartBoundHandler;
      let panEndBoundHandler;

      if (!chartContainerElement || !chartElement) {
        return;
      }

      chartContainerElement.style.overflow = 'auto';
      panStartBoundHandler = getState(chartElement, 'panStartBoundHandler');
      panEndBoundHandler = getState(chartElement, 'panEndBoundHandler');
      if (panStartBoundHandler) {
        chartElement.removeEventListener('mousedown', panStartBoundHandler);
        chartElement.removeEventListener('touchstart', panStartBoundHandler);
        setState(chartElement, 'panStartBoundHandler', null);
      }
      if (panEndBoundHandler) {
        getDocument().removeEventListener('mouseup', panEndBoundHandler);
        getDocument().removeEventListener('touchend', panEndBoundHandler);
        setState(chartElement, 'panEndBoundHandler', null);
      }
    },
    //
    zoomWheelHandler: function (e) {
      const nativeEvent = e.originalEvent || e;
      const orgChart = e.orgChart;
      const chartContainerElement = orgChart ? orgChart.chartContainer : null;
      const chartContainerRect = chartContainerElement && typeof chartContainerElement.getBoundingClientRect === 'function'
        ? chartContainerElement.getBoundingClientRect()
        : null;
      const hasPointerPosition = nativeEvent && typeof nativeEvent.clientX === 'number' && typeof nativeEvent.clientY === 'number';
      let zoomAnchor = null;

      if (!orgChart || !orgChart.chart || !chartContainerElement) {
        return;
      }

      if (chartContainerRect && hasPointerPosition) {
        if (nativeEvent.clientX < chartContainerRect.left || nativeEvent.clientX > chartContainerRect.right
          || nativeEvent.clientY < chartContainerRect.top || nativeEvent.clientY > chartContainerRect.bottom) {
          return;
        }

        zoomAnchor = {
          x: nativeEvent.clientX,
          y: nativeEvent.clientY
        };
      }

      if (nativeEvent && typeof nativeEvent.preventDefault === 'function') {
        nativeEvent.preventDefault();
      }
      const newScale  = 1 + (nativeEvent.deltaY > 0 ? -0.2 : 0.2);
      orgChart.setChartScale(orgChart.chart, newScale, zoomAnchor);
    },
    //
    zoomStartHandler: function (e) {
      let orgChart;
      let chartElement;
      let dist;
      let pinchCenter;
      const nativeEvent = e.originalEvent || e;

      if(nativeEvent.touches && nativeEvent.touches.length === 2) {
        orgChart = e.orgChart;
        chartElement = orgChart.chart;
        if (!chartElement) {
          return;
        }
        setState(chartElement, 'pinching', true);
        dist = orgChart.getPinchDist(nativeEvent);
        pinchCenter = orgChart.getPinchCenter(nativeEvent);
        setState(chartElement, 'pinchDistStart', dist);
        setState(chartElement, 'pinchCenterStart', pinchCenter);
        setState(chartElement, 'pinchCenterEnd', pinchCenter);
      }
    },
    zoomingHandler: function (e) {
      const nativeEvent = e.originalEvent || e;
      const orgChart = e.orgChart;
      const chartElement = orgChart.chart;
      let dist;
      let pinchCenter;

      if(chartElement && getState(chartElement, 'pinching')) {
        dist = orgChart.getPinchDist(nativeEvent);
        pinchCenter = orgChart.getPinchCenter(nativeEvent);
        setState(chartElement, 'pinchDistEnd', dist);
        setState(chartElement, 'pinchCenterEnd', pinchCenter);
      }
    },
    zoomEndHandler: function (e) {
      const orgChart = e.orgChart;
      const chartElement = orgChart.chart;
      let diff;
      let pinchCenter;

      if(chartElement && getState(chartElement, 'pinching')) {
        setState(chartElement, 'pinching', false);
        diff = getState(chartElement, 'pinchDistEnd') - getState(chartElement, 'pinchDistStart');
        pinchCenter = getState(chartElement, 'pinchCenterEnd') || getState(chartElement, 'pinchCenterStart') || null;
        if (diff > 0) {
          orgChart.setChartScale(orgChart.chart, 1.2, pinchCenter);
        } else if (diff < 0) {
          orgChart.setChartScale(orgChart.chart, 0.8, pinchCenter);
        }
      }
    },
    //
    bindZoom: function () {
      const orgChart = this;
      const chartContainerElement = this.chartContainer;
      const chartElement = this.chart;
      let zoomWheelBoundHandler;
      let zoomStartBoundHandler;
      let zoomingBoundHandler;
      let zoomEndBoundHandler;

      if (!chartContainerElement || !chartElement) {
        return;
      }

      this.unbindZoom();
      zoomWheelBoundHandler = function (event) {
        orgChart.zoomWheelHandler({
          orgChart: orgChart,
          originalEvent: event
        });
      };
      zoomStartBoundHandler = function (event) {
        orgChart.zoomStartHandler({
          orgChart: orgChart,
          originalEvent: event
        });
      };
      zoomingBoundHandler = function (event) {
        orgChart.zoomingHandler({
          orgChart: orgChart,
          originalEvent: event
        });
      };
      zoomEndBoundHandler = function () {
        orgChart.zoomEndHandler({
          orgChart: orgChart
        });
      };

      setState(chartElement, 'zoomWheelBoundHandler', zoomWheelBoundHandler);
      setState(chartElement, 'zoomStartBoundHandler', zoomStartBoundHandler);
      setState(chartElement, 'zoomingBoundHandler', zoomingBoundHandler);
      setState(chartElement, 'zoomEndBoundHandler', zoomEndBoundHandler);
      chartContainerElement.addEventListener('wheel', zoomWheelBoundHandler);
      chartContainerElement.addEventListener('touchstart', zoomStartBoundHandler);
      getDocument().addEventListener('touchmove', zoomingBoundHandler);
      getDocument().addEventListener('touchend', zoomEndBoundHandler);
    },
    unbindZoom: function () {
      const chartContainerElement = this.chartContainer;
      const chartElement = this.chart;
      let zoomWheelBoundHandler;
      let zoomStartBoundHandler;
      let zoomingBoundHandler;
      let zoomEndBoundHandler;

      if (!chartContainerElement || !chartElement) {
        return;
      }

      zoomWheelBoundHandler = getState(chartElement, 'zoomWheelBoundHandler');
      zoomStartBoundHandler = getState(chartElement, 'zoomStartBoundHandler');
      zoomingBoundHandler = getState(chartElement, 'zoomingBoundHandler');
      zoomEndBoundHandler = getState(chartElement, 'zoomEndBoundHandler');
      if (zoomWheelBoundHandler) {
        chartContainerElement.removeEventListener('wheel', zoomWheelBoundHandler);
        setState(chartElement, 'zoomWheelBoundHandler', null);
      }
      if (zoomStartBoundHandler) {
        chartContainerElement.removeEventListener('touchstart', zoomStartBoundHandler);
        setState(chartElement, 'zoomStartBoundHandler', null);
      }
      if (zoomingBoundHandler) {
        getDocument().removeEventListener('touchmove', zoomingBoundHandler);
        setState(chartElement, 'zoomingBoundHandler', null);
      }
      if (zoomEndBoundHandler) {
        getDocument().removeEventListener('touchend', zoomEndBoundHandler);
        setState(chartElement, 'zoomEndBoundHandler', null);
      }
    },
    //
    getPinchDist: function (e) {
      const nativeEvent = e.originalEvent || e;

      return Math.sqrt((nativeEvent.touches[0].clientX - nativeEvent.touches[1].clientX) * (nativeEvent.touches[0].clientX - nativeEvent.touches[1].clientX) +
      (nativeEvent.touches[0].clientY - nativeEvent.touches[1].clientY) * (nativeEvent.touches[0].clientY - nativeEvent.touches[1].clientY));
    },
    getPinchCenter: function (e) {
      const nativeEvent = e.originalEvent || e;

      return {
        x: (nativeEvent.touches[0].clientX + nativeEvent.touches[1].clientX) / 2,
        y: (nativeEvent.touches[0].clientY + nativeEvent.touches[1].clientY) / 2
      };
    },
    //
    setChartScale: function (chartEl, newScale, zoomAnchor) {
      const chartElement = getElement(chartEl);
      const chartContainerElement = this.chartContainer;
      let opts;
      let currentTransform;
      let chartRect;
      let matrixValues;
      let currentScale = 1;
      let currentTranslateX = 0;
      let currentTranslateY = 0;
      let targetScale = 1;
      let anchorX;
      let anchorY;
      let localAnchorX;
      let localAnchorY;
      let baseLeft;
      let baseTop;
      let containerRect;
      let targetTranslateX;
      let targetTranslateY;

      if (!chartElement) {
        return;
      }

      opts = getState(chartElement, 'options');
      currentTransform = getWindow().getComputedStyle(chartElement).transform || chartElement.style.transform || 'none';
      if (currentTransform && currentTransform !== 'none') {
        if (currentTransform.indexOf('matrix3d(') === 0) {
          matrixValues = currentTransform.slice(9, -1).split(',').map(function (value) {
            return getWindow().parseFloat(value.trim());
          });
          currentScale = Math.abs(matrixValues[0]) || 1;
          currentTranslateX = matrixValues[12] || 0;
          currentTranslateY = matrixValues[13] || 0;
        } else if (currentTransform.indexOf('matrix(') === 0) {
          matrixValues = currentTransform.slice(7, -1).split(',').map(function (value) {
            return getWindow().parseFloat(value.trim());
          });
          currentScale = Math.abs(matrixValues[0]) || 1;
          currentTranslateX = matrixValues[4] || 0;
          currentTranslateY = matrixValues[5] || 0;
        } else if (currentTransform.indexOf('scale3d(') === 0) {
          matrixValues = currentTransform.slice(8, -1).split(',').map(function (value) {
            return getWindow().parseFloat(value.trim());
          });
          currentScale = Math.abs(matrixValues[0]) || 1;
        } else if (currentTransform.indexOf('scale(') === 0) {
          matrixValues = currentTransform.slice(6, -1).split(',').map(function (value) {
            return getWindow().parseFloat(value.trim());
          });
          currentScale = Math.abs(matrixValues[0]) || 1;
        }
      }

      targetScale = currentScale * newScale;
      if (!(targetScale > opts.zoomoutLimit && targetScale < opts.zoominLimit)) {
        return;
      }

      targetTranslateX = currentTranslateX;
      targetTranslateY = currentTranslateY;
      chartRect = typeof chartElement.getBoundingClientRect === 'function'
        ? chartElement.getBoundingClientRect()
        : null;
      if (!zoomAnchor && chartContainerElement && typeof chartContainerElement.getBoundingClientRect === 'function') {
        containerRect = chartContainerElement.getBoundingClientRect();
        zoomAnchor = {
          x: containerRect.left + (containerRect.width / 2),
          y: containerRect.top + (containerRect.height / 2)
        };
      }
      if (zoomAnchor && chartRect && typeof zoomAnchor.x === 'number' && typeof zoomAnchor.y === 'number' && currentScale !== 0) {
        anchorX = zoomAnchor.x;
        anchorY = zoomAnchor.y;
        localAnchorX = (anchorX - chartRect.left) / currentScale;
        localAnchorY = (anchorY - chartRect.top) / currentScale;
        baseLeft = chartRect.left - currentTranslateX;
        baseTop = chartRect.top - currentTranslateY;
        targetTranslateX = anchorX - baseLeft - (localAnchorX * targetScale);
        targetTranslateY = anchorY - baseTop - (localAnchorY * targetScale);
      }

      chartElement.style.transformOrigin = '0 0';
      chartElement.style.transform = 'matrix(' + targetScale + ', 0, 0, ' + targetScale + ', ' + targetTranslateX + ', ' + targetTranslateY + ')';
    },
    //
    buildJsonDS: function (liEl) {
      const orgChart = this;
      const liElement = getElement(liEl);
      let childListElement;
      let jsonNodeData;

      if (!liElement) {
        return {};
      }

      childListElement = Array.from(liElement.children || []).find(function (childEl) {
        return childEl.tagName === 'UL';
      }) || null;

      jsonNodeData = {
        'name': ((liElement.childNodes && liElement.childNodes[0]) ? liElement.childNodes[0].textContent : '').trim(),
        'relationship': (liElement.parentElement && liElement.parentElement.parentElement && liElement.parentElement.parentElement.tagName === 'LI' ? '1' : '0')
          + (liElement.parentElement ? Array.from(liElement.parentElement.children).filter(function (siblingEl) {
              return siblingEl !== liElement && siblingEl.tagName === 'LI';
            }).length ? 1 : 0 : 0)
          + (childListElement ? 1 : 0)
      };
      forEachValue(getDatasetSnapshot(liElement), function(key, value) {
        jsonNodeData[key] = value;
      });
      if (childListElement) {
        Array.from(childListElement.children).forEach(function (childEl) {
          if (childEl.tagName !== 'LI') {
            return;
          }
          if (!jsonNodeData.children) {
            jsonNodeData.children = [];
          }
          jsonNodeData.children.push(orgChart.buildJsonDS(childEl));
        });
      }

      return jsonNodeData;
    },
    // process datasource and add necessary information
    attachRel: function (data, flags) {
      const orgChart = this;
      data.relationship = flags + (data.children && data.children.length > 0 ? 1 : 0);
      if (this.options?.compact?.constructor === Function && this.options.compact(data)) {
        data.compact = true;
      }
      if (data.children) {
        data.children.forEach(function(item) {
          if (data.hybrid || data.vertical) { // identify all the descendant nodes except the root node of hybrid structure
            item.vertical = true;
          } else if (data.compact && item.children) { // identify all the compact ancestor nodes
            item.compact = true;
          } else if (data.compact && !item.children) { // identify all the compact descendant nodes
            item.associatedCompact = true;
          }
          orgChart.attachRel(item, '1' + (data.children.length > 1 ? 1 : 0));
        });
      }
      return data;
    },
    //
    loopChart: function (chartEl, includeNodeData) {
      const orgChart = this;
      const chartElement = getElement(chartEl);
      let nodeElement;
      let childNodesContainerElement;
      let hierarchyNodeData;

      includeNodeData = (includeNodeData !== null && includeNodeData !== undefined) ? includeNodeData : false;

      if (!chartElement) {
        return {};
      }

      nodeElement = chartElement.classList && chartElement.classList.contains('hierarchy')
        ? Array.from(chartElement.children || []).find(function (childEl) {
            return childEl.classList && childEl.classList.contains('node');
          })
        : chartElement.querySelector('.node');
      if (!nodeElement) {
        return {};
      }

      hierarchyNodeData = { 'id': nodeElement.id };
      if (includeNodeData) {
        forEachValue(getState(nodeElement, 'nodeData'), function (key, value) {
          hierarchyNodeData[key] = value;
        });
      }
      childNodesContainerElement = Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
        return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
      }) || null;
      if (childNodesContainerElement) {
        Array.from(childNodesContainerElement.children).forEach(function (childEl) {
          if (!childEl.classList || !childEl.classList.contains('hierarchy')) {
            return;
          }
          if (!hierarchyNodeData.children) {
            hierarchyNodeData.children = [];
          }
          hierarchyNodeData.children.push(orgChart.loopChart(childEl, includeNodeData));
        });
      }

      return hierarchyNodeData;
    },
    //
    getHierarchy: function (includeNodeData) {
      const chartElement = this.chart;
      let nodeElements;

      includeNodeData = (includeNodeData !== null && includeNodeData !== undefined) ? includeNodeData : false;
      if (!chartElement) {
        return 'Error: orgchart does not exist'
      } else {
        nodeElements = chartElement ? Array.from(chartElement.querySelectorAll('.node')) : [];
        if (!nodeElements.length) {
          return 'Error: nodes do not exist'
        } else {
          if (nodeElements.some(function (nodeEl) { return !nodeEl.id; })) {
            return 'Error: All nodes of orghcart to be exported must have data-id attribute!';
          }
        }
      }
      return this.loopChart(chartElement, includeNodeData);
    },
    // detect the exist/display state of related node
    getNodeState: function (nodeEl, relation) {
      const nodeElement = getElement(nodeEl);
      let relatedElement;
      let isVerticalNode;
      let siblingElements;

      if (!nodeElement || !nodeElement.classList || !nodeElement.classList.contains('node')) {
        return { 'exist': false, 'visible': false };
      }

      relation = relation || 'self';
      isVerticalNode = !!nodeElement.closest('vertical');

      if (relation === 'parent') {
        if (isVerticalNode) {
          relatedElement = nodeElement.closest('ul');
          relatedElement = relatedElement ? relatedElement.parentElement && relatedElement.parentElement.closest('ul') : null;
          if (!relatedElement) {
            relatedElement = nodeElement.closest('.nodes');
            if (!relatedElement) {
              relatedElement = nodeElement.closest('.vertical');
              relatedElement = relatedElement && relatedElement.parentElement ? relatedElement.parentElement.firstElementChild : null;
            }
          }
        } else {
          relatedElement = nodeElement.closest('.nodes');
          relatedElement = relatedElement ? relatedElement.previousElementSibling : null;
        }

        if (relatedElement) {
          if (relatedElement.classList.contains('hidden')
            || (relatedElement.closest('.nodes') && relatedElement.closest('.nodes').classList.contains('hidden'))
            || (relatedElement.closest('.vertical') && relatedElement.closest('.vertical').classList.contains('hidden'))) {
            return { 'exist': true, 'visible': false };
          }
          return { 'exist': true, 'visible': true };
        }
      } else if (relation === 'children') {
        relatedElement = isVerticalNode
          ? Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
              return childEl.tagName === 'UL';
            }) || null
          : Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
              return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
            }) || null;

        if (relatedElement) {
          if (!relatedElement.classList.contains('hidden')) {
            return { 'exist': true, 'visible': true };
          }
          return { 'exist': true, 'visible': false };
        }
      } else if (relation === 'siblings') {
        if (isVerticalNode) {
          relatedElement = nodeElement.closest('ul');
          siblingElements = relatedElement ? Array.from(relatedElement.children || []).filter(function (childEl) {
            return childEl.tagName === 'LI';
          }) : [];
        } else {
          siblingElements = nodeElement.parentElement && nodeElement.parentElement.parentElement
            ? Array.from(nodeElement.parentElement.parentElement.children).filter(function (childEl) {
                return childEl !== nodeElement.parentElement;
              })
            : [];
          relatedElement = siblingElements[0] || null;
        }

        if (relatedElement && (!isVerticalNode || siblingElements.length > 1)) {
          if (!siblingElements.some(function (siblingEl) { return siblingEl.classList.contains('hidden'); })
            && !siblingElements.some(function (siblingEl) { return siblingEl.parentElement && siblingEl.parentElement.classList.contains('hidden'); })
            && (!isVerticalNode || !relatedElement.closest('.vertical') || !relatedElement.closest('.vertical').classList.contains('hidden'))) {
            return { 'exist': true, 'visible': true };
          }
          return { 'exist': true, 'visible': false };
        }
      } else {
        if (!((nodeElement.closest('.nodes') && nodeElement.closest('.nodes').classList.contains('hidden')) ||
          (nodeElement.closest('.hierarchy') && nodeElement.closest('.hierarchy').classList.contains('hidden')) ||
          (nodeElement.closest('.vertical') && ((nodeElement.closest('.nodes') && nodeElement.closest('.nodes').classList.contains('hidden')) || nodeElement.closest('.vertical').classList.contains('hidden')))
        )) {
          return { 'exist': true, 'visible': true };
        }
        return { 'exist': true, 'visible': false };
      }

      return { 'exist': false, 'visible': false };
    },
    getParent: function (nodeEl) {
      return this.getRelatedNodes(nodeEl, 'parent');
    },
    getChildren: function (nodeEl) {
      return this.getRelatedNodes(nodeEl, 'children');
    },
    getSiblings: function (nodeEl) {
      return this.getRelatedNodes(nodeEl, 'siblings');
    },
    // find the related nodes
    getRelatedNodes: function (nodeEl, relation) {
      const nodeElement = getElement(nodeEl);
      let nodesContainerEl;
      let childNodesContainerElement;
      let hierarchyEl;

      if (!nodeElement || !nodeElement.classList || !nodeElement.classList.contains('node')) {
        return relation === 'parent' ? null : [];
      }

      if (relation === 'parent') {
        nodesContainerEl = nodeElement.closest('.nodes');
        return nodesContainerEl ? nodesContainerEl.previousElementSibling : null;
      } else if (relation === 'children') {
        childNodesContainerElement = Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
          return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
        });

        if (!childNodesContainerElement) {
          return [];
        }

        return Array.from(childNodesContainerElement.children).filter(function (childEl) {
          return childEl.classList && childEl.classList.contains('hierarchy');
        }).map(function (childHierarchyEl) {
          return childHierarchyEl.querySelector('.node');
        }).filter(Boolean);
      } else if (relation === 'siblings') {
        hierarchyEl = nodeElement.closest('.hierarchy');
        if (!hierarchyEl || !hierarchyEl.parentElement) {
          return [];
        }

        return Array.from(hierarchyEl.parentElement.children).filter(function (siblingEl) {
          return siblingEl !== hierarchyEl;
        }).map(function (siblingHierarchyEl) {
          return siblingHierarchyEl.querySelector('.node');
        }).filter(Boolean);
      }

      return [];
    },
    hideParentEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const animatedNodeElement = getElement(event.animatedNode || nativeEvent.animatedNode || nativeEvent.target);
      const parentElement = getElement(event.parent || nativeEvent.parent);

      if (animatedNodeElement && animatedNodeElement.classList) {
        animatedNodeElement.classList.remove('sliding');
      }
      if (parentElement && parentElement.classList) {
        parentElement.classList.add('hidden');
      }
    },
    // recursively hide the ancestor node and sibling nodes of the specified node
    hideParent: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      let parentEl;
      let chartElement;
      let hierarchyElement;

      if (!nodeElement) {
        return;
      }

      parentEl = this.getParent(nodeElement);
      chartElement = nodeElement.closest('.orgchart');
      hierarchyElement = nodeElement.closest('.hierarchy');
      if (parentEl && parentEl.querySelector && parentEl.querySelector('.spinner')) {
        if (chartElement) {
          setState(chartElement, 'inAjax', false);
        }
      }

      if (this.getNodeState(nodeElement, 'siblings').visible) {
        this.hideSiblings(nodeElement);
      }

      if (hierarchyElement) {
        hierarchyElement.classList.add('isAncestorsCollapsed');
      }
      if (this.getNodeState(parentEl).visible) {
        parentEl.classList.add('sliding', 'slide-down');
        parentEl.addEventListener('transitionend', function (event) {
          event.animatedNode = parentEl;
          OrgChart.prototype.hideParentEnd(event);
        }, { once: true });
      }

      if (this.getNodeState(parentEl, 'parent').visible) {
        this.hideParent(parentEl);
      }
    },
    showParentEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const animatedNodeElement = getElement(event.animatedNode || nativeEvent.animatedNode || nativeEvent.target);
      const nodeElement = getElement(event.node || nativeEvent.node);
      let topEdgeElement;

      if (animatedNodeElement && animatedNodeElement.classList) {
        animatedNodeElement.classList.remove('sliding');
      }
      if (this.isInAction(nodeElement)) {
        topEdgeElement = nodeElement ? Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('topEdge');
        }) || null : null;
        this.switchVerticalArrow(topEdgeElement);
      }
    },
    // show the parent node of the specified node
    showParent: function (nodeEl) {
      const orgChart = this;
      const nodeElement = getElement(nodeEl);
      let parentEl;
      let hierarchyElement;

      if (!nodeElement) {
        return;
      }

      parentEl = this.getParent(nodeElement);
      hierarchyElement = nodeElement.closest('.hierarchy');
      if (parentEl && parentEl.classList) {
        parentEl.classList.remove('hidden');
      }
      if (hierarchyElement) {
        hierarchyElement.classList.remove('isAncestorsCollapsed');
      }
      this.repaint(parentEl);
      if (parentEl && parentEl.classList) {
        parentEl.classList.add('sliding');
        parentEl.classList.remove('slide-down');
        parentEl.addEventListener('transitionend', function (event) {
          event.animatedNode = parentEl;
          event.node = nodeElement;
          orgChart.showParentEnd(event);
        }, { once: true });
      }
    },
    stopAjax: function (nodeLevelEl) {
      const nodeLevelElement = getElement(nodeLevelEl);
      let chartElement;

      if (!nodeLevelElement || !nodeLevelElement.querySelector('.spinner')) {
        return;
      }

      chartElement = nodeLevelElement.closest('.orgchart');
      if (chartElement) {
        setState(chartElement, 'inAjax', false);
      }
    },
    isVisibleNode: function (index, elem) {
      return this.getNodeState(elem).visible;
    },
    isCompactDescendant: function (index, elem) {
      return !!(elem && elem.parentElement && elem.parentElement.matches('.node.compact'));
    },
    // do some necessary cleanup tasks when hide animation is finished
    hideChildrenEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const nodeElement = getElement(event.node || nativeEvent.node);
      const animatedNodeElements = event.animatedNodes || nativeEvent.animatedNodes;
        let bottomEdgeElement;

        getElements(animatedNodeElements).forEach(function (animatedNodeEl) {
          let lowerNodesElement;

          if (animatedNodeEl.classList) {
            animatedNodeEl.classList.remove('sliding');
          }
          lowerNodesElement = animatedNodeEl && typeof animatedNodeEl.closest === 'function'
            ? animatedNodeEl.closest('.nodes')
            : null;
          if (lowerNodesElement && lowerNodesElement.classList) {
            lowerNodesElement.classList.add('hidden');
          }
        });
        if (this.isInAction(nodeElement)) {
          bottomEdgeElement = nodeElement ? Array.from(nodeElement.children || []).find(function (childEl) {
            return childEl.classList && childEl.classList.contains('bottomEdge');
          }) || null : null;
          this.switchVerticalArrow(bottomEdgeElement);
      }
    },
    // recursively hide the descendant nodes of the specified node
    hideChildren: function (nodeEl) {
      const orgChart = this;
      const nodeElement = getElement(nodeEl);
      let hierarchyElement;
      let lowerLevelElement;
      let animatedNodeElements;
      let isVerticalDesc;

      if (!nodeElement) {
        return;
      }

      hierarchyElement = nodeElement.closest('.hierarchy');
      lowerLevelElement = Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
        return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
      }) || null;

      if (!lowerLevelElement) {
        return;
      }

      if (hierarchyElement) {
        hierarchyElement.classList.add('isChildrenCollapsed');
      }
      this.stopAjax(lowerLevelElement);
      animatedNodeElements = Array.from(lowerLevelElement.querySelectorAll('.node')).filter(function (visibleNodeEl, index) {
        return this.isVisibleNode(index, visibleNodeEl) && !this.isCompactDescendant(index, visibleNodeEl);
      }, this);
      isVerticalDesc = lowerLevelElement.classList.contains('vertical');
      if (!isVerticalDesc) {
        animatedNodeElements.forEach(function (animatedNodeEl) {
          const animatedHierarchyElement = animatedNodeEl.closest('.hierarchy');

          if (animatedHierarchyElement) {
            animatedHierarchyElement.classList.add('isCollapsedDescendant');
          }
        });
      }
      if (lowerLevelElement.classList.contains('vertical') || lowerLevelElement.querySelector('.vertical')) {
        animatedNodeElements.forEach(function (animatedNodeEl) {
          Array.from(animatedNodeEl.querySelectorAll('.' + this.options.icons.expanded)).forEach(function (expandedIconEl) {
            expandedIconEl.classList.remove(this.options.icons.expanded);
            expandedIconEl.classList.add(this.options.icons.collapsed);
          }, this);
        }, this);
      }
      this.repaint(animatedNodeElements[0]);
      animatedNodeElements.forEach(function (animatedNodeEl) {
        animatedNodeEl.classList.add('sliding', 'slide-up');
      });
      if (animatedNodeElements[0]) {
        animatedNodeElements[0].addEventListener('transitionend', function (event) {
          event.node = nodeElement;
          event.animatedNodes = animatedNodeElements;
          orgChart.hideChildrenEnd(event);
        }, { once: true });
      }
    },
    //
    showChildrenEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const nodeElement = getElement(event.node || nativeEvent.node);
      const animatedNodeElements = event.animatedNodes || nativeEvent.animatedNodes;
      let bottomEdgeElement;

      getElements(animatedNodeElements).forEach(function (animatedNodeEl) {
        if (animatedNodeEl.classList) {
          animatedNodeEl.classList.remove('sliding');
        }
      });
      if (this.isInAction(nodeElement)) {
        bottomEdgeElement = nodeElement ? Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('bottomEdge');
        }) || null : null;
        this.switchVerticalArrow(bottomEdgeElement);
      }
    },
    // show the children nodes of the specified node
    showChildren: function (nodeEl) {
      const orgChart = this;
      const nodeElement = getElement(nodeEl);
      let hierarchyElement;
      let levelsElement;
      let isVerticalDesc;
      let animatedNodeElements;

      if (!nodeElement) {
        return;
      }

      hierarchyElement = nodeElement.closest('.hierarchy');
      levelsElement = Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
        return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
      }) || null;

      if (!levelsElement) {
        return;
      }

      if (hierarchyElement) {
        hierarchyElement.classList.remove('isChildrenCollapsed');
      }
      levelsElement.classList.remove('hidden');
      isVerticalDesc = levelsElement.classList.contains('vertical');
      animatedNodeElements = isVerticalDesc
        ? Array.from(levelsElement.querySelectorAll('.node')).filter(function (visibleNodeEl, index) {
            return this.isVisibleNode(index, visibleNodeEl);
          }, this)
        : Array.from(levelsElement.children).filter(function (childEl) {
            return childEl.classList && childEl.classList.contains('hierarchy');
          }).map(function (childHierarchyEl) {
            return childHierarchyEl.querySelector('.node');
          }).filter(function (visibleNodeEl, index) {
            return this.isVisibleNode(index, visibleNodeEl);
          }, this);
      if (!isVerticalDesc) {
        animatedNodeElements.forEach(function (animatedNodeEl) {
          const animatedHierarchyElement = animatedNodeEl.closest('.hierarchy');

          if (animatedHierarchyElement && !animatedNodeEl.matches(':only-child')) {
            animatedHierarchyElement.classList.add('isChildrenCollapsed');
          }
          if (animatedHierarchyElement) {
            animatedHierarchyElement.classList.remove('isCollapsedDescendant');
          }
        });
      }
      this.repaint(animatedNodeElements[0]);
      animatedNodeElements.forEach(function (animatedNodeEl) {
        animatedNodeEl.classList.add('sliding');
        animatedNodeEl.classList.remove('slide-up');
      });
      if (animatedNodeElements[0]) {
        animatedNodeElements[0].addEventListener('transitionend', function (event) {
          event.node = nodeElement;
          event.animatedNodes = animatedNodeElements;
          orgChart.showChildrenEnd(event);
        }, { once: true });
      }
    },
    //
    hideSiblingsEnd: function (event) {
      const orgChart = this;
      const nativeEvent = event.originalEvent || event;
      const nodeElement = getElement(event.node || nativeEvent.node);
      const nodeContainerElement = getElement(event.nodeContainer || nativeEvent.nodeContainer);
      let direction = typeof event.direction !== 'undefined' ? event.direction : nativeEvent.direction;
      const animatedNodeElements = event.animatedNodes || nativeEvent.animatedNodes;

      if (typeof direction === 'undefined') {
        direction = nativeEvent.direction;
      }
      let siblingElements = [];
      let currentSiblingElement;

      if (nodeContainerElement) {
        if (direction === 'left') {
          currentSiblingElement = nodeContainerElement.previousElementSibling;
          while (currentSiblingElement) {
            if (!currentSiblingElement.classList.contains('hidden')) {
              siblingElements.push(currentSiblingElement);
            }
            currentSiblingElement = currentSiblingElement.previousElementSibling;
          }
        } else if (direction === 'right') {
          currentSiblingElement = nodeContainerElement.nextElementSibling;
          while (currentSiblingElement) {
            if (!currentSiblingElement.classList.contains('hidden')) {
              siblingElements.push(currentSiblingElement);
            }
            currentSiblingElement = currentSiblingElement.nextElementSibling;
          }
        } else if (nodeContainerElement.parentElement) {
          siblingElements = Array.from(nodeContainerElement.parentElement.children).filter(function (childEl) {
            return childEl !== nodeContainerElement;
          });
        }
      }

      getElements(animatedNodeElements).forEach(function (animatedNodeEl) {
        if (animatedNodeEl.classList) {
          animatedNodeEl.classList.remove('sliding');
        }
      });
      siblingElements.forEach(function (siblingElement) {
        Array.from(siblingElement.querySelectorAll('.node')).filter(function (siblingNodeEl) {
          return orgChart.isVisibleNode(null, siblingNodeEl);
        }).slice(1)
          .forEach(function (siblingNodeEl) {
            siblingNodeEl.classList.remove('slide-left', 'slide-right');
            if (!orgChart.options.compact) {
              siblingNodeEl.classList.add('slide-up');
            }
          });
        Array.from(siblingElement.querySelectorAll('.nodes, .vertical')).forEach(function (descendantEl) {
          descendantEl.classList.add('hidden');
        });
        siblingElement.classList.add('hidden');
      });

      if (this.isInAction(nodeElement)) {
        this.switchHorizontalArrow(nodeElement);
      }
    },
    // hide the sibling nodes of the specified node
    hideSiblings: function (nodeEl, direction) {
      const orgChart = this;
      const nodeElement = getElement(nodeEl);
      let chartElement;
      let nodeContainerElement;
      let siblingContainerElements = [];
      let animatedNodeElements = [];

      if (!nodeElement) {
        return;
      }

      chartElement = nodeElement.closest('.orgchart');
      nodeContainerElement = nodeElement.closest('.hierarchy');
      if (!nodeContainerElement) {
        return;
      }

      nodeContainerElement.classList.add('isSiblingsCollapsed');
      siblingContainerElements = nodeContainerElement.parentElement
        ? Array.from(nodeContainerElement.parentElement.children).filter(function (childEl) {
            return childEl !== nodeContainerElement;
          })
        : [];

      if (siblingContainerElements.some(function (siblingContainerEl) {
        return siblingContainerEl.querySelector('.spinner');
      })) {
        if (chartElement) {
          setState(chartElement, 'inAjax', false);
        }
      }

      if (direction) {
        if (direction === 'left') {
          let currentPreviousSiblingElement = nodeContainerElement.previousElementSibling;

          nodeContainerElement.classList.add('left-sibs');
          siblingContainerElements.forEach(function (siblingContainerEl) {
            if (siblingContainerEl.classList.contains('isSiblingsCollapsed')) {
              siblingContainerEl.classList.remove('isSiblingsCollapsed', 'left-sibs');
            }
          });

          while (currentPreviousSiblingElement) {
            currentPreviousSiblingElement.classList.add('isCollapsedSibling', 'isChildrenCollapsed');
            animatedNodeElements = animatedNodeElements.concat(
              Array.from(currentPreviousSiblingElement.querySelectorAll('.node')).filter(function (visibleNodeEl, index) {
                return this.isVisibleNode(index, visibleNodeEl);
              }, this)
            );
            currentPreviousSiblingElement = currentPreviousSiblingElement.previousElementSibling;
          }
          animatedNodeElements.forEach(function (animatedNodeEl) {
            animatedNodeEl.classList.add('sliding', 'slide-right');
          });
        } else {
          let currentNextSiblingElement = nodeContainerElement.nextElementSibling;

          nodeContainerElement.classList.add('right-sibs');
          siblingContainerElements.forEach(function (siblingContainerEl) {
            if (siblingContainerEl.classList.contains('isSiblingsCollapsed')) {
              siblingContainerEl.classList.remove('isSiblingsCollapsed', 'right-sibs');
            }
          });

          while (currentNextSiblingElement) {
            currentNextSiblingElement.classList.add('isCollapsedSibling', 'isChildrenCollapsed');
            animatedNodeElements = animatedNodeElements.concat(
              Array.from(currentNextSiblingElement.querySelectorAll('.node')).filter(function (visibleNodeEl, index) {
                return this.isVisibleNode(index, visibleNodeEl);
              }, this)
            );
            currentNextSiblingElement = currentNextSiblingElement.nextElementSibling;
          }
          animatedNodeElements.forEach(function (animatedNodeEl) {
            animatedNodeEl.classList.add('sliding', 'slide-left');
          });
        }
      } else {
        siblingContainerElements.forEach(function (siblingContainerEl) {
          const siblingAnimatedNodeElements = Array.from(siblingContainerEl.querySelectorAll('.node')).filter(function (visibleNodeEl, index) {
            return this.isVisibleNode(index, visibleNodeEl);
          }, this);

          siblingContainerEl.classList.add('isCollapsedSibling', 'isChildrenCollapsed');
          animatedNodeElements = animatedNodeElements.concat(siblingAnimatedNodeElements);
          siblingAnimatedNodeElements.forEach(function (animatedNodeEl) {
            animatedNodeEl.classList.add('sliding');
            if (siblingContainerEl.compareDocumentPosition(nodeContainerElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
              animatedNodeEl.classList.add('slide-right');
            } else {
              animatedNodeEl.classList.add('slide-left');
            }
          });
        }, this);
      }

      if (animatedNodeElements[0]) {
        animatedNodeElements[0].addEventListener('transitionend', function (event) {
          event.node = nodeElement;
          event.nodeContainer = nodeContainerElement;
          event.direction = direction;
          event.animatedNodes = animatedNodeElements;
          orgChart.hideSiblingsEnd(event);
        }, { once: true });
      }
    },
    //
    showSiblingsEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const nodeElement = getElement(event.node || nativeEvent.node);
      const visibleNodeElements = event.visibleNodes || nativeEvent.visibleNodes;
      let topEdgeElement;

      getElements(visibleNodeElements).forEach(function (visibleNodeEl) {
        if (visibleNodeEl.classList) {
          visibleNodeEl.classList.remove('sliding');
        }
      });
      if (this.isInAction(nodeElement)) {
        this.switchHorizontalArrow(nodeElement);
        topEdgeElement = nodeElement ? Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('topEdge');
        }) || null : null;
        if (topEdgeElement && topEdgeElement.classList) {
          topEdgeElement.classList.remove(this.options.icons.expandToUp);
          topEdgeElement.classList.add(this.options.icons.collapseToDown);
        }
      }
    },
    //
    showRelatedParentEnd: function(event) {
      const nativeEvent = event.originalEvent || event;
      const animatedNodeElement = getElement(event.animatedNode || nativeEvent.animatedNode || nativeEvent.target);

      if (animatedNodeElement && animatedNodeElement.classList) {
        animatedNodeElement.classList.remove('sliding');
      }
    },
    // show the sibling nodes of the specified node
    showSiblings: function (nodeEl, direction) {
      const orgChart = this;
      const nodeElement = getElement(nodeEl);
      let nodeContainerElement;
      let siblingElements = [];
      let parentNodesContainerElement;
      let upperLevelElement;
      let visibleNodeElements;

      if (!nodeElement) {
        return;
      }

      // firstly, show the sibling nodes
      nodeContainerElement = nodeElement.closest('.hierarchy');
      if (!nodeContainerElement) {
        return;
      }

      if (direction) {
        if (direction === 'left') {
          let currentPreviousSiblingElement = nodeContainerElement.previousElementSibling;
          while (currentPreviousSiblingElement) {
            currentPreviousSiblingElement.classList.remove('hidden');
            siblingElements.push(currentPreviousSiblingElement);
            currentPreviousSiblingElement = currentPreviousSiblingElement.previousElementSibling;
          }
        } else {
          let currentNextSiblingElement = nodeContainerElement.nextElementSibling;
          while (currentNextSiblingElement) {
            currentNextSiblingElement.classList.remove('hidden');
            siblingElements.push(currentNextSiblingElement);
            currentNextSiblingElement = currentNextSiblingElement.nextElementSibling;
          }
        }
      } else {
        siblingElements = nodeContainerElement.parentElement
          ? Array.from(nodeContainerElement.parentElement.children).filter(function (childEl) {
              return childEl !== nodeContainerElement;
            })
          : [];
        siblingElements.forEach(function (siblingEl) {
          siblingEl.classList.remove('hidden');
        });
      }
      // secondly, show the lines
      parentNodesContainerElement = nodeElement.closest('.nodes');
      upperLevelElement = parentNodesContainerElement ? parentNodesContainerElement.previousElementSibling : null;
      if (direction) {
        nodeContainerElement.classList.remove(direction + '-sibs');
        if (!Array.from(nodeContainerElement.classList).some(function (className) { return className.indexOf('-sibs') > -1; })) {
          nodeContainerElement.classList.remove('isSiblingsCollapsed');
        }
        siblingElements.forEach(function (siblingEl) {
          siblingEl.classList.remove('isCollapsedSibling', direction + '-sibs');
        });
      } else {
        nodeContainerElement.classList.remove('isSiblingsCollapsed');
        siblingElements.forEach(function (siblingEl) {
          siblingEl.classList.remove('isCollapsedSibling');
        });
      }
      // thirdly, show parent node if it is collapsed
      if (!this.getNodeState(nodeElement, 'parent').visible) {
        nodeContainerElement.classList.remove('isAncestorsCollapsed');
        if (upperLevelElement) {
          upperLevelElement.classList.remove('hidden');
          this.repaint(upperLevelElement);
          upperLevelElement.classList.add('sliding');
          upperLevelElement.classList.remove('slide-down');
          upperLevelElement.addEventListener('transitionend', function (event) {
            event.animatedNode = upperLevelElement;
            orgChart.showRelatedParentEnd(event);
          }, { once: true });
        }
      }
      // lastly, show the sibling nodes with animation
      visibleNodeElements = siblingElements.flatMap(function (siblingEl) {
        return Array.from(siblingEl.querySelectorAll('.node'));
      }, this).filter(function (visibleNodeEl, index) {
        return this.isVisibleNode(index, visibleNodeEl);
      }, this);
      this.repaint(visibleNodeElements[0]);
      visibleNodeElements.forEach(function (visibleNodeEl) {
        visibleNodeEl.classList.add('sliding');
        visibleNodeEl.classList.remove('slide-left', 'slide-right');
      });
      if (visibleNodeElements[0]) {
        visibleNodeElements[0].addEventListener('transitionend', function (event) {
          event.node = nodeElement;
          event.visibleNodes = visibleNodeElements;
          orgChart.showSiblingsEnd(event);
        }, { once: true });
      }
    },
    // start up loading status for requesting new nodes
    startLoading: function (edgeEl) {
      const edgeElement = getElement(edgeEl);
      const chartElement = this.chart;
      let nodeElement;
      let spinnerElement;

      if (!edgeElement || !chartElement) {
        return false;
      }

      if (typeof getState(chartElement, 'inAjax') !== 'undefined' && getState(chartElement, 'inAjax') === true) {
        return false;
      }

      edgeElement.classList.add('hidden');
      nodeElement = edgeElement.parentElement;
      if (nodeElement) {
        nodeElement.insertAdjacentHTML('beforeend', `<i class="${this.options.icons.theme} ${this.options.icons.spinner} spinner"></i>`);
        spinnerElement = Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('spinner');
        }) || null;
        Array.from(nodeElement.children || []).forEach(function (childEl) {
          if (childEl !== spinnerElement) {
            childEl.style.opacity = 0.2;
          }
        });
      }
      setState(chartElement, 'inAjax', true);
      Array.from(getDocument().querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
        exportButtonEl.disabled = true;
      });
      return true;
    },
    // terminate loading status for requesting new nodes
    endLoading: function (edgeEl) {
      const edgeElement = getElement(edgeEl);
      let nodeElement;
      const chartElement = this.chart;

      if (!edgeElement || !chartElement) {
        return;
      }

      nodeElement = edgeElement.parentElement;
      edgeElement.classList.remove('hidden');
      if (nodeElement) {
        Array.from(nodeElement.querySelectorAll('.spinner')).forEach(function (spinnerEl) {
          spinnerEl.remove();
        });
        Array.from(nodeElement.children || []).forEach(function (childEl) {
          childEl.removeAttribute('style');
        });
      }
      setState(chartElement, 'inAjax', false);
      Array.from(getDocument().querySelectorAll('.oc-export-btn')).forEach(function (exportButtonEl) {
        exportButtonEl.disabled = false;
      });
    },
    // whether the cursor is hovering over the node
    isInAction: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      const edgeClassName = Array.from(nodeElement ? nodeElement.children : []).filter(function (childEl) {
        return childEl.classList && childEl.classList.contains('edge');
      }).map(function (edgeEl) {
        return edgeEl.className;
      }).join(' ');

      // TODO: 展开/折叠的按钮不止4个箭头，还有toggleBtn
      return [
        this.options.icons.expandToUp,
        this.options.icons.collapseToDown,
        this.options.icons.collapseToLeft,
        this.options.icons.expandToRight
      ].some(function (icon) {
        return edgeClassName.indexOf(icon) > -1;
      });
    },
    //
    switchVerticalArrow: function (arrowEl) {
      const arrowElement = getElement(arrowEl);

      if (!arrowElement || !arrowElement.classList) {
        return;
      }

      arrowElement.classList.toggle(this.options.icons.expandToUp);
      arrowElement.classList.toggle(this.options.icons.collapseToDown);
    },
    //
    switchHorizontalArrow: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      const opts = this.options;
      let hierarchyElement;
      let siblingsContainerElement;
      let leftEdgeElement;
      let rightEdgeElement;
      let previousSiblingElement;
      let nextSiblingElement;
      let siblingElements;
      let sibsVisible;

      if (!nodeElement) {
        return;
      }

      hierarchyElement = nodeElement.closest('.hierarchy');
      siblingsContainerElement = nodeElement.closest('.nodes');
      leftEdgeElement = Array.from(nodeElement.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('leftEdge');
      }) || null;
      rightEdgeElement = Array.from(nodeElement.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('rightEdge');
      }) || null;

      if (opts.toggleSiblingsResp && (typeof opts.ajaxURL === 'undefined' || getState(siblingsContainerElement, 'siblingsLoaded'))) {
        previousSiblingElement = hierarchyElement ? hierarchyElement.previousElementSibling : null;
        if (previousSiblingElement && leftEdgeElement) {
          leftEdgeElement.classList.toggle(opts.icons.collapseToLeft, previousSiblingElement.classList.contains('hidden'));
          leftEdgeElement.classList.toggle(opts.icons.expandToRight, !previousSiblingElement.classList.contains('hidden'));
        }
        nextSiblingElement = hierarchyElement ? hierarchyElement.nextElementSibling : null;
        if (nextSiblingElement && rightEdgeElement) {
          rightEdgeElement.classList.toggle(opts.icons.expandToRight, nextSiblingElement.classList.contains('hidden'));
          rightEdgeElement.classList.toggle(opts.icons.collapseToLeft, !nextSiblingElement.classList.contains('hidden'));
        }
      } else {
        siblingElements = hierarchyElement && hierarchyElement.parentElement
          ? Array.from(hierarchyElement.parentElement.children).filter(function (childEl) {
              return childEl !== hierarchyElement;
            })
          : [];
        sibsVisible = siblingElements.length ? !siblingElements[0].classList.contains('hidden') : false;
        if (leftEdgeElement) {
          leftEdgeElement.classList.toggle(opts.icons.expandToRight, sibsVisible);
          leftEdgeElement.classList.toggle(opts.icons.collapseToLeft, !sibsVisible);
        }
        if (rightEdgeElement) {
          rightEdgeElement.classList.toggle(opts.icons.collapseToLeft, sibsVisible);
          rightEdgeElement.classList.toggle(opts.icons.expandToRight, !sibsVisible);
        }
      }
    },
    //
    repaint: function (node) {
      if (node) {
        node.style.offsetWidth = node.offsetWidth;
      }
    },
    // determines how to show arrow buttons 
    nodeEnterLeaveHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const eventType = nativeEvent.type;
      const nodeElement = event.node || nativeEvent.currentTarget;
      const childElements = Array.from(nodeElement ? nodeElement.children : []);
      const isVerticalNode = !!(nodeElement && nodeElement.closest('.nodes.vertical'));
      const toggleBtnElement = childElements.find(function (childEl) {
        return childEl.classList && childEl.classList.contains('toggleBtn');
      }) || null;
      const topEdgeElement = childElements.find(function (childEl) {
        return childEl.classList && childEl.classList.contains('topEdge');
      }) || null;
      const rightEdgeElement = childElements.find(function (childEl) {
        return childEl.classList && childEl.classList.contains('rightEdge');
      }) || null;
      const bottomEdgeElement = childElements.find(function (childEl) {
        return childEl.classList && childEl.classList.contains('bottomEdge');
      }) || null;
      const leftEdgeElement = childElements.find(function (childEl) {
        return childEl.classList && childEl.classList.contains('leftEdge');
      }) || null;
      let isExpanded = false;
      if (isVerticalNode) {
        if (eventType === 'mouseenter') {
          if (toggleBtnElement) {
            isExpanded = this.getNodeState(nodeElement, 'children').visible;
            toggleBtnElement.classList.toggle(this.options.icons.collapsed, !isExpanded);
            toggleBtnElement.classList.toggle(this.options.icons.expanded, isExpanded);
          }
        } else if (toggleBtnElement) {
          toggleBtnElement.classList.remove(this.options.icons.collapsed, this.options.icons.expanded);
        }
      } else {
        if (eventType === 'mouseenter') {
          if (topEdgeElement) {
            isExpanded = this.getNodeState(nodeElement, 'parent').visible;
            topEdgeElement.classList.toggle(this.options.icons.expandToUp, !isExpanded);
            topEdgeElement.classList.toggle(this.options.icons.collapseToDown, isExpanded);
          }
          if (bottomEdgeElement) {
            isExpanded = this.getNodeState(nodeElement, 'children').visible;
            bottomEdgeElement.classList.toggle(this.options.icons.collapseToDown, !isExpanded);
            bottomEdgeElement.classList.toggle(this.options.icons.expandToUp, isExpanded);
          }
          if (leftEdgeElement || rightEdgeElement) {
            this.switchHorizontalArrow(nodeElement);
          }
        } else {
          childElements.forEach(function (childEl) {
            if (childEl.classList && childEl.classList.contains('edge')) {
              childEl.classList.remove(
                this.options.icons.expandToUp,
                this.options.icons.collapseToDown,
                this.options.icons.collapseToLeft,
                this.options.icons.expandToRight
              );
            }
          }, this);
        }
      }
    },
    //
    nodeClickHandler: function (event) {
      const chartElement = this.chart;
      const nativeEvent = event.originalEvent || event;
      const nodeElement = event.node || nativeEvent.currentTarget;

      if (!chartElement || !nodeElement || !nodeElement.classList) {
        return;
      }

      Array.from(chartElement.querySelectorAll('.focused')).forEach(function (focusedEl) {
        focusedEl.classList.remove('focused');
      });
      nodeElement.classList.add('focused');
    },
    addAncestors: function (data, parentId) {
      const rootHierarchyElement = this.chart ? this.chart.querySelector(':scope > .nodes > .hierarchy') : null;
      let originalRootChildren;
      let ancestorWrapperElement;
      let targetParentNodeElement;
      let targetSiblingsContainerElement;

      if (!rootHierarchyElement) {
        return;
      }

      this.buildHierarchy(rootHierarchyElement, data);
      originalRootChildren = Array.from(rootHierarchyElement.children).slice(0, 2);
      ancestorWrapperElement = getDocument().createElement('li');
      ancestorWrapperElement.className = 'hierarchy';
      rootHierarchyElement.insertBefore(ancestorWrapperElement, originalRootChildren[0] || null);
      originalRootChildren.forEach(function (childEl) {
        ancestorWrapperElement.appendChild(childEl);
      });
      targetParentNodeElement = getDocument().getElementById(parentId);
      targetSiblingsContainerElement = targetParentNodeElement
        ? Array.from(targetParentNodeElement.parentElement ? targetParentNodeElement.parentElement.children : []).find(function (childEl) {
            return childEl !== targetParentNodeElement && childEl.classList && childEl.classList.contains('nodes');
          }) || null
        : null;
      if (targetSiblingsContainerElement && targetSiblingsContainerElement !== ancestorWrapperElement.parentElement) {
        targetSiblingsContainerElement.appendChild(ancestorWrapperElement);
      }
    },
    addDescendants:function (data, parentEl) {
      const orgChart = this;
      const parentElement = getElement(parentEl);
      let descendantsElement;

      if (!parentElement || !parentElement.parentElement) {
        return;
      }

      descendantsElement = getDocument().createElement('ul');
      descendantsElement.className = 'nodes';
      parentElement.after(descendantsElement);
      forEachValue(data, function () {
        const descendantHierarchyElement = getDocument().createElement('li');

        descendantHierarchyElement.className = 'hierarchy';
        descendantsElement.appendChild(descendantHierarchyElement);
        orgChart.buildHierarchy(descendantHierarchyElement, this);
      });
    },
    //
    HideFirstParentEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const topEdgeElement = getElement(event.topEdge || nativeEvent.topEdge);
      const nodeElement = topEdgeElement ? topEdgeElement.parentElement : null;

      if (this.isInAction(nodeElement)) {
        this.switchVerticalArrow(topEdgeElement);
        this.switchHorizontalArrow(nodeElement);
      }
    },
    // actions on clinking top edge of a node
    topEdgeClickHandler: function (event) {
      const orgChart = this;
      const nativeEvent = event.originalEvent || event;
      const nodeElement = event.node || nativeEvent.currentTarget;
      const topEdgeElement = getElement(event.edge || nativeEvent.target);
      const parentEl = this.getParent(nodeElement);
      const parentState = this.getNodeState(nodeElement, 'parent');
      let parentSliding;
      let parentHiding;
      if (parentState.exist) {
        parentSliding = !!(parentEl && parentEl.classList && parentEl.classList.contains('sliding'));
        parentHiding = !!(parentEl && parentEl.classList && parentEl.classList.contains('slide-down'));
        if (parentSliding && !parentHiding) { return; }
        // hide the ancestor nodes and sibling nodes of the specified node
        if (parentState.visible && !parentHiding) {
          this.hideParent(nodeElement);
          if (parentEl) {
            parentEl.addEventListener('transitionend', function (transitionEvent) {
              transitionEvent.topEdge = topEdgeElement;
              orgChart.HideFirstParentEnd(transitionEvent);
            }, { once: true });
          }
          this.triggerHideEvent(nodeElement, 'parent');
        } else { // show the ancestors and siblings
          this.showParent(nodeElement);
          this.triggerShowEvent(nodeElement, 'parent');
        }
      }
    },
    // actions on clinking bottom edge of a node
    bottomEdgeClickHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const nodeElement = event.node || nativeEvent.currentTarget;
      const childrenState = this.getNodeState(nodeElement, 'children');
      let childNodesContainerElement;
      let childNodeElements;
      if (childrenState.exist) {
        childNodesContainerElement = Array.from(nodeElement.parentElement ? nodeElement.parentElement.children : []).find(function (childEl) {
          return childEl !== nodeElement && childEl.classList && childEl.classList.contains('nodes');
        }) || null;
        childNodeElements = childNodesContainerElement
          ? Array.from(childNodesContainerElement.children).filter(function (childEl) {
              return childEl.classList && childEl.classList.contains('hierarchy');
            }).map(function (childHierarchyEl) {
              return childHierarchyEl.querySelector('.node');
            }).filter(Boolean)
          : [];
        if (childNodeElements.some(function (childNodeEl) { return childNodeEl.classList.contains('sliding'); })) { return; }
        // hide the descendant nodes of the specified node
        if (childrenState.visible) {
          this.hideChildren(nodeElement);
          this.triggerHideEvent(nodeElement, 'children');
        } else { // show the descendants
          this.showChildren(nodeElement);
          this.triggerShowEvent(nodeElement, 'children');
        }
      }
    },
    // actions on clicking horizontal edges
    hEdgeClickHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const nodeElement = event.node || nativeEvent.currentTarget;
      const edgeElement = getElement(event.edge || nativeEvent.target);
      const opts = this.options;
      const siblingsState = this.getNodeState(nodeElement, 'siblings');
      let hierarchyElement;
      let siblingElements;
      let previousSiblingElement;
      let nextSiblingElement;
      if (siblingsState.exist) {
        hierarchyElement = nodeElement.closest('.hierarchy');
        siblingElements = hierarchyElement && hierarchyElement.parentElement
          ? Array.from(hierarchyElement.parentElement.children).filter(function (childEl) {
              return childEl !== hierarchyElement;
            })
          : [];
        if (siblingElements.some(function (siblingEl) {
          return siblingEl.querySelector('.sliding');
        })) { return; }
        if (opts.toggleSiblingsResp) {
          previousSiblingElement = hierarchyElement ? hierarchyElement.previousElementSibling : null;
          nextSiblingElement = hierarchyElement ? hierarchyElement.nextElementSibling : null;
          if (edgeElement && edgeElement.classList && edgeElement.classList.contains('leftEdge')) {
            if (previousSiblingElement && previousSiblingElement.classList.contains('hidden')) {
              this.showSiblings(nodeElement, 'left');
              this.triggerShowEvent(nodeElement,'siblings');
            } else {
              this.hideSiblings(nodeElement, 'left');
              this.triggerHideEvent(nodeElement, 'siblings');
            }
          } else {
            if (nextSiblingElement && nextSiblingElement.classList.contains('hidden')) {
              this.showSiblings(nodeElement, 'right');
              this.triggerShowEvent(nodeElement,'siblings');
            } else {
              this.hideSiblings(nodeElement, 'right');
              this.triggerHideEvent(nodeElement, 'siblings');
            }
          }
        } else {
          if (siblingsState.visible) {
            this.hideSiblings(nodeElement);
            this.triggerHideEvent(nodeElement, 'siblings');
          } else {
            this.showSiblings(nodeElement);
            this.triggerShowEvent(nodeElement, 'siblings');
          }
        }
      }
    },
    // show the compact node's children in the compact mode
    backToCompactHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const compactNodeEl = event.compactNode || nativeEvent.currentTarget;
      let nestedLooseModeElements;
      let backToCompactSymbolElement;
      let backToLooseSymbolElement;

      if (!compactNodeEl) {
        return;
      }

      compactNodeEl.classList.remove('looseMode');
      nestedLooseModeElements = Array.from(compactNodeEl.querySelectorAll('.looseMode'));
      nestedLooseModeElements.forEach(function (nestedLooseModeEl) {
        const nestedBackToCompactSymbolElement = Array.from(nestedLooseModeEl.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('backToCompactSymbol');
        }) || null;
        const nestedBackToLooseSymbolElement = Array.from(nestedLooseModeEl.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('backToLooseSymbol');
        }) || null;

        nestedLooseModeEl.classList.remove('looseMode');
        if (nestedBackToCompactSymbolElement) {
          nestedBackToCompactSymbolElement.classList.add('hidden');
        }
        if (nestedBackToLooseSymbolElement) {
          nestedBackToLooseSymbolElement.classList.remove('hidden');
        }
      });

      backToCompactSymbolElement = Array.from(compactNodeEl.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('backToCompactSymbol');
      }) || null;
      backToLooseSymbolElement = Array.from(compactNodeEl.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('backToLooseSymbol');
      }) || null;
      if (backToCompactSymbolElement) {
        backToCompactSymbolElement.classList.add('hidden');
      }
      if (backToLooseSymbolElement) {
        backToLooseSymbolElement.classList.remove('hidden');
      }
    },
    // show the compact node's children in the loose mode 
    backToLooseHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const compactNodeEl = event.compactNode || nativeEvent.currentTarget;
      let backToLooseSymbolElement;
      let backToCompactSymbolElement;

      if (!compactNodeEl) {
        return;
      }

      compactNodeEl.classList.add('looseMode');
      backToLooseSymbolElement = Array.from(compactNodeEl.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('backToLooseSymbol');
      }) || null;
      backToCompactSymbolElement = Array.from(compactNodeEl.children || []).find(function (childEl) {
        return childEl.classList && childEl.classList.contains('backToCompactSymbol');
      }) || null;
      if (backToLooseSymbolElement) {
        backToLooseSymbolElement.classList.add('hidden');
      }
      if (backToCompactSymbolElement) {
        backToCompactSymbolElement.classList.remove('hidden');
      }
    },
    //
    expandVNodesEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const verticalNodeElements = event.vNodes || nativeEvent.vNodes;

      getElements(verticalNodeElements).forEach(function (verticalNodeEl) {
        if (verticalNodeEl.classList) {
          verticalNodeEl.classList.remove('sliding');
        }
      });
    },
    //
    collapseVNodesEnd: function (event) {
      const nativeEvent = event.originalEvent || event;
      const verticalNodeElements = event.vNodes || nativeEvent.vNodes;

      getElements(verticalNodeElements).forEach(function (verticalNodeEl) {
        const verticalNodesWrapperElement = verticalNodeEl && typeof verticalNodeEl.closest === 'function'
          ? verticalNodeEl.closest('ul')
          : null;

        if (verticalNodeEl.classList) {
          verticalNodeEl.classList.remove('sliding');
        }
        if (verticalNodesWrapperElement && verticalNodesWrapperElement.classList) {
          verticalNodesWrapperElement.classList.add('hidden');
        }
      });
    },
    // event handler for toggle buttons in Hybrid(horizontal + vertical) OrgChart
    toggleVNodes: function (event) {
      const orgChart = this;
      const nativeEvent = event.originalEvent || event;
      const toggleBtnEl = event.toggleButton || nativeEvent.target;
      const descendantWrapperElement = toggleBtnEl && toggleBtnEl.parentElement ? toggleBtnEl.parentElement.nextElementSibling : null;
      let descendantNodeElements;
      let childNodeElements;

      if (!toggleBtnEl || !descendantWrapperElement) {
        return;
      }

      descendantNodeElements = Array.from(descendantWrapperElement.querySelectorAll('.node'));
      childNodeElements = Array.from(descendantWrapperElement.children || []).map(function (childEl) {
        return childEl.querySelector('.node');
      }).filter(Boolean);
      if (childNodeElements.some(function (childNodeEl) { return childNodeEl.classList.contains('sliding'); })) { return; }
      toggleBtnEl.classList.toggle(this.options.icons.collapsed);
      toggleBtnEl.classList.toggle(this.options.icons.expanded);
      if (descendantNodeElements[0] && descendantNodeElements[0].classList.contains('slide-up')) {
        descendantWrapperElement.classList.remove('hidden');
        this.repaint(childNodeElements[0]);
        childNodeElements.forEach(function (childNodeEl) {
          childNodeEl.classList.add('sliding');
          childNodeEl.classList.remove('slide-up');
        });
        if (childNodeElements[0]) {
          childNodeElements[0].addEventListener('transitionend', function (transitionEvent) {
            transitionEvent.vNodes = childNodeElements;
            orgChart.expandVNodesEnd(transitionEvent);
          }, { once: true });
        }
      } else {
        descendantNodeElements.forEach(function (descendantNodeEl) {
          descendantNodeEl.classList.add('sliding', 'slide-up');
        });
        if (descendantNodeElements[0]) {
          descendantNodeElements[0].addEventListener('transitionend', function (transitionEvent) {
            transitionEvent.vNodes = descendantNodeElements;
            orgChart.collapseVNodesEnd(transitionEvent);
          }, { once: true });
        }
        descendantNodeElements.forEach(function (descendantNodeEl) {
          Array.from(descendantNodeEl.querySelectorAll('.toggleBtn')).forEach(function (nestedToggleBtnEl) {
            nestedToggleBtnEl.classList.remove(this.options.icons.collapsed, this.options.icons.expanded);
          }, this);
        }, this);
      }
    },
    //
    createGhostNode: function (event) {
      const nativeEvent = event.originalEvent || event;
      const sourceNodeEl = event.sourceNode || nativeEvent.target;
      const chartElement = sourceNodeEl && typeof sourceNodeEl.closest === 'function'
        ? sourceNodeEl.closest('.orgchart')
        : null;
      const opts = this.options;
      const origEvent = nativeEvent;
      const isFirefox = /firefox/.test(getWindow().navigator.userAgent.toLowerCase());
      let sourceRect;
      let transformValue;
      let transformValues;
      let isVerticalChartDirection;
      let scaleFactor;
      let ghostNodeEl, nodeCoverEl;

      if (!sourceNodeEl || !chartElement) {
        return;
      }

      if (!getDocument().querySelector('.ghost-node')) {
        ghostNodeEl = getDocument().createElementNS("http://www.w3.org/2000/svg", "svg");
        if (!ghostNodeEl.classList) return;
        ghostNodeEl.classList.add('ghost-node');
        nodeCoverEl = getDocument().createElementNS('http://www.w3.org/2000/svg','rect');
        ghostNodeEl.appendChild(nodeCoverEl);
        chartElement.appendChild(ghostNodeEl);
      } else {
        ghostNodeEl = chartElement.querySelector('.ghost-node');
        nodeCoverEl = ghostNodeEl ? ghostNodeEl.firstElementChild : null;
      }

      if (!ghostNodeEl || !nodeCoverEl) {
        return;
      }

      sourceRect = sourceNodeEl.getBoundingClientRect();
      transformValue = chartElement.style.transform || getWindow().getComputedStyle(chartElement).transform || 'none';
      transformValues = transformValue.split(',');
      isVerticalChartDirection = opts.direction === 't2b' || opts.direction === 'b2t';
      scaleFactor = Math.abs(getWindow().parseFloat(isVerticalChartDirection ? transformValues[0].slice(transformValues[0].indexOf('(') + 1) : transformValues[1]));
      ghostNodeEl.setAttribute('width', isVerticalChartDirection ? sourceRect.width : sourceRect.height);
      ghostNodeEl.setAttribute('height', isVerticalChartDirection ? sourceRect.height : sourceRect.width);
      nodeCoverEl.setAttribute('x',5 * scaleFactor);
      nodeCoverEl.setAttribute('y',5 * scaleFactor);
      nodeCoverEl.setAttribute('width', 120 * scaleFactor);
      nodeCoverEl.setAttribute('height', 40 * scaleFactor);
      nodeCoverEl.setAttribute('rx', 4 * scaleFactor);
      nodeCoverEl.setAttribute('ry', 4 * scaleFactor);
      nodeCoverEl.setAttribute('stroke-width', 1 * scaleFactor);
      let xOffset = origEvent.offsetX * scaleFactor;
      let yOffset = origEvent.offsetY * scaleFactor;
      if (opts.direction === 'l2r') {
        xOffset = origEvent.offsetY * scaleFactor;
        yOffset = origEvent.offsetX * scaleFactor;
      } else if (opts.direction === 'r2l') {
        xOffset = sourceRect.width - origEvent.offsetY * scaleFactor;
        yOffset = origEvent.offsetX * scaleFactor;
      } else if (opts.direction === 'b2t') {
        xOffset = sourceRect.width - origEvent.offsetX * scaleFactor;
        yOffset = sourceRect.height - origEvent.offsetY * scaleFactor;
      }
      if (isFirefox) { // hack for old version of Firefox(< 48.0)
        nodeCoverEl.setAttribute('fill', 'rgb(255, 255, 255)');
        nodeCoverEl.setAttribute('stroke', 'rgb(191, 0, 0)');
        const ghostNodeImageEl = getDocument().createElement('img');
        ghostNodeImageEl.src = 'data:image/svg+xml;utf8,' + (new XMLSerializer()).serializeToString(ghostNodeEl);
        origEvent.dataTransfer.setDragImage(ghostNodeImageEl, xOffset, yOffset);
      } else {
        // IE/Edge do not support this, so only use it if we can
        if (origEvent.dataTransfer.setDragImage)
          origEvent.dataTransfer.setDragImage(ghostNodeEl, xOffset, yOffset);
      }
    },
    // get the level amount of a hierachy
    getUpperLevel: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      let currentElement;
      let levelCount = 0;

      if (!nodeElement || !nodeElement.matches('.node')) {
        return 0;
      }

      currentElement = nodeElement.parentElement;
      while (currentElement) {
        if (currentElement.classList && currentElement.classList.contains('hierarchy')) {
          levelCount += 1;
        }
        currentElement = currentElement.parentElement;
      }

      return levelCount;
    },
    // get the level amount of a hierachy
    getLowerLevel: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      let levelCount = 1;
      let currentLevelNodes;

      if (!nodeElement || !nodeElement.matches('.node')) {
        return 0;
      }

      currentLevelNodes = this.getChildren(nodeElement);
      while (currentLevelNodes.length) {
        const nextLevelNodes = [];
        levelCount += 1;
        currentLevelNodes.forEach(function (childNodeEl) {
          Array.prototype.push.apply(nextLevelNodes, this.getChildren(childNodeEl));
        }, this);
        currentLevelNodes = nextLevelNodes;
      }

      return levelCount;
    },
    // get nodes in level order traversal
    getLevelOrderNodes: function (rootEl) {
      const rootElement = getElement(rootEl);
      const pendingNodeElements = [];
      const nodesByLevel = [];
      if (!rootElement) {
        return [];
      }

      pendingNodeElements.push(rootElement);
      while(pendingNodeElements.length) {
        const levelNodeElements = [];
        const levelNodeCount = pendingNodeElements.length;
        for(let i = 0; i < levelNodeCount; i++) {
            const currentNodeElement = pendingNodeElements.shift();
            const childNodeElements = this.getChildren(currentNodeElement);
            if(childNodeElements.length) {
              Array.prototype.push.apply(pendingNodeElements, childNodeElements);
            }
            levelNodeElements.push(currentNodeElement);
        }
        nodesByLevel.push(levelNodeElements);
      }
      return nodesByLevel;
    },
    //
    filterAllowedDropNodes: function (draggedEl) {
      const draggedNodeEl = getElement(draggedEl);
      const opts = this.options;
      const chartElement = this.chart;
      let draggableHostEl;
      let draggedParentNodeEl;
      let draggedSubtreeNodeEls;
      let excludedNodeEls;
      let draggingNode;

      if (!chartElement) {
        return;
      }

      // what is being dragged?  a node, or something within a node?
      draggableHostEl = draggedNodeEl && typeof draggedNodeEl.closest === 'function'
        ? draggedNodeEl.closest('[draggable]')
        : null;
      draggingNode = !!(draggableHostEl && draggableHostEl.classList && draggableHostEl.classList.contains('node'));
      draggedParentNodeEl = draggedNodeEl && draggedNodeEl.closest('.nodes')
        ? draggedNodeEl.closest('.nodes').previousElementSibling
        : null;
      draggedSubtreeNodeEls = draggedNodeEl && draggedNodeEl.closest('.hierarchy')
        ? Array.from(draggedNodeEl.closest('.hierarchy').querySelectorAll('.node'))
        : [];
      excludedNodeEls = new Set(draggedSubtreeNodeEls);
      setState(chartElement, 'dragged', draggedNodeEl);
      Array.from(chartElement.querySelectorAll('.node')).forEach(function (node) {
        if (!draggingNode || !excludedNodeEls.has(node)) {
          if (opts.dropCriteria) {
            if (opts.dropCriteria(draggedNodeEl, draggedParentNodeEl, node)) {
              node.classList.add('allowedDrop');
            }
          } else {
            node.classList.add('allowedDrop');
          }
        }
      });
    },
    //
    dragstartHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const draggedNodeEl = event.draggedNode || nativeEvent.target;
      const chartElement = this.chart;
      const transformValue = chartElement
        ? (chartElement.style.transform || getWindow().getComputedStyle(chartElement).transform || 'none')
        : 'none';

      nativeEvent.dataTransfer.setData('text/html', 'hack for firefox');
      // if users enable zoom or direction options
      if (transformValue !== 'none') {
        this.createGhostNode({
          sourceNode: draggedNodeEl,
          originalEvent: nativeEvent
        });
      }
      this.filterAllowedDropNodes(draggedNodeEl);
    },
    //
    dragoverHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const dropZoneEl = event.dropZone || nativeEvent.currentTarget;

      if (!dropZoneEl || !dropZoneEl.classList || !dropZoneEl.classList.contains('allowedDrop')) {
        nativeEvent.dataTransfer.dropEffect = 'none';
      } else {
        // default action for drag-and-drop of div is not to drop, so preventing default action for nodes which have allowedDrop class
        //to fix drag and drop on IE and Edge
        if (typeof nativeEvent.preventDefault === 'function') {
          nativeEvent.preventDefault();
        }
      }
    },
    //
    dragendHandler: function (event) {
      const chartElement = this.chart;

      if (!chartElement) {
        return;
      }

      Array.from(chartElement.querySelectorAll('.allowedDrop')).forEach(function (node) {
        node.classList.remove('allowedDrop');
      });
    },
    // when user drops the node, it will be removed from original parent node and be added to new parent node
    dropHandler: async function (event) {
      const nativeEvent = event.originalEvent || event;
      const orgChart = this;
      const chartElement = this.chart;
      const dropZoneEl = event.dropZone || nativeEvent.currentTarget;
      const draggedEl = chartElement ? getElement(getState(chartElement, 'dragged')) : null;
      const chartOptions = chartElement ? getState(chartElement, 'options') : null;
      let draggedParentNodeEl;
      let dropChildrenContainerEl;
      let draggedHierarchyEl;
      let draggedParentChildrenContainerEl;
      let remainingHierarchyEls;

      // Pass on drops which are not nodes (since they are not our doing)
      if (!draggedEl || !draggedEl.classList || !draggedEl.classList.contains('node')) {
        if (chartElement) {
          chartElement.dispatchEvent(createTriggeredEvent('otherdropped.orgchart', {
            'draggedItem': draggedEl,
            'dropZone': dropZoneEl
          }));
        }
        return;
      }

      if (!dropZoneEl || !dropZoneEl.classList || !dropZoneEl.classList.contains('allowedDrop')) {
          // We are trying to drop a node into a node which isn't allowed
          // IE/Edge have a habit of allowing this, so we need our own double-check
          return;
      }

      draggedParentNodeEl = draggedEl.closest('.nodes') ? draggedEl.closest('.nodes').previousElementSibling : null;
      const dropEvent = createEventLike('nodedrop.orgchart');
      if (chartElement) {
        const triggeredDropEvent = createTriggeredEvent(dropEvent, {
          'draggedNode': draggedEl,
          'dragZone': draggedParentNodeEl,
          'dropZone': dropZoneEl
        });

        triggeredDropEvent.delegateTarget = chartElement;
        chartElement.dispatchEvent(triggeredDropEvent);
        dropEvent.defaultPrevented = triggeredDropEvent.defaultPrevented;
      }
      if (dropEvent.isDefaultPrevented()) {
        return;
      }
      // special process for hybrid chart
      const datasource = chartOptions.data;
      const dataDigger = new JSONDigger(datasource, chartOptions.nodeId, 'children');
      const hybridNodeData = dataDigger.findOneNode({ 'hybrid': true });
      if (chartOptions.verticalLevel > 1 || hybridNodeData) {
        const draggedNodeData = dataDigger.findNodeById(getState(draggedEl, 'nodeData').id);
        const draggedNodeCopy = Object.assign({}, draggedNodeData);
        dataDigger.removeNode(draggedNodeData.id);
        const dropNodeData = dataDigger.findNodeById(getState(dropZoneEl, 'nodeData').id);
        if (dropNodeData.children) {
          dropNodeData.children.push(draggedNodeCopy);
        } else {
          dropNodeData.children = [draggedNodeCopy];
        }
        orgChart.init({ 'data': datasource });
      } else {
        // The folowing code snippets are used to process horizontal chart
        draggedHierarchyEl = draggedEl.closest('.hierarchy');
        dropChildrenContainerEl = Array.from(dropZoneEl.parentElement ? dropZoneEl.parentElement.children : []).find(function (childEl) {
          return childEl !== dropZoneEl && childEl.classList && childEl.classList.contains('nodes');
        }) || null;
        // firstly, deal with the hierarchy of drop zone
        if (!dropChildrenContainerEl) { // if the drop zone is a leaf node
          dropZoneEl.insertAdjacentHTML('beforeend', `<i class="edge verticalEdge bottomEdge ${this.options.icons.theme}"></i>`);
          dropZoneEl.insertAdjacentHTML('afterend', '<ul class="nodes"></ul>');
          dropChildrenContainerEl = dropZoneEl.nextElementSibling;
          Array.from(draggedEl.querySelectorAll('.horizontalEdge')).forEach(function (edgeEl) {
            edgeEl.remove();
          });
          dropChildrenContainerEl.appendChild(draggedHierarchyEl);
          const titleEl = Array.from(dropZoneEl.children || []).find(function (childEl) {
            return childEl.classList && childEl.classList.contains('title');
          }) || null;
          if (titleEl) {
            titleEl.insertAdjacentHTML('afterbegin', `<i class="${this.options.icons.theme} ${chartOptions.icons.parentNode} parentNodeSymbol"></i>`);
          }
        } else {
          const horizontalEdges = `<i class="edge horizontalEdge rightEdge ${this.options.icons.theme}"></i><i class="edge horizontalEdge leftEdge ${this.options.icons.theme}"></i>`;
          if (!draggedEl.querySelector('.horizontalEdge')) {
            draggedEl.insertAdjacentHTML('beforeend', horizontalEdges);
          }
          dropChildrenContainerEl.appendChild(draggedHierarchyEl);
          const dropSiblingNodeEls = Array.from(dropChildrenContainerEl.children || []).filter(function (childEl) {
            return childEl !== draggedHierarchyEl && childEl.classList && childEl.classList.contains('hierarchy');
          }).map(function (siblingHierarchyEl) {
            return siblingHierarchyEl.querySelector('.node');
          }).filter(Boolean);
          if (dropSiblingNodeEls.length === 1) {
            dropSiblingNodeEls[0].insertAdjacentHTML('beforeend', horizontalEdges);
          }
        }
        // secondly, deal with the hierarchy of dragged node
        draggedParentChildrenContainerEl = Array.from(draggedParentNodeEl && draggedParentNodeEl.parentElement ? draggedParentNodeEl.parentElement.children : []).find(function (childEl) {
          return childEl !== draggedParentNodeEl && childEl.classList && childEl.classList.contains('nodes');
        }) || null;
        remainingHierarchyEls = draggedParentChildrenContainerEl
          ? Array.from(draggedParentChildrenContainerEl.children || []).filter(function (childEl) {
              return childEl.classList && childEl.classList.contains('hierarchy');
            })
          : [];
        if (remainingHierarchyEls.length === 1) { // if there is only one sibling node left
          const remainingNodeEl = remainingHierarchyEls[0].querySelector('.node');
          if (remainingNodeEl) {
            Array.from(remainingNodeEl.querySelectorAll('.horizontalEdge')).forEach(function (edgeEl) {
              edgeEl.remove();
            });
          }
        } else if (remainingHierarchyEls.length === 0) {
          Array.from(draggedParentNodeEl.querySelectorAll('.bottomEdge, .parentNodeSymbol')).forEach(function (edgeEl) {
            edgeEl.remove();
          });
          if (draggedParentChildrenContainerEl) {
            draggedParentChildrenContainerEl.remove();
          }
        }
      }
    },
    //
    touchstartHandler: function (event) {
      const nativeEvent = event.originalEvent || event;

      if (this.touchHandled)
        return;

      if (nativeEvent.touches && nativeEvent.touches.length > 1)
        return;

      this.touchHandled = true;
      this.touchMoved = false; // this is so we can work out later if this was a 'press' or a 'drag' touch
      if (typeof nativeEvent.preventDefault === 'function') {
        nativeEvent.preventDefault();
      }
    },
    //
    touchmoveHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      const draggedNodeEl = event.draggedNode || nativeEvent.currentTarget || nativeEvent.target;
      const chartElement = this.chart;
      let cachedDraggedNodeEl;
      let touchedElement;
      let candidateDropNodeEl;

      if (!this.touchHandled)
        return;

      if (nativeEvent.touches && nativeEvent.touches.length > 1)
        return;

      if (typeof nativeEvent.preventDefault === 'function') {
        nativeEvent.preventDefault();
      }

      if (!this.touchMoved) {
        // we do not bother with createGhostNode (dragstart does) since the touch event does not have a dataTransfer property
        this.filterAllowedDropNodes(draggedNodeEl);  // will also cache the dragged node on the chart element for us
        // create an image which can be used to illustrate the drag (our own createGhostNode)
        cachedDraggedNodeEl = chartElement ? getElement(getState(chartElement, 'dragged')) : null;
        if (!cachedDraggedNodeEl) {
          return;
        }
        this.touchDragImage = this.createDragImage(nativeEvent, cachedDraggedNodeEl);
      }
      this.touchMoved = true;

      // move our dragimage so it follows our finger
      this.moveDragImage(nativeEvent, this.touchDragImage);

      touchedElement = getDocument().elementFromPoint(nativeEvent.touches[0].clientX, nativeEvent.touches[0].clientY);
      candidateDropNodeEl = touchedElement && typeof touchedElement.closest === 'function'
        ? touchedElement.closest('div.node')
        : null;
      if (candidateDropNodeEl && candidateDropNodeEl.classList && candidateDropNodeEl.classList.contains('allowedDrop')) {
        this.touchTargetNode = candidateDropNodeEl;
      } else {
        this.touchTargetNode = null;
      }
    },
    //
    touchendHandler: function (event) {
      const nativeEvent = event.originalEvent || event;
      let firstTouch;
      let targetEl;
      let fakeMouseClickEvent;

      if (!this.touchHandled) {
          return;
      }

      this.destroyDragImage();
      if (this.touchMoved) {
          // we've had movement, so this was a 'drag' touch
          if (this.touchTargetNode) {
            const syntheticDropEvent = { dropZone: this.touchTargetNode };
            this.dropHandler(syntheticDropEvent);
            this.touchTargetNode = null;
          }
          this.dragendHandler(event);
      } else {
          // we did not move, so this was a 'press' touch (fake a click)
          firstTouch = nativeEvent.changedTouches[0];
          targetEl = nativeEvent.target;
          fakeMouseClickEvent = new (getWindow().MouseEvent)('click', {
            bubbles: true,
            cancelable: true,
            view: getWindow(),
            screenX: firstTouch.screenX,
            screenY: firstTouch.screenY,
            clientX: firstTouch.clientX,
            clientY: firstTouch.clientY,
            ctrlKey: nativeEvent.ctrlKey,
            altKey: nativeEvent.altKey,
            shiftKey: nativeEvent.shiftKey,
            metaKey: nativeEvent.metaKey,
            button: 0
          });
          targetEl.dispatchEvent(fakeMouseClickEvent);
      }

      this.touchHandled = false;
    },
    //
    createDragImage: function (event, sourceEl) {
      const dragImageEl = sourceEl.cloneNode(true);
      this.copyStyle(sourceEl, dragImageEl);
      dragImageEl.style.top = dragImageEl.style.left = '-9999px';
      const sourceRect = sourceEl.getBoundingClientRect();
      const sourcePoint = this.getTouchPoint(event);
      this.touchDragImageOffset = { x: sourcePoint.x - sourceRect.left, y: sourcePoint.y - sourceRect.top };
      dragImageEl.style.opacity = '0.5';
      getDocument().body.appendChild(dragImageEl);
      return dragImageEl;
    },
    //
    destroyDragImage: function () {
      if (this.touchDragImage && this.touchDragImage.parentElement)
        this.touchDragImage.parentElement.removeChild(this.touchDragImage);
      this.touchDragImageOffset = null;
      this.touchDragImage = null;
    },
    //
    copyStyle: function (sourceEl, targetEl) {
      // remove potentially troublesome attributes
      const badAttributes = ['id', 'class', 'style', 'draggable'];
      badAttributes.forEach(function (attributeName) {
          targetEl.removeAttribute(attributeName);
      });
      // copy canvas content
      if (sourceEl instanceof HTMLCanvasElement) {
        const sourceCanvas = sourceEl;
        const targetCanvas = targetEl;
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;
        targetCanvas.getContext('2d').drawImage(sourceCanvas, 0, 0);
      }
      // copy style (without transitions)
      const computedStyle = getComputedStyle(sourceEl);
        for (let i = 0; i < computedStyle.length; i++) {
        const key = computedStyle[i];
        if (key.indexOf('transition') < 0) {
          targetEl.style[key] = computedStyle[key];
        }
      }
      targetEl.style.pointerEvents = 'none';
      // and repeat for all children
        for (let i = 0; i < sourceEl.children.length; i++) {
        this.copyStyle(sourceEl.children[i], targetEl.children[i]);
      }
    },
    //
    getTouchPoint: function (event) {
      let nativeEvent = event ? (event.originalEvent || event) : null;

      if (nativeEvent && nativeEvent.touches) {
        nativeEvent = nativeEvent.touches[0];
      }
      return {
        x: nativeEvent.clientX,
        y: nativeEvent.clientY
      };
    },
    //
    moveDragImage: function (event, dragImageEl) {
      if (!event || !dragImageEl)
        return;
      const orgChartMaster = this;
      requestAnimationFrame(function () {
        const touchPoint = orgChartMaster.getTouchPoint(event);
        const dragImageStyle = dragImageEl.style;
        dragImageStyle.position = 'absolute';
        dragImageStyle.pointerEvents = 'none';
        dragImageStyle.zIndex = '999999';
        if (orgChartMaster.touchDragImageOffset) {
            dragImageStyle.left = Math.round(touchPoint.x - orgChartMaster.touchDragImageOffset.x) + 'px';
            dragImageStyle.top = Math.round(touchPoint.y - orgChartMaster.touchDragImageOffset.y) + 'px';
        }
      });
    },
    //
    bindDragDrop: function (nodeEl) {
      const nodeElement = getElement(nodeEl);

      if (!nodeElement) {
        return;
      }

      nodeElement.addEventListener('dragstart', this.dragstartHandler.bind(this));
      nodeElement.addEventListener('dragover', this.dragoverHandler.bind(this));
      nodeElement.addEventListener('dragend', this.dragendHandler.bind(this));
      nodeElement.addEventListener('drop', this.dropHandler.bind(this));
      nodeElement.addEventListener('touchstart', this.touchstartHandler.bind(this));
      nodeElement.addEventListener('touchmove', this.touchmoveHandler.bind(this));
      nodeElement.addEventListener('touchend', this.touchendHandler.bind(this));
    },
    // create node
    createNode: function (data) {
      const opts = this.options;
      const level = data.level;
      const flags = data.relationship || '';
      const nodeClassName = [
        'node',
        data.className || '',
        data?.outsider ? 'outsider' : '',
        level > opts.visibleLevel ? 'slide-up' : ''
      ].filter(Boolean).join(' ');
      const titleMarkupParts = [];
      const contentMarkupParts = [];
      const nodeMarkupParts = [];
      const shouldAddParentSymbol = Number(flags.substr(2, 1));

      if (data.children && data[opts.nodeId]) {
        forEachValue(data.children, function (index, child) {
          child.parentId = data[opts.nodeId]
        });
      }

      if (shouldAddParentSymbol) {
        titleMarkupParts.push(`<i class="${opts.icons.theme} ${opts.icons.parentNode} parentNodeSymbol"></i>`);
      }
      titleMarkupParts.push(data[opts.nodeTitle]);

      if (opts.nodeTemplate) {
        nodeMarkupParts.push(opts.nodeTemplate(data));
      } else {
        nodeMarkupParts.push(`<div class="title">${titleMarkupParts.join('')}</div>`);
        if (typeof opts.nodeContent !== 'undefined') {
          contentMarkupParts.push(`<div class="content">${data[opts.nodeContent] || ''}</div>`);
        }
        nodeMarkupParts.push(contentMarkupParts.join(''));
      }

      if ((opts.verticalLevel && level >= opts.verticalLevel) || data.vertical) {
        if (shouldAddParentSymbol) {
          nodeMarkupParts.push(`<i class="toggleBtn ${opts.icons.theme}"></i>`);
        }
      } else if (data.hybrid) {
        if (shouldAddParentSymbol) {
          nodeMarkupParts.push(`<i class="edge verticalEdge bottomEdge ${opts.icons.theme}"></i>`);
        }
      } else if (data.compact) {
        if (shouldAddParentSymbol) {
          nodeMarkupParts.push(`<i class="${opts.icons.theme} ${opts.icons.backToCompact} backToCompactSymbol hidden"></i>`);
          nodeMarkupParts.push(`<i class="${opts.icons.theme} ${opts.icons.backToLoose} backToLooseSymbol"></i>`);
        }
      } else if (!data.associatedCompact) {
        if (Number(flags.substr(0, 1))) {
          nodeMarkupParts.push(`<i class="edge verticalEdge topEdge ${opts.icons.theme}"></i>`);
        }
        if (Number(flags.substr(1, 1))) {
          nodeMarkupParts.push(`<i class="edge horizontalEdge rightEdge ${opts.icons.theme}"></i>`);
          nodeMarkupParts.push(`<i class="edge horizontalEdge leftEdge ${opts.icons.theme}"></i>`);
        }
        if (shouldAddParentSymbol) {
          nodeMarkupParts.push(`<i class="edge verticalEdge bottomEdge ${opts.icons.theme}"></i>`);
        }
      }

      // construct the content of node
      const nodeElement = getDocument().createElement('div');
      const routeNodeClick = function (selector, handler) {
        nodeElement.addEventListener('click', function (event) {
          const matchedElement = event.target && typeof event.target.closest === 'function'
            ? event.target.closest(selector)
            : null;

          if (!matchedElement || matchedElement.parentElement !== nodeElement) {
            return;
          }

          handler.call(this, event);
        }.bind(this));
      }.bind(this);

      if (opts.draggable) {
        nodeElement.setAttribute('draggable', 'true');
      }
      if (data[opts.nodeId]) {
        nodeElement.id = data[opts.nodeId];
      }
      if (data.parentId) {
        nodeElement.setAttribute('data-parent', data.parentId);
      }
      nodeElement.className = nodeClassName;
      nodeElement.insertAdjacentHTML('beforeend', nodeMarkupParts.join(''));
      //
      const storedNodeData = mergeObjects({}, data);
      delete storedNodeData.children;
      setState(nodeElement, 'nodeData', storedNodeData);
      nodeElement.__ocNodeData = storedNodeData;
      if (data.compact && nodeElement && nodeElement.style) {
        nodeElement.style.gridTemplateColumns = `repeat(${Math.floor(Math.sqrt(data.children.length + 1))}, auto)`;
      }

      nodeElement.addEventListener('mouseenter', this.nodeEnterLeaveHandler.bind(this));
      nodeElement.addEventListener('mouseleave', this.nodeEnterLeaveHandler.bind(this));
      nodeElement.addEventListener('click', this.nodeClickHandler.bind(this));
      routeNodeClick('.topEdge', this.topEdgeClickHandler);
      routeNodeClick('.bottomEdge', this.bottomEdgeClickHandler);
      routeNodeClick('.leftEdge, .rightEdge', this.hEdgeClickHandler);
      routeNodeClick('.toggleBtn', this.toggleVNodes);
      routeNodeClick('.backToCompactSymbol', this.backToCompactHandler);
      routeNodeClick('.backToLooseSymbol', this.backToLooseHandler);

      if (opts.draggable) {
        this.bindDragDrop(nodeElement);
        this.touchHandled = false;
        this.touchMoved = false;
        this.touchTargetNode = null;
      }
      // allow user to append dom modification after finishing node create of orgchart
      if (opts.createNode) {
        opts.createNode(nodeElement, data);
      }

      return nodeElement;
    },
    // Construct the inferior nodes within a hierarchy
    buildInferiorNodes: function (hierarchyEl, nodeEl, data, level) {
      const orgChart = this;
      const opts = this.options;
      const hierarchyElement = getElement(hierarchyEl);
      const nodeElement = getElement(nodeEl);
      const isHidden = level + 1 > opts.visibleLevel || (data.collapsed !== undefined && data.collapsed);
      let nodesLayerElement;

      if (!hierarchyElement) {
        return;
      }

      if ((opts.verticalLevel && (level + 1) >= opts.verticalLevel) || data.hybrid) {
        nodesLayerElement = getDocument().createElement('ul');
        nodesLayerElement.className = 'nodes';
        if (isHidden && (opts.verticalLevel && (level + 1) >= opts.verticalLevel)) {
          nodesLayerElement.classList.add('hidden');
        }
        if (((opts.verticalLevel && level + 1 === opts.verticalLevel) || data.hybrid)
          && !hierarchyElement.closest('.vertical')) {
            nodesLayerElement.classList.add('vertical');
        }
        hierarchyElement.appendChild(nodesLayerElement);
      } else if (data.compact) {
        if (nodeElement && nodeElement.classList) {
          nodeElement.classList.add('compact');
        }
      } else {
        nodesLayerElement = getDocument().createElement('ul');
        nodesLayerElement.className = isHidden ? 'nodes hidden' : 'nodes';
        if (isHidden) {
          hierarchyElement.classList.add('isChildrenCollapsed');
        }
        hierarchyElement.appendChild(nodesLayerElement);
      }
      // recurse through children nodes
      if (Array.isArray(data.children[0])) {
        forEachValue(data.children, function() {
          this.level = level + 1;
        });
        this.buildHierarchy(nodesLayerElement, data.children); // 构造子一层的夫妻组合（每个组合可能有多妻多夫情况）
      } else {
        forEachValue(data.children, function () {
          this.level = level + 1;
          if (data.compact) {
            orgChart.buildHierarchy(nodeElement, this);
          } else {
            const nodeCellElement = getDocument().createElement('li');

            nodeCellElement.className = 'hierarchy';
            nodesLayerElement.appendChild(nodeCellElement);
            orgChart.buildHierarchy(nodeCellElement, this);
          }
        });
      }
    },
    // recursively build the tree
    buildHierarchy: function (hierarchyEl, data) {
      const orgChart = this;
      const hierarchyElement = getElement(hierarchyEl);
      let level = 0;
      let nodeCollection;
      let nodeElement;

      if (!hierarchyElement) {
        return;
      }

      if (data.level || data[0]?.level) {
        level = data.level;
      } else {
        let currentAncestorElement = hierarchyElement.parentElement;

        while (currentAncestorElement && !currentAncestorElement.matches('.orgchart')) {
          if (currentAncestorElement.classList && currentAncestorElement.classList.contains('nodes')) {
            level += 1;
          }
          currentAncestorElement = currentAncestorElement.parentElement;
        }
        if (Array.isArray(data) && Array.isArray(data[0])) {
          forEachValue(data, function () {
            forEachValue(this, function () {
              this.level = level;
            });
          });
        } else {
          data.level = level;
        }
      }
      // Construct the single node in OrgChart or the multiple nodes in family tree
      if (Array.isArray(data) && Array.isArray(data[0])) { // 处理family tree的情况
        forEachValue(data, function () { // 构造一个家庭的hierarchy
          const familyNodes = this;
          forEachValue(this, function (i) { // 构造一个夫/妻节点
            let spouseNodeElement;
            let wrapperElement;

            nodeElement = orgChart.createNode(this);
            // if there are only two persons in a marriage, two single nodes will appear in a hierarchy
            if (familyNodes.length === 2 && i === 1) {
              spouseNodeElement = Array.from(hierarchyElement.querySelectorAll('.node')).find(function (candidateNodeEl) {
                return candidateNodeEl.id === familyNodes[0].id;
              }) || null;
              if (spouseNodeElement && spouseNodeElement.parentElement) {
                spouseNodeElement.after(nodeElement);
              }
              if (this.children && this.children.length && this.children[0].length) {
                orgChart.buildInferiorNodes(spouseNodeElement ? spouseNodeElement.parentElement : null, nodeElement, this, level);
              }
            } else {
              // if there are more than two persons in a marriage, every node will be included in a single hierarchy
              wrapperElement = getDocument().createElement('li');
              wrapperElement.className = `hierarchy${familyNodes.length > 1 ? ' spouse' : ''}${familyNodes.length === 2 ? ' couple' : ''}${!!this.outsider === false && familyNodes.length > 2  ? ' insider' : ''}`;

              //在family tree中，一个多妻/多夫组合里，本姓人只有一个，外姓人可能有多个，我们通过水平的连线来表示他们是一家子
              if (i === 0) {
                wrapperElement.style.setProperty('--ft-width', '50%');
                wrapperElement.style.setProperty('--ft-left-offset', '50%');
              } else if (i > 0 && i < familyNodes.length - 1) {
                wrapperElement.style.setProperty('--ft-width', '100%');
                wrapperElement.style.setProperty('--ft-left-offset', '0px');
              } else {
                wrapperElement.style.setProperty('--ft-width', '50%');
                wrapperElement.style.setProperty('--ft-left-offset', '0px');
              }

              wrapperElement.appendChild(nodeElement);
              hierarchyElement.appendChild(wrapperElement);
              if (this.children && this.children.length && this.children[0].length) {
                orgChart.buildInferiorNodes(wrapperElement, nodeElement, this, level);
              }
            }
          });
        });
      } else {
        if (Object.keys(data).length > 2) { // TODO: 应该用更好的方式来判断是否是供父一级节点创建的信息
          nodeElement = this.createNode(data);
          hierarchyElement.appendChild(nodeElement);
        }
        if (data.children && data.children.length) {
          this.buildInferiorNodes(hierarchyElement, nodeElement || null, data, level);
        }
      }
    },
    // build the child nodes of specific node
    buildChildNode: function (appendToEl, data) {
      const parentHierarchyEl = appendToEl;

      this.buildHierarchy(parentHierarchyEl, { 'children': data });
    },
    // exposed method
    addChildren: function (nodeEl, data) {
      const nodeElement = getElement(nodeEl);
      let titleElement;
      let bottomEdgeElement;

      if (!nodeElement) {
        return;
      }

      this.buildChildNode(nodeElement.closest('.hierarchy'), data);
      if (!nodeElement.querySelector('.parentNodeSymbol')) {
        titleElement = Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('title');
        }) || null;
        if (titleElement) {
          titleElement.insertAdjacentHTML('afterbegin', `<i class="${this.options.icons.theme} ${this.options.icons.parentNode} parentNodeSymbol"></i>`);
        }
      }
      if (nodeElement.closest('.nodes.vertical')) {
        if (!nodeElement.querySelector(':scope > .toggleBtn')) {
          nodeElement.insertAdjacentHTML('beforeend', `<i class="toggleBtn ${this.options.icons.theme}"></i>`);
        }
      } else if (!nodeElement.querySelector(':scope > .bottomEdge')) {
        nodeElement.insertAdjacentHTML('beforeend', `<i class="edge verticalEdge bottomEdge ${this.options.icons.theme}"></i>`);
      }
      if (this.isInAction(nodeElement)) {
        bottomEdgeElement = Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('bottomEdge');
        }) || null;
        this.switchVerticalArrow(bottomEdgeElement);
      }
    },
    // build the parent node of specific node
    buildParentNode: function (currentRootEl, data) {
      const currentRootElement = getElement(currentRootEl);
      let currentRootListElement;
      let newRootWrapperElement;
      let newRootHierarchyElement;

      if (!currentRootElement) {
        return;
      }

      data.relationship = data.relationship || '001';
      currentRootListElement = currentRootElement.closest('ul');
      newRootWrapperElement = getDocument().createElement('ul');
      newRootWrapperElement.className = 'nodes';
      newRootHierarchyElement = getDocument().createElement('li');
      newRootHierarchyElement.className = 'hierarchy';
      newRootWrapperElement.appendChild(newRootHierarchyElement);
      newRootHierarchyElement.appendChild(this.createNode(data));
      if (this.chart) {
        this.chart.prepend(newRootWrapperElement);
      }
      if (currentRootListElement) {
        currentRootListElement.classList.add('nodes');
        newRootHierarchyElement.appendChild(currentRootListElement);
      }
    },
    // exposed method
    addParent: function (currentRootEl, data) {
      const currentRootElement = getElement(currentRootEl);
      let titleElement;
      let topEdgeElement;

      if (!currentRootElement) {
        return;
      }

      this.buildParentNode(currentRootElement, data);
      if (!currentRootElement.querySelector(':scope > .topEdge')) {
        titleElement = Array.from(currentRootElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('title');
        }) || null;
        if (titleElement) {
          titleElement.insertAdjacentHTML('afterend', `<i class="edge verticalEdge topEdge ${this.options.icons.theme}"></i>`);
        }
      }
      if (this.isInAction(currentRootElement)) {
        topEdgeElement = Array.from(currentRootElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('topEdge');
        }) || null;
        this.switchVerticalArrow(topEdgeElement);
      }
    },
    // build the sibling nodes of specific node
    buildSiblingNode: function (nodeChartEl, data) {
      const nodeChartElement = getElement(nodeChartEl);
      let nodeChartParentElement;
      let newSiblingCount;
      let existingSiblingCount;
      let siblingCount;
      let insertPosition;
      let ancestorNodesElement;
      let parentHierarchyElement;
      let newSiblingContainerElement;
      let newSiblingHierarchyElements;
      let existingHierarchyElements;
      let newParentHierarchyElement;
      let newParentChildrenContainerElement;
      let insertAnchorElement;
      const removeIfEmpty = function (containerElement) {
        if (containerElement && !containerElement.children.length) {
          containerElement.remove();
        }
      };
      const getHierarchyChildren = function (containerElement) {
        return containerElement
          ? Array.from(containerElement.children).filter(function (childEl) {
              return childEl.classList && childEl.classList.contains('hierarchy');
            })
          : [];
      };
      const getLastNodesChild = function (containerElement) {
        let childElement;

        if (!containerElement) {
          return null;
        }

        childElement = containerElement.lastElementChild;
        while (childElement) {
          if (childElement.classList && childElement.classList.contains('nodes')) {
            return childElement;
          }
          childElement = childElement.previousElementSibling;
        }

        return null;
      };

      if (!nodeChartElement) {
        return;
      }

      nodeChartParentElement = nodeChartElement.parentElement;
      newSiblingCount = Array.isArray(data) ? data.length : data.children.length;
      existingSiblingCount = nodeChartParentElement && nodeChartParentElement.classList && nodeChartParentElement.classList.contains('nodes')
        ? getHierarchyChildren(nodeChartParentElement).length
        : 1;
      siblingCount = existingSiblingCount + newSiblingCount;
      insertPosition = (siblingCount > 1) ? Math.floor(siblingCount / 2 - 1) : 0;
      // just build the sibling nodes for the specific node
      ancestorNodesElement = nodeChartElement.closest('.nodes');
      if (ancestorNodesElement && ancestorNodesElement.parentElement && ancestorNodesElement.parentElement.classList && ancestorNodesElement.parentElement.classList.contains('hierarchy')) {
        parentHierarchyElement = nodeChartParentElement ? nodeChartParentElement.closest('.hierarchy') : null;
        this.buildChildNode(parentHierarchyElement, data);
        newSiblingContainerElement = getLastNodesChild(parentHierarchyElement);
        newSiblingHierarchyElements = getHierarchyChildren(newSiblingContainerElement);
        if (existingSiblingCount > 1) {
          existingHierarchyElements = getHierarchyChildren(nodeChartParentElement);
          existingHierarchyElements.forEach(function (existingSiblingEl) {
            if (newSiblingHierarchyElements[0] && newSiblingHierarchyElements[0].parentElement) {
              newSiblingHierarchyElements[0].parentElement.insertBefore(existingSiblingEl, newSiblingHierarchyElements[0]);
            }
          });
          removeIfEmpty(nodeChartParentElement);
        } else {
          insertAnchorElement = newSiblingHierarchyElements[insertPosition] || null;
          if (insertAnchorElement && insertAnchorElement.parentElement) {
            insertAnchorElement.parentElement.insertBefore(nodeChartElement, insertAnchorElement.nextSibling);
          }
          removeIfEmpty(nodeChartParentElement);
        }
      } else { // build the sibling nodes and parent node for the specific ndoe
        newParentHierarchyElement = getDocument().createElement('li');
        newParentHierarchyElement.className = 'hierarchy';
        if (nodeChartParentElement) {
          nodeChartParentElement.insertBefore(newParentHierarchyElement, nodeChartParentElement.firstChild);
        }
        this.buildHierarchy(newParentHierarchyElement, data);
        newParentChildrenContainerElement = getLastNodesChild(newParentHierarchyElement);
        insertAnchorElement = newParentChildrenContainerElement
          ? getHierarchyChildren(newParentChildrenContainerElement)[insertPosition] || null
          : null;
        if (insertAnchorElement && insertAnchorElement.parentElement) {
          insertAnchorElement.parentElement.insertBefore(nodeChartElement, insertAnchorElement.nextSibling);
        }
      }
    },
    //
    addSiblings: function (nodeEl, data) {
      const nodeElement = getElement(nodeEl);
      let nodesContainerElement;
      let topEdgeElement;

      if (!nodeElement) {
        return;
      }

      this.buildSiblingNode(nodeElement.closest('.hierarchy'), data);
      nodesContainerElement = nodeElement.closest('.nodes');
      if (nodesContainerElement) {
        setState(nodesContainerElement, 'siblingsLoaded', true);
      }
      if (!Array.from(nodeElement.children || []).some(function (childEl) {
        return childEl.classList && childEl.classList.contains('leftEdge');
      })) {
        topEdgeElement = Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('topEdge');
        }) || null;
        if (topEdgeElement) {
          topEdgeElement.insertAdjacentHTML('afterend', `<i class="edge horizontalEdge rightEdge ${this.options.icons.theme}"></i><i class="edge horizontalEdge leftEdge ${this.options.icons.theme}"></i>`);
        }
      }
      if (this.isInAction(nodeElement)) {
        this.switchHorizontalArrow(nodeElement);
        topEdgeElement = Array.from(nodeElement.children || []).find(function (childEl) {
          return childEl.classList && childEl.classList.contains('topEdge');
        }) || null;
        if (topEdgeElement && topEdgeElement.classList) {
          topEdgeElement.classList.remove(this.options.icons.expandToUp);
          topEdgeElement.classList.add(this.options.icons.collapseToDown);
        }
      }
    },
    // remove node and its descendent nodes
    removeNodes: function (nodeEl) {
      const nodeElement = getElement(nodeEl);
      let hierarchyElement;
      let wrapperElement;
      let remainingNodeElement;
      let parentNodeElement;

      if (!nodeElement) {
        return;
      }

      hierarchyElement = nodeElement.closest('.hierarchy');
      wrapperElement = hierarchyElement ? hierarchyElement.parentElement : null;

      if (!wrapperElement) {
        return;
      }

      if (wrapperElement.parentElement && wrapperElement.parentElement.classList && wrapperElement.parentElement.classList.contains('hierarchy')) {
        if (this.getNodeState(nodeElement, 'siblings').exist) {
          hierarchyElement.remove();
          if (wrapperElement.children.length === 1) {
            remainingNodeElement = wrapperElement.querySelector('.node');
            if (remainingNodeElement) {
              Array.from(remainingNodeElement.querySelectorAll('.horizontalEdge')).forEach(function (edgeEl) {
                edgeEl.remove();
              });
            }
          }
        } else {
          parentNodeElement = wrapperElement.parentElement.querySelector(':scope > .node');
          if (parentNodeElement) {
            Array.from(parentNodeElement.querySelectorAll('.bottomEdge, .parentNodeSymbol')).forEach(function (edgeEl) {
              edgeEl.remove();
            });
          }
          wrapperElement.remove();
        }
      } else { // if $node is root node
        const chartElement = wrapperElement.closest('.orgchart');
        if (chartElement) {
          chartElement.remove();
        }
      }
    },
    //
    hideDropZones: function () {
      const chartElement = this.chart;

      if (!chartElement) {
        return;
      }

      // Remove all the 'this is a drop zone' indicators
      Array.from(chartElement.querySelectorAll('.allowedDrop')).forEach(function (node) {
        node.classList.remove('allowedDrop');
      });
    },
    //
    showDropZones: function (draggedEl) {
      // Highlight all the 'drop zones', and set dragged, so that the drop/enter can work out what happens later
      // TODO: This assumes all nodes are droppable: it doesn't run the custom isDroppable function - it should!
      const draggedNodeEl = getElement(draggedEl);
      const chartElement = this.chart;

      if (!chartElement) {
        return;
      }

      Array.from(chartElement.querySelectorAll('.node')).forEach(function (node) {
        node.classList.add('allowedDrop');
      });
      setState(chartElement, 'dragged', draggedNodeEl);
    },
    //
    processExternalDrop: function (dropTargetEl, draggedEl) {
      const dropZoneEl = getElement(dropTargetEl);
      const droppedOnNodeEl = dropZoneEl && typeof dropZoneEl.closest === 'function'
        ? dropZoneEl.closest('.node')
        : null;
      let draggedNodeEl;
      const chartElement = this.chart;

      // Allow an external drop event to be handled by one of our nodes
      if (draggedEl && chartElement) {
        draggedNodeEl = getElement(draggedEl);
        setState(chartElement, 'dragged', draggedNodeEl);
      }
      if (!droppedOnNodeEl) {
        return;
      }
      // would like to just call 'dropZoneHandler', but I can't reach it from here
      // instead raise a drop event on the node element
      droppedOnNodeEl.dispatchEvent(createTriggeredEvent('drop'));
    },
    //
    exportPDF: function(canvas, exportFilename){
      let doc = {};
      const docWidth = Math.floor(canvas.width);
      const docHeight = Math.floor(canvas.height);
      if (!getWindow().jsPDF) {
        getWindow().jsPDF = getWindow().jspdf.jsPDF;
      }

      if (docWidth > docHeight) {
        doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [docWidth, docHeight]
        });
      } else {
        doc = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [docHeight, docWidth]
        });
      }
      doc.addImage(canvas.toDataURL(), 'png', 0, 0);
      doc.save(exportFilename + '.pdf');
    },
    //
    exportPNG: function(canvas, exportFilename){
      const isWebkit = 'WebkitAppearance' in getDocument().documentElement.style;
      const isFf = !!getWindow().sidebar;
      const navigatorObject = getWindow().navigator;
      const isEdge = navigatorObject.appName === 'Microsoft Internet Explorer' || (navigatorObject.appName === 'Netscape' && navigatorObject.appVersion.indexOf('Edge') > -1);
      const chartContainerElement = this.chartContainer;
      let downloadButtonClassName;
      let downloadSelector;
      let downloadAnchorElement;

      if (!chartContainerElement) {
        return;
      }

      if ((!isWebkit && !isFf) || isEdge) {
        getWindow().navigator.msSaveBlob(canvas.msToBlob(), exportFilename + '.png');
      } else {
        downloadButtonClassName = 'download-btn' + (this.options.chartClass !== '' ? ' ' + this.options.chartClass : '');
        downloadSelector = '.download-btn' + (this.options.chartClass !== '' ? '.' + this.options.chartClass : '');
        downloadAnchorElement = chartContainerElement.querySelector(downloadSelector);

        if (!downloadAnchorElement) {
          downloadAnchorElement = getDocument().createElement('a');
          downloadAnchorElement.className = downloadButtonClassName;
          chartContainerElement.appendChild(downloadAnchorElement);
        }

        downloadAnchorElement.setAttribute('download', exportFilename + '.png');
        downloadAnchorElement.setAttribute('href', canvas.toDataURL());
        downloadAnchorElement.click();
      }
    },
    //
    export: function (exportFilename, exportFileextension) {
      const orgChart = this;
      const chartContainerElement = this.chartContainer;
      let maskElement;
      let sourceChartElement;
      let isHorizontalDirection;

      exportFilename = (typeof exportFilename !== 'undefined') ?  exportFilename : this.options.exportFilename;
      exportFileextension = (typeof exportFileextension !== 'undefined') ?  exportFileextension : this.options.exportFileextension;
      if (chartContainerElement && chartContainerElement.querySelector('.spinner')) {
        return false;
      }

      if (!chartContainerElement) {
        return false;
      }

      maskElement = chartContainerElement.querySelector('.mask');
      if (!maskElement) {
        maskElement = getDocument().createElement('div');
        maskElement.className = 'mask';
        maskElement.insertAdjacentHTML('beforeend', `<i class="${this.options.icons.theme} ${this.options.icons.spinner} spinner"></i>`);
        chartContainerElement.appendChild(maskElement);
      } else {
        maskElement.classList.remove('hidden');
      }
      chartContainerElement.classList.add('canvasContainer');
      sourceChartElement = Array.from(chartContainerElement.querySelectorAll('.orgchart')).find(function (chartEl) {
        return !chartEl.classList.contains('hidden');
      }) || null;
      isHorizontalDirection = orgChart.options.direction === 'l2r' || orgChart.options.direction === 'r2l';
      html2canvas(sourceChartElement, {
        'width': isHorizontalDirection ? sourceChartElement.clientHeight : sourceChartElement.clientWidth,
        'height': isHorizontalDirection ? sourceChartElement.clientWidth : sourceChartElement.clientHeight,
        'onclone': function (cloneDoc) {
          const clonedContainerElement = cloneDoc.querySelector('.canvasContainer');
          let clonedChartElement;

          if (!clonedContainerElement) {
            return;
          }

          clonedContainerElement.style.overflow = 'visible';
          clonedChartElement = Array.from(clonedContainerElement.querySelectorAll('.orgchart')).find(function (chartEl) {
            return !chartEl.classList.contains('hidden');
          }) || null;
          if (clonedChartElement) {
            clonedChartElement.style.transform = '';
          }
        }
      })
      .then(function (canvas) {
        if (maskElement) {
          maskElement.classList.add('hidden');
        }

        if (exportFileextension.toLowerCase() === 'pdf') {
          orgChart.exportPDF(canvas, exportFilename);
        } else {
          orgChart.exportPNG(canvas, exportFilename);
        }

        chartContainerElement.classList.remove('canvasContainer');
      }, function () {
        chartContainerElement.classList.remove('canvasContainer');
      });
    }
  };

  return OrgChart;
}));
