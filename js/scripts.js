'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Ren Yang',
      'title': 'manager',
      'relationship': { 'children_num': 6, 'parent_num': 1,'sibling_num': 2 },
      'children': [
        {'name': 'yugang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }},
        {'name': 'haibo', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }},
        {'name': 'duanmu', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }},
        {'name': 'liuzheng', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }},
        {'name': 'chenxiong', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }},
        {'name': 'xuebin', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 5 }}
      ]
    };

 $('#chart-container').jOrgChart({
    'data' : datascource,
    'chartClass': 'oc-employee',
    'nodeTitle': ['name'],
    'nodeContent': ['title'],
    'create': function() {
      var chartContainer = $('#chart-container');
      var chart = chartContainer.find('.jOrgChart');
      var containerWidth = chartContainer.width();
      if (chartContainer[0].scrollWidth > containerWidth) {
        chartContainer.scrollLeft(chartContainer[0].scrollWidth/2 - containerWidth/2);
      } else {
        chart.css('left', containerWidth/2 - chart.outerWidth(true)/2);
      }
    }
  });

  });

})(jQuery);