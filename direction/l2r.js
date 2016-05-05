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
            { 'name': 'Hei Hei', 'title': 'senior engineer' }
          ]
        },
        { 'name': 'Hong Miao', 'title': 'department manager' },
        { 'name': 'Chun Miao', 'title': 'department manager' }
      ]
    };

    var $chart = $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title',
      'direction': 'l2r'
    }).find('.orgchart');

    // $chart.css('transform', $chart.css('transform') + ' translateX(-' + $chart.outerWidth(true) + 'px)');
    // $chart.css('margin-top', $chart.outerWidth(true));

  });

})(jQuery);