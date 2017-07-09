'use strict';

(function($){

  $(function() {

    var datasource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager' },
        { 'name': 'Su Miao', 'title': 'department manager' },
        { 'name': 'Yu Jie', 'title': 'department manager' },
        { 'name': 'Yu Li', 'title': 'department manager' },
        { 'name': 'Hong Miao', 'title': 'department manager' },
        { 'name': 'Yu Wei', 'title': 'department manager' },
        { 'name': 'Chun Miao', 'title': 'department manager' },
        { 'name': 'Yu Tie', 'title': 'department manager' }
      ]
    };

    var oc = $('#chart-container').orgchart({
      'data' : datasource,
      'nodeContent': 'title'
    });

    $('#btn-chart1').on('click', function (argument) {
      oc.init({ 'data': datasource });
    });

    $('#btn-chart2').on('click', function (argument) {
      var data = { 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'name': 'Hei Hei', 'title': 'senior engineer' }
        ]
      };
      oc.init({ 'data': data });
    });

    $('#btn-chart3').on('click', function (argument) {
      var data = { 'name': 'Hei Hei', 'title': 'senior engineer',
        'children': [
          { 'name': 'Pang Pang', 'title': 'engineer' },
          { 'name': 'Dan Zai', 'title': 'UE engineer' },
          { 'name': '2Dan Zai', 'title': 'UE engineer' }
        ]
      };
      oc.init({ 'data': data });
    });

  });

})(jQuery);