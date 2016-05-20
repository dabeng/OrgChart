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
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'depth': 2,
      'nodeContent': 'title',
      'pan': true,
      'zoom': true
    });

    /*$('#chart-container').on('click', function(event) {
      var $t1 = $('#t1');
      var $t2 = $('#t2');
      var matrix = $t1.css('transform').match(/-?[\d\.]+/g).map(function(item) {
        return Number(item);
      });
      // var offsetX = event.originalEvent.pageX - $chartContainer[0].offsetLeft - ($chart[0].offsetLeft + matrix[4]) + ($chart.outerWidth()*(1-matrix[0])/2);
      // var offsetY = event.originalEvent.pageY - $chartContainer[0].offsetTop - $chart[0].offsetTop - matrix[5] + ($chart.outerHeight()/2*(matrix[0]-1));
      // var translateX = Math.round(($chart.outerWidth()/2 - offsetX) * delta);
      // var translateY = Math.round(($chart.outerHeight()/2 - offsetY) * delta);
      // matrix[4] = matrix[4] + translateX;
      // matrix[5] = matrix[5] + translateY;
      var offsetX = event.originalEvent.pageX - this.offsetLeft - ($t1[0].offsetLeft + matrix[4]) + ($t1.outerWidth()*(matrix[0]-1)/2);
      var offsetY = event.originalEvent.pageY - this.offsetTop - ($t1[0].offsetTop + matrix[4]) + ($t1.outerHeight()*(matrix[0]-1)/2);
      console.log(Math.round(($t1.outerWidth()/2 - offsetX) * 0.2));
      console.log(Math.round(($t1.outerWidth()/2 - offsetY) * 0.2));
    });*/

  });

})(jQuery);