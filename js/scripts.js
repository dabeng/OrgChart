'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': { 'children_num': 8 },
      'children': [
        {'name': 'Bo Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
          'children': [
            {'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
            {'name': 'Xue Bin', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 },
              'children': [
                {'name': 'Pang Pang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
                {'name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
              ]
            }
          ]
        },
        {'name': 'Yu Jie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        {'name': 'Yu Li', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        {'name': 'Hong Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        {'name': 'Yu Wei', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        {'name': 'Chun Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        {'name': 'Yu Tie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
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
      chart.css('top',30);
    }
  });

  });

})(jQuery);