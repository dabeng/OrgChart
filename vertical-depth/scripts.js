'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Ren Wu', 'title': 'senior engineer' },
            { 'name': 'Wo Ge', 'title': 'senior engineer' },
            { 'name': 'Fei Xuan', 'title': 'engineer' }
          ]
        },
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
        { 'name': 'Hong Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Xing An', 'title': 'senior engineer' },
            { 'name': 'Yi Dian', 'title': 'engineer' },
            { 'name': 'Xiao Gang', 'title': 'engineer' }
          ]
        }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title',
      'verticalDepth': 3
    });

  });

})(jQuery);