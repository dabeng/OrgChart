'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'backgroundHeader': 'blue',
          'children': [
            { 'name': 'Li Jing', 'title': 'senior engineer', 'backgroundHeader': 'blue' },
            { 'name': 'Li Xin', 'title': 'senior engineer', 'backgroundHeader': 'green',
              'children': [
                { 'name': 'To To', 'title': 'engineer' },
                { 'name': 'Fei Fei', 'title': 'engineer' },
                { 'name': 'Xuan Xuan', 'title': 'engineer', 'backgroundHeader':'#ff9999' }
              ]
            }
          ]
        },
        { 'name': 'Su Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Pang Pang', 'title': 'senior engineer', 'backgroundHeader':'#ff00ff'},
            { 'name': 'Hei Hei', 'title': 'senior engineer',
              'children': [
                { 'name': 'Xiang Xiang', 'title': 'UE engineer'},
                { 'name': 'Dan Dan', 'title': 'engineer', 'backgroundBody':'  #ffe6e6'},
                { 'name': 'Zai Zai', 'title': 'engineer'}
              ]
            }
          ]
        }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title'
    });

  });

})(jQuery);