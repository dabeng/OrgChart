'use strict';

(function($){

  $(function() {

    $('#chart-container').orgchart({
      'data' : $('#ul-data')
    });

    $('#btn-export-hier').on('click', function() {
      if (!$('pre').length) {
        var hierarchy = $('#chart-container').orgchart('getHierarchy');
        $('#btn-export-hier').after('<pre>').next().append(JSON.stringify(hierarchy, null, 2));
      }
    });

  });

})(jQuery);