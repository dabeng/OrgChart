# OrgChart
With the help of DOM, jQuery and CSS3 transition, we got a simple and direct organization chart plugin.

## Notes
- First of all, thanks a lot for [wesnolte](https://github.com/wesnolte)'s great work -- [jOrgChart](https://github.com/wesnolte/jOrgChart). The thought that using nested tables to build out the tree-like orgonization chart is amazing. This idea is more simple and direct than its counterparts based on svg.
- Unfortunately, it's long time not to see the update of jOrgChart. on the other hand, I don't think "drag and drop" functinality is necessary for organization chart plugin, because in real life, there is no such unsecure demand that allowing users to change company's organization chart randomly with manual mode. We all konw the importance and seriousness of a organization chart for a company. Due to all these stuff, I choose to create a new repo.
- Font Awesome provides us with administration icon, second level menu icon and loading spinner.

## Demo
- **[using local datasource](http://dabeng.github.io/OrgChart/local-datasource/)**
```js
// sample of core source code
var datascource = {
  'name': 'Lao Lao',
  'title': 'general manager',
  'relationship': '001',
  'children': [
    { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': '110' },
    { 'name': 'Su Miao', 'title': 'department manager', 'relationship': '111',
      'children': [
        { 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': '110' },
        { 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': '110' }
      ]
    },
    { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': '110' }
  ]
};
    
$('#chart-container').orgchart({
  'data' : datascource,
  'depth': 2,
  'nodeTitle': 'name',
  'nodeContent': 'title'
});
```
![local datasource](http://dabeng.github.io/OrgChart/local-datasource/recorder.gif)

- **[I wanna load datasource through ajax](http://dabeng.github.io/OrgChart/ajax-datasource/)**
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : '/orgchart/initdata',
  'depth': 2,
  'nodeTitle': 'name',
  'nodeContent': 'title'
});
```
![ajax datasource](http://dabeng.github.io/OrgChart/ajax-datasource/recorder.gif)

- **[I wanna load data on-demand](http://dabeng.github.io/OrgChart/ondemand-loading-data/)**
```js
// sample of core source code
var datascource = {
  'id': '1',
  'name': 'Su Miao',
  'title': 'department manager',
  'relationship': '111',
  'children': [
    { 'id': '2','name': 'Tie Hua', 'title': 'senior engineer', 'relationship': '110' },
    { 'id': '3','name': 'Hei Hei', 'title': 'senior engineer', 'relationship': '111' }
  ]
};

var ajaxURLs = {
  'children': '/orgchart/children/',
  'parent': '/orgchart/parent/',
  'siblings': '/orgchart/siblings/',
  'families': '/orgchart/families/' 
};

$('#chart-container').orgchart({
  'data' : datascource,
  'ajaxURL': ajaxURLs,
  'nodeTitle': 'name',
  'nodeContent': 'title',
  'nodeId': 'id'
});
```
![on-demand loading data](http://dabeng.github.io/OrgChart/ondemand-loading-data/recorder.gif)

- **[I wanna customize the structure of node](http://dabeng.github.io/OrgChart/option-createNode/)**
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'depth': 2,
  'nodeTitle': 'name',
  'nodeContent': 'title',
  'nodeID': 'id',
  'createNode': function($node, data) {
    var secondMenuIcon = $('<i>', {
      'class': 'fa fa-info-circle second-menu-icon',
      click: function() {
        $(this).siblings('.second-menu').toggle();
      }
    });
    var secondMenu = '<div class="second-menu"><img class="avatar" src="../img/avatar/' + data.id + '.jpg"></div>';
    $node.append(secondMenuIcon).append(secondMenu);
  }
});
```
![option--createNode](http://dabeng.github.io/OrgChart/option-createNode/recorder.gif)

- **[I wanna export the organization chart as a picture](http://dabeng.github.io/OrgChart/export-orgchart/)**

Here, we need the help from [html2canvas](https://github.com/niklasvh/html2canvas).
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'depth': 2,
  'nodeTitle': 'name',
  'nodeContent': 'title',
  'exportButton': true,
  'exportFilename': 'MyOrgChart'
});
``` 
![export orgchart](http://dabeng.github.io/OrgChart/export-orgchart/recorder.gif)

- **[I wanna itegrate organization chart with geographic information](http://dabeng.github.io/OrgChart/integrate-map/)**

Here, we fall back on [OpenLayers](https://github.com/openlayers/ol3). It's the most aewsome open-source js library for Web GIS you sholdn't miss.
```js
// sample of core source code
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'watercolor'
      }),
      preload: 4
    }),
    new ol.layer.Tile({
      source: new ol.source.Stamen({
        layer: 'terrain-labels'
      }),
      preload: 1
    })
  ],
  target: 'pageBody',
  view: new ol.View({
    center: ol.proj.transform([-87.6297980, 41.8781140], 'EPSG:4326', 'EPSG:3857'),
    zoom: 10
  })
});
$('body').prepend(map.getViewport());

var datascource = {
  'name': 'Lao Lao',
  'title': 'President Office',
  'relationship': '001',
  'position': [-87.6297980, 41.8781140],
  'children': [
    { 'name': 'Bo Miao', 'title': 'Administration  Dept.', 'relationship': '110', 'position': [-83.0457540, 42.3314270]},
    { 'name': 'Yu Jie', 'title': 'Product Dept.', 'relationship': '110', 'position': [-71.0588800, 42.3600820]},
    { 'name': 'Yu Tie', 'title': 'Marketing Dept.', 'relationship': '110', 'position': [-80.1917900, 25.7616800] }
  ]
};

$('#chart-container').orgchart({
  'data' : datascource,
  'nodeTitle': 'name',
  'nodeContent': 'title',
  'createNode': function($node, data) {
    $node.on('click', function() {
      var view = map.getView();
      var duration = 2000;
      var start = +new Date();
      var pan = ol.animation.pan({
        duration: duration,
        source:  view.getCenter(),
        start: start
      });
      var bounce = ol.animation.bounce({
        duration: duration,
        resolution: 4 * view.getResolution(),
        start: start
      });
      map.beforeRender(pan, bounce);
      view.setCenter(ol.proj.transform(data.position, 'EPSG:4326', 'EPSG:3857'));
    });
  }
});
``` 
![integrate map](http://dabeng.github.io/OrgChart/integrate-map/recorder.gif)

- **[I wanna edit orgchart](http://dabeng.github.io/OrgChart/edit-orgchart/)**

With the help of exposed core methods of orgchart plugin, we can finish this task easily.
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'nodeTitle': 'name',
  'exportButton': true,
  'exportFilename': 'SportsChart',
  'parentNodeSymbol': 'fa-th-large',
  'createNode': function($node, data) {
    $node.on('click', function(event) {
      if (!$(event.target).is('.edge')) {
        $('#selected-node').val(data.name).data('node', $node);
      }
    });
  }
})
.on('click', '.orgchart', function(event) {
  if (!$(event.target).closest('.node').length) {
    $('#selected-node').val('');
  }
});

$('#btn-add-nodes').on('click', function() {
  var nodeVals = [];
  $('#new-nodelist').find('.new-node').each(function(index, item) {
    var validVal = item.value.trim();
    if (validVal.length) {
      nodeVals.push(validVal);
    }
  });
  var $node = $('#selected-node').data('node');
  var nodeType = $('input[name="node-type"]:checked');
  if (nodeType.val() === 'parent') {
    $('#chart-container').orgchart('addParent', $('#chart-container').find('.node:first'), { 'name': nodeVals[0] });
  } else if (nodeType.val() === 'siblings') {
    $('#chart-container').orgchart('addSiblings', $node,
      { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110' }; })
    });
  } else {
    var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
    if (!hasChild) {
      var rel = nodeVals.length > 1 ? '110' : '100';
      $('#chart-container').orgchart('addChildren', $node, {
          'children': nodeVals.map(function(item) {
            return { 'name': item, 'relationship': rel };
          })
        }, $.extend({}, $('#chart-container').data('orgchart').options, { depth: 0 }));
    } else {
      $('#chart-container').orgchart('addSiblings', $node.closest('tr').siblings('.nodes').find('.node:first'),
        { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110' }; })
      });
    }
  }
});

$('#btn-delete-nodes').on('click', function() {
  var $node = $('#selected-node').data('node');
  $('#chart-container').orgchart('removeNodes', $node);
  $('#selected-node').data('node', null);
});
```
![edit orgchart](http://dabeng.github.io/OrgChart/edit-orgchart/recorder.gif)

## Usage

### Instantiation Statement
```js
$('#chartContainerId').orgchart(options);
``` 

### Structure of Datasource
```js
{
  'nodeTitlePro': 'Lao Lao',
  'nodeContentPro': 'general manager',
  'relationship': relationshipValue, // The property implies that whether this node has parent node, siblings nodes or children nodes. "relationship" is just default name you can override.
  // relationshipValue is a string composed of three "0/1" identifier.
  // First character stands for wether current node has parent node;
  // Scond character stands for wether current node has siblings nodes;
  // Third character stands for wether current node has children node.
  'children': [ // The property stands for nested nodes. "children" is just default name you can override.
    { 'nodeTitlePro': 'Bo Miao', 'nodeContentPro': 'department manager', 'relationship': '110' },
    { 'nodeTitlePro': 'Su Miao', 'nodeContentPro': 'department manager', 'relationship': '111',
      'children': [
        { 'nodeTitlePro': 'Tie Hua', 'nodeContentPro': 'senior engineer', 'relationship': '110' },
        { 'nodeTitlePro': 'Hei Hei', 'nodeContentPro': 'senior engineer', 'relationship': '110' }
      ]
    },
    { 'nodeTitlePro': 'Yu Jie', 'nodeContentPro': 'department manager', 'relationship': '110' }
  ],
  'otherPro': anyValue
};
``` 

### Options
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>data</td><td>json or string</td><td>yes</td><td></td><td>datasource usded to build out structure of orgchart. It could be a json object or a string containing the URL to which the ajax request is sent.</td>
    </tr>
    <tr>
      <td>ajaxURL</td><td>json</td><td>no</td><td></td><td>It inclueds four properites -- parent, children, siblings, families(ask for parent node and siblings nodes). As their names imply, different propety indicates the URL to which ajax request for different nodes is sent.</td>
    </tr>
    <tr>
      <td>depth</td><td>positive integer</td><td>no</td><td>999</td><td>It indicates the level that at the very beginning orgchart is expanded to.</td>
    </tr>
    <tr>
      <td>nodeRelationship</td><td>string</td><td>no</td><td>"relationship"</td><td>It sets one property of datasource as a identifier which implies whether current node has parent node, siblings nodes or children nodes.</td>
    </tr>
    <tr>
      <td>nodeChildren</td><td>string</td><td>no</td><td>"children"</td><td>It sets one property of datasource as children nodes collection.</td>
    </tr>
    <tr>
      <td>nodeTitle</td><td>string</td><td>yes</td><td></td><td>It sets one property of datasource as text content of title section of orgchart node. In fact, users can create a simple orghcart with only nodeTitle option.</td>
    </tr>
    <tr>
      <td>nodeContent</td><td>string</td><td>no</td><td></td><td>It sets one property of datasource as text content of content section of orgchart node.</td>
    </tr>
    <tr>
      <td>nodeId</td><td>string</td><td>no</td><td></td><td>It sets one property of datasource as unique identifier of every orgchart node.</td>
    </tr>
    <tr>
      <td>createNode</td><td>function</td><td>no</td><td></td><td>It's a callback function used to customize every orgchart node. It recieves two parament: "$node" stands for jquery object of single node div; "data" stands for datasource of single node.</td>
    </tr>
    <tr>
      <td>exportButton</td><td>boolean</td><td>no</td><td>false</td><td>It enable the export button for orgchart.</td>
    </tr>
    <tr>
      <td>exportFilename</td><td>string</td><td>no</td><td>"Orgchart"</td><td>It's filename when you export current orgchart as a picture.</td>
    </tr>
    <tr>
      <td>chartClass</td><td>string</td><td>no</td><td></td><td>when you wanna instantiate multiple orgcharts on one page, you should add diffent classname to them in order to distinguish them.</td>
    </tr>
  </tbody>
</table>

## Browser Compatibility
- Chrome 19+
- Firefox 4+
- Safari 6+
- Opera 15+
