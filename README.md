![OrgChart](http://dabeng.github.io/OrgChart/img/orgchart-heading.png)
With the help of DOM, jQuery and CSS3 transition, we got a simple and direct organization chart plugin. In fact, anytime you want a tree-like hierarchical structure, you can turn to OrgChart.

## Foreword
- First of all, thanks a lot for [wesnolte](https://github.com/wesnolte)'s great work:blush: -- [jOrgChart](https://github.com/wesnolte/jOrgChart). The thought that using nested tables to build out the tree-like orgonization chart is amazing. This idea is more simple and direct than its counterparts based on svg.
- Unfortunately, it's long time not to see the update of jOrgChart. on the other hand, I got some interesting ideas to add, so I choose to create a new repo.
- Font Awesome provides us with administration icon, second level menu icon and loading spinner.

## Features
- Supports both local data and remote data (JSON).
- Smooth expand/collapse effects based on CSS3 transitions.
- Align the chart in 4 orientations.
- Allows user to change orgchart structure by drag/drop nodes.
- Allows user to edit orgchart dynamically and save the final hierarchy as a JSON object.
- Supports exporting chart as a picture.
- Supports pan and zoom

## Installation
Of course, you can directly use the standalone build by including dist/js/jquery.orgchart.js and dist/css/jquery.orgchart.css in your webapp. 
### Install with Bower
```
# From version 1.0.2 on, users can install orgchart and add it to bower.json dependencies 
$ bower install orgchart
```

### Install with npm
```
# From version 1.0.4 on, users can install orgchart with npm 
$ npm install orgchart
```
require('orgchart') will load orgchart plugin onto the jQuery object. The orgchart module itself does not export anything.

## [Demo](http://dabeng.github.io/OrgChart/)
- **[using ul datasource](http://dabeng.github.io/OrgChart/ul-datasource/)**(this feature comes from [Tobyee's good idea:blush:](https://github.com/dabeng/OrgChart/issues/1))
```html
<!-- wrap the text node with <a href="#"> , <span>, blabla is also OK. Note:text node must immediately follow the <li> tag, with no intervening characters of any kind.  -->
<ul id="ul-data">
  <li>Lao Lao
    <ul>
      <li>Bo Miao</li>
      <li>Su Miao
        <ul>
          <li>Tie Hua</li>
          <li>Hei Hei
            <ul>
              <li>Pang Pang</li>
              <li>Xiang Xiang</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```
```js
$('#chart-container').orgchart({
  'data' : $('#ul-data')
});
```
![ul datasource](http://dabeng.github.io/OrgChart/ul-datasource/snapshot.png)

- **[using local datasource](http://dabeng.github.io/OrgChart/local-datasource/)**
```js
// sample of core source code
var datascource = {
  'name': 'Lao Lao',
  'title': 'general manager',
  'children': [
    { 'name': 'Bo Miao', 'title': 'department manager' },
    { 'name': 'Su Miao', 'title': 'department manager',
      'children': [
        { 'name': 'Tie Hua', 'title': 'senior engineer' },
        { 'name': 'Hei Hei', 'title': 'senior engineer' }
      ]
    },
    { 'name': 'Hong Miao', 'title': 'department manager' },
    { 'name': 'Chun Miao', 'title': 'department manager' }
  ]
};
    
$('#chart-container').orgchart({
  'data' : datascource,
  'depth': 2,
  'nodeContent': 'title'
});
```
![local datasource](http://dabeng.github.io/OrgChart/local-datasource/recorder.gif)

- **[I wanna pan&zoom the orgchart](http://dabeng.github.io/OrgChart/pan-zoom/)**

![pan & zoom](http://dabeng.github.io/OrgChart/pan-zoom/recorder.gif)

- **I wanna align orgchart with different orientation**(this feature comes from [the good idea of fvlima and badulesia :blush:](https://github.com/dabeng/OrgChart/issues/5))

  Top to Bottom -- default direction, as you can see all other examples on this page.
  
  [Bottom to Top](http://dabeng.github.io/OrgChart/direction/bottom2top)
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'nodeContent': 'title',
  'direction': 'b2t'
});
```
![Bottom to Top](http://dabeng.github.io/OrgChart/direction/b2t.png)

  [Left to Right](http://dabeng.github.io/OrgChart/direction/left2right)
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'nodeContent': 'title',
  'direction': 'l2r'
});
```
![Left to Right](http://dabeng.github.io/OrgChart/direction/l2r.png)

  [Right to Left](http://dabeng.github.io/OrgChart/direction/right2left)
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
  'nodeContent': 'title',
  'direction': 'r2l'
});
```
![Right to Left](http://dabeng.github.io/OrgChart/direction/r2l.png)

- **[I wanna load datasource through ajax](http://dabeng.github.io/OrgChart/ajax-datasource/)**
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : '/orgchart/initdata',
  'depth': 2,
  'nodeContent': 'title'
});
```
![ajax datasource](http://dabeng.github.io/OrgChart/ajax-datasource/recorder.gif)

- **[I wanna load data on-demand](http://dabeng.github.io/OrgChart/ondemand-loading-data/)**

Note: when users use ajaxURL option to build orghchart, they must use json datasource(both local and remote are OK) and set the relationship property of datasource by themselves. All of these staff are used to generate the correct expanding/collapsing arrows for nodes.
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
  'position': [-87.6297980, 41.8781140],
  'children': [
    { 'name': 'Bo Miao', 'title': 'Administration  Dept.', 'position': [-83.0457540, 42.3314270]},
    { 'name': 'Yu Jie', 'title': 'Product Dept.', 'position': [-71.0588800, 42.3600820]},
    { 'name': 'Yu Tie', 'title': 'Marketing Dept.', 'position': [-80.1917900, 25.7616800] }
  ]
};

$('#chart-container').orgchart({
  'data' : datascource,
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

With the help of exposed core methods(addParent(), addSiblings(), addChildren(), removeNodes()) of orgchart plugin, we can finish this task easily.
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datascource,
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

- **[I wanna drag & drop the nodes of orgchart](http://dabeng.github.io/OrgChart/drag-drop/)**

Users are allowed to drag & drop the nodes of orgchart when option "draggable" is assigned to true.

![drag & drop](http://dabeng.github.io/OrgChart/drag-drop/recorder.gif)

- **[I want a method that can decribe the hierarchy of orgchart](http://dabeng.github.io/OrgChart/get-hierarchy/)**

That's where getHierarchy() comes in.
```html
<ul id="ul-data">
  <li id="1">Lao Lao
    <ul>
      <li id="2">Bo Miao</li>
      <li id="3">Su Miao
        <ul>
          <li id="4">Tie Hua</li>
          <li id="5">Hei Hei
            <ul>
              <li id="6">Pang Pang</li>
              <li id="7">Xiang Xiang</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>
```
```js
$('#chart-container').orgchart({
  'data' : $('#ul-data')
});

$('#btn-export-hier').on('click', function() {
  var hierarchy = $('#chart-container').orgchart('getHierarchy');
  $(this).after('<pre>').next().append(JSON.stringify(hierarchy, null, 2));
});
```
![get hierarchy](http://dabeng.github.io/OrgChart/get-hierarchy/snapshot.png)

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
  'relationship': relationshipValue, // Note: when you activate ondemand loading nodes feature,
  // you should use json datsource (local or remote) and set this property.
  // This property implies that whether this node has parent node, siblings nodes or children nodes. 
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
      <td>panzoom</td><td>boolean</td><td>no</td><td>false</td><td>Users could pan the orgchart by mouse drag&drop, zoomin/zoomout the orgchart by mouse wheel if they enable this option.</td>
    </tr>
    <tr>
      <td>direction</td><td>string</td><td>no</td><td>"t2b"</td><td>The available values are t2b(implies "top to bottom", it's default value), b2t(implies "bottom to top"), l2r(implies "left to right"), r2l(implies "right to left").</td>
    </tr>
    <tr>
      <td>ajaxURL</td><td>json</td><td>no</td><td></td><td>It inclueds four properites -- parent, children, siblings, families(ask for parent node and siblings nodes). As their names imply, different propety indicates the URL to which ajax request for different nodes is sent.</td>
    </tr>
    <tr>
      <td>depth</td><td>positive integer</td><td>no</td><td>999</td><td>It indicates the level that at the very beginning orgchart is expanded to.</td>
    </tr>
    <tr>
      <td>nodeChildren</td><td>string</td><td>no</td><td>"children"</td><td>It sets one property of datasource as children nodes collection.</td>
    </tr>
    <tr>
      <td>nodeTitle</td><td>string</td><td>no</td><td>"name"</td><td>It sets one property of datasource as text content of title section of orgchart node. In fact, users can create a simple orghcart with only nodeTitle option.</td>
    </tr>
    <tr>
      <td>parentNodeSymbol</td><td>string</td><td>no</td><td>"fa-users"</td><td>Using font awesome icon to imply that the node has child nodes.</td>
    </tr>
    <tr>
      <td>nodeContent</td><td>string</td><td>no</td><td></td><td>It sets one property of datasource as text content of content section of orgchart node.</td>
    </tr>
    <tr>
      <td>nodeId</td><td>string</td><td>no</td><td>"id"</td><td>It sets one property of datasource as unique identifier of every orgchart node.</td>
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
      <td>chartClass</td><td>string</td><td>no</td><td>""</td><td>when you wanna instantiate multiple orgcharts on one page, you should add diffent classname to them in order to distinguish them.</td>
    </tr>
    <tr>
      <td>draggable</td><td>boolean</td><td>no</td><td>false</td><td>Users can drag & drop the nodes of orgchart if they enable this option</td>
    </tr>
  </tbody>
</table>

### Methods
I'm sure that you can grasp the key points of the methods below after you try out demo -- [edit orgchart](http://dabeng.github.io/OrgChart/edit-orgchart/).
##### $container.orgchart(options)
Embeds an organization chart in designated container. Accepts an options object and you can go through the "options" section to find which options are required.
##### .orgchart('addParent', data, opts)
Adds parent node(actullay it's always root node) for current orgchart.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>data</td><td>json object</td><td>yes</td><td></td><td>datasource for building root node</td></tr>
    <tr><td>opts</td><td>json object</td><td>no</td><td>initial options of current orgchart</td><td>options used for overriding initial options</td></tr>
  </tbody>
</table>
##### .orgchart('addSiblings', $node, data, opts)
Adds sibling nodes for designated node.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>we'll add sibling nodes based on this node</td></tr>
    <tr><td>data</td><td>json object</td><td>yes</td><td></td><td>datasource for building sibling nodes</td></tr>
    <tr><td>opts</td><td>json object</td><td>no</td><td>initial options of current orgchart</td><td>options used for overriding initial options</td></tr>
  </tbody>
</table>
##### .orgchart('addChildren', $node, data, opts）
Adds child nodes for designed node.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>we'll add child nodes based on this node</td></tr>
    <tr><td>data</td><td>json object</td><td>yes</td><td></td><td>datasource for building child nodes</td></tr>
    <tr><td>opts</td><td>json object</td><td>no</td><td>initial options of current orgchart</td><td>options used for overriding initial options</td></tr>
  </tbody>
</table>
##### .orgchart('removeNodes', $node）
Removes the designated node and its descedant nodes.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>node to be removed</td></tr>
  </tbody>
</table>
##### .orgchart('getHierarchy'）
This method is designed to get the hierarchy relationships of orgchart for further processing. For example, after editing the orgchart, you could send the returned value of this method to server-side and save the new statte of orghcart. 

## Browser Compatibility
- Chrome 19+
- Firefox 4+
- Safari 6+
- Opera 15+
- IE 11+
