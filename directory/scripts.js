'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'children': [
        { 'name': 'Bo Miao' },
        { 'name': 'Su Miao',
          'children': [
            { 'name': 'Tie Hua' },
            { 'name': 'Hei Hei' }
          ]
        },
        { 'name': 'Hong Miao' },
        { 'name': 'Chun Miao' }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'direction': 'l2r'
    });

  });

})(jQuery);