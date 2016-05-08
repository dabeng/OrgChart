'use strict';

(function($){

  $(function() {

    $.mockjax({
      url: '/orgchart/initdata',
      responseTime: 1000,
      contentType: 'application/json',
      responseText: {
        'name': 'Lao Lao',
        'title': 'general manager',
        'children': [
          { 'name': 'Bo Miao', 'title': 'department manager' },
          { 'name': 'Su Miao', 'title': 'department manager',
            'children': [
              { 'name': 'Tie Hua', 'title': 'senior engineer' },
              { 'name': 'Hei Hei', 'title': 'senior engineer',
                'children': [
                  { 'name': 'Pang Pang', 'title': 'engineer' },
                  { 'name': 'Xiang Xiang', 'title': 'UE engineer' }
                ]
              }
            ]
          },
          { 'name': 'Yu Jie', 'title': 'department manager' },
          { 'name': 'Yu Li', 'title': 'department manager' },
          { 'name': 'Hong Miao', 'title': 'department manager' },
          { 'name': 'Yu Wei', 'title': 'department manager' },
          { 'name': 'Chun Miao', 'title': 'department manager' },
          { 'name': 'Yu Tie', 'title': 'department manager' }
        ]
      }
    });

    $('#chart-container').orgchart({
      'data' : '/orgchart/initdata',
      'depth': 2,
      'nodeContent': 'title'
    });

  });

})(jQuery);