'use strict';

(function($){

  $(function() {

    var datascource = {
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
                { 'name': 'Xiang Xiang', 'title': 'UE engineer' ,
                'children': [
            { 'name': 'Tie Hua', 'title': 'senior engineer' },
            { 'name': 'Hei Hei', 'title': 'senior engineer',
              'children': [
                { 'name': 'Pang Pang', 'title': 'engineer' },
                { 'name': 'Xiang Xiang', 'title': 'UE engineer' }
              ]
            }
          ]}
              ]
            }
          ]
        },
        { 'name': 'Hong Miao', 'title': 'department manager' },
        { 'name': 'Chun Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Bing Qin', 'title': 'senior engineer' },
            { 'name': 'Yue Yue', 'title': 'senior engineer',
              'children': [
                { 'name': 'Er Yue', 'title': 'engineer' },
                { 'name': 'San Yue', 'title': 'UE engineer' }
              ]
            }
          ]
        }
      ]
    };

    var oc = $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title',
      'verticalDepth': 3, // From the 3th level of orgchart, nodes will be aligned vertically.
      'depth': 4
    });

  });

})(jQuery);