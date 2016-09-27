'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Li Jing', 'title': 'senior engineer' },
            { 'name': 'Li Xin', 'title': 'senior engineer',
              'children': [
                { 'name': 'To To', 'title': 'engineer' },
                { 'name': 'Fei Fei', 'title': 'engineer' },
                { 'name': 'Xuan Xuan', 'title': 'engineer' }
              ]
            }
          ]
        },
        { 'name': 'Su Miao', 'title': 'department manager',
          'children': [
            { 'name': 'Pang Pang', 'title': 'senior engineer' },
            { 'name': 'Hei Hei', 'title': 'senior engineer',
              'children': [
                { 'name': 'Xiang Xiang', 'title': 'UE engineer' },
                { 'name': 'Dan Dan', 'title': 'engineer' },
                { 'name': 'Zai Zai', 'title': 'engineer' }
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

    $('#btn-filter-node').on('click', function() {
      var keyWord = $('#key-word').val().trim();
      if (!keyWord.length) {
        window.alert('Please type key word firstly.');
        return;
      } else {
        $('.orgchart').addClass('noncollapsable');
        // distinguish the matched nodes and the unmatched nodes according to the given key word
        $('#chart-container').find('.node').filter(function(index, node) {
            return $(node).text().toLowerCase().indexOf(keyWord) > -1;
          })
        .addClass('matched')
          .closest('table').parents('table').find('tr:first').find('.node').addClass('retained');
        $('#chart-container').find('.node:not(.matched,.retained)').addClass('unmatched');
        // hide the unmatched nodes
        // var $filteredNodes = $('#chart-container').find('.node.filtered');
        // for (var i = $filteredNodes.length; i > -1; i--) {
        //   $filteredNodes.eq(i).closest('table').parent().siblings
        // }
      }
    });

  });

})(jQuery);