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
                { 'name': 'Dan Zai', 'title': 'UE engineer',
                  'children': [
                    { 'name': 'Er Dan Zai', 'title': 'Intern' }
                  ]
                }
              ]
            }
          ]
        },
        { 'name': 'Hong Miao', 'title': 'department manager' },
        { 'name': 'Chun Miao', 'title': 'department manager' }
      ]
    };

    $('#chart-container').orgchart({
      'depth': 2,
      'pan': true,
      'data' : datascource,
      'nodeContent': 'title',
      'createNode': function($node, data) {
        $node.on('click', function(event) {
          if (!$(event.target).is('.edge, .toggleBtn')) {
            var $this = $(this);
            var $chart = $this.closest('.orgchart');
            var newX = window.parseInt(($chart.outerWidth(true)/2) - ($this.offset().left - $chart.offset().left) - ($this.outerWidth(true)/2));
            var newY = window.parseInt(($chart.outerHeight(true)/2) - ($this.offset().top - $chart.offset().top) - ($this.outerHeight(true)/2));
            $chart.css('transform', 'matrix(1, 0, 0, 1, ' + newX + ', ' + newY + ')');
          }
        });
      }
    });

  });

})(jQuery);