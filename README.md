![OrgChart](http://dabeng.github.io/OrgChart/img/orgchart-heading.png)

# [Perhaps you'd prefer the native javascript(ES6) version](http://github.com/dabeng/OrgChart.js)
# [Perhaps you'd prefer the Web Components version](http://github.com/dabeng/OrgChart-Webcomponents)

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
- Supports exporting chart as a picture or pdf document.
- Supports pan and zoom
- Users can adopt multiple solutions to build up a huge organization chart(please refer to multiple-layers or hybrid layout sections)
- touch-enabled plugin for mobile divice

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
var datasource = {
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
  'data' : datasource,
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
  'data' : datasource,
  'nodeContent': 'title',
  'direction': 'b2t'
});
```
![Bottom to Top](http://dabeng.github.io/OrgChart/direction/b2t.png)

  [Left to Right](http://dabeng.github.io/OrgChart/direction/left2right)
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'nodeContent': 'title',
  'direction': 'l2r'
});
```
![Left to Right](http://dabeng.github.io/OrgChart/direction/l2r.png)

  [Right to Left](http://dabeng.github.io/OrgChart/direction/right2left)
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'nodeContent': 'title',
  'direction': 'r2l'
});
```
![Right to Left](http://dabeng.github.io/OrgChart/direction/r2l.png)

- **[I wanna show/hide left/right sibling nodes respectively by clicking left/right arrow](http://dabeng.github.io/OrgChart/toggle-sibs-resp/)**
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'nodeContent': 'title',
  'toggleSiblingsResp': true
});
```
![toggle siblings respectively](http://dabeng.github.io/OrgChart/toggle-sibs-resp/recorder.gif)

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
var datasource = {
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
  // It would be helpful to have functions instead of URLs for the AJAX fetching
  // as it would allow a more flexible treatment of the results.
  'siblings': function(nodeData) {
    return '/orgchart/siblings/' + nodeData.id;
  },
  'families': function(nodeData) {
    return '/orgchart/families/' + nodeData.id;
  }
};

$('#chart-container').orgchart({
  'data' : datasource,
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
  'data' : datasource,
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
  'data' : datasource,
  'depth': 2,
  'nodeContent': 'title',
  'exportButton': true,
  'exportFilename': 'MyOrgChart'
});
```
![export orgchart](http://dabeng.github.io/OrgChart/export-orgchart/recorder.gif)

Besides, if you wanna export a pdf format, you need to introduce jspdf as shown bellow:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.debug.js"></script>
```
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'depth': 2,
  'nodeContent': 'title',
  'exportButton': true,
  'exportFilename': 'MyOrgChart',
  'exportFileextension': 'pdf'
});
```
**Note:**

(1) if you wanna export something in IE or Edge, please introduce [es6-promise.auto.js](https://github.com/stefanpenner/es6-promise) firstly.

(2) if your OS is windows, please check your display scaling settings. For the perfact exported picture, you'd better adjust "Change the size of text, apps, and other items" to 100%.(thanks for [sayamkrai](https://github.com/sayamkrai)'s [exploration](https://github.com/dabeng/OrgChart/issues/152))

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

var datasource = {
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
  'data' : datasource,
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
  'data' : datasource,
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

Users are allowed to drag & drop the nodes of orgchart when option "draggable" is assigned to true(**Note**: this feature doesn't work on IE due to its poor support for HTML5 drag & drop API).

![drag & drop](http://dabeng.github.io/OrgChart/drag-drop/recorder.gif)

Furthermore, users can make use of option dropCriteria to inject their custom limitations on drag & drop. As shown below, we don't want an manager employee to be under a engineer under no circumstance.
```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'nodeContent': 'title',
  'draggable': true,
  'dropCriteria': function($draggedNode, $dragZone, $dropZone) {
    if($draggedNode.find('.content').text().indexOf('manager') > -1 && $dropZone.find('.content').text().indexOf('engineer') > -1) {
      return false;
    }
    return true;
  }
})
```

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

- **[I want a color-coded chart](http://dabeng.github.io/OrgChart/color-coded/)**

It's a so easy task, we just need to append id or className property to node data.
```js
var datasource = {
  'name': 'Lao Lao',
  'title': 'general manager',
  'className': 'top-level',
  'children': [
    { 'name': 'Bo Miao', 'title': 'department manager', 'className': 'middle-level',
      'children': [
        { 'name': 'Li Jing', 'title': 'senior engineer', 'className': 'bottom-level' },
        { 'name': 'Li Xin', 'title': 'senior engineer', 'className': 'bottom-level' }
      ]
    }
  };
```
```css
.orgchart .top-level .title {
  background-color: #006699;
}
.orgchart .top-level .content {
  border-color: #006699;
}
.orgchart .middle-level .title {
  background-color: #009933;
}
.orgchart .middle-level .content {
  border-color: #009933;
}
.orgchart .bottom-level .title {
  background-color: #993366;
}
.orgchart .bottom-level .content {
  border-color: #993366;
}
```
![color coded](http://dabeng.github.io/OrgChart/color-coded/snapshot.png)

- **[I want a multiple-layers chart](http://dabeng.github.io/OrgChart/multiple-layers/)**

In fact, this is a wonderful solution to display a orgchart which includes a huge number of node data.

![multiple layers](http://dabeng.github.io/OrgChart/multiple-layers/recorder.gif)

- **[I want a hybrid(horizontal + vertical) chart](http://dabeng.github.io/OrgChart/vertical-depth/)**

This feature is inspired by the issues([Aligning Children Vertical](https://github.com/dabeng/OrgChart/issues/46), [Hybrid(horizontal + vertical) OrgChart](https://github.com/dabeng/OrgChart/issues/61)). Thank [mfahadi](https://github.com/mfahadi) and [Destructrix](https://github.com/Destructrix) for their constructive suggestions:blush: Special thanks to [tedliang](https://github.com/tedliang) for his wonderful hybrid mode solution.

From now on, users never have to worry about how to align a huge of nodes in one screen of browser. The option "verticalDepth" allows users to align child nodes vertically from the given depth.

**Note**: currently, this option is incompatible with many other options or methods, like direction, drag&drop, addChildren(), removeNodes(), getHierarchy() and so on. These conflicts will be solved one by one in the later versions.

```js
// sample of core source code
$('#chart-container').orgchart({
  'data' : datasource,
  'nodeContent': 'title',
  'verticalDepth': 3, // From the 3th level of orgchart, nodes will be aligned vertically.
  'depth': 4
});
```

![hybrid layout](http://dabeng.github.io/OrgChart/vertical-depth/snapshot.png)

- **[I want to collapse some nodes by default](http://dabeng.github.io/OrgChart/default-collapsed/)**

No problem. You just need to adjust a little detail of datasource with the help of option "collapse" and className "slide-up".

```js
// sample of core source code
var datascource = {
  'name': 'Lao Lao',
  'title': 'general manager',
  'children': [
    { 'name': 'Bo Miao', 'title': 'department manager', 'collapsed': true,
      'children': [
        { 'name': 'Li Jing', 'title': 'senior engineer', 'className': 'slide-up' },
        { 'name': 'Li Xin', 'title': 'senior engineer', 'collapsed': true, 'className': 'slide-up',
          'children': [
            { 'name': 'To To', 'title': 'engineer', 'className': 'slide-up' },
            { 'name': 'Fei Fei', 'title': 'engineer', 'className': 'slide-up' },
            { 'name': 'Xuan Xuan', 'title': 'engineer', 'className': 'slide-up' }
          ]
        }
      ]
    },
    { 'name': 'Su Miao', 'title': 'department manager',
      'children': [
        { 'name': 'Pang Pang', 'title': 'senior engineer' },
        { 'name': 'Hei Hei', 'title': 'senior engineer', 'collapsed': true,
          'children': [
            { 'name': 'Xiang Xiang', 'title': 'UE engineer', 'className': 'slide-up' },
            { 'name': 'Dan Dan', 'title': 'engineer', 'className': 'slide-up' },
            { 'name': 'Zai Zai', 'title': 'engineer', 'className': 'slide-up' }
          ]
        }
      ]
    }
  ]
};
```

## Usage

### Instantiation Statement
```js
$('#chartContainerId').orgchart(options);
```

### Structure of Datasource
```js
{
  'id': 'rootNode', // It's a optional property which will be used as id attribute of node
  // and data-parent attribute, which contains the id of the parent node
  'collapsed': true, // By default, the children nodes of current node is hidden.
  'className': 'top-level', // It's a optional property which will be used as className attribute of node.
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
      <td>pan</td><td>boolean</td><td>no</td><td>false</td><td>Users could pan the orgchart by mouse drag&drop if they enable this option.</td>
    </tr>
    <tr>
      <td>zoom</td><td>boolean</td><td>no</td><td>false</td><td>Users could zoomin/zoomout the orgchart by mouse wheel if they enable this option.</td>
    </tr>
    <tr>
      <td>zoominLimit</td><td>number</td><td>no</td><td>7</td><td>Users are allowed to set a zoom-in limit.</td>
    </tr>
    <tr>
      <td>zoomoutLimit</td><td>number</td><td>no</td><td>0.5</td><td>Users are allowed to set a zoom-out limit.</td>
    </tr>
    <tr>
      <td>direction</td><td>string</td><td>no</td><td>"t2b"</td><td>The available values are t2b(implies "top to bottom", it's default value), b2t(implies "bottom to top"), l2r(implies "left to right"), r2l(implies "right to left").</td>
    </tr>
    <tr>
      <td>verticalDepth</td><td>integer</td><td>no</td><td></td><td>Users can make use of this option to align the nodes vertically from the specified depth.</td>
    </tr>
    <tr>
      <td>toggleSiblingsResp</td><td>boolean</td><td>no</td><td>false</td><td>Once enable this option, users can show/hide left/right sibling nodes respectively by clicking left/right arrow.</td>
    </tr>
    <tr>
      <td>ajaxURL</td><td>json</td><td>no</td><td></td><td>It inclueds four properites -- parent, children, siblings, families(ask for parent node and siblings nodes). As their names imply, different propety provides the URL to which ajax request for different nodes is sent.</td>
    </tr>
    <tr>
      <td>depth</td><td>positive integer</td><td>no</td><td>999</td><td>It indicates the level that at the very beginning orgchart is expanded to.</td>
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
      <td>exportFileextension</td><td>string</td><td>no</td><td>"png"</td><td>Available values are png and pdf.</td>
    </tr>
    <tr>
      <td>chartClass</td><td>string</td><td>no</td><td>""</td><td>when you wanna instantiate multiple orgcharts on one page, you should add diffent classname to them in order to distinguish them.</td>
    </tr>
    <tr>
      <td>draggable</td><td>boolean</td><td>no</td><td>false</td><td>Users can drag & drop the nodes of orgchart if they enable this option. **Note**: this feature doesn't work on IE due to its poor support for HTML5 drag & drop API.</td>
    </tr>
    <tr>
      <td>dropCriteria</td><td>function</td><td>no</td><td></td><td>Users can construct their own criteria to limit the relationships between dragged node and drop zone. Furtherly, this function accept three arguments(draggedNode, dragZone, dropZone) and just only return boolen values.</td>
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
This method is designed to get the hierarchy relationships of orgchart for further processing. For example, after editing the orgchart, you could send the returned value of this method to server-side and save the new state of orghcart.
##### .orgchart('hideParent',$node)
This method allows you to hide programatically the parent node of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to hide its parent node. Of course, its sibling nodes will be hidden at the same time</td>
  </tr>
</table>
##### .orgchart('showParent',$node)
This method allows you to show programatically the parent node of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to show its parent node</td>
  </tr>
</table>
##### .orgchart('hideChildren',$node)
This method allows you to hide programatically the children of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to hide its children nodes</td>
  </tr>
</table>
##### .orgchart('showChildren',$node)
This method allows you to show programatically the children of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to show its children nodes</td>
  </tr>
</table>
##### .orgchart('hideSiblings',$node,direction)
This method allows you to hide programatically the siblings of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to hide its siblings nodes</td>
  </tr>
  <tr>
    <td>direction</td>
    <td>string</td>
    <td>No</td>
    <td>None</td>
    <td>Possible values:"left","rigth". Specifies if hide the siblings at left or rigth. If not defined hide both of them.</td>
  </tr>
</table>
##### .orgchart('showSiblings',$node,direction)
This method allows you to show programatically the siblings of any specific node(.node element), if it has
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to show its siblings nodes</td>
  </tr>
  <tr>
    <td>direction</td>
    <td>string</td>
    <td>No</td>
    <td>None</td>
    <td>Possible values:"left","rigth". Specifies if hide the siblings at left or rigth. If not defined hide both of them.</td>
  </tr>
</table>
##### .orgchart('getNodeState',$node,relation)
This method returns you the display state of related node of the specified node.
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to know its related nodes' display state.</td>
  </tr>
  <tr>
    <td>relation</td>
    <td>String</td>
    <td>Yes</td>
    <td>None</td>
    <td>Possible values: "parent", "children" and "siblings". Specifies the desired relation to return.</td>
  </tr>
</table>
The returning object will have the next structure:
```js
{
  "exist": true|false,  //Indicates if has parent|children|siblings
  "visible":true|false,  //Indicates if the relationship nodes are visible
}
```
##### .orgchart('getRelatedNodes',$node,relation)
This method returns you the nodes related to the specified node
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$node</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's the desired JQuery Object to know its related nodes</td>
  </tr>
  <tr>
    <td>relation</td>
    <td>String</td>
    <td>Yes</td>
    <td>None</td>
    <td>Possible values: "parent", "children" and "siblings". Specifies the desired relation to return.</td>
  </tr>
</table>

### Events
<table>
  <thead>
    <tr><th>Event Type</th><th>Attached Data</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>nodedropped.orgchart</td><td>draggedNode, dragZone, dropZone</td><td>The event's handler is where you can place your customized function after node drop over. For more details, please refer to <a target="_blank" href="http://dabeng.github.io/OrgChart/drag-drop/">example drag & drop</a>.</td></tr>
  </tbody>
</table>

### Tips
**How can I deactivate expand/collapse feature of orgchart?**

This use case is inspired by the [issue](https://github.com/dabeng/OrgChart/issues/25). Thanks [der-robert](https://github.com/der-robert) and [ActiveScottShaw](https://github.com/ActiveScottShaw) for their constructive discussions:blush:

Users can enable/disable exapand/collapse feature with className "noncollapsable" as shown below.
```js
$('.orgchart').addClass('noncollapsable'); // deactivate

$('.orgchart').removeClass('noncollapsable'); // activate
```

**How can I search nodes and show the minimized chart?**

This use case is inspired by the [issue](https://github.com/dabeng/OrgChart/issues/78). Thanks [Mmannem](https://github.com/Mmannem) for his constructive discussions:blush:
The following statements show the core logic and this is the complete [demo - filter node](http://dabeng.github.io/OrgChart/filter-node).
```js
var $chart = $('.orgchart');
// disalbe the expand/collapse feture
$chart.addClass('noncollapsable');
// distinguish the matched nodes and the unmatched nodes according to the given key word
$chart.find('.node').filter(function(index, node) {
    return $(node).text().toLowerCase().indexOf(keyWord) > -1;
  }).addClass('matched')
  .closest('table').parents('table').find('tr:first').find('.node').addClass('retained');
// hide the unmatched nodes
$chart.find('.matched,.retained').each(function(index, node) {
  var $unmatched = $(node).closest('table').parent().siblings().find('.node:first:not(.matched,.retained)')
    .closest('table').parent().addClass('hidden');
  $unmatched.parent().prev().children().slice(1, $unmatched.length * 2 + 1).addClass('hidden');
});
// hide the redundant descendant nodes of the matched nodes
$chart.find('.matched').each(function(index, node) {
  if (!$(node).closest('tr').siblings(':last').find('.matched').length) {
    $(node).closest('tr').siblings().addClass('hidden');
  }
});
```

**Why is the root node gone?**

When I have a huge orgchart with enabled "pan" option, if I hide all the children of one of the topmost parents then the chart disappear from screen. It seems that we need to add a reset button to keep the chart visible.
For details, please refer to the [issue](https://github.com/dabeng/OrgChart/issues/85) opened by [manuel-84](https://github.com/manuel-84) :blush:

Users can embed any clear up logics into the click handler of the reset buttton as shown below.
```js
$('.orgchart').css('transform',''); // remove the tansform settings
```

## Browser Compatibility
- Chrome 19+
- Firefox 4+
- Safari 6+
- Opera 15+
- IE 10+

## Work Show
[I love NBA.](http://codepen.io/dabeng/full/aZzEVJ/)
![2016 NBA Playoff](http://dabeng.github.io/OrgChart/img/2016nba/2016-nba-playoff.png)

We thank [JordiCorbilla](https://github.com/JordiCorbilla):blush: for his sharing [how to save datasource after chart editing](https://github.com/dabeng/OrgChart/issues/34).
![save datasource](https://cloud.githubusercontent.com/assets/7347994/16707530/d7e206ca-45c9-11e6-9a93-5b29840de272.png)
