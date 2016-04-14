'use strict';

(function($){

  $(function() {

    $('#chart-container').orgchart({
      'data' : $('#ul-data'),
      'nodeTitle': 'name'
    });

  });

})(jQuery);