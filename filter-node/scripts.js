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
        var $chart = $('.orgchart');
        // disalbe the expand/collapse feture
        $chart.addClass('noncollapsable filtered');
        // distinguish the matched nodes and the unmatched nodes according to the given key word
        $chart.find('.node').filter(function(index, node) {
            return $(node).text().toLowerCase().indexOf(keyWord) > -1;
          }).addClass('matched')
          .closest('table').parents('table').find('tr:first').find('.node').addClass('retained');
        // hide the unmatched nodes
        $chart.find('.matched,.retained').each(function(index, node) {
          var $unmatched = $(node).closest('table').parent().siblings().find('.node:first:not(.matched,.retained)')//find('.node:first').not('.matched,.retained')
            .closest('table').parent().addClass('hidden');
          $unmatched.parent().prev().children().slice(1, $unmatched.length * 2 + 1).addClass('hidden');
        });
      }
    });

  });

})(jQuery);