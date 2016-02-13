'use strict';

(function($){

  function mockJqueryAjax() {
    $.mockjax({
      url: '/orgchart/children/1',
      contentType: 'application/json',
      responseText: {'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
    });
  }

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'id': '1',
      'relationship': { 'children_num': 8 },
      'children': [
        { 'name': 'Bo Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Jie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Li', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Hong Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Wei', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Chun Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Tie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
      ]
    };

    var ajaxURLs = {
      'children': '/orgchart/children/',
      'parent': '/orgchart/parent/',
      'sibling': '/orgchart/sibling/',
      'siblingWithParent': '/orgchart/sibling/with/parent/' };

 $('#chart-container').orgchart({
    'data' : datascource,
    'ajaxURL': ajaxURLs,
    // 'chartClass': 'oc-employee',
    'nodeTitle': ['name'],
    'nodeContent': ['title'],
    'nodeID': 'id',
    'create': function() {
      var chartContainer = $('#chart-container');
      var chart = chartContainer.find('.orgchart');
      var containerWidth = chartContainer.width();
      if (chartContainer[0].scrollWidth > containerWidth) {
        chartContainer.scrollLeft(chartContainer[0].scrollWidth/2 - containerWidth/2);
      } else {
        chart.css('left', containerWidth/2 - chart.outerWidth(true)/2);
      }
      chart.css('top',30);
    }
  });

 mockJqueryAjax();

  });

})(jQuery);