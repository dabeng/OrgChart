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
  const eventStore = new WeakMap();
  const getWindow = () => (typeof globalThis !== 'undefined' && globalThis.window ? globalThis.window : window);
  const getDocument = () => {
    const currentWindow = getWindow();
    return currentWindow && currentWindow.document
      ? currentWindow.document
      : (typeof globalThis !== 'undefined' && globalThis.document ? globalThis.document : document);
  };

  const isCollection = (value) => value instanceof $;
  const isElement = (value) => value && (value.nodeType === 1 || value.nodeType === 9 || value === getWindow());
  const isNode = (value) => value && typeof value.nodeType === 'number';
  const isNodeList = (value) => value && typeof value.length === 'number' && typeof value !== 'string' && !isNode(value);
  const isHtmlString = (value) => typeof value === 'string' && value.trim().startsWith('<') && value.trim().endsWith('>');
  const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
  const unique = (elements) => Array.from(new Set(elements.filter(Boolean)));
  const splitClasses = (value) => String(value || '').trim().split(/\s+/).filter(Boolean);
  const toCollection = (value) => (isCollection(value) ? value : $(value));

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

  function getStoredData(element) {
    if (!elementDataStore.has(element)) {
      elementDataStore.set(element, {});
    }
    return elementDataStore.get(element);
  }

  function setData(element, key, value) {
    const store = getStoredData(element);
    store[toDataKey(key)] = value;
  }

  function getData(element, key) {
    const store = getStoredData(element);
    const normalizedKey = toDataKey(key);
    if (Object.prototype.hasOwnProperty.call(store, normalizedKey)) {
      return store[normalizedKey];
    }
    if (element.dataset && Object.prototype.hasOwnProperty.call(element.dataset, normalizedKey)) {
      return element.dataset[normalizedKey];
    }
    return undefined;
  }

  function getAllData(element) {
    const store = Object.assign({}, getStoredData(element));
    if (element.dataset) {
      Object.keys(element.dataset).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(store, key)) {
          store[key] = element.dataset[key];
        }
      });
    }
    return store;
  }

  function normalizeInput(input, context) {
    if (input === null || input === undefined) {
      return [];
    }
    if (isCollection(input)) {
      return Array.from(input);
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

  function applyAttributes(element, attrs) {
    if (!attrs || !element || element.nodeType !== 1) {
      return;
    }
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      if (key === 'class') {
        element.className = value;
      } else if (key === 'text') {
        element.textContent = value;
      } else if (key === 'html') {
        element.innerHTML = value;
      } else if (key === 'data' && isPlainObject(value)) {
        Object.keys(value).forEach((dataKey) => setData(element, dataKey, value[dataKey]));
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2), value);
      } else if (typeof value === 'function' && key === 'click') {
        element.addEventListener('click', value);
      } else if (value !== undefined && value !== null) {
        element.setAttribute(key, value);
      }
    });
  }

  function toNodeArray(content) {
    if (content instanceof DocumentFragment) {
      return Array.from(content.childNodes);
    }
    if (isCollection(content)) {
      return Array.from(content);
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

  function getEventEntries(element) {
    if (!eventStore.has(element)) {
      eventStore.set(element, []);
    }
    return eventStore.get(element);
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

  class DollarCollection extends Array {
    constructor(elements = [], prevObject = null) {
      if (typeof elements === 'number') {
        super(elements);
      } else {
        super(...elements);
      }
      this.prevObject = prevObject;
    }

    static get [Symbol.species]() {
      return Array;
    }

    pushStack(elements) {
      return new DollarCollection(unique(elements), this);
    }

    each(callback) {
      this.forEach((element, index) => {
        callback.call(element, index, element);
      });
      return this;
    }

    get(index) {
      if (index === undefined) {
        return Array.from(this);
      }
      return index < 0 ? this[this.length + index] : this[index];
    }

    toArray() {
      return Array.from(this);
    }

    eq(index) {
      const element = this.get(index);
      return this.pushStack(element ? [element] : []);
    }

    slice(begin, end) {
      return this.pushStack(Array.prototype.slice.call(this, begin, end));
    }

    add(other) {
      return this.pushStack(unique([...this, ...normalizeInput(other)]));
    }

    addBack() {
      return this.add(this.prevObject || []);
    }

    end() {
      return this.prevObject || $([]);
    }

    find(selector) {
      return this.pushStack(unique(this.flatMap((element) => {
        if (!element || (element.nodeType !== 1 && element.nodeType !== 9)) {
          return [];
        }
        const parsed = parseSelector(selector);
        return filterBySelector(Array.from(element.querySelectorAll(parsed.selector)), selector);
      })));
    }

    filter(selectorOrCallback) {
      if (typeof selectorOrCallback === 'function') {
        return this.pushStack(Array.prototype.filter.call(this, (element, index) => selectorOrCallback.call(element, index, element)));
      }
      return this.pushStack(filterBySelector(Array.from(this), selectorOrCallback));
    }

    not(selectorOrCallback) {
      if (typeof selectorOrCallback === 'function') {
        return this.pushStack(Array.prototype.filter.call(this, (element, index) => !selectorOrCallback.call(element, index, element)));
      }
      const excluded = new Set(filterBySelector(Array.from(this), selectorOrCallback));
      return this.pushStack(Array.prototype.filter.call(this, (element) => !excluded.has(element)));
    }

    is(selector) {
      return this.length > 0 && filterBySelector([this[0]], selector).length > 0;
    }

    parent(selector) {
      const parents = unique(this.map((element) => element && element.parentElement).filter(Boolean));
      return this.pushStack(selector ? filterBySelector(parents, selector) : parents);
    }

    children(selector) {
      const children = unique(this.flatMap((element) => element ? Array.from(element.children || []) : []));
      return this.pushStack(selector ? filterBySelector(children, selector) : children);
    }

    contents() {
      return this.pushStack(unique(this.flatMap((element) => element ? Array.from(element.childNodes || []) : [])));
    }

    siblings(selector) {
      const siblings = unique(this.flatMap((element) => {
        if (!element || !element.parentElement) {
          return [];
        }
        return Array.from(element.parentElement.children).filter((child) => child !== element);
      }));
      return this.pushStack(selector ? filterBySelector(siblings, selector) : siblings);
    }

    prev(selector) {
      const prev = unique(this.map((element) => element && element.previousElementSibling).filter(Boolean));
      return this.pushStack(selector ? filterBySelector(prev, selector) : prev);
    }

    next(selector) {
      const next = unique(this.map((element) => element && element.nextElementSibling).filter(Boolean));
      return this.pushStack(selector ? filterBySelector(next, selector) : next);
    }

    prevAll(selector) {
      const prevAll = unique(this.flatMap((element) => {
        const result = [];
        let current = element ? element.previousElementSibling : null;
        while (current) {
          result.push(current);
          current = current.previousElementSibling;
        }
        return result;
      }));
      return this.pushStack(selector ? filterBySelector(prevAll, selector) : prevAll);
    }

    nextAll(selector) {
      const nextAll = unique(this.flatMap((element) => {
        const result = [];
        let current = element ? element.nextElementSibling : null;
        while (current) {
          result.push(current);
          current = current.nextElementSibling;
        }
        return result;
      }));
      return this.pushStack(selector ? filterBySelector(nextAll, selector) : nextAll);
    }

    closest(selector) {
      return this.pushStack(unique(this.map((element) => {
        if (!element || typeof element.closest !== 'function') {
          return null;
        }
        return element.closest(selector);
      }).filter(Boolean)));
    }

    parents(selector) {
      const parents = unique(this.flatMap((element) => {
        const result = [];
        let current = element ? element.parentElement : null;
        while (current) {
          result.push(current);
          current = current.parentElement;
        }
        return result;
      }));
      return this.pushStack(selector ? filterBySelector(parents, selector) : parents);
    }

    parentsUntil(stopSelector, filterSelector) {
      const parents = unique(this.flatMap((element) => {
        const result = [];
        let current = element ? element.parentElement : null;
        while (current && !matchesSelector(current, stopSelector)) {
          result.push(current);
          current = current.parentElement;
        }
        return result;
      }));
      return this.pushStack(filterSelector ? filterBySelector(parents, filterSelector) : parents);
    }

    append(content) {
      const nodes = toNodeArray(content);
      this.forEach((element, index) => {
        cloneNodesForTarget(nodes, index < this.length - 1).forEach((node) => element.appendChild(node));
      });
      return this;
    }

    prepend(content) {
      const nodes = toNodeArray(content);
      this.forEach((element, index) => {
        const reference = element.firstChild;
        cloneNodesForTarget(nodes, index < this.length - 1).forEach((node) => element.insertBefore(node, reference));
      });
      return this;
    }

    before(content) {
      const nodes = toNodeArray(content);
      this.forEach((element, index) => {
        if (!element || !element.parentNode) {
          return;
        }
        cloneNodesForTarget(nodes, index < this.length - 1).forEach((node) => element.parentNode.insertBefore(node, element));
      });
      return this;
    }

    after(content) {
      const nodes = toNodeArray(content);
      this.forEach((element, index) => {
        if (!element || !element.parentNode) {
          return;
        }
        const reference = element.nextSibling;
        cloneNodesForTarget(nodes, index < this.length - 1).forEach((node) => element.parentNode.insertBefore(node, reference));
      });
      return this;
    }

    appendTo(target) {
      $(target).append(this);
      return this;
    }

    remove() {
      this.forEach((element) => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      return this;
    }

    empty() {
      this.forEach((element) => {
        if (element) {
          element.innerHTML = '';
        }
      });
      return this;
    }

    wrapAll(html) {
      if (!this.length) {
        return this;
      }
      const wrapper = toNodeArray(html)[0];
      if (!wrapper) {
        return this;
      }
      const first = this[0];
      first.parentNode.insertBefore(wrapper, first);
      let deepest = wrapper;
      while (deepest.firstElementChild) {
        deepest = deepest.firstElementChild;
      }
      this.forEach((element) => deepest.appendChild(element));
      return this;
    }

    unwrap() {
      unique(this.map((element) => element && element.parentElement).filter(Boolean)).forEach((parent) => {
        while (parent.firstChild) {
          parent.parentNode.insertBefore(parent.firstChild, parent);
        }
        parent.parentNode.removeChild(parent);
      });
      return this;
    }

    attr(name, value) {
      if (typeof name === 'object') {
        this.forEach((element) => applyAttributes(element, name));
        return this;
      }
      if (value === undefined) {
        return this[0] && this[0].nodeType === 1 ? this[0].getAttribute(name) : undefined;
      }
      this.forEach((element) => {
        if (element && element.nodeType === 1) {
          element.setAttribute(name, value);
        }
      });
      return this;
    }

    removeAttr(name) {
      this.forEach((element) => {
        if (element && element.nodeType === 1) {
          element.removeAttribute(name);
        }
      });
      return this;
    }

    prop(name, value) {
      if (value === undefined) {
        return this[0] ? this[0][name] : undefined;
      }
      this.forEach((element) => {
        if (element) {
          element[name] = value;
        }
      });
      return this;
    }

    data(name, value) {
      if (name === undefined) {
        return this[0] ? getAllData(this[0]) : undefined;
      }
      if (isPlainObject(name)) {
        this.forEach((element) => {
          Object.keys(name).forEach((key) => setData(element, key, name[key]));
        });
        return this;
      }
      if (value === undefined) {
        return this[0] ? getData(this[0], name) : undefined;
      }
      this.forEach((element) => setData(element, name, value));
      return this;
    }

    css(name, value) {
      if (typeof name === 'object') {
        this.forEach((element) => {
          Object.keys(name).forEach((key) => {
            element.style[key] = name[key];
          });
        });
        return this;
      }
      if (value === undefined) {
        return this[0] ? getWindow().getComputedStyle(this[0])[name] : undefined;
      }
      this.forEach((element) => {
        element.style[name] = value;
      });
      return this;
    }

    text(value) {
      if (value === undefined) {
        return this.map((element) => element.textContent).join('');
      }
      this.forEach((element) => {
        element.textContent = value;
      });
      return this;
    }

    html(value) {
      if (value === undefined) {
        return this[0] ? this[0].innerHTML : undefined;
      }
      this.forEach((element) => {
        element.innerHTML = value;
      });
      return this;
    }

    addClass(classNames) {
      this.forEach((element, index) => {
        if (element && element.classList) {
          const names = splitClasses(typeof classNames === 'function'
            ? classNames.call(element, index, element.className)
            : classNames);
          element.classList.add(...names);
        }
      });
      return this;
    }

    removeClass(classNames) {
      const names = splitClasses(classNames);
      this.forEach((element) => {
        if (!element || !element.classList) {
          return;
        }
        if (names.length) {
          element.classList.remove(...names);
        } else {
          element.className = '';
        }
      });
      return this;
    }

    toggleClass(classNames, force) {
      const names = splitClasses(classNames);
      this.forEach((element) => {
        if (!element || !element.classList) {
          return;
        }
        names.forEach((name) => element.classList.toggle(name, force));
      });
      return this;
    }

    hasClass(className) {
      return this.length > 0 && this[0].classList.contains(className);
    }

    index(element) {
      if (element === undefined) {
        if (!this[0] || !this[0].parentElement) {
          return -1;
        }
        return Array.from(this[0].parentElement.children).indexOf(this[0]);
      }
      const target = isCollection(element) ? element[0] : element;
      return Array.from(this).indexOf(target);
    }

    outerWidth(includeMargin) {
      if (!this[0]) {
        return 0;
      }
      const rect = this[0].getBoundingClientRect();
      if (!includeMargin) {
        return rect.width;
      }
      const style = getWindow().getComputedStyle(this[0]);
      return rect.width + Number.parseFloat(style.marginLeft) + Number.parseFloat(style.marginRight);
    }

    outerHeight(includeMargin) {
      if (!this[0]) {
        return 0;
      }
      const rect = this[0].getBoundingClientRect();
      if (!includeMargin) {
        return rect.height;
      }
      const style = getWindow().getComputedStyle(this[0]);
      return rect.height + Number.parseFloat(style.marginTop) + Number.parseFloat(style.marginBottom);
    }

    on(events, selectorOrData, dataOrHandler, handler) {
      const types = String(events).trim().split(/\s+/);
      let selector = null;
      let data = null;
      let listener = handler;
      if (typeof selectorOrData === 'string') {
        selector = selectorOrData;
        listener = dataOrHandler;
      } else if (typeof selectorOrData === 'function') {
        listener = selectorOrData;
      } else {
        data = selectorOrData;
        listener = dataOrHandler;
      }
      this.forEach((element) => {
        const entries = getEventEntries(element);
        types.forEach((type) => {
          const wrappedHandler = (nativeEvent) => {
            if (selector) {
              const matchedTarget = nativeEvent.target && nativeEvent.target.closest(selector);
              if (!matchedTarget || !element.contains(matchedTarget)) {
                return;
              }
            }
            nativeEvent.delegateTarget = element;
            nativeEvent.data = data;
            nativeEvent.originalEvent = nativeEvent.originalEvent || nativeEvent;
            return listener.call(element, nativeEvent);
          };
          entries.push({ type, listener, wrappedHandler, selector });
          element.addEventListener(type, wrappedHandler);
        });
      });
      return this;
    }

    one(events, selectorOrData, dataOrHandler, handler) {
      const types = String(events).trim().split(/\s+/);
      let selector = null;
      let data = null;
      let listener = handler;
      if (typeof selectorOrData === 'string') {
        selector = selectorOrData;
        listener = dataOrHandler;
      } else if (typeof selectorOrData === 'function') {
        listener = selectorOrData;
      } else {
        data = selectorOrData;
        listener = dataOrHandler;
      }
      this.forEach((element) => {
        const entries = getEventEntries(element);
        types.forEach((type) => {
          const wrappedHandler = (nativeEvent) => {
            if (selector) {
              const matchedTarget = nativeEvent.target && nativeEvent.target.closest(selector);
              if (!matchedTarget || !element.contains(matchedTarget)) {
                return;
              }
            }
            nativeEvent.delegateTarget = element;
            nativeEvent.data = data;
            nativeEvent.originalEvent = nativeEvent.originalEvent || nativeEvent;
            element.removeEventListener(type, wrappedHandler);
            const registry = getEventEntries(element);
            const index = registry.findIndex((entry) => entry.type === type && entry.wrappedHandler === wrappedHandler);
            if (index > -1) {
              registry.splice(index, 1);
            }
            return listener.call(element, nativeEvent);
          };
          entries.push({ type, listener, wrappedHandler, selector });
          element.addEventListener(type, wrappedHandler);
        });
      });
      return this;
    }

    off(events, listener) {
      const types = events ? String(events).trim().split(/\s+/) : [];
      this.forEach((element) => {
        const entries = getEventEntries(element);
        for (let index = entries.length - 1; index >= 0; index -= 1) {
          const entry = entries[index];
          const matchesType = !types.length || types.includes(entry.type);
          const matchesListener = !listener || entry.listener === listener;
          if (matchesType && matchesListener) {
            element.removeEventListener(entry.type, entry.wrappedHandler);
            entries.splice(index, 1);
          }
        }
      });
      return this;
    }

    trigger(eventLike, extraData) {
      this.forEach((element) => {
        const triggeredEvent = createTriggeredEvent(eventLike, extraData);
        triggeredEvent.delegateTarget = element;
        element.dispatchEvent(triggeredEvent);
        if (eventLike && typeof eventLike === 'object') {
          eventLike.defaultPrevented = triggeredEvent.defaultPrevented;
        }
      });
      return this;
    }

    triggerHandler(eventLike, extraData) {
      this.forEach((element) => {
        const type = typeof eventLike === 'string' ? eventLike : eventLike.type;
        const registry = getEventEntries(element).filter((entry) => entry.type === type);
        registry.forEach((entry) => {
          const eventObject = typeof eventLike === 'string' ? { type } : eventLike;
          eventObject.delegateTarget = element;
          eventObject.originalEvent = eventObject.originalEvent || eventObject;
          eventObject.data = extraData;
          entry.listener.call(element, eventObject);
        });
      });
      return this;
    }
  }

  function $(input, attrs) {
    const elements = normalizeInput(input, getDocument());
    const collection = new DollarCollection(elements);
    if (attrs && elements[0] && isHtmlString(input)) {
      applyAttributes(elements[0], attrs);
    }
    return collection;
  }

  $.prototype = DollarCollection.prototype;
  $.extend = function () {
    return Object.assign.apply(Object, [{}].concat(Array.from(arguments)));
  };
  $.each = function (collection, callback) {
    if (Array.isArray(collection) || isNodeList(collection) || isCollection(collection)) {
      for (let index = 0; index < collection.length; index += 1) {
        if (callback.call(collection[index], index, collection[index]) === false) {
          break;
        }
      }
      return collection;
    }
    Object.keys(collection || {}).some((key) => callback.call(collection[key], key, collection[key]) === false);
    return collection;
  };
  $.isArray = Array.isArray;
  $.Event = function (type) {
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
  };

  var OrgChart = function (elem, opts) {
    if (!(this instanceof OrgChart)) {
      return new OrgChart(elem, opts);
    }
    if (isPlainObject(elem) && !opts) {
      this.opts = elem;
      this.$chartContainer = $(elem.chartContainer || elem.container);
    } else {
      this.$chartContainer = $(elem);
      this.opts = opts || {};
    }
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
    if (this.$chartContainer.length) {
      this.init();
    }
  };
  //
  OrgChart.prototype = {
    //
    init: function (opts) {
      var that = this;
      this.options = $.extend({}, this.defaultOptions, this.opts, opts);
      // build the org-chart
      var $chartContainer = this.$chartContainer;
      if (this.$chart) {
        this.$chart.remove();
      }
      var data = this.options.data;
      var $chart = this.$chart = $('<div>', {
        'data': { 'options': this.options },
        'class': 'orgchart' + (this.options.chartClass !== '' ? ' ' + this.options.chartClass : '') + (this.options.direction !== 't2b' ? ' ' + this.options.direction : ''),
        'click': function(event) {
          if (!$(event.target).closest('.node').length) {
            $chart.find('.node.focused').removeClass('focused');
          }
        }
      });
      if (typeof getWindow().MutationObserver !== 'undefined') {
        this.triggerInitEvent();
      }
      var isCollectionData = isCollection(data);
      var $root = (!isCollectionData && Array.isArray(data))
        ? $chart.append($('<ul class="nodes"></ul>')).find('.nodes')
        : $chart.append($('<ul class="nodes"><li class="hierarchy"></li></ul>')).find('.hierarchy');

        if (isCollectionData) { // ul datasource
          this.buildHierarchy($root, this.buildJsonDS(data.children()), 0, this.options);
        } else { // local json datasource
          if (data.relationship) {
            this.buildHierarchy($root, data);
          } else {
            this.buildHierarchy($root, Array.isArray(data) ? data : this.attachRel(data, '00'));
          }
        }

      $chartContainer.append($chart);

      // append the export button
      if (this.options.exportButton && !$('.oc-export-btn').length) {
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
      if (!this.$chart || !this.$chart.length) {
        return;
      }
      // caculate the compact nodes' level which is used to add different styles
      this.$chart.find('.node.compact')
        .each((index, node) => {
          $(node).addClass($(node).parents('.compact').length % 2 === 0 ? 'even' : 'odd');
        }); // the following code snippets is used to add direction arrows for the most top compact node, however the styles is not adjusted correctly
        // .filter((index, node) => !$(node).parent().is('.compact'))
        // .each((index, node) => {
        //   $(node).append(`<i class="edge verticalEdge topEdge ${this.options.icons.theme}"></i>`);
        //   if (this.getSiblings($(node)).length) {
        //     $(node).append(`<i class="edge horizontalEdge rightEdge ${this.options.icons.theme}"></i><i class="edge horizontalEdge leftEdge ${this.options.icons.theme}"></i>`);
        //   }
        // });
    },
    //
    triggerInitEvent: function () {
      var that = this;
      var MutationObserverCtor = getWindow().MutationObserver;
      var mo = new MutationObserverCtor(function (mutations) {
        mo.disconnect();
        initTime:
        for (var i = 0; i < mutations.length; i++) {
          for (var j = 0; j < mutations[i].addedNodes.length; j++) {
            if (mutations[i].addedNodes[j].classList && mutations[i].addedNodes[j].classList.contains('orgchart')) {
              that.handleCompactNodes();
              if (!that.$chart || !that.$chart.length) {
                break initTime;
              }
              if (that.options.initCompleted && typeof that.options.initCompleted === 'function') {
                that.options.initCompleted(that.$chart[0]);
              }
              var initEvent = $.Event('init.orgchart');
              that.$chart.trigger(initEvent);
              break initTime;
            }
          }
        }
      });
      mo.observe(this.$chartContainer[0], { childList: true });
    },
    triggerShowEvent: function ($target, rel) {
      var initEvent = $.Event('show-' + rel + '.orgchart');
      $target.trigger(initEvent);
    },
    triggerHideEvent: function ($target, rel) {
      var initEvent = $.Event('hide-' + rel + '.orgchart');
      $target.trigger(initEvent);
    },
    // add export button for orgchart
    attachExportButton: function () {
      var that = this;
      var $exportBtn = $('<button>', {
        'class': 'oc-export-btn',
        'text': this.options.exportButtonName,
        'click': function(e) {
          e.preventDefault();
          that.export();
        }
      });
      this.$chartContainer.after($exportBtn);
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
      var $chart = $(e.delegateTarget);
      if ($(e.target).closest('.node').length || (e.touches && e.touches.length > 1)) {
        $chart.data('panning', false);
        return;
      } else {
        $chart.css('cursor', 'move').data('panning', true);
      }
      var lastX = 0;
      var lastY = 0;
      var lastTf = $chart.css('transform');
      if (lastTf !== 'none') {
        var temp = lastTf.split(',');
        if (lastTf.indexOf('3d') === -1) {
          lastX = parseInt(temp[4]);
          lastY = parseInt(temp[5]);
        } else {
          lastX = parseInt(temp[12]);
          lastY = parseInt(temp[13]);
        }
      }
      var startX = 0;
      var startY = 0;
      if (!e.targetTouches) { // pand on desktop
        startX = e.pageX - lastX;
        startY = e.pageY - lastY;
      } else if (e.targetTouches.length === 1) { // pan on mobile device
        startX = e.targetTouches[0].pageX - lastX;
        startY = e.targetTouches[0].pageY - lastY;
      } else if (e.targetTouches.length > 1) {
        return;
      }
      $chart.on('mousemove touchmove',function(e) {
        if (!$chart.data('panning')) {
          return;
        }
        var newX = 0;
        var newY = 0;
        if (!e.targetTouches) { // pand on desktop
          newX = e.pageX - startX;
          newY = e.pageY - startY;
        } else if (e.targetTouches.length === 1) { // pan on mobile device
          newX = e.targetTouches[0].pageX - startX;
          newY = e.targetTouches[0].pageY - startY;
        } else if (e.targetTouches.length > 1) {
          return;
        }
        var lastTf = $chart.css('transform');
        if (lastTf === 'none') {
          if (lastTf.indexOf('3d') === -1) {
            $chart.css('transform', 'matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')');
          } else {
            $chart.css('transform', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + newX + ', ' + newY + ', 0, 1)');
          }
        } else {
          var matrix = lastTf.split(',');
          if (lastTf.indexOf('3d') === -1) {
            matrix[4] = ' ' + newX;
            matrix[5] = ' ' + newY + ')';
          } else {
            matrix[12] = ' ' + newX;
            matrix[13] = ' ' + newY;
          }
          $chart.css('transform', matrix.join(','));
        }
      });
    },
    //
    panEndHandler: function (e) {
      if (e.data.chart.data('panning')) {
        e.data.chart.data('panning', false).css('cursor', 'default').off('mousemove');
      }
    },
    //
    bindPan: function () {
      this.$chartContainer.css('overflow', 'hidden');
      this.$chart.on('mousedown touchstart', this.panStartHandler);
      $(getDocument()).on('mouseup touchend', { 'chart': this.$chart }, this.panEndHandler);
    },
    //
    unbindPan: function () {
      this.$chartContainer.css('overflow', 'auto');
      this.$chart.off('mousedown touchstart', this.panStartHandler);
      $(getDocument()).off('mouseup touchend', this.panEndHandler);
    },
    //
    zoomWheelHandler: function (e) {
      var oc = e.data.oc;
      e.preventDefault();
      var newScale  = 1 + (e.originalEvent.deltaY > 0 ? -0.2 : 0.2);
      oc.setChartScale(oc.$chart, newScale);
    },
    //
    zoomStartHandler: function (e) {
      if(e.touches && e.touches.length === 2) {
        var oc = e.data.oc;
        oc.$chart.data('pinching', true);
        var dist = oc.getPinchDist(e);
        oc.$chart.data('pinchDistStart', dist);
      }
    },
    zoomingHandler: function (e) {
      var oc = e.data.oc;
      if(oc.$chart.data('pinching')) {
        var dist = oc.getPinchDist(e);
        oc.$chart.data('pinchDistEnd', dist);
      }
    },
    zoomEndHandler: function (e) {
      var oc = e.data.oc;
      if(oc.$chart.data('pinching')) {
        oc.$chart.data('pinching', false);
        var diff = oc.$chart.data('pinchDistEnd') - oc.$chart.data('pinchDistStart');
        if (diff > 0) {
          oc.setChartScale(oc.$chart, 1.2);
        } else if (diff < 0) {
          oc.setChartScale(oc.$chart, 0.8);
        }
      }
    },
    //
    bindZoom: function () {
      this.$chartContainer.on('wheel', { 'oc': this }, this.zoomWheelHandler);
      this.$chartContainer.on('touchstart', { 'oc': this }, this.zoomStartHandler);
      $(getDocument()).on('touchmove', { 'oc': this }, this.zoomingHandler);
      $(getDocument()).on('touchend', { 'oc': this }, this.zoomEndHandler);
    },
    unbindZoom: function () {
      this.$chartContainer.off('wheel', this.zoomWheelHandler);
      this.$chartContainer.off('touchstart', this.zoomStartHandler);
      $(getDocument()).off('touchmove', this.zoomingHandler);
      $(getDocument()).off('touchend', this.zoomEndHandler);
    },
    //
    getPinchDist: function (e) {
      return Math.sqrt((e.touches[0].clientX - e.touches[1].clientX) * (e.touches[0].clientX - e.touches[1].clientX) +
      (e.touches[0].clientY - e.touches[1].clientY) * (e.touches[0].clientY - e.touches[1].clientY));
    },
    //
    setChartScale: function ($chart, newScale) {
      $chart = toCollection($chart);
      var opts = $chart.data('options');
      var lastTf = $chart.css('transform');
      var matrix = '';
      var targetScale = 1;
      if (lastTf === 'none') {
        $chart.css('transform', 'scale(' + newScale + ',' + newScale + ')');
      } else {
        matrix = lastTf.split(',');
        if (lastTf.indexOf('3d') === -1) {
          targetScale = Math.abs(getWindow().parseFloat(matrix[3]) * newScale);
          if (targetScale > opts.zoomoutLimit && targetScale < opts.zoominLimit) {
            $chart.css('transform', lastTf + ' scale(' + newScale + ',' + newScale + ')');
          }
        } else {
          targetScale = Math.abs(getWindow().parseFloat(matrix[1]) * newScale);
          if (targetScale > opts.zoomoutLimit && targetScale < opts.zoominLimit) {
            $chart.css('transform', lastTf + ' scale3d(' + newScale + ',' + newScale + ', 1)');
          }
        }
      }
    },
    //
    buildJsonDS: function ($li) {
      $li = toCollection($li);
      var that = this;
      var subObj = {
        'name': $li.contents().eq(0).text().trim(),
        'relationship': ($li.parent().parent().is('li') ? '1': '0') + ($li.siblings('li').length ? 1: 0) + ($li.children('ul').length ? 1 : 0)
      };
      $.each($li.data(), function(key, value) {
         subObj[key] = value;
      });
      $li.children('ul').children().each(function() {
        if (!subObj.children) { subObj.children = []; }
        subObj.children.push(that.buildJsonDS($(this)));
      });
      return subObj;
    },
    // process datasource and add necessary information
    attachRel: function (data, flags) {
      var that = this;
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
          that.attachRel(item, '1' + (data.children.length > 1 ? 1 : 0));
        });
      }
      return data;
    },
    //
    loopChart: function ($chart, includeNodeData) {
      $chart = toCollection($chart);
      includeNodeData = (includeNodeData !== null && includeNodeData !== undefined) ? includeNodeData : false;
      var that = this;
      var $node = $chart.find('.node:first');
      var subObj = { 'id': $node[0].id };
      if (includeNodeData) {
        $.each($node.data('nodeData'), function (key, value) {
          subObj[key] = value;
        });
      }
      $node.siblings('.nodes').children().each(function() {
        if (!subObj.children) { subObj.children = []; }
        subObj.children.push(that.loopChart($(this), includeNodeData));
      });
      return subObj;
    },
    //
    getHierarchy: function (includeNodeData) {
      includeNodeData = (includeNodeData !== null && includeNodeData !== undefined) ? includeNodeData : false;
      if (typeof this.$chart === 'undefined') {
        return 'Error: orgchart does not exist'
      } else {
        if (!this.$chart.find('.node').length) {
          return 'Error: nodes do not exist'
        } else {
          var valid = true;
          this.$chart.find('.node').each(function () {
            if (!this.id) {
              valid = false;
              return false;
            }
          });
          if (!valid) {
            return 'Error: All nodes of orghcart to be exported must have data-id attribute!';
          }
        }
      }
      return this.loopChart(this.$chart, includeNodeData);
    },
    // detect the exist/display state of related node
    getNodeState: function ($node, relation) {
      $node = toCollection($node);
      var $target = {};
      var isVerticalNode = !!$node.closest('vertical').length;
      var relation = relation || 'self';
      if (relation === 'parent') {
        if (isVerticalNode) {
          $target = $node.closest('ul').parents('ul');
          if (!$target.length) {
            $target = $node.closest('.nodes');
            if (!$target.length) {
              $target = $node.closest('.vertical').siblings(':first');
            }
          }
        } else {
          $target = $node.closest('.nodes').siblings('.node');
        }
        if ($target.length) {
          if ($target.is('.hidden') || (!$target.is('.hidden') && $target.closest('.nodes').is('.hidden')) || (!$target.is('.hidden') && $target.closest('.vertical').is('.hidden'))) {
            return { 'exist': true, 'visible': false };
          }
          return { 'exist': true, 'visible': true };
        }
      } else if (relation === 'children') {
        $target = isVerticalNode ? $node.parent().children('ul') : $node.siblings('.nodes');
        if ($target.length) {
          if (!$target.is('.hidden')) {
            return { 'exist': true, 'visible': true };
          }
          return { 'exist': true, 'visible': false };
        }
      } else if (relation === 'siblings') {
        $target = isVerticalNode ? $node.closest('ul') : $node.parent().siblings();
        if ($target.length && (!isVerticalNode || $target.children('li').length > 1)) {
          if (!$target.is('.hidden') && !$target.parent().is('.hidden') && (!isVerticalNode || !$target.closest('.vertical').is('.hidden'))) {
            return { 'exist': true, 'visible': true };
          }
          return { 'exist': true, 'visible': false };
        }
      } else {
        $target = $node;
        if ($target.length) {
          if (!(($target.closest('.nodes').length && $target.closest('.nodes').is('.hidden')) ||
            ($target.closest('.hierarchy').length && $target.closest('.hierarchy').is('.hidden')) ||
            ($target.closest('.vertical').length && ($target.closest('.nodes').is('.hidden') || $target.closest('.vertical').is('.hidden')))
          )) {
            return { 'exist': true, 'visible': true };
          }
          return { 'exist': true, 'visible': false };
        }
      }
      return { 'exist': false, 'visible': false };
    },
    getParent: function ($node) {
      return this.getRelatedNodes($node, 'parent');
    },
    getChildren: function ($node) {
      return this.getRelatedNodes($node, 'children');
    },
    getSiblings: function ($node) {
      return this.getRelatedNodes($node, 'siblings');
    },
    // find the related nodes
    getRelatedNodes: function ($node, relation) {
      $node = toCollection($node);
      if (!$node || !($node instanceof $) || !$node.is('.node')) {
        return $();
      }
      if (relation === 'parent') {
        return $node.closest('.nodes').siblings('.node');
      } else if (relation === 'children') {
        return $node.siblings('.nodes').children('.hierarchy').find('.node:first');
      } else if (relation === 'siblings') {
        return $node.closest('.hierarchy').siblings().find('.node:first');
      } else {
        return $();
      }
    },
    hideParentEnd: function (event) {
      $(event.target).removeClass('sliding');
      event.data.parent.addClass('hidden');
    },
    // recursively hide the ancestor node and sibling nodes of the specified node
    hideParent: function ($node) {
      $node = toCollection($node);
      var $parent = $node.closest('.nodes').siblings('.node');
      if ($parent.find('.spinner').length) {
        $node.closest('.orgchart').data('inAjax', false);
      }
      // hide the sibling nodes
      if (this.getNodeState($node, 'siblings').visible) {
        this.hideSiblings($node);
      }
      // hide the lines
      $node.parent().addClass('isAncestorsCollapsed');
      // hide the superior nodes with transition
      if (this.getNodeState($parent).visible) {
        $parent.addClass('sliding slide-down').one('transitionend', { 'parent': $parent }, this.hideParentEnd);
      }
      // if the current node has the parent node, hide it recursively
      if (this.getNodeState($parent, 'parent').visible) {
        this.hideParent($parent);
      }
    },
    showParentEnd: function (event) {
      var $node = event.data.node;
      $(event.target).removeClass('sliding');
      if (this.isInAction($node)) {
        this.switchVerticalArrow($node.children('.topEdge'));
      }
    },
    // show the parent node of the specified node
    showParent: function ($node) {
      $node = toCollection($node);
      // just show only one superior level
      var $parent = $node.closest('.nodes').siblings('.node').removeClass('hidden');
      // just show only one line
      $node.closest('.hierarchy').removeClass('isAncestorsCollapsed');
      // show parent node with animation
      this.repaint($parent[0]);
      $parent.addClass('sliding').removeClass('slide-down').one('transitionend', { 'node': $node }, this.showParentEnd.bind(this));
    },
    stopAjax: function ($nodeLevel) {
      if ($nodeLevel.find('.spinner').length) {
        $nodeLevel.closest('.orgchart').data('inAjax', false);
      }
    },
    isVisibleNode: function (index, elem) {
      return this.getNodeState($(elem)).visible;
    },
    isCompactDescendant: function (index, elem) {
      return $(elem).parent().is('.node.compact');
    },
    // do some necessary cleanup tasks when hide animation is finished
    hideChildrenEnd: function (event) {
      var $node = event.data.node;
      event.data.animatedNodes.removeClass('sliding');
      event.data.animatedNodes.closest('.nodes').addClass('hidden');
      if (this.isInAction($node)) {
        this.switchVerticalArrow($node.children('.bottomEdge'));
      }
    },
    // recursively hide the descendant nodes of the specified node
    hideChildren: function ($node) {
      $node = toCollection($node);
      $node.closest('.hierarchy').addClass('isChildrenCollapsed');
      var $lowerLevel = $node.siblings('.nodes');
      this.stopAjax($lowerLevel);
      var $animatedNodes = $lowerLevel.find('.node').filter(this.isVisibleNode.bind(this)).not(this.isCompactDescendant.bind(this));
      var isVerticalDesc = $lowerLevel.is('.vertical');
      if (!isVerticalDesc) {
        $animatedNodes.closest('.hierarchy').addClass('isCollapsedDescendant');
      }
      if ($lowerLevel.is('.vertical') || $lowerLevel.find('.vertical').length) {
        $animatedNodes.find(this.options.icons.expanded).removeClass(this.options.icons.expanded).addClass(this.options.icons.collapsed);
      }
      this.repaint($animatedNodes.get(0));
      $animatedNodes.addClass('sliding slide-up').eq(0).one('transitionend', { 'animatedNodes': $animatedNodes, 'lowerLevel': $lowerLevel, 'node': $node }, this.hideChildrenEnd.bind(this));
    },
    //
    showChildrenEnd: function (event) {
      var $node = event.data.node;
      event.data.animatedNodes.removeClass('sliding');
      if (this.isInAction($node)) {
        this.switchVerticalArrow($node.children('.bottomEdge'));
      }
    },
    // show the children nodes of the specified node
    showChildren: function ($node) {
      $node = toCollection($node);
      var that = this;
      $node.closest('.hierarchy').removeClass('isChildrenCollapsed');
      var $levels = $node.siblings('.nodes');
      var isVerticalDesc = $levels.is('.vertical');
      var $animatedNodes = isVerticalDesc
        ? $levels.removeClass('hidden').find('.node').filter(this.isVisibleNode.bind(this))
        : $levels.removeClass('hidden').children('.hierarchy').find('.node:first').filter(this.isVisibleNode.bind(this));
      if (!isVerticalDesc) {
        $animatedNodes.filter(':not(:only-child)').closest('.hierarchy').addClass('isChildrenCollapsed');
        $animatedNodes.closest('.hierarchy').removeClass('isCollapsedDescendant');
      }
      // the two following statements are used to enforce browser to repaint
      this.repaint($animatedNodes.get(0));
      $animatedNodes.addClass('sliding').removeClass('slide-up').eq(0).one('transitionend', { 'node': $node, 'animatedNodes': $animatedNodes }, this.showChildrenEnd.bind(this));
    },
    //
    hideSiblingsEnd: function (event) {
      var that = this;
      var $node = event.data.node;
      var $nodeContainer = event.data.nodeContainer;
      var direction = event.data.direction;
      var $siblings = direction ? (direction === 'left' ? $nodeContainer.prevAll(':not(.hidden)') : $nodeContainer.nextAll(':not(.hidden)')) : $nodeContainer.siblings();
      event.data.animatedNodes.removeClass('sliding');
      $siblings.each(function () {
        $(this).find('.node').filter(that.isVisibleNode.bind(that)).slice(1)
          .removeClass('slide-left slide-right')
          .addClass(function() {
            return that.options.compact ? '' : 'slide-up';
          });
      });
      $siblings.find('.nodes, .vertical').addClass('hidden')
        .end().addClass('hidden');

      if (this.isInAction($node)) {
        this.switchHorizontalArrow($node);
      }
    },
    // hide the sibling nodes of the specified node
    hideSiblings: function ($node, direction) {
      $node = toCollection($node);
      var that = this;
      var $nodeContainer = $node.closest('.hierarchy').addClass('isSiblingsCollapsed');
      if ($nodeContainer.siblings().find('.spinner').length) {
        $node.closest('.orgchart').data('inAjax', false);
      }
      if (direction) {
        if (direction === 'left') {
          $nodeContainer.addClass('left-sibs')
            .prevAll('.isSiblingsCollapsed').removeClass('isSiblingsCollapsed left-sibs').end()
            .prevAll().addClass('isCollapsedSibling isChildrenCollapsed')
            .find('.node').filter(this.isVisibleNode.bind(this)).addClass('sliding slide-right');
        } else {
          $nodeContainer.addClass('right-sibs')
            .nextAll('.isSiblingsCollapsed').removeClass('isSiblingsCollapsed right-sibs').end()
            .nextAll().addClass('isCollapsedSibling isChildrenCollapsed')
            .find('.node').filter(this.isVisibleNode.bind(this)).addClass('sliding slide-left');
        }
      } else {
        $nodeContainer.prevAll().find('.node').filter(this.isVisibleNode.bind(this)).addClass('sliding slide-right');
        $nodeContainer.nextAll().find('.node').filter(this.isVisibleNode.bind(this)).addClass('sliding slide-left');
        $nodeContainer.siblings().addClass('isCollapsedSibling isChildrenCollapsed');
      }
      var $animatedNodes = $nodeContainer.siblings().find('.sliding');
      $animatedNodes.eq(0).one('transitionend', { 'node': $node, 'nodeContainer': $nodeContainer, 'direction': direction, 'animatedNodes': $animatedNodes }, this.hideSiblingsEnd.bind(this));
    },
    //
    showSiblingsEnd: function (event) {
      var $node = event.data.node;
      event.data.visibleNodes.removeClass('sliding');
      if (this.isInAction($node)) {
        this.switchHorizontalArrow($node);
        $node.children('.topEdge').removeClass(this.options.icons.expandToUp).addClass(this.options.icons.collapseToDown);
      }
    },
    //
    showRelatedParentEnd: function(event) {
      $(event.target).removeClass('sliding');
    },
    // show the sibling nodes of the specified node
    showSiblings: function ($node, direction) {
      $node = toCollection($node);
      var that = this;
      // firstly, show the sibling nodes
      var $siblings = $();
      var $nodeContainer = $node.closest('.hierarchy');
      if (direction) {
        if (direction === 'left') {
          $siblings = $nodeContainer.prevAll().removeClass('hidden');
        } else {
          $siblings = $nodeContainer.nextAll().removeClass('hidden');
        }
      } else {
        $siblings = $node.closest('.hierarchy').siblings().removeClass('hidden');
      }
      // secondly, show the lines
      var $upperLevel = $node.closest('.nodes').siblings('.node');
      if (direction) {
        $nodeContainer.removeClass(direction + '-sibs');
        if (!$nodeContainer.is('[class*=-sibs]')) {
          $nodeContainer.removeClass('isSiblingsCollapsed');
        }
        $siblings.removeClass('isCollapsedSibling ' + direction + '-sibs');
      } else {
        $node.closest('.hierarchy').removeClass('isSiblingsCollapsed');
        $siblings.removeClass('isCollapsedSibling');
      }
      // thirdly, show parent node if it is collapsed
      if (!this.getNodeState($node, 'parent').visible) {
        $node.closest('.hierarchy').removeClass('isAncestorsCollapsed');
        $upperLevel.removeClass('hidden');
        this.repaint($upperLevel[0]);
        $upperLevel.addClass('sliding').removeClass('slide-down').one('transitionend', this.showRelatedParentEnd);
      }
      // lastly, show the sibling nodes with animation
      var $visibleNodes = $siblings.find('.node').filter(this.isVisibleNode.bind(this));
      this.repaint($visibleNodes.get(0));
      $visibleNodes.addClass('sliding').removeClass('slide-left slide-right');
      $visibleNodes.eq(0).one('transitionend', { 'node': $node, 'visibleNodes': $visibleNodes }, this.showSiblingsEnd.bind(this));
    },
    // start up loading status for requesting new nodes
    startLoading: function ($edge) {
      $edge = toCollection($edge);
      var $chart = this.$chart;
      if (typeof $chart.data('inAjax') !== 'undefined' && $chart.data('inAjax') === true) {
        return false;
      }

      $edge.addClass('hidden');
      $edge.parent().append(`<i class="${this.options.icons.theme} ${this.options.icons.spinner} spinner"></i>`)
        .children().not('.spinner').css('opacity', 0.2);
      $chart.data('inAjax', true);
      $('.oc-export-btn').prop('disabled', true);
      return true;
    },
    // terminate loading status for requesting new nodes
    endLoading: function ($edge) {
      $edge = toCollection($edge);
      var $node = $edge.parent();
      $edge.removeClass('hidden');
      $node.find('.spinner').remove();
      $node.children().removeAttr('style');
      this.$chart.data('inAjax', false);
      $('.oc-export-btn').prop('disabled', false);
    },
    // whether the cursor is hovering over the node
    isInAction: function ($node) {
      $node = toCollection($node);
      // TODO: 展开/折叠的按钮不止4个箭头，还有toggleBtn
      return [
        this.options.icons.expandToUp,
        this.options.icons.collapseToDown,
        this.options.icons.collapseToLeft,
        this.options.icons.expandToRight
      ].some((icon) => $node.children('.edge').attr('class').indexOf(icon) > -1);
    },
    //
    switchVerticalArrow: function ($arrow) {
      $arrow = toCollection($arrow);
      $arrow.toggleClass(`${this.options.icons.expandToUp} ${this.options.icons.collapseToDown}`);
    },
    //
    switchHorizontalArrow: function ($node) {
      $node = toCollection($node);
      var opts = this.options;
      if (opts.toggleSiblingsResp && (typeof opts.ajaxURL === 'undefined' || $node.closest('.nodes').data('siblingsLoaded'))) {
        var $prevSib = $node.parent().prev();
        if ($prevSib.length) {
          if ($prevSib.is('.hidden')) {
            $node.children('.leftEdge').addClass(opts.icons.collapseToLeft).removeClass(opts.icons.expandToRight);
          } else {
            $node.children('.leftEdge').addClass(opts.icons.expandToRight).removeClass(opts.icons.collapseToLeft);
          }
        }
        var $nextSib = $node.parent().next();
        if ($nextSib.length) {
          if ($nextSib.is('.hidden')) {
            $node.children('.rightEdge').addClass(opts.icons.expandToRight).removeClass(opts.icons.collapseToLeft);
          } else {
            $node.children('.rightEdge').addClass(opts.icons.collapseToLeft).removeClass(opts.icons.expandToRight);
          }
        }
      } else {
        var $sibs = $node.parent().siblings();
        var sibsVisible = $sibs.length ? !$sibs.is('.hidden') : false;
        $node.children('.leftEdge').toggleClass(opts.icons.expandToRight, sibsVisible).toggleClass(opts.icons.collapseToLeft, !sibsVisible);
        $node.children('.rightEdge').toggleClass(opts.icons.collapseToLeft, sibsVisible).toggleClass(opts.icons.expandToRight, !sibsVisible);
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
      var $node = $(event.delegateTarget);
      var flag = false;
      if ($node.closest('.nodes.vertical').length) {
        var $toggleBtn = $node.children('.toggleBtn');
        if (event.type === 'mouseenter') {
          if ($node.children('.toggleBtn').length) {
            flag = this.getNodeState($node, 'children').visible;
            $toggleBtn.toggleClass(this.options.icons.collapsed, !flag).toggleClass(this.options.icons.expanded, flag);
          }
        } else {
          $toggleBtn.removeClass(`${this.options.icons.collapsed} ${this.options.icons.expanded}`);
        }
      } else {
        var $topEdge = $node.children('.topEdge');
        var $rightEdge = $node.children('.rightEdge');
        var $bottomEdge = $node.children('.bottomEdge');
        var $leftEdge = $node.children('.leftEdge');
        if (event.type === 'mouseenter') {
          if ($topEdge.length) {
            flag = this.getNodeState($node, 'parent').visible;
            $topEdge.toggleClass(this.options.icons.expandToUp, !flag).toggleClass(this.options.icons.collapseToDown, flag);
          }
          if ($bottomEdge.length) {
            flag = this.getNodeState($node, 'children').visible;
            $bottomEdge.toggleClass(this.options.icons.collapseToDown, !flag).toggleClass(this.options.icons.expandToUp, flag);
          }
          if ($leftEdge.length) {
            this.switchHorizontalArrow($node);
          }
        } else {
          $node.children('.edge').removeClass(`${this.options.icons.expandToUp} ${this.options.icons.collapseToDown} ${this.options.icons.collapseToLeft} ${this.options.icons.expandToRight}`);
        }
      }
    },
    //
    nodeClickHandler: function (event) {
      this.$chart.find('.focused').removeClass('focused');
      $(event.delegateTarget).addClass('focused');
    },
    addAncestors: function (data, parentId) {
      var $root = this.$chart.children('.nodes').children('.hierarchy');
      this.buildHierarchy($root, data);
      $root.children().slice(0, 2)
        .wrapAll('<li class="hierarchy"></li>').parent()
        .appendTo($('#' + parentId).siblings('.nodes'));
    },
    addDescendants:function (data, $parent) {
      var that = this;
      var $descendants = $('<ul class="nodes"></ul>');
      $parent.after($descendants);
      $.each(data, function (i) {
        $descendants.append($('<li class="hierarchy"></li>'));
        that.buildHierarchy($descendants.children().eq(i), this);
      });
    },
    //
    HideFirstParentEnd: function (event) {
      var $topEdge = event.data.topEdge;
      var $node = $topEdge.parent();
      if (this.isInAction($node)) {
        this.switchVerticalArrow($topEdge);
        this.switchHorizontalArrow($node);
      }
    },
    // actions on clinking top edge of a node
    topEdgeClickHandler: function (event) {
      var that = this;
      var $topEdge = $(event.target);
      var $node = $(event.delegateTarget);
      var parentState = this.getNodeState($node, 'parent');
      if (parentState.exist) {
        var $parent = $node.closest('.nodes').siblings('.node');
        if ($parent.is('.sliding')) { return; }
        // hide the ancestor nodes and sibling nodes of the specified node
        if (parentState.visible) {
          this.hideParent($node);
          $parent.one('transitionend', { 'topEdge': $topEdge }, this.HideFirstParentEnd.bind(this));
          this.triggerHideEvent($node, 'parent');
        } else { // show the ancestors and siblings
          this.showParent($node);
          this.triggerShowEvent($node, 'parent');
        }
      }
    },
    // actions on clinking bottom edge of a node
    bottomEdgeClickHandler: function (event) {
      var $bottomEdge = $(event.target);
      var $node = $(event.delegateTarget);
      var childrenState = this.getNodeState($node, 'children');
      if (childrenState.exist) {
        var $children = $node.siblings('.nodes').children().children('.node');
        if ($children.is('.sliding')) { return; }
        // hide the descendant nodes of the specified node
        if (childrenState.visible) {
          this.hideChildren($node);
          this.triggerHideEvent($node, 'children');
        } else { // show the descendants
          this.showChildren($node);
          this.triggerShowEvent($node, 'children');
        }
      }
    },
    // actions on clicking horizontal edges
    hEdgeClickHandler: function (event) {
      var $hEdge = $(event.target);
      var $node = $(event.delegateTarget);
      var opts = this.options;
      var siblingsState = this.getNodeState($node, 'siblings');
      if (siblingsState.exist) {
        var $siblings = $node.closest('.hierarchy').siblings();
        if ($siblings.find('.sliding').length) { return; }
        if (opts.toggleSiblingsResp) {
          var $prevSib = $node.closest('.hierarchy').prev();
          var $nextSib = $node.closest('.hierarchy').next();
          if ($hEdge.is('.leftEdge')) {
            if ($prevSib.is('.hidden')) {
              this.showSiblings($node, 'left');
              this.triggerShowEvent($node,'siblings');
            } else {
              this.hideSiblings($node, 'left');
              this.triggerHideEvent($node, 'siblings');
            }
          } else {
            if ($nextSib.is('.hidden')) {
              this.showSiblings($node, 'right');
              this.triggerShowEvent($node,'siblings');
            } else {
              this.hideSiblings($node, 'right');
              this.triggerHideEvent($node, 'siblings');
            }
          }
        } else {
          if (siblingsState.visible) {
            this.hideSiblings($node);
            this.triggerHideEvent($node, 'siblings');
          } else {
            this.showSiblings($node);
            this.triggerShowEvent($node, 'siblings');
          }
        }
      }
    },
    // show the compact node's children in the compact mode
    backToCompactHandler: function (event) {
      $(event.delegateTarget).removeClass('looseMode')
        .find('.looseMode').removeClass('looseMode')
        .children('.backToCompactSymbol').addClass('hidden').end()
        .children('.backToLooseSymbol').removeClass('hidden');
      $(event.delegateTarget).children('.backToCompactSymbol').addClass('hidden').end()
        .children('.backToLooseSymbol').removeClass('hidden');
    },
    // show the compact node's children in the loose mode 
    backToLooseHandler: function (event) {
      $(event.delegateTarget)
        .addClass('looseMode')
        .children('.backToLooseSymbol').addClass('hidden').end()
        .children('.backToCompactSymbol').removeClass('hidden');
    },
    //
    expandVNodesEnd: function (event) {
      event.data.vNodes.removeClass('sliding');
    },
    //
    collapseVNodesEnd: function (event) {
      event.data.vNodes.removeClass('sliding').closest('ul').addClass('hidden');
    },
    // event handler for toggle buttons in Hybrid(horizontal + vertical) OrgChart
    toggleVNodes: function (event) {
      var $toggleBtn = $(event.target);
      var $descWrapper = $toggleBtn.parent().next();
      var $descendants = $descWrapper.find('.node');
      var $children = $descWrapper.children().children('.node');
      if ($children.is('.sliding')) { return; }
      $toggleBtn.toggleClass(`${this.options.icons.collapsed} ${this.options.icons.expanded}`);
      if ($descendants.eq(0).is('.slide-up')) {
        $descWrapper.removeClass('hidden');
        this.repaint($children.get(0));
        $children.addClass('sliding').removeClass('slide-up').eq(0).one('transitionend', { 'vNodes': $children }, this.expandVNodesEnd);
      } else {
        $descendants.addClass('sliding slide-up').eq(0).one('transitionend', { 'vNodes': $descendants }, this.collapseVNodesEnd);
        $descendants.find('.toggleBtn').removeClass(`${this.options.icons.collapsed} ${this.options.icons.expanded}`);
      }
    },
    //
    createGhostNode: function (event) {
      var $nodeDiv = $(event.target);
      var opts = this.options;
      var origEvent = event.originalEvent;
      var isFirefox = /firefox/.test(getWindow().navigator.userAgent.toLowerCase());
      var ghostNode, nodeCover;
      if (!getDocument().querySelector('.ghost-node')) {
        ghostNode = getDocument().createElementNS("http://www.w3.org/2000/svg", "svg");
        if (!ghostNode.classList) return;
        ghostNode.classList.add('ghost-node');
        nodeCover = getDocument().createElementNS('http://www.w3.org/2000/svg','rect');
        ghostNode.appendChild(nodeCover);
        $nodeDiv.closest('.orgchart').append(ghostNode);
      } else {
        ghostNode = $nodeDiv.closest('.orgchart').children('.ghost-node').get(0);
        nodeCover = $(ghostNode).children().get(0);
      }
      var transValues = $nodeDiv.closest('.orgchart').css('transform').split(',');
      var isHorizontal = opts.direction === 't2b' || opts.direction === 'b2t';
      var scale = Math.abs(getWindow().parseFloat(isHorizontal ? transValues[0].slice(transValues[0].indexOf('(') + 1) : transValues[1]));
      ghostNode.setAttribute('width', isHorizontal ? $nodeDiv.outerWidth(false) : $nodeDiv.outerHeight(false));
      ghostNode.setAttribute('height', isHorizontal ? $nodeDiv.outerHeight(false) : $nodeDiv.outerWidth(false));
      nodeCover.setAttribute('x',5 * scale);
      nodeCover.setAttribute('y',5 * scale);
      nodeCover.setAttribute('width', 120 * scale);
      nodeCover.setAttribute('height', 40 * scale);
      nodeCover.setAttribute('rx', 4 * scale);
      nodeCover.setAttribute('ry', 4 * scale);
      nodeCover.setAttribute('stroke-width', 1 * scale);
      var xOffset = origEvent.offsetX * scale;
      var yOffset = origEvent.offsetY * scale;
      if (opts.direction === 'l2r') {
        xOffset = origEvent.offsetY * scale;
        yOffset = origEvent.offsetX * scale;
      } else if (opts.direction === 'r2l') {
        xOffset = $nodeDiv.outerWidth(false) - origEvent.offsetY * scale;
        yOffset = origEvent.offsetX * scale;
      } else if (opts.direction === 'b2t') {
        xOffset = $nodeDiv.outerWidth(false) - origEvent.offsetX * scale;
        yOffset = $nodeDiv.outerHeight(false) - origEvent.offsetY * scale;
      }
      if (isFirefox) { // hack for old version of Firefox(< 48.0)
        nodeCover.setAttribute('fill', 'rgb(255, 255, 255)');
        nodeCover.setAttribute('stroke', 'rgb(191, 0, 0)');
        var ghostNodeWrapper = getDocument().createElement('img');
        ghostNodeWrapper.src = 'data:image/svg+xml;utf8,' + (new XMLSerializer()).serializeToString(ghostNode);
        origEvent.dataTransfer.setDragImage(ghostNodeWrapper, xOffset, yOffset);
      } else {
        // IE/Edge do not support this, so only use it if we can
        if (origEvent.dataTransfer.setDragImage)
          origEvent.dataTransfer.setDragImage(ghostNode, xOffset, yOffset);
      }
    },
    // get the level amount of a hierachy
    getUpperLevel: function ($node) {
      if (!$node.is('.node')) {
        return 0;
      }
      return $node.parents('.hierarchy').length;
    },
    // get the level amount of a hierachy
    getLowerLevel: function ($node) {
      if (!$node.is('.node')) {
        return 0;
      }
      return $node.closest('.hierarchy').find('.nodes').length + 1;
    },
    // get nodes in level order traversal
    getLevelOrderNodes: function ($root) {
      if(!$root) return [];
      var queue = [];
      var output = [];
      queue.push($root);
      while(queue.length) {
        var row = [];
        for(var i = 0; i < queue.length; i++) {
            var cur = queue.shift();
            var children = this.getChildren(cur);
            if(children.length) {
              queue.push(children.toArray().flat());
            }
            row.push($(cur));
        }
        output.push(row);
      }
      return output;
    },
    //
    filterAllowedDropNodes: function ($dragged) {
      var opts = this.options;
      // what is being dragged?  a node, or something within a node?
      var draggingNode = $dragged.closest('[draggable]').hasClass('node');
      var $dragZone = $dragged.closest('.nodes').siblings('.node'); // parent node
      var $dragHier = $dragged.closest('.hierarchy').find('.node'); // this node, and its children
      this.$chart.data('dragged', $dragged)
        .find('.node').each(function (index, node) {
          if (!draggingNode || $dragHier.index(node) === -1) {
            if (opts.dropCriteria) {
              if (opts.dropCriteria($dragged, $dragZone, $(node))) {
                $(node).addClass('allowedDrop');
              }
            } else {
              $(node).addClass('allowedDrop');
            }
          }
        });
    },
    //
    dragstartHandler: function (event) {
      event.originalEvent.dataTransfer.setData('text/html', 'hack for firefox');
      // if users enable zoom or direction options
      if (this.$chart.css('transform') !== 'none') {
        this.createGhostNode(event);
      }
      this.filterAllowedDropNodes($(event.target));
    },
    //
    dragoverHandler: function (event) {
      if (!$(event.delegateTarget).is('.allowedDrop')) {
        event.originalEvent.dataTransfer.dropEffect = 'none';
      } else {
        // default action for drag-and-drop of div is not to drop, so preventing default action for nodes which have allowedDrop class
        //to fix drag and drop on IE and Edge
        event.preventDefault();
      }
    },
    //
    dragendHandler: function (event) {
      this.$chart.find('.allowedDrop').removeClass('allowedDrop');
    },
    // when user drops the node, it will be removed from original parent node and be added to new parent node
    dropHandler: async function (event) {
      var that = this;
      var $dropZone = $(event.delegateTarget);
      var $dragged = this.$chart.data('dragged');

      // Pass on drops which are not nodes (since they are not our doing)
      if (!$dragged.hasClass('node')) {
        this.$chart.triggerHandler({ 'type': 'otherdropped.orgchart', 'draggedItem': $dragged, 'dropZone': $dropZone });
        return;
      }

      if (!$dropZone.hasClass('allowedDrop')) {
          // We are trying to drop a node into a node which isn't allowed
          // IE/Edge have a habit of allowing this, so we need our own double-check
          return;
      }

      var $dragZone = $dragged.closest('.nodes').siblings('.node');
      var dropEvent = $.Event('nodedrop.orgchart');
      this.$chart.trigger(dropEvent, { 'draggedNode': $dragged, 'dragZone': $dragZone, 'dropZone': $dropZone });
      if (dropEvent.isDefaultPrevented()) {
        return;
      }
      // special process for hybrid chart
      var datasource = this.$chart.data('options').data;
      var digger = new JSONDigger(datasource, this.$chart.data('options').nodeId, 'children');
      const hybridNode = digger.findOneNode({ 'hybrid': true });
      if (this.$chart.data('options').verticalLevel > 1 || hybridNode) {
        var draggedNode = digger.findNodeById($dragged.data('nodeData').id);
        var copy = Object.assign({}, draggedNode);
        digger.removeNode(draggedNode.id);
        var dropNode = digger.findNodeById($dropZone.data('nodeData').id);
        if (dropNode.children) {
          dropNode.children.push(copy);
        } else {
          dropNode.children = [copy];
        }
        that.init({ 'data': datasource });
      } else {
        // The folowing code snippets are used to process horizontal chart
        // firstly, deal with the hierarchy of drop zone
        if (!$dropZone.siblings('.nodes').length) { // if the drop zone is a leaf node
          $dropZone.append(`<i class="edge verticalEdge bottomEdge ${this.options.icons.theme}"></i>`)
            .after('<ul class="nodes"></ul>')
            .siblings('.nodes').append($dragged.find('.horizontalEdge').remove().end().closest('.hierarchy'));
          if ($dropZone.children('.title').length) {
            $dropZone.children('.title').prepend(`<i class="${this.options.icons.theme} ${this.$chart.data('options').icons.parentNode} parentNodeSymbol"></i>`);
          }
        } else {
          var horizontalEdges = `<i class="edge horizontalEdge rightEdge ${this.options.icons.theme}"></i><i class="edge horizontalEdge leftEdge ${this.options.icons.theme}"></i>`;
          if (!$dragged.find('.horizontalEdge').length) {
            $dragged.append(horizontalEdges);
          }
          $dropZone.siblings('.nodes').append($dragged.closest('.hierarchy'));
          var $dropSibs = $dragged.closest('.hierarchy').siblings().find('.node:first');
          if ($dropSibs.length === 1) {
            $dropSibs.append(horizontalEdges);
          }
        }
        // secondly, deal with the hierarchy of dragged node
        if ($dragZone.siblings('.nodes').children('.hierarchy').length === 1) { // if there is only one sibling node left
          $dragZone.siblings('.nodes').children('.hierarchy').find('.node:first')
            .find('.horizontalEdge').remove();
        } else if ($dragZone.siblings('.nodes').children('.hierarchy').length === 0) {
          $dragZone.find('.bottomEdge, .parentNodeSymbol').remove()
            .end().siblings('.nodes').remove();
        }
      }
    },
    //
    touchstartHandler: function (event) {
      if (this.touchHandled)
        return;

      if (event.touches && event.touches.length > 1)
        return;

      this.touchHandled = true;
      this.touchMoved = false; // this is so we can work out later if this was a 'press' or a 'drag' touch
      event.preventDefault();
    },
    //
    touchmoveHandler: function (event) {
      if (!this.touchHandled)
        return;

      if (event.touches && event.touches.length > 1)
        return;

      event.preventDefault();

      if (!this.touchMoved) {
        // we do not bother with createGhostNode (dragstart does) since the touch event does not have a dataTransfer property
        this.filterAllowedDropNodes($(event.currentTarget));  // will also set 'this.$chart.data('dragged')' for us
        // create an image which can be used to illustrate the drag (our own createGhostNode)
        this.touchDragImage = this.createDragImage(event, this.$chart.data('dragged')[0]);
      }
      this.touchMoved = true;

      // move our dragimage so it follows our finger
      this.moveDragImage(event, this.touchDragImage);

      var $touching = $(getDocument().elementFromPoint(event.touches[0].clientX, event.touches[0].clientY));
      var $touchingNodes = $touching.closest('div.node');
      if ($touchingNodes.length > 0) {
        var touchingNodeElement = $touchingNodes[0];
        if ($touchingNodes.is('.allowedDrop')) {
          this.touchTargetNode = touchingNodeElement;
        }
        else {
          this.touchTargetNode = null;
        }
      }
      else {
        this.touchTargetNode = null;
      }
    },
    //
    touchendHandler: function (event) {
      if (!this.touchHandled) {
          return;
      }
      this.destroyDragImage();
      if (this.touchMoved) {
          // we've had movement, so this was a 'drag' touch
          if (this.touchTargetNode) {
              var fakeEventForDropHandler = { delegateTarget: this.touchTargetNode };
              this.dropHandler(fakeEventForDropHandler);
              this.touchTargetNode = null;
          }
          this.dragendHandler(event);
      }
      else {
          // we did not move, so this was a 'press' touch (fake a click)
          var firstTouch = event.changedTouches[0];
          var fakeMouseClickEvent = getDocument().createEvent('MouseEvents');
          fakeMouseClickEvent.initMouseEvent('click', true, true, getWindow(), 1, firstTouch.screenX, firstTouch.screenY, firstTouch.clientX, firstTouch.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 0, null);
          event.target.dispatchEvent(fakeMouseClickEvent);
      }
      this.touchHandled = false;
    },
    //
    createDragImage: function (event, source) {
      var dragImage = source.cloneNode(true);
      this.copyStyle(source, dragImage);
      dragImage.style.top = dragImage.style.left = '-9999px';
      var sourceRectangle = source.getBoundingClientRect();
      var sourcePoint = this.getTouchPoint(event);
      this.touchDragImageOffset = { x: sourcePoint.x - sourceRectangle.left, y: sourcePoint.y - sourceRectangle.top };
      dragImage.style.opacity = '0.5';
      getDocument().body.appendChild(dragImage);
      return dragImage;
    },
    //
    destroyDragImage: function () {
      if (this.touchDragImage && this.touchDragImage.parentElement)
        this.touchDragImage.parentElement.removeChild(this.touchDragImage);
      this.touchDragImageOffset = null;
      this.touchDragImage = null;
    },
    //
    copyStyle: function (src, dst) {
      // remove potentially troublesome attributes
      var badAttributes = ['id', 'class', 'style', 'draggable'];
      badAttributes.forEach(function (att) {
          dst.removeAttribute(att);
      });
      // copy canvas content
      if (src instanceof HTMLCanvasElement) {
        var cSrc = src, cDst = dst;
        cDst.width = cSrc.width;
        cDst.height = cSrc.height;
        cDst.getContext('2d').drawImage(cSrc, 0, 0);
      }
      // copy style (without transitions)
      var cs = getComputedStyle(src);
      for (var i = 0; i < cs.length; i++) {
        var key = cs[i];
        if (key.indexOf('transition') < 0) {
          dst.style[key] = cs[key];
        }
      }
      dst.style.pointerEvents = 'none';
      // and repeat for all children
      for (var i = 0; i < src.children.length; i++) {
        this.copyStyle(src.children[i], dst.children[i]);
      }
    },
    //
    getTouchPoint: function (event) {
      if (event && event.touches) {
        event = event.touches[0];
      }
      return {
        x: event.clientX,
        y: event.clientY
      };
    },
    //
    moveDragImage: function (event, image) {
      if (!event || !image)
        return;
      var orgChartMaster = this;
      requestAnimationFrame(function () {
        var pt = orgChartMaster.getTouchPoint(event);
        var s = image.style;
        s.position = 'absolute';
        s.pointerEvents = 'none';
        s.zIndex = '999999';
        if (orgChartMaster.touchDragImageOffset) {
            s.left = Math.round(pt.x - orgChartMaster.touchDragImageOffset.x) + 'px';
            s.top = Math.round(pt.y - orgChartMaster.touchDragImageOffset.y) + 'px';
        }
      });
    },
    //
    bindDragDrop: function ($node) {
      $node = toCollection($node);
      $node.on('dragstart', this.dragstartHandler.bind(this))
        .on('dragover', this.dragoverHandler.bind(this))
        .on('dragend', this.dragendHandler.bind(this))
        .on('drop', this.dropHandler.bind(this))
        .on('touchstart', this.touchstartHandler.bind(this))
        .on('touchmove', this.touchmoveHandler.bind(this))
        .on('touchend', this.touchendHandler.bind(this));
    },
    // create node
    createNode: function (data) {
      var opts = this.options;
      var level = data.level;
      var flags = data.relationship || '';
      var nodeClass = [
        'node',
        data.className || '',
        data?.outsider ? 'outsider' : '',
        level > opts.visibleLevel ? 'slide-up' : ''
      ].filter(Boolean).join(' ');
      var titleChunks = [];
      var contentChunks = [];
      var nodeChunks = [];
      var shouldAddParentSymbol = Number(flags.substr(2, 1));

      if (data.children && data[opts.nodeId]) {
        $.each(data.children, function (index, child) {
          child.parentId = data[opts.nodeId]
        });
      }

      if (shouldAddParentSymbol) {
        titleChunks.push(`<i class="${opts.icons.theme} ${opts.icons.parentNode} parentNodeSymbol"></i>`);
      }
      titleChunks.push(data[opts.nodeTitle]);

      if (opts.nodeTemplate) {
        nodeChunks.push(opts.nodeTemplate(data));
      } else {
        nodeChunks.push(`<div class="title">${titleChunks.join('')}</div>`);
        if (typeof opts.nodeContent !== 'undefined') {
          contentChunks.push(`<div class="content">${data[opts.nodeContent] || ''}</div>`);
        }
        nodeChunks.push(contentChunks.join(''));
      }

      if ((opts.verticalLevel && level >= opts.verticalLevel) || data.vertical) {
        if (shouldAddParentSymbol) {
          nodeChunks.push(`<i class="toggleBtn ${opts.icons.theme}"></i>`);
        }
      } else if (data.hybrid) {
        if (shouldAddParentSymbol) {
          nodeChunks.push(`<i class="edge verticalEdge bottomEdge ${opts.icons.theme}"></i>`);
        }
      } else if (data.compact) {
        if (shouldAddParentSymbol) {
          nodeChunks.push(`<i class="${opts.icons.theme} ${opts.icons.backToCompact} backToCompactSymbol hidden"></i>`);
          nodeChunks.push(`<i class="${opts.icons.theme} ${opts.icons.backToLoose} backToLooseSymbol"></i>`);
        }
      } else if (!data.associatedCompact) {
        if (Number(flags.substr(0, 1))) {
          nodeChunks.push(`<i class="edge verticalEdge topEdge ${opts.icons.theme}"></i>`);
        }
        if (Number(flags.substr(1, 1))) {
          nodeChunks.push(`<i class="edge horizontalEdge rightEdge ${opts.icons.theme}"></i>`);
          nodeChunks.push(`<i class="edge horizontalEdge leftEdge ${opts.icons.theme}"></i>`);
        }
        if (shouldAddParentSymbol) {
          nodeChunks.push(`<i class="edge verticalEdge bottomEdge ${opts.icons.theme}"></i>`);
        }
      }

      // construct the content of node
      var $nodeDiv = $('<div' + (opts.draggable ? ' draggable="true"' : '') + (data[opts.nodeId] ? ' id="' + data[opts.nodeId] + '"' : '') + (data.parentId ? ' data-parent="' + data.parentId + '"' : '') + '>')
        .addClass(nodeClass);
      if (opts.nodeTemplate) {
        $nodeDiv.append(nodeChunks.join(''));
      } else {
        $nodeDiv.append(nodeChunks.join(''));
      }
      //
      var nodeData = $.extend({}, data);
      delete nodeData.children;
      $nodeDiv.data('nodeData', nodeData);
      $nodeDiv[0].__ocNodeData = nodeData;
      if (data.compact) {
        $nodeDiv.css('grid-template-columns', `repeat(${Math.floor(Math.sqrt(data.children.length + 1))}, auto)`);
      }

      $nodeDiv.on('mouseenter mouseleave', this.nodeEnterLeaveHandler.bind(this));
      $nodeDiv.on('click', this.nodeClickHandler.bind(this));
      $nodeDiv.on('click', '.topEdge', this.topEdgeClickHandler.bind(this));
      $nodeDiv.on('click', '.bottomEdge', this.bottomEdgeClickHandler.bind(this));
      $nodeDiv.on('click', '.leftEdge, .rightEdge', this.hEdgeClickHandler.bind(this));
      $nodeDiv.on('click', '.toggleBtn', this.toggleVNodes.bind(this));
      $nodeDiv.on('click', '> .backToCompactSymbol',this.backToCompactHandler.bind(this));
      $nodeDiv.on('click', '> .backToLooseSymbol',this.backToLooseHandler.bind(this));

      if (opts.draggable) {
        this.bindDragDrop($nodeDiv);
        this.touchHandled = false;
        this.touchMoved = false;
        this.touchTargetNode = null;
      }
      // allow user to append dom modification after finishing node create of orgchart
      if (opts.createNode) {
        opts.createNode($nodeDiv[0], data);
      }

      return $nodeDiv;
    },
    // Construct the inferior nodes within a hierarchy
    buildInferiorNodes: function ($hierarchy, $nodeDiv, data, level) {
      var that = this;
      var opts = this.options;
      var isHidden = level + 1 > opts.visibleLevel || (data.collapsed !== undefined && data.collapsed);
      var $nodesLayer;
      if ((opts.verticalLevel && (level + 1) >= opts.verticalLevel) || data.hybrid) {
        $nodesLayer = $('<ul class="nodes">');
        if (isHidden && (opts.verticalLevel && (level + 1) >= opts.verticalLevel)) {
          $nodesLayer.addClass('hidden');
        }
        if (((opts.verticalLevel && level + 1 === opts.verticalLevel) || data.hybrid)
          && !$hierarchy.closest('.vertical').length) {
            $nodesLayer.addClass('vertical');
        }
        $hierarchy.append($nodesLayer);
      } else if (data.compact) {
        $nodeDiv.addClass('compact');
      } else {
        $nodesLayer = $('<ul class="nodes' + (isHidden ? ' hidden' : '') + '">');
        if (isHidden) {
          $hierarchy.addClass('isChildrenCollapsed');
        }
        $hierarchy.append($nodesLayer);
      }
      // recurse through children nodes
      if (Array.isArray(data.children[0])) {
        $.each(data.children, function() {
          this.level = level + 1;
        });
        this.buildHierarchy($nodesLayer, data.children); // 构造子一层的夫妻组合（每个组合可能有多妻多夫情况）
      } else {
        $.each(data.children, function () {
          this.level = level + 1;
          if (data.compact) {
            that.buildHierarchy($nodeDiv, this);
          } else {
            var $nodeCell = $('<li class="hierarchy">');
            $nodesLayer.append($nodeCell);
            that.buildHierarchy($nodeCell, this);
          }
        });
      }
    },
    // recursively build the tree
    buildHierarchy: function ($hierarchy, data) {
      var that = this;
      var opts = this.options;
      var level = 0;
      var $nodeDiv;
      if (data.level || data[0]?.level) {
        level = data.level;
      } else {
        level = $hierarchy.parentsUntil('.orgchart', '.nodes').length;
        if (Array.isArray(data) && Array.isArray(data[0])) {
          $.each(data, function () {
            $.each(this, function () {
              this.level = level;
            });
          });
        } else {
          data.level = level;
        }
      }
      // Construct the single node in OrgChart or the multiple nodes in family tree
      if (Array.isArray(data) && Array.isArray(data[0])) { // 处理family tree的情况
        $.each(data, function () { // 构造一个家庭的hierarchy
          var _this = this;
          $.each(this, function (i) { // 构造一个夫/妻节点
            $nodeDiv = that.createNode(this);
            // if there are only two persons in a marriage, two single nodes will appear in a hierarchy
            if (_this.length === 2 && i === 1) {
              $hierarchy.find(`#${_this[0].id}`).after($nodeDiv);
              if (this.children && this.children.length && this.children[0].length) {
                that.buildInferiorNodes($hierarchy.find(`#${_this[0].id}`).parent(), $nodeDiv, this, level);
              }
            } else {
              // if there are more than two persons in a marriage, every node will be included in a single hierarchy
              var $wrapper = $(`<li class="hierarchy${_this.length > 1 ? ' spouse' : ''}${_this.length === 2 ? ' couple' : ''}${!!this.outsider === false && _this.length > 2  ? ' insider' : ''}"></li>`);

              //在family tree中，一个多妻/多夫组合里，本姓人只有一个，外姓人可能有多个，我们通过水平的连线来表示他们是一家子
              if (i === 0) {
                $wrapper.css({'--ft-width': '50%', '--ft-left-offset': '50%'});
              } else if (i > 0 && i < _this.length - 1) {
                $wrapper.css({'--ft-width': '100%', '--ft-left-offset': '0px'});
              } else {
                $wrapper.css({'--ft-width': '50%', '--ft-left-offset': '0px'});
              }

              $wrapper.append($nodeDiv);
              $hierarchy.append($wrapper);
              if (this.children && this.children.length && this.children[0].length) {
                that.buildInferiorNodes($wrapper, $nodeDiv, this, level);
              }
            }
          });
        });
      } else {
        if (Object.keys(data).length > 2) { // TODO: 应该用更好的方式来判断是否是供父一级节点创建的信息
          $nodeDiv = this.createNode(data);
          $hierarchy.append($nodeDiv);
        }
        if (data.children && data.children.length) {
          this.buildInferiorNodes($hierarchy, $nodeDiv, data, level);
        }
      }
    },
    // build the child nodes of specific node
    buildChildNode: function ($appendTo, data) {
      this.buildHierarchy($appendTo, { 'children': data });
    },
    // exposed method
    addChildren: function ($node, data) {
      $node = toCollection($node);
      this.buildChildNode($node.closest('.hierarchy'), data);
      if (!$node.find('.parentNodeSymbol').length) {
        $node.children('.title').prepend(`<i class="${this.options.icons.theme} ${this.options.icons.parentNode} parentNodeSymbol"></i>`);
      }
      if ($node.closest('.nodes.vertical').length) {
        if (!$node.children('.toggleBtn').length) {
          $node.append(`<i class="toggleBtn ${this.options.icons.theme}"></i>`);
        }
      } else {
        if (!$node.children('.bottomEdge').length) {
          $node.append(`<i class="edge verticalEdge bottomEdge ${this.options.icons.theme}"></i>`);
        }
      }
      if (this.isInAction($node)) {
        this.switchVerticalArrow($node.children('.bottomEdge'));
      }
    },
    // build the parent node of specific node
    buildParentNode: function ($currentRoot, data) {
      data.relationship = data.relationship || '001';
      var $newRootWrapper = $('<ul class="nodes"><li class="hierarchy"></li></ul>')
        .find('.hierarchy').append(this.createNode(data)).end();
      this.$chart.prepend($newRootWrapper)
        .find('.hierarchy:first').append($currentRoot.closest('ul').addClass('nodes'));
    },
    // exposed method
    addParent: function ($currentRoot, data) {
      $currentRoot = toCollection($currentRoot);
      this.buildParentNode($currentRoot, data);
      if (!$currentRoot.children('.topEdge').length) {
        $currentRoot.children('.title').after(`<i class="edge verticalEdge topEdge ${this.options.icons.theme}"></i>`);
      }
      if (this.isInAction($currentRoot)) {
        this.switchVerticalArrow($currentRoot.children('.topEdge'));
      }
    },
    // build the sibling nodes of specific node
    buildSiblingNode: function ($nodeChart, data) {
      var newSiblingCount = $.isArray(data) ? data.length : data.children.length;
      var existingSibligCount = $nodeChart.parent().is('.nodes') ? $nodeChart.siblings().length + 1 : 1;
      var siblingCount = existingSibligCount + newSiblingCount;
      var insertPostion = (siblingCount > 1) ? Math.floor(siblingCount/2 - 1) : 0;
      // just build the sibling nodes for the specific node
      if ($nodeChart.closest('.nodes').parent().is('.hierarchy')) {
        this.buildChildNode($nodeChart.parent().closest('.hierarchy'), data);
        var $siblings = $nodeChart.parent().closest('.hierarchy').children('.nodes:last').children('.hierarchy');
        if (existingSibligCount > 1) {
          $siblings.eq(0).before($nodeChart.siblings().addBack().unwrap());
        } else {
          $siblings.eq(insertPostion).after($nodeChart.unwrap());
        }
      } else { // build the sibling nodes and parent node for the specific ndoe
        this.buildHierarchy($nodeChart.parent().prepend($('<li class="hierarchy">')).children('.hierarchy:first'), data);
        $nodeChart.prevAll('.hierarchy').children('.nodes').children().eq(insertPostion).after($nodeChart);
      }
    },
    //
    addSiblings: function ($node, data) {
      $node = toCollection($node);
      this.buildSiblingNode($node.closest('.hierarchy'), data);
      $node.closest('.nodes').data('siblingsLoaded', true);
      if (!$node.children('.leftEdge').length) {
        $node.children('.topEdge').after(`<i class="edge horizontalEdge rightEdge ${this.options.icons.theme}"></i><i class="edge horizontalEdge leftEdge ${this.options.icons.theme}"></i>`);
      }
      if (this.isInAction($node)) {
        this.switchHorizontalArrow($node);
        $node.children('.topEdge').removeClass(this.options.icons.expandToUp).addClass(this.options.icons.collapseToDown);
      }
    },
    // remove node and its descendent nodes
    removeNodes: function ($node) {
      $node = toCollection($node);
      var $wrapper = $node.closest('.hierarchy').parent();
      if ($wrapper.parent().is('.hierarchy')) {
        if (this.getNodeState($node, 'siblings').exist) {
          $node.closest('.hierarchy').remove();
          if ($wrapper.children().length === 1) {
            $wrapper.find('.node:first .horizontalEdge').remove();
          }
        } else {
          $wrapper.siblings('.node').find('.bottomEdge').remove()
            .end().end().remove();
        }
      } else { // if $node is root node
        $wrapper.closest('.orgchart').remove();
      }
    },
    //
    hideDropZones: function () {
      // Remove all the 'this is a drop zone' indicators
      var orgChartObj = this;
      orgChartObj.$chart.find('.allowedDrop')
        .removeClass('allowedDrop');
    },
    //
    showDropZones: function (dragged) {
      // Highlight all the 'drop zones', and set dragged, so that the drop/enter can work out what happens later
      // TODO: This assumes all nodes are droppable: it doesn't run the custom isDroppable function - it should!
      var orgChartObj = this;
      orgChartObj.$chart.find('.node')
        .each(function (index, node) {
          $(node).addClass('allowedDrop');
        });
      orgChartObj.$chart.data('dragged', $(dragged));
    },
    //
    processExternalDrop: function (dropZone, dragged) {
      // Allow an external drop event to be handled by one of our nodes
      if (dragged) {
        this.$chart.data('dragged', $(dragged));
      }
      var droppedOnNode = dropZone.closest('.node');
      // would like to just call 'dropZoneHandler', but I can't reach it from here
      // instead raise a drop event on the node element
      droppedOnNode.triggerHandler({ 'type': 'drop' });
    },
    //
    exportPDF: function(canvas, exportFilename){
      var doc = {};
      var docWidth = Math.floor(canvas.width);
      var docHeight = Math.floor(canvas.height);
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
      var that = this;
      var isWebkit = 'WebkitAppearance' in getDocument().documentElement.style;
      var isFf = !!getWindow().sidebar;
      var isEdge = navigator.appName === 'Microsoft Internet Explorer' || (navigator.appName === "Netscape" && navigator.appVersion.indexOf('Edge') > -1);
      var $chartContainer = this.$chartContainer;

      if ((!isWebkit && !isFf) || isEdge) {
        getWindow().navigator.msSaveBlob(canvas.msToBlob(), exportFilename + '.png');
      } else {
        var selector = '.download-btn' + (that.options.chartClass !== '' ? '.' + that.options.chartClass : '');

        if (!$chartContainer.find(selector).length) {
          $chartContainer.append('<a class="download-btn' + (that.options.chartClass !== '' ? ' ' + that.options.chartClass : '') + '"'
                                 + ' download="' + exportFilename + '.png"></a>');
        }

        $chartContainer.find(selector).attr('href', canvas.toDataURL())[0].click();
      }
    },
    //
    export: function (exportFilename, exportFileextension) {
      var that = this;
      exportFilename = (typeof exportFilename !== 'undefined') ?  exportFilename : this.options.exportFilename;
      exportFileextension = (typeof exportFileextension !== 'undefined') ?  exportFileextension : this.options.exportFileextension;
      if ($(this).children('.spinner').length) {
        return false;
      }
      var $chartContainer = this.$chartContainer;
      var $mask = $chartContainer.find('.mask');
      if (!$mask.length) {
        $chartContainer.append(`<div class="mask"><i class="${this.options.icons.theme} ${this.options.icons.spinner} spinner"></i></div>`);
      } else {
        $mask.removeClass('hidden');
      }
      var sourceChart = $chartContainer.addClass('canvasContainer').find('.orgchart:not(".hidden")').get(0);
      var flag = that.options.direction === 'l2r' || that.options.direction === 'r2l';
      html2canvas(sourceChart, {
        'width': flag ? sourceChart.clientHeight : sourceChart.clientWidth,
        'height': flag ? sourceChart.clientWidth : sourceChart.clientHeight,
        'onclone': function (cloneDoc) {
          $(cloneDoc).find('.canvasContainer').css('overflow', 'visible')
            .find('.orgchart:not(".hidden"):first').css('transform', '');
        }
      })
      .then(function (canvas) {
        $chartContainer.find('.mask').addClass('hidden');

        if (exportFileextension.toLowerCase() === 'pdf') {
          that.exportPDF(canvas, exportFilename);
        } else {
          that.exportPNG(canvas, exportFilename);
        }

        $chartContainer.removeClass('canvasContainer');
      }, function () {
        $chartContainer.removeClass('canvasContainer');
      });
    }
  };

  OrgChart.$ = $;
  OrgChart.utils = { $: $ };
  if (!getWindow().$) {
    getWindow().$ = $;
  }
  if (!getWindow().jQuery) {
    getWindow().jQuery = $;
  }
  return OrgChart;
}));
