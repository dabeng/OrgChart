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
    })
    .find('.node').on('click', function() {
      $('#selected-node').val($(this).children('.title').text());
    });

    $('#btn-report-path').on('click', function() {
      var $selected = $('#chart-container').find('.node.focused');
      if ($selected.length) {
        $selected.parents('.nodes').children(':has(.focused)').find('.node:first').each(function(index, superior) {
          if (!$(superior).find('.horizontalEdge:first').closest('table').parent().siblings().is('.hidden')) {
            $(superior).find('.horizontalEdge:first').trigger('click');
          }
        });
        $(this).prop('disabled', true);
      } else {
        alert('please select the node firstly');
      }
    });

    $('#btn-reset').on('click', function() {
      $('#chart-container').find('.hidden').removeClass('hidden')
        .end().find('.slide-up, .slide-right, .slide-left, .focused').removeClass('slide-up slide-right slide-left focused');
      $('#btn-report-path').prop('disabled', false);
      $('#selected-node').val('');
    });

  });

})(jQuery);