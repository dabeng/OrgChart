'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': '001',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': '111',
          'children': [
            { 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': '110' },
            { 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': '111',
              'children': [
                { 'name': 'Pang Pang', 'title': 'engineer', 'relationship': '110' },
                { 'name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': '110' }
              ]
            }
          ]
        }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeTitle': 'name',
      'nodeContent': 'title'
    });

  });

})(jQuery);