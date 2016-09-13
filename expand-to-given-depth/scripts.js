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
                    { 'name': 'Er Dan Zai', 'title': 'engineer',
                      'children': [
                        { 'name': 'AAA', 'title': 'Intern' },
                        { 'name': 'BBB', 'title': 'Intern' }
                      ]
                    }
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

    var showDescendents = function(node, depth) {
      if (depth === 1) {
        return false;
      }
      $(node).closest('tr').siblings(':last').children().find('.node:first').each(function(index, node) {
        var $temp = $(node).closest('tr').siblings().removeClass('hidden');
        var $children = $temp.last().children().find('.node:first');
        if ($children.length) {
          $children[0].style.offsetWidth = $children[0].offsetWidth;
        }
        $children.removeClass('slide-up');
        showDescendents(node, depth--);
      });
    };

    $('#chart-container').orgchart({
      'depth': 2,
      'data' : datascource,
      'nodeContent': 'title',
      'createNode': function($node, data) {
        $node.on('click', function(event) {
          if ($(event.target).is('.fa-chevron-down')) {
            showDescendents(this, 3);
          }
        });
      }
    });

  });

})(jQuery);