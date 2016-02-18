'use strict';

(function($){

  $(function() {

    $.mockjax({
      url: '/orgchart/initdata',
      responseTime: 1000,
      contentType: 'application/json',
      responseText: {
        'id': '1',
        'name': 'Lao Lao',
        'title': 'general manager',
        'relationship': { 'children_num': 8 },
        'children': [
          { 'id': '2','name': 'Bo Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '3','name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
            'children': [
              { 'id': '4', 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
              { 'id': '5', 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 },
                'children': [
                  { 'id': '6', 'name': 'Pang Pang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
                  { 'id': '7','name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
                ]
              }
            ]
          },
          { 'id': '8', 'name': 'Yu Jie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '9', 'name': 'Yu Li', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '10', 'name': 'Hong Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '11', 'name': 'Yu Wei', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '12', 'name': 'Chun Miao', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
          { 'id': '13', 'name': 'Yu Tie', 'title': 'department engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
        ]
      }
    });

 $('#chart-container').orgchart({
    'data' : '/orgchart/initdata',
    'depth': 2,
    'nodeTitle': ['name'],
    'nodeContent': ['title']
  });

  });

})(jQuery);