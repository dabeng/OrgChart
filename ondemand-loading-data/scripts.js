'use strict';

(function($){

  $(function() {

    $.mockjax({
      url: '/orgchart/children/3/',
      contentType: 'application/json',
      responseTime: 1000,
      responseText: { 'children': [
        { 'id': '4', 'name': 'Pang Pang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
        { 'id': '5', 'name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
      ]}
    });

    $.mockjax({
      url: '/orgchart/parent/1/',
      contentType: 'application/json',
      responseTime: 1000,
      responseText: { 'id': '6','name': 'Lao Lao', 'title': 'general manager', 'relationship': { 'children_num': 8 }}
    });

    $.mockjax({
      url: '/orgchart/siblings/1/',
      contentType: 'application/json',
      responseTime: 1000,
      responseText: { 'siblings': [
        { 'id': '7','name': 'Bo Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '8', 'name': 'Yu Jie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '9', 'name': 'Yu Li', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '10', 'name': 'Hong Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '11', 'name': 'Yu Wei', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '12', 'name': 'Chun Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '13', 'name': 'Yu Tie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
      ]}
    });

    $.mockjax({
      url: '/orgchart/families/1/',
      contentType: 'application/json',
      responseTime: 1000,
      responseText: {
        'id': '6',
        'name': 'Lao Lao',
        'title': 'general manager',
        'relationship': { 'children_num': 8 },
        'children': [
        { 'id': '7','name': 'Bo Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '8', 'name': 'Yu Jie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '9', 'name': 'Yu Li', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '10', 'name': 'Hong Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '11', 'name': 'Yu Wei', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '12', 'name': 'Chun Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '13', 'name': 'Yu Tie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
      ]}
    });

    var datascource = {
      'id': '1',
      'name': 'Su Miao',
      'title': 'department manager',
      'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
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

  });

})(jQuery);