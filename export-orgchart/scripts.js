'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': { 'children_num': 8 },
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
          'children': [
            { 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
            { 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 },
              'children': [
                { 'name': 'Pang Pang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
                { 'name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
              ]
            }
          ]
        },
        { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Li', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Hong Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Wei', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Chun Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'name': 'Yu Tie', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
      ]
    };

    $('#chart-container').orgchart({'chartClass': 'QQQ',
      'data' : datascource,
      'depth': 2,
      'nodeTitle': 'name',
      'nodeContent': 'title',
      'exportButton': true
    });

  });

})(jQuery);