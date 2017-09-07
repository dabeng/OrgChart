const should = require('chai').should();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM('<!doctype html><html><body><div id="chart-container"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
const $ = require('jquery');
require('../src/js/jquery.orgchart');

describe('orgchart', function () {

  let $container = $('#chart-container');
  let  datascource = {
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'name': 'Bo Miao', 'title': 'department manager' },
      { 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'name': 'Pang Pang', 'title': 'engineer' },
              { 'name': 'Xiang Xiang', 'title': 'UE engineer' }
            ]
          }
        ]
      },
      { 'name': 'Hong Miao', 'title': 'department manager' },
      { 'name': 'Chun Miao', 'title': 'department manager' }
    ]
  };

  beforeEach(function () {
    let oc = $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title'
    });
  });
    
  afterEach(function () {
    $container.empty();
  });

  it('There will be an orgchart embeded in the container div after initialization', function () {
    let $chart = $container.find('.orgchart');

    $chart.length.should.equal(1);
  });
});