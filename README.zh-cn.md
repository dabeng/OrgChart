![OrgChart](http://dabeng.github.io/OrgChart/img/heading.svg)

# Read this in other languages: [繁體中文](https://github.com/dabeng/OrgChart/blob/master/README.zh-tw.md), [English](https://github.com/dabeng/OrgChart/blob/master/README.md)

# [ES6版](http://github.com/dabeng/OrgChart.js)
# [Web Components版](http://github.com/dabeng/OrgChart-Webcomponents)
# [Vue.js版](https://github.com/dabeng/vue-orgchart)
# [Angular版 -- 最节省空间的解决方案](https://github.com/dabeng/ng-orgchart)
# [React版](https://github.com/dabeng/react-orgchart)

## 写在前面的话
感谢[wesnolte](https://github.com/wesnolte)的非常棒的作品-- [jOrgChart](https://github.com/wesnolte/jOrgChart)。用嵌套的table来构造树状结构，用td的border来构造节点间的连线，非常有创意。天然地降低了前端程序员在构造树状结构时的工作量和难度，要知道，利用D3.js中的脑图去达到同样效果，开发周期就会长好多。哪怕你对svg，canvas等高级的制图API了然于胸，当你的树状结构图激发出HR大姐的各种天马行空的需求时，你会坦诚的承认svg或canvas这种重型武器拖累了你的快速解决一小戳敌人的能力。相比较而言，用单纯的**HTML5 + CSS3**的解决方案就像是 **“小米 + 步枪”的轻步兵**，天然地降低了你在实现树状结构图的难度，同时给予你更大的定制空间去面对基于这个结构图衍生出的种种琐碎需求。只要你的需求足够多，基于这个树状结构图，打造出一个完备的HR系统，也是可以期待的。实际上，网络上很多OrgChart商业软件就是围绕着一个树状结构核心模型展开的业务逻辑实现。

- 自 5.0 版本起，用户可以构建家谱树。
- 自 6.0 版本起，OrgChart 组件已回归原生实现，不再依赖 jQuery。

## 功能特性
- 支持本地和远程的数据源。
- 用户可以展开/折叠节点或子树，方便地浏览局部的结构图。
- 上下左右4个方向的布局。
- 用户可以通过拖放节点或子树的方式来改变组织结构图的形态。
- 用户可以编辑组织结构图的层次结构并将最终结果保存为JSON对象。
- 支持将组织结构图导出为png图片或pdf文档。
- 支持对组织结构图的缩放/平移
- 用户可以自行定制节点的内部结构，例如插入员工照到节点中。
- 用户可以采用不同的数据源构建多层级的组织结构图（请参考多层组织结构图和混合布局组织结构图的实例）。
- 支持移动设备上的多点触控操作。

## CDN
可以在CDN上找到本插件的对应资源。

[![cdnjs](https://img.shields.io/cdnjs/v/orgchart)](https://cdnjs.com/libraries/orgchart) https://cdnjs.com/libraries/orgchart

## 安装
### Bower
```
# From version 1.0.2 on, users can install orgchart and add it to bower.json dependencies
$ bower install orgchart
```

### npm
```
# From version 1.0.4 on, users can install orgchart with npm
$ npm install orgchart
```
在 CommonJS 环境中，`require('orgchart')`会直接导出 `OrgChart` 构造函数。

可参考这个例子, [在React中使用jQuery Orchart](https://stackblitz.com/edit/vitejs-vite-hqv4nbdt)

## [gihtub pages实例集合](https://dabeng.github.io/OrgChart/)
## [基于嵌套ul的实例集合](https://codepen.io/collection/nWqvzY)
## [基于嵌套table的实例集合](https://codepen.io/collection/AWxGVb/) (过时)

### 天马行空的需求
- [我想在500毫秒内渲染10,000个节点](https://dabeng.github.io/OrgChart/10000-nodes.html)

![10000-nodes](http://dabeng.github.io/OrgChart/img/10000-nodes.png)

- [ul数据源](https://dabeng.github.io/OrgChart/ul-datasource.html)(感谢 [Tobyee的好点子 :blush:](https://github.com/dabeng/OrgChart/issues/1))

- [本地数据源](https://dabeng.github.io/OrgChart/local-datasource.html)

- [我想平移/缩放组织结构图，像在地图应用上那样](https://dabeng.github.io/OrgChart/pan-zoom.html)

- 我想以不同的方向布局组织结构图(感谢 [fvlima 和 badulesia 的好点子 :blush:](https://github.com/dabeng/OrgChart/issues/5))

  从上到下 -- 默认的布局方向

  [从下到上](https://dabeng.github.io/OrgChart/bottom2top.html)

  [从左到右](https://dabeng.github.io/OrgChart/left2right.html)

  [从右到左](https://dabeng.github.io/OrgChart/right2left.html)

- [我想通过点击左右两边的箭头来展开/折叠当前节点的左右两边单侧的兄弟节点](https://dabeng.github.io/OrgChart/toggle-sibs-resp.html)

- [我想通过ajax请求获得远程数据源，然后构造组织结构图](https://dabeng.github.io/OrgChart/ajax-datasource.html)

- [我想按需载入数据源，进而渲染不同的组织结构图](https://dabeng.github.io/OrgChart/ondemand-loading-data.html)
  
![ondemand-loading-data](http://dabeng.github.io/OrgChart/img/ondemand-loading-data.gif)

- [我想定制组织结构图中节点内的结构](https://dabeng.github.io/OrgChart/option-createNode.html)

- [我想把组织结构图导出成一个图片](https://dabeng.github.io/OrgChart/export-chart.html)

这里使用了第三方的工具[html2canvas](https://github.com/niklasvh/html2canvas).

**注意:**

(1) 如果你想在IE或Edge导出，请先引入[es6-promise.auto.js](https://github.com/stefanpenner/es6-promise)到项目中.

(2) 如果你的操作系统是Windows，请先检查“缩放设置”，需调整"Change the size of text, apps, and other items" to 100%.(感谢[sayamkrai](https://github.com/sayamkrai)的[研究](https://github.com/dabeng/OrgChart/issues/152))

(3) 此外，如果你想导出成pdf文件, 请先引入[jspdf](https://github.com/MrRio/jsPDF)到项目中，然后设置"exportFileextension"选项为"pdf"。

- [我想把地理信息集成到组织结构图里](https://dabeng.github.io/OrgChart/integrate-map.html)

这里，我们需要求助于[OpenLayers](https://github.com/openlayers/ol3)。

- [我想编辑组织结构图的节点或者某个分支](https://dabeng.github.io/OrgChart/edit-chart.html)

本插件中暴露来若干方法--addParent(), addSiblings(), addChildren(), removeNodes()，可以帮助开发者很方便的实现上述需求。

- [我想通过拖放的方式来改变组织结构图的结构](https://dabeng.github.io/OrgChart/drag-drop.html)

一旦启用了"draggable"选项，我们就可以通过拖放来改变组织结构图的层次结构了。但是注意，这个特性在IE浏览器上不工作。后续地，我们还可以利用dropCriteria选项，来定制更细致的拖放限制准则。默认情况下，插件只提供了一条限制准则--不能直接把父节点放到它的子节点里。

- [我希望这个插件能提供给一个方法，调用它返回给我一个结果，该结果能描述出当前组织结构图的层次结构](https://dabeng.github.io/OrgChart/get-hierarchy.html)

我们有个getHierarchy()方法，专门干这事。

- [我想渲染一个颜色编码的组织结构图](https://dabeng.github.io/OrgChart/color-coded.html)

我们只需要把css的样式与数据源中的id字段或css类字段关联起来就好。

- [我想构造一个混合布局的（水平方向 + 垂直方向）组织结构图](https://dabeng.github.io/OrgChart/vertical-level.html)

这个特性的灵感来源于这两个话题的讨论--[Aligning Children Vertical](https://github.com/dabeng/OrgChart/issues/46), [Hybrid(horizontal + vertical) OrgChart](https://github.com/dabeng/OrgChart/issues/61)。感谢[mfahadi](https://github.com/mfahadi)和[Destructrix](https://github.com/Destructrix)建设性的讨论:blush:尤其感谢[tedliang](https://github.com/tedliang)提供了非常棒的混合布局的解决方案。

- [我想在组织结构图初始化时，就默认折叠掉若干节点（不限时这些节点的子节点）](https://dabeng.github.io/OrgChart/default-collapsed.html)

这个好办。在数据源中，给父节点追加`'collapsed': true`，给子节点追加`'className': 'slide-up'`。

- [基于初始的数据源和options实例化组织结构图之后，如果我还想变更某些option或者改动原始的数据源，然后让组织结构图基于这些变更刷新](https://dabeng.github.io/OrgChart/reload-data.html)

我们暴露了init()方法帮你完成上述任务，把新的option传到init()方法里就好了。

- [我想自己定制节点的内部结构，而非只是”名字和职位“的简单构成](https://dabeng.github.io/OrgChart/custom-template.html)

没问题，我们推荐使用ES6的模版字符串。

- [我想将节点安置在特定的层级. 咋做 ?](https://dabeng.github.io/OrgChart/level-offset.html)

![level-offset](http://dabeng.github.io/OrgChart/img/level-offset.png)

你需要的是一个复合的解决方案： **levelOffset data prop** + callback createNode() + CSS custom properties(variables)

- [我想构造一个组织结构图，每个节点宽度都可以不同的](https://dabeng.github.io/OrgChart/nodes-of-different-widths.html)

![nodes-of-different-widths](http://dabeng.github.io/OrgChart/img/nodes-of-different-widths.png)

- [我想在混合布局中实现拖/放功能](https://dabeng.github.io/OrgChart/drag-drop-hybrid-chart.html)

- [我想指定从某一分支开始，其下所有子节点都以垂直样式显示](https://dabeng.github.io/OrgChart/data-prop-hybrid.html)

![data-prop-hybrid](http://dabeng.github.io/OrgChart/img/data-prop-hybrid.png)

**hybrid data property** 就派上用场了. 在数据源的某个节点中提供"hybrid"属性，那么它的所有后代节点都会垂直布局.

- [我想用Font Awesome图标代替内置的图标](https://dabeng.github.io/OrgChart/custom-icons.html)

- [子节点众多的时候，我想以一种压缩起来的展示方式尽可能节省空间](https://dabeng.github.io/OrgChart/data-prop-compact.html)

![data-prop-compact](http://dabeng.github.io/OrgChart/img/data-prop-compact.png)

**compact data property** 就派上用场了. 在数据源的某个节点里提供了"compact"属性，并赋为真值，那么它和它的子节点就会展示为压缩模式。

- [我想构造族谱，家谱，宗谱的关系图](https://dabeng.github.io/OrgChart/family-tree.html)

![family-tree](http://dabeng.github.io/OrgChart/img/family-tree.png)

我们使用如下的二维数组数据源来构建家谱。“outsider”代表外姓人。

```
var datascource = [
  [
    { 'id': '8', 'name': 'Lao Ye', 'title': 'Grandfather' },
    { 
      'id': '1', 'name': 'Lao Lao', 'title': 'Grandmother', 'outsider': true,
      'children': [
        [
          { 'id': '2', 'name': 'Bo miao', 'title': 'Aunt' }
        ],
        [
          { 'id': '3', 'name': 'Su Miao', 'title': 'Mother',
            'children': [
              [
              
                { 'id': '12', 'name': 'Pang Pang', 'title': 'Wife', 'outsider': true,
                  'children': [
                    [{ 'id': '7', 'name': 'Dan Dan', 'title': 'Daughter' }],
                    [{ 'id': '6', 'name': 'Er Dan', 'title': 'Daughter' }],
                  ]
                },
                { 'id': '5', 'name': 'Hei Hei', 'title': 'Me' },
              ]
            ]
          },
          { 'id': '9', 'name': 'Tie Hua', 'title': 'Father', 'outsider': true }
        ],
        [
          { 'id': '10', 'name': 'Hong miao', 'title': 'Aunt' }
        ]
      ]
    }
  ]
];
```

- [我想往族谱里追加一些自定义的标识](https://dabeng.github.io/OrgChart/familytree-custom-properties.html)

![familytree-custom-properties](http://dabeng.github.io/OrgChart/img/familytree-custom-properties.png)

- [我想通过小地图导航组织结构图](https://dabeng.github.io/OrgChart/minimap.html)

![minimap](http://dabeng.github.io/OrgChart/img/minimap.png)

启用 `minimap` 选项即可显示概览导航器。拖动其中的视口可以移动组织结构图，在小地图上滚动鼠标滚轮可以缩放。

### 本地运行orgchart

- 必须安装node.js v6+，因为我们的单元测试是基于jsdom v11。
- 必须安装现代浏览器（忽略IE浏览器）。因为orgchart插件几乎所有的行为和特性都是基于HTML5和CSS3环境下开发与测试的。
- 运行命令 `npm install`来安装必要的依赖。
- 运行命令`npm test`来跑所有的测试（单元测试，集成测试，端到端测试，以及视觉回归测试）
- 运行命令`npm run build`来生成生产版本的js,css文件。
- 运行命令`npm start`来启动本地web server，在这个地址http://localhost:3000 上查看满足不同场景需求的Demo。

## 使用

### 实例化组织结构图
```js
var oc = new OrgChart({
  chartContainer: '#chartContainerId',
  data: datasource
});
```

### 数据源示例
```js
{
  'id': 'rootNode', // 可选属性。将来插件会基于它，创建节点的id，data-parent（当前节点的父节点的id属性）等特性
  'collapsed': true, // 默认初始化时，当前节点处于折叠状态，其子节点不显示
  'className': 'top-level', // 可选属性。将来组件会把它的值追加到节点的CSS 类中
  'nodeTitle': 'name', // 可选属性。插件会以该属性的值为属性，
  // 来检索数据源，然后渲染默认结构样式的节点的上半部分
  'nodeContent': 'title', // 可选属性。插件会以该属性的值为属性，
  // 来检索数据源，然后渲染默认结构样式的节点的下半部分
  'relationship': relationshipValue, // 注意：当你激活按需载入节点特性时
  // 你应该使用JSON数据源（不论本地或远程）并设置本属性
  // 本属性标识当前节点是否具有父节点，兄弟节点，子节点
  // relationshipValue的值是由“0”或“1”组成的长度为3的字符串
  // 第1个字符代表当前节点是否具有父节点
  // 第2个字符代表当前节点是否具有兄弟节点
  // 第三个字符代表当前节点是否具有孩子节点
  'children': [ // The property stands for nested nodes.
    { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': '110' },
    { 'name': 'Su Miao', 'title': 'department manager', 'relationship': '111',
      'children': [
        { 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': '110' },
        { 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': '110' }
      ]
    },
    { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': '110' }
  ],
  'otherPro': anyValue // 数据源中可以追加任意其他字段，只要你觉得
  // 在之后的渲染和操作组织结构图时派得上用场
};
```

### 选项
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data</td>
      <td>json / HTMLUListElement</td>
      <td>是</td>
      <td></td>
      <td>用于构造组织结构图的数据源。它的值可以是JSON或能提供数据的ul元素。</td>
    </tr>
    <tr>
      <td>pan</td>
      <td>boolean</td>
      <td>否</td>
      <td>false</td>
      <td>启用本选项，用户可以通过鼠标拖拽组织结构图。</td>
    </tr>
    <tr>
      <td>zoom</td>
      <td>boolean</td>
      <td>否</td>
      <td>false</td>
      <td>启动本选项，用户可以通过鼠标滚轮或触摸板对组织结构图进行缩放。</td>
    </tr>
    <tr>
      <td>zoominLimit</td>
      <td>number</td>
      <td>否</td>
      <td>7</td>
      <td>放大的上限值</td>
    </tr>
    <tr>
      <td>zoomoutLimit</td>
      <td>number</td>
      <td>否</td>
      <td>0.5</td>
      <td>缩小的下限值</td>
    </tr>
    <tr>
      <td>direction</td>
      <td>string</td>
      <td>否</td>
      <td>"t2b"</td>
      <td>该选项用来设置布局方向。"t2b"代表从上到下，是默认值。"b2t"代表从下到上。"l2r"代表从左到右。"r2l"代表从右到左。</td>
    </tr>
    <tr>
      <td>verticalLevel</td>
      <td>integer(>=2)</td>
      <td>否</td>
      <td></td>
      <td>表示组织结构图从哪一层开始，从水平布局节点转变为垂直布局节点。</td>
    </tr>
    <tr>
      <td>toggleSiblingsResp</td>
      <td>boolean</td>
      <td>否</td>
      <td>false</td>
      <td>启动该选项，用户点击了节点的两侧箭头按钮时，会展开/折叠一侧的兄弟节点；默认的行为是用户点击了节点任何一侧的箭头按钮，都会折叠起所有的兄弟节点，不区分左右。</td>
    </tr>
    <tr>
      <td>visibleLevel</td>
      <td>positive integer</td>
      <td>否</td>
      <td>999</td>
      <td>该选项为用户指定初始化组织结构图时，可见的展开的层级是多少</td>
    </tr>
    <tr>
      <td>nodeTitle</td>
      <td>string</td>
      <td>否</td>
      <td>"name"</td>
      <td>将默认节点结构中的标题部分关联到数据源中的一个属性</td>
    </tr>
    <tr>
      <td>parentNodeSymbol</td>
      <td>string</td>
      <td>否</td>
      <td>"oci-leader"</td>
      <td>为所有父节点的icon标识指定CSS类名</td>
    </tr>
    <tr>
      <td>nodeContent</td>
      <td>string</td>
      <td>否</td>
      <td></td>
      <td>将默认节点结构中的内容部分关联到数据源中的一个属性</td>
    </tr>
    <tr>
      <td>nodeId</td>
      <td>string</td>
      <td>no</td>
      <td>"id"</td>
      <td>选取一个数据源中的字段作为组织结构图中的每个节点的唯一标识</td>
    </tr>
    <tr>
      <td>nodeTemplate</td>
      <td>function</td>
      <td>否</td>
      <td></td>
      <td>应该为该选项提供一个节点结构模版生成函数，该函数只接收一个参数，就是涵盖子树渲染的数据源片段。</td>
    </tr>
    <tr>
      <td>createNode</td>
      <td>function</td>
      <td>否</td>
      <td></td>
      <td>为该选项提供的函数，会在默认节点结构创建完毕后调用。利用传入的两个参数--"node"和"data"，可以帮助开发者定制或改动现有的节点结构。</td>
    </tr>
    <tr>
      <td>exportButton</td>
      <td>boolean</td>
      <td>否</td>
      <td>false</td>
      <td>启用该选项，插件会追加“导出”按钮到组织结构图的容器DIV里。</td>
    </tr>
    <tr>
      <td>exportButtonName</td>
      <td>string</td>
      <td>否</td>
      <td>"Export"</td>
      <td>导出按钮的名字。</td>
    </tr>
    <tr>
      <td>exportFilename</td>
      <td>string</td>
      <td>否</td>
      <td>"Orgchart"</td>
      <td>导出文件的文件名。</td>
    </tr>
    <tr>
      <td>exportFileextension</td>
      <td>string</td>
      <td>否</td>
      <td>"png"</td>
      <td>导出文件的扩展名。</td>
    </tr>
    <tr>
      <td>chartClass</td>
      <td>string</td>
      <td>否</td>
      <td>""</td>
      <td>通过指定该选项，来给组织结构图追加自定义的CSSl类名，尤其是在你的组织结构图容器中要承载夺冠chart的时候，这个选项就显得很重要了。</td>
    </tr>
    <tr>
      <td>draggable</td>
      <td>boolean</td>
      <td>否</td>
      <td>false</td>
      <td>启用该选项，用户就可以拖放节点的方式改变组织结构图的结构了。**注意：**将当前的某个父节点拖放到其下面的某个子节点里，这样的操作是不允许的。因为如果插件顺从了这样的操作，会产生孤立的子树；本选项在IE浏览器上不可用。</td>
    </tr>
    <tr>
      <td>dropCriteria</td>
      <td>function</td>
      <td>否</td>
      <td></td>
      <td>用户可以通过该选项定制更细致的拖放节点的限制准则。你需要为该选项提供一个返回boolean值的函数，该函数用来判断当拖放操作结束时，是否允许将当前拖拽的节点从拖动区域摘出来插入到松放区域里。该函数接受3个参数--draggedNode, dragZone, dropZone。</td>
    </tr>
    <tr>
      <td>initCompleted</td>
      <td>function</td>
      <td>否</td>
      <td></td>
      <td>组织结构图初始化完成后，该选项指定的回调函数被触发。该函数接受一个参数--"chart", 即初始化后的组织结构图元素。</td>
    </tr>
  </tbody>
</table>

### 方法
使用 `new OrgChart(options)` 创建实例。`chartContainer` 和 `chart` 属性分别提供原生容器元素与已渲染的组织结构图元素。

```js
const oc = new OrgChart({ chartContainer: '#chartContainerId', data: datasource });
```

公开 API 包括：`init`、`setOptions`、`attachMinimap`、`detachMinimap`、`updateMinimap`、`addAncestors`、`addDescendants`、`addParent`、`addSiblings`、`addChildren`、`removeNodes`、`getHierarchy`、`getNodeState`、`getParent`、`getChildren`、`getSiblings`、`getRelatedNodes`、`hideParent`、`showParent`、`hideChildren`、`showChildren`、`hideSiblings`、`showSiblings`、`setChartScale`、`export`、`exportPNG` 和 `exportPDF`。其中节点和图表参数均为原生 `HTMLElement`。

#### API 参考
| 调用 | 参数 | 返回值与调用行为 |
| --- | --- | --- |
| `oc.init(options)` | 部分选项对象；传入 `data` 可替换数据源。 | 重新构建图表并返回 `oc`。 |
| `oc.setOptions(options)`<br>`oc.setOptions(name, value)` | 包含 `data`、`pan`、`zoom` 或 `minimap` 的对象；或受支持的选项名称及布尔值。 | `data` 会重建图表，其他选项切换相应功能；返回 `oc`。 |
| `oc.attachMinimap()`<br>`oc.detachMinimap()`<br>`oc.updateMinimap(forceRefresh)` | `forceRefresh` 可选；传入 `true` 会重绘节点预览。 | 创建、移除或刷新小地图。常规启用应使用 `setOptions('minimap', value)`。 |
| `oc.addAncestors(data, parentId)` | 祖先数据，以及接收原根节点的祖先节点 id。 | 插入祖先层级；无返回值。 |
| `oc.addDescendants(data, parent)` | 后代数据数组和已渲染的父 `.node`。 | 追加后代层级；无返回值。 |
| `oc.addParent(currentRoot, data)` | 已渲染的根 `.node` 和新父节点数据。 | 用新父节点包裹当前根；无返回值。 |
| `oc.addSiblings(node, data)`<br>`oc.addChildren(node, data)` | 已渲染的 `.node` 和兄弟节点或子节点数据数组。 | 增加渲染节点；无返回值。 |
| `oc.removeNodes(node)` | 要删除的已渲染 `.node`。 | 删除该节点及其后代；无返回值。 |
| `oc.getHierarchy(includeNodeData)` | 可选布尔值，默认 `false`。 | 返回层级对象；图表或必要节点 id 不可用时返回错误字符串。 |
| `oc.getNodeState(node, relation)` | 已渲染 `.node`；`relation` 为 `parent`、`children` 或 `siblings`。 | 返回 `{ exist, visible }`。 |
| `oc.getParent(node)` | 已渲染 `.node`。 | 返回父 `.node`，不存在时返回 `null`。 |
| `oc.getChildren(node)`<br>`oc.getSiblings(node)` | 已渲染 `.node`。 | 返回直接子节点或兄弟节点 `.node` 元素数组。 |
| `oc.getRelatedNodes(node, relation)` | 已渲染 `.node`；`relation` 为 `parent`、`children` 或 `siblings`。 | 通用关联查询；parent 返回节点或 `null`，其他关系返回数组。 |
| `oc.hideParent(node)` / `oc.showParent(node)`<br>`oc.hideChildren(node)` / `oc.showChildren(node)` | 已渲染 `.node`。 | 通过图表过渡隐藏或显示关联分支；无返回值。 |
| `oc.hideSiblings(node, direction)`<br>`oc.showSiblings(node, direction)` | 已渲染 `.node`；可选 `direction` 为 `left` 或 `right`。 | 隐藏或显示指定一侧的兄弟节点；省略方向时处理全部兄弟节点；无返回值。 |
| `oc.setChartScale(chart, multiplier, zoomAnchor)` | 通常传入 `oc.chart`；正数的相对缩放倍数；可选视口坐标 `{ x, y }`。 | 在配置的缩放范围内缩放，提供 `zoomAnchor` 时固定该点。 |
| `oc.export(filename, extension)` | 可选文件名和 `png` 或 `pdf` 扩展名。 | 按配置默认值开始导出；无法导出时返回 `false`。 |
| `oc.exportPNG(canvas, filename)`<br>`oc.exportPDF(canvas, filename, exportScale)` | 已准备的 canvas、文件名；PDF 缩放默认 `1`。 | 将传入 canvas 直接下载为 PNG 或 PDF；通常应调用 `export()`。 |

#### init(newOptions)
当你想基于新的options或数据源刷新组织结构图时，这个方法就派上用场了。

#### setOptions(options) / setOptions(name, value)
无需重新构建图表即可更新 `pan`、`zoom` 或 `minimap`。可传入选项对象，或传入支持的选项名称和布尔值；传入包含 `data` 的对象时会重新构建图表。

#### attachMinimap() / detachMinimap()
创建或移除当前图表的小地图覆盖层。通常应使用 `setOptions('minimap', true|false)`，以保证选项状态和覆盖层保持同步。

#### updateMinimap(forceRefresh)
在修改图表变换或布局后重新计算小地图视口。传入 `true` 会重绘小地图中的节点预览。

#### addAncestors(data, parentId)
为当前的组织结构图增加祖先节点，可以不止一个层级。
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data</td>
      <td>json</td>
      <td>是</td>
      <td></td>
      <td>用于构造祖先节点的数据源</td>
    </tr>
    <tr>
      <td>parentId</td>
      <td>string</td>
      <td>yes</td>
      <td></td>
      <td>将当前的组织结构图追加到某一个祖先节点里，该节点的id</td>
    </tr>
  </tbody>
</table>

#### addDescendants(data, parent)
为指定的父节点增加后代节点。
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>data</td>
      <td>array</td>
      <td>yes</td>
      <td></td>
      <td>用于构造后代节点的数据源</td>
    </tr>
    <tr>
      <td>parent</td>
      <td>HTMLElement</td>
      <td>yes</td>
      <td></td>
      <td>后代节点要追加到的父节点对象</td>
    </tr>
  </tbody>
</table>

#### addParent(currentRoot, data)
为当前的组织结构图增加父节点。
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>currentRoot</td>
      <td>HTMLElement</td>
      <td>是</td>
      <td></td>
      <td>当前组织结构图的根节点，新父节点会包裹这个根节点</td>
    </tr>
    <tr>
      <td>data</td>
      <td>json object</td>
      <td>是</td>
      <td></td>
      <td>构造根节点的数据源</td>
    </tr>
  </tbody>
</table>

#### addSiblings(node, data)
为指定的节点增加兄弟节点。
<table>
  <thead>
    <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>node</td>
      <td>HTMLElement</td>
      <td>是</td>
      <td></td>
      <td>基于该节点增加其兄弟节点</td>
    </tr>
    <tr>
      <td>data</td>
      <td>array</td>
      <td>是</td>
      <td></td>
      <td>用于构造兄弟节点的数据源</td>
    </tr>
  </tbody>
</table>

#### addChildren(node, data)
为指定的节点增加孩子节点。
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>node</td>
      <td>HTMLElement</td>
      <td>是</td>
      <td></td>
      <td>基于该节点增加其孩子节点</td>
    </tr>
    <tr>
      <td>data</td>
      <td>array</td>
      <td>是</td>
      <td></td>
      <td>构造孩子节点的数据源</td>
    </tr>
  </tbody>
</table>

#### removeNodes(node)
删除指定的节点及其后代节点。
<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>类型</th>
      <th>必填</th>
      <th>默认值</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>node</td>
      <td>HTMLElement</td>
      <td>是</td>
      <td></td>
      <td>待删除的节点。</td>
    </tr>
  </tbody>
</table>

#### getHierarchy()
这个方法被设计用来提供组织结构图的层次结构关系。举个例子，当你采取某种手段对当前的组织结构图的结构进行了改动后，可以调用本方法获得最新的结构，并将其保存到后台。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>includeNodeData</td>
    <td>Boolean</td>
    <td>否</td>
    <td>false</td>
    <td>如果传入的该参数为true，那么导出的层次结构对象中就加入nodeData数据。</td>
  </tr>
</table>

#### hideParent(node)
隐藏指定节点的父节点。当然其兄弟节点及祖先节点也一并隐藏了。
<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>Yes</td>
    <td>None</td>
    <td>指定节点元素。</td>
  </tr>
</table>

#### showParent(node)
显示指定节点的父节点。但不包括更上一层的祖先节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
</table>

#### hideChildren(node)
隐藏指定节点的孩子节点。当然这其中包含了所有的后代节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
</table>

#### showChildren(node)
显示指定节点的孩子节点。默认只显示紧邻的下一个层级，并不包括所有的后代节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
</table>

#### hideSiblings(node, direction)
隐藏指定节点的兄弟节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
  <tr>
    <td>direction</td>
    <td>string</td>
    <td>否</td>
    <td></td>
    <td>可供选择的值有"left"和"rigth". 如果指定某一侧，就只隐藏某一侧的兄弟节点。如果不提供该参数，就隐藏所有的兄弟节点</td>
  </tr>
</table>

#### showSiblings(node, direction)
显示指定节点的兄弟节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
  <tr>
    <td>direction</td>
    <td>string</td>
    <td>否</td>
    <td></td>
    <td>可供选择的值有"left"和"rigth". 如果指定某一侧，就只显示某一侧的兄弟节点。如果不提供该参数，就显示所有的兄弟节点</td>
  </tr>
</table>

#### getNodeState(node, relation)
该方法帮你了解指定节点的相关节点的显示状况。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
  <tr>
    <td>relation</td>
    <td>String</td>
    <td>是</td>
    <td></td>
    <td>可选的值有--"parent", "children" 和 "siblings"。 指定明确的关系，然后本方法返回给你相关节点的显示状态。</td>
  </tr>
</table>

本方法的返回对象的结构如下:
```js
{
  "exist": true|false, // 标识你想了解的父节点，孩子节点，兄弟节点是否存在
  "visible":true|false, // 标识相关节点当前是否可见
}
```
#### getRelatedNodes(node, relation)
获得指定节点的关联节点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>node</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td></td>
    <td>指定节点元素。</td>
  </tr>
  <tr>
    <td>relation</td>
    <td>String</td>
    <td>是</td>
    <td></td>
    <td>可选的值有--"parent", "children" 和 "siblings"。用来指定具体的关系。</td>
  </tr>
</table>

#### getParent(node)
返回指定节点的父节点；如果不存在父节点，则返回 `null`。

#### getChildren(node)
返回指定节点的直接子节点数组。返回值中的每一项都是原生 `HTMLElement`。

#### getSiblings(node)
返回指定节点的兄弟节点数组。返回值中的每一项都是原生 `HTMLElement`。

#### setChartScale(chart, newScale, zoomAnchor)
用这个方法可以帮你为指定的组织结构图设置新的scale系数。

`zoomAnchor` 为可选参数，格式为视口坐标 `{ x, y }`。提供该参数后，缩放时会固定该坐标点。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>chart</td>
    <td>HTMLElement</td>
    <td>是</td>
    <td>None</td>
    <td>组织结构图容器中的某一个图。</td>
  </tr>
  <tr>
    <td>newScale</td>
    <td>Float</td>
    <td>是</td>
    <td>None</td>
    <td>用于缩放组织结构图的缩放系数。</td>
  </tr>
</table>

#### export(exportFilename, exportFileextension)
将当前的组织结构图导出为png图片或pdf文档。

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>必填</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td>exportFilename</td>
    <td>String</td>
    <td>否</td>
    <td>'OrgChart'</td>
    <td>导出文件的文件名。</td>
  </tr>
  <tr>
    <td>exportFileextension</td>
    <td>String</td>
    <td>否</td>
    <td>'png'</td>
    <td>导出文件的扩展名</td>
  </tr>
</table>

#### exportPNG(canvas, exportFilename)
将准备好的 canvas 导出为 PNG 下载。当应用自行提供 canvas 时可直接调用；大多数场景应使用 `export()`。

#### exportPDF(canvas, exportFilename, exportScale)
将准备好的 canvas 导出为 PDF 下载。`exportScale` 是 canvas 的渲染缩放比例，用于保持 PDF 的逻辑尺寸；大多数场景应使用 `export()`。

### 事件

OrgChart 会派发可冒泡的原生 `CustomEvent`。请使用 `addEventListener` 订阅，事件参数位于 `event.detail`。

```js
oc.chart.addEventListener('nodedrop.orgchart', function (event) {
  const { draggedNode, dragZone, dropZone } = event.detail;
});
```

<table>
  <thead>
    <tr>
    <th>类型</th>
    <th>附带参数</th>
    <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>nodedrop.orgchart</td>
      <td><code>event.detail</code>: draggedNode, dragZone, dropZone</td>
      <td>在节点移动前于图表元素上触发。调用 <code>event.preventDefault()</code> 可取消本次拖放。</td>
    </tr>
    <tr>
      <td>otherdropped.orgchart</td>
      <td><code>event.detail</code>: draggedItem, dropZone</td>
      <td>非 OrgChart 的可拖放项被放到节点上时，于图表元素上触发。</td>
    </tr>
    <tr>
      <td>init.orgchart</td>
      <td>无；<code>event.target</code> 为图表元素</td>
      <td>图表渲染完成后触发。</td>
    </tr>
    <tr>
      <td>show-[relation].orgchart</td>
      <td></td>
      <td>关联节点显示时在该节点上触发；<code>relation</code> 为 parent、children 或 siblings。</td>
    </tr>
    <tr>
      <td>hide-[relation].orgchart</td>
      <td></td>
      <td>关联节点隐藏时在该节点上触发；<code>relation</code> 为 parent、children 或 siblings。</td>
    </tr>
  </tbody>
</table>

### Tips
#### 默认的展开/折叠节点功能虽然很好，但是我想禁掉它，咋办？
关于这个需求的展开讨论可以看这个[问题](https://github.com/dabeng/OrgChart/issues/25)。感谢[der-robert](https://github.com/der-robert)和[ActiveScottShaw](https://github.com/ActiveScottShaw)的非常有建设性的讨论:blush:

我们提供了一个CSS类"noncollapsable"，可以方便地完成这件事。
```js
oc.chart.classList.add('noncollapsable'); // 禁掉展开/折叠

oc.chart.classList.remove('noncollapsable'); // 开启展开/折叠
```

#### 为啥根节点消失了，看不到了？
比如说我渲染了一个非常庞大的组织结构图，同时我启用了“平移”特性，这时如果我隐藏掉某个节点的大量的后代节点，可能会导致上层的一些节点在当前可视区域内消失。
跟多的细节，可以参考这个[问题](https://github.com/dabeng/OrgChart/issues/85)的讨论。感谢[manuel-84](https://github.com/manuel-84) 的问题抛出 :blush:

## 浏览器兼容性检查
- Chrome 19+
- Firefox 4+
- Safari 6+
- Opera 15+
- IE 10+
