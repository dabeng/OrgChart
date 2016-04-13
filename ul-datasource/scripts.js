'use strict';

(function($){

  $(function() {

 var extractDatasource = function($li, data, total, count, callback) {
    if ($.isEmptyObject(data)) {
      data.name = $li.contents().eq(0).text().trim();
      data.relationship= '001';
    } else {
      // if (data.children) {
        data.children.push({ 'name': $li.contents().eq(0).text().trim(),
          'relationship': '1' +( $li.siblings().length ? 1: 0) + ($li.children().length ? 1 : 0) });
      // } else {
      //   data.children = [{ 'name': $li.contents().eq(0).text().trim(),
      //     'relationship': '1' + ($li.siblings().length ? 1: 0) + ($li.children().length ? 1 : 0) }];
      // }
    }
    count++;
    if (count === total) {
      callback();
    }
    if ($li.children().length) {
      $li.children().children().each(function(index, item) {
        data.children = [];
        // if ($(item).children().length) {
        extractDatasource($(item), data, total, count+index, callback);
      });
    }
  }
var conversed = {};
extractDatasource($('#ul-data').children(), conversed, $('#ul-data').find('li').length, 0, function() {
    $('#chart-container').orgchart({
      'data' : conversed,
      'nodeTitle': 'name'
    });
});



  });

})(jQuery);