# OrgChart
With the help of DOM, jQuery and CSS3 transition, we got a simple and direct organization chart plugin.

## Notes
- First of all, thanks a lot for [wesnolte](https://github.com/wesnolte)'s great work -- [jOrgChart](https://github.com/wesnolte/jOrgChart). The thought that using nested tables to build out the tree-like orgonization chart is amazing. This idea is more simple and direct than its counterparts based on svg.
- Unfortunately, it's long time not to see the update of jOrgChart. on the other hand, I don't think "drag and drop" functinality is necessary for organization chart plugin, because in real life, there is no such unsecure demand that allowing users to change company's organization chart randomly with manual mode. We all konw the importance and seriousness of a organization chart for a company. Due to all these stuff, I choose to create a new repo.

## Demo
- **[using local datasource](http://dabeng.github.io/OrgChart/local-datasource/)**
```js
// sample of core source code
var datascource = {
  'name': 'Lao Lao',
  'title': 'general manager',
  'relationship': { 'children_num': 3 },
  'children': [
    { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 2 }},
    { 'name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 2 },
      'children': [
        { 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
        { 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
      ]
    },
    { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 2 }}
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
  'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 2 },
  'children': [
    { 'id': '2','name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
    { 'id': '3','name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 }}
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
    var nodePrompt = $('<i>', {
      'class': 'fa fa-info-circle second-menu-icon',
      click: function() {
        $(this).siblings('.second-menu').toggle();
      }
    });
    var secondMenu = '<div class="second-menu"><img class="avatar" src="../img/avatar/' + data.id + '.jpg"></div>';
    $node.append(nodePrompt).append(secondMenu);
  }
});
```
![option--createNode](http://dabeng.github.io/OrgChart/option-createNode/recorder.gif)
