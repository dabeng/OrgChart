![OrgChart](http://dabeng.github.io/OrgChart/img/orgchart-heading.png)

# [Native JavaScript(ES6) Version](http://github.com/dabeng/OrgChart.js)
# [Web Components Version](http://github.com/dabeng/OrgChart-Webcomponents)

## Foreword
- First of all, thanks a lot for [wesnolte](https://github.com/wesnolte)'s great work:blush: -- [jOrgChart](https://github.com/wesnolte/jOrgChart). The thought that using nested tables to build out the tree-like orgonization chart is amazing. This idea is more simple and direct than its counterparts based on svg
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
Of course, you can directly use the standalone build by including dist/js/jquery.orgchart.js and dist/css/jquery.orgchart.css in your webapps.
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

## [Demo](https://rawgit.com/dabeng/OrgChart/master/demo/index.html)
### online demos
- [using ul datasource](https://rawgit.com/dabeng/OrgChart/master/demo/ul-datasource.html)(this feature comes from [Tobyee's good idea:blush:](https://github.com/dabeng/OrgChart/issues/1))

- [using local datasource](https://rawgit.com/dabeng/OrgChart/master/demo/local-datasource.html)

- [I wanna pan&zoom the orgchart](https://rawgit.com/dabeng/OrgChart/master/demo/pan-zoom.html)

- I wanna align orgchart with different orientation**(this feature comes from [the good idea of fvlima and badulesia :blush:](https://github.com/dabeng/OrgChart/issues/5))

  Top to Bottom -- default direction, as you can see all other examples on this page.

  [Bottom to Top](https://rawgit.com/dabeng/OrgChart/master/demo/bottom2top.html)

  [Left to Right](https://rawgit.com/dabeng/OrgChart/master/demo/left2right.html)

  [Right to Left](https://rawgit.com/dabeng/OrgChart/master/demo/right2left.html)

- [I wanna show/hide left/right sibling nodes respectively by clicking left/right arrow](https://rawgit.com/dabeng/OrgChart/master/demo/toggle-sibs-resp.html)

- [I wanna load datasource through ajax](https://rawgit.com/dabeng/OrgChart/master/demo/ajax-datasource.html)

- [I wanna load data on-demand](https://rawgit.com/dabeng/OrgChart/master/demo/ondemand-loading-data.html)

Note: when users use ajaxURL option to build orghchart, they must use json datasource(both local and remote are OK) and set the relationship property of datasource by themselves. All of these staff are used to generate the correct expanding/collapsing arrows for nodes.

- [I wanna customize the structure of node](https://rawgit.com/dabeng/OrgChart/master/demo/option-createNode.html)

- [I wanna export the organization chart as a picture](https://rawgit.com/dabeng/OrgChart/master/demo/export-chart.html)

Here, we need the help from [html2canvas](https://github.com/niklasvh/html2canvas).

**Note:**

(1) if you wanna export something in IE or Edge, please introduce [es6-promise.auto.js](https://github.com/stefanpenner/es6-promise) firstly.

(2) if your OS is windows, please check your display scaling settings. For the perfact exported picture, you'd better adjust "Change the size of text, apps, and other items" to 100%.(thanks for [sayamkrai](https://github.com/sayamkrai)'s [exploration](https://github.com/dabeng/OrgChart/issues/152))

(3) Besides, if you wanna export a pdf format or your orgchart includes picture, you have to introduce [jspdf](https://github.com/MrRio/jsPDF) and set "exportFileextension" option to "pdf".

- [I wanna itegrate organization chart with geographic information](https://rawgit.com/dabeng/OrgChart/master/demo/integrate-map.html)

Here, we fall back on [OpenLayers](https://github.com/openlayers/ol3). It's the most aewsome open-source js library for Web GIS you sholdn't miss.

- [I wanna edit orgchart](https://rawgit.com/dabeng/OrgChart/master/demo/edit-chart.html)

With the help of exposed core methods(addParent(), addSiblings(), addChildren(), removeNodes()) of orgchart plugin, we can finish this task easily.

- [I wanna drag & drop the nodes of orgchart](https://rawgit.com/dabeng/OrgChart/master/demo/drag-drop.html)

Users are allowed to drag & drop the nodes of orgchart when option "draggable" is assigned to true(**Note**: this feature doesn't work on IE due to its poor support for HTML5 drag & drop API).

Furthermore, users can make use of option dropCriteria to inject their custom limitations on drag & drop. As shown below, we don't want an manager employee to be under a engineer under no circumstance.

- [I want a method that can decribe the hierarchy of orgchart](https://rawgit.com/dabeng/OrgChart/master/demo/get-hierarchy.html)

That's where getHierarchy() comes in.

- [I want a color-coded chart](https://rawgit.com/dabeng/OrgChart/master/demo/color-coded.html)

It's a so easy task, we just need to append id or className property to node data.

- [I want a multiple-layers chart](https://rawgit.com/dabeng/OrgChart/master/demo/multiple-layers.html)

In fact, this is a wonderful solution to display a orgchart which includes a huge number of node data.

- [I want a hybrid(horizontal + vertical) chart](https://rawgit.com/dabeng/OrgChart/master/demo/vertical-level.html)

This feature is inspired by the issues([Aligning Children Vertical](https://github.com/dabeng/OrgChart/issues/46), [Hybrid(horizontal + vertical) OrgChart](https://github.com/dabeng/OrgChart/issues/61)). Thank [mfahadi](https://github.com/mfahadi) and [Destructrix](https://github.com/Destructrix) for their constructive suggestions:blush: Special thanks to [tedliang](https://github.com/tedliang) for his wonderful hybrid mode solution.

From now on, users never have to worry about how to align a huge of nodes in one screen of browser. The option "verticalLevel" allows users to align child nodes vertically from the given level.

**Note**: currently, this option is incompatible with many other options or methods, like direction, drag&drop, addChildren(), removeNodes(), getHierarchy() and so on. These conflicts will be solved one by one in the later versions.

- [I want to collapse some nodes by default](https://rawgit.com/dabeng/OrgChart/master/demo/default-collapsed.html)

No problem. You just need to adjust a little detail of datasource with the help of option "collapse" and className "slide-up".

- [I want to refresh orgchart base on new options or datasource](https://rawgit.com/dabeng/OrgChart/master/demo/reload-data.html)

It's not a big deal. You just turn to the method init().

- [I want to use complex template to customize the internal structure of every node](https://rawgit.com/dabeng/OrgChart/master/demo/custom-template.html)

No problem. With the help of ES6 Template literals, we can customize the any complex node structure rather than the common title and content sections.

### how to start up demos locally

- you have to install node.js v6+ because our unit tests are based on jsdom v11
- you have to install modern browsers because many behaviors of orgchart plugin are based on HTML5 and CSS3
- run ```npm install``` to install necessary dependencies
- run ```npm test``` to run all tests including unit tests, integration tests and e2e tests
- run ```npm run build``` to generate production js&css files of plugin
- run ```npm start``` to start up local web server to host all the demos

## Usage

### Instantiation Statement
```js
var oc = $('#chartContainerId').orgchart(options);
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
  'children': [ // The property stands for nested nodes.
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
      <td>verticalLevel</td><td>integer(>=2)</td><td>no</td><td></td><td>Users can make use of this option to align the nodes vertically from the specified level.</td>
    </tr>
    <tr>
      <td>toggleSiblingsResp</td><td>boolean</td><td>no</td><td>false</td><td>Once enable this option, users can show/hide left/right sibling nodes respectively by clicking left/right arrow.</td>
    </tr>
    <tr>
      <td>ajaxURL</td><td>json</td><td>no</td><td></td><td>It inclueds four properites -- parent, children, siblings, families(ask for parent node and siblings nodes). As their names imply, different propety provides the URL to which ajax request for different nodes is sent.</td>
    </tr>
    <tr>
      <td>visibleLevel</td><td>positive integer</td><td>no</td><td>999</td><td>It indicates the level that at the very beginning orgchart is expanded to.</td>
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
      <td>nodeTemplate</td><td>function</td><td>no</td><td></td><td>It's a template generation function used to customize any complex internal structure of node. It recieves only one parameter: "data" stands for json datasoure which will be use to render one node.</td>
    </tr>
    <tr>
      <td>createNode</td><td>function</td><td>no</td><td></td><td>It's a callback function used to customize every orgchart node. It recieves two parameters: "$node" stands for jquery object of single node div; "data" stands for datasource of single node.</td>
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
    <tr>
      <td>initCompleted</td><td>function</td><td>no</td><td></td><td>It can often be useful to know when your table has fully been initialised, data loaded and rendered, particularly when using an ajax data source. It recieves one parament: "$chart" stands for jquery object of initialised chart.</td>
    </tr>
  </tbody>
</table>

### Methods
I'm sure that you can grasp the key points of the methods below after you try out demo -- [edit orgchart](http://dabeng.github.io/OrgChart/edit-orgchart/).

#### var oc = $container.orgchart(options)
Embeds an organization chart in designated container. Accepts an options object and you can go through the "options" section to find which options are required. Variable oc is the instance of class OrgChart.
#### init(newOptions)
It's the useful way when users want to re-initialize or refresh orgchart based on new options or reload new data.
#### addParent(data)
Adds parent node(actullay it's always root node) for current orgchart.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>data</td><td>json object</td><td>yes</td><td></td><td>datasource for building root node</td></tr>
  </tbody>
</table>

#### addSiblings($node, data)
Adds sibling nodes for designated node.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>we'll add sibling nodes based on this node</td></tr>
    <tr><td>data</td><td>array</td><td>yes</td><td></td><td>datasource for building sibling nodes</td></tr>
  </tbody>
</table>

#### addChildren($node, data)
Adds child nodes for designed node.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>we'll add child nodes based on this node</td></tr>
    <tr><td>data</td><td>array</td><td>yes</td><td></td><td>datasource for building child nodes</td></tr>
  </tbody>
</table>

#### removeNodes($node）
Removes the designated node and its descedant nodes.
<table>
  <thead>
    <tr><th>Name</th><th>Type</th><th>Required</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>$node</td><td>jquery object</td><td>yes</td><td></td><td>node to be removed</td></tr>
  </tbody>
</table>

#### getHierarchy()
This method is designed to get the hierarchy relationships of orgchart for further processing. For example, after editing the orgchart, you could send the returned value of this method to server-side and save the new state of orghcart.

#### hideParent($node)
This method allows you to hide programatically the parent node of any specific node(.node element), if it has.
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

#### showParent($node)
This method allows you to show programatically the parent node of any specific node(.node element), if it has.
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

#### hideChildren($node)
This method allows you to hide programatically the children of any specific node(.node element), if it has.
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

#### showChildren($node)
This method allows you to show programatically the children of any specific node(.node element), if it has.
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

#### hideSiblings($node, direction)
This method allows you to hide programatically the siblings of any specific node(.node element), if it has.
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

#### showSiblings($node, direction)
This method allows you to show programatically the siblings of any specific node(.node element), if it has.
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

#### getNodeState($node, relation)
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

The returning object will have the following structure:
```js
{
  "exist": true|false,  //Indicates if has parent|children|siblings
  "visible":true|false,  //Indicates if the relationship nodes are visible
}
```

#### getRelatedNodes($node, relation)
This method returns you the nodes related to the specified node.
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

#### setChartScale($chart, newScale)
This method returns you the nodes related to the specified node.
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$chart</td>
    <td>JQuery Object</td>
    <td>Yes</td>
    <td>None</td>
    <td>It's a chart in your chart-container</td>
  </tr>
  <tr>
    <td>newScale</td>
    <td>Float</td>
    <td>Yes</td>
    <td>None</td>
    <td>Positive float value which is used to zoom in/out the chart</td>
  </tr>
</table>

#### export(exportFilename, exportFileextension)
This method allow you to export current orgchart as png or pdf file.
<table>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>exportFilename</td>
    <td>String</td>
    <td>No</td>
    <td>'OrgChart'</td>
    <td>It's the name of exported file</td>
  </tr>
  <tr>
    <td>exportFileextension</td>
    <td>String</td>
    <td>No</td>
    <td>'png'</td>
    <td>It's the extension name of exported file</td>
  </tr>
</table>

### Events
<table>
  <thead>
    <tr><th>Event Type</th><th>Additional Parameters</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>nodedrop.orgchart</td><td>draggedNode, dragZone, dropZone</td><td>The event's handler is where you can place your customized function after node drop over. For more details, please refer to <a target="_blank" href="http://dabeng.github.io/OrgChart/drag-drop/">example drag & drop</a>.</td></tr>
    <tr><td>init.orgchart</td><td>chart</td><td>Initialisation complete event - fired when Organization Chart has been fully initialised and data loaded.</td></tr>
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

## Charts Show
[I love NBA.](http://codepen.io/dabeng/full/aZzEVJ/)
![2016 NBA Playoff](http://dabeng.github.io/OrgChart/img/2016nba/2016-nba-playoff.png)

We thank [JordiCorbilla](https://github.com/JordiCorbilla):blush: for his sharing [how to save datasource after chart editing](https://github.com/dabeng/OrgChart/issues/34).
![save datasource](https://cloud.githubusercontent.com/assets/7347994/16707530/d7e206ca-45c9-11e6-9a93-5b29840de272.png)
