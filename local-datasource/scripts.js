'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao LaoAAAAAAAAA',
      'title': 'general managerAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'relationship': { 'children_num': 8 },
      'children': [
        {'name': 'Bo Miao', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Su MiaoBBBBBBBBBBBBBBBBBBBBBBBBBB', 'title': 'department managerBBBBBBBBBBBBBBBBBBBBBBBBBBBBB', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
          'children': [
            {'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
            {'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 },
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

 $('#chart-container').orgchart({
    'data' : datascource,
    'depth': 2,
    'nodeTitle': 'name',
    'nodeContent': 'title'
  });

  });

})(jQuery);