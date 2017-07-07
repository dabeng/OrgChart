'use strict';

(function($){

  $(function() {

    var oc = $('#chart-container').orgchart({
      'data' : $('#ul-data')
    });

    $('#btn-export-hier').on('click', function() {
      if (!$('pre').length) {
        var hierarchy = oc.getHierarchy();
        $('#btn-export-hier').after('<pre>').next().append(JSON.stringify(hierarchy, null, 2));
      }
    });

  });

})(jQuery);