'use strict';

(function($){

  $(function() {

    var datascource = {
      'id': '1',
      'name': 'Lao Lao',
      'title': 'general manager',
      'children': [
        { 'id': '2', 'name': 'Bo Miao', 'title': 'department manager' },
        { 'id': '3', 'name': 'Su Miao', 'title': 'department manager',
          'children': [
            { 'id': '4', 'name': 'Tie Hua', 'title': 'senior engineer' },
            { 'id': '5', 'name': 'Hei Hei', 'title': 'senior engineer',
              'children': [
                { 'id': '6', 'name': 'Pang Pang', 'title': 'engineer' },
                { 'id': '7', 'name': 'Xiang Xiang', 'title': 'UE engineer' }
              ]
            }
          ]
        },
        { 'id': '8', 'name': 'Yu Jie', 'title': 'department manager' },
        { 'id': '9', 'name': 'Yu Li', 'title': 'department manager' },
        { 'id': '10', 'name': 'Hong Miao', 'title': 'department manager' },
        { 'id': '11', 'name': 'Yu Wei', 'title': 'department manager' },
        { 'id': '12', 'name': 'Chun Miao', 'title': 'department manager' },
        { 'id': '13', 'name': 'Yu Tie', 'title': 'department manager' }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'depth': 2,
      'nodeContent': 'title',
      'nodeID': 'id',
      'createNode': function($node, data) {
        var secondMenuIcon = $('<i>', {
          'class': 'fa fa-info-circle second-menu-icon',
          click: function() {
            $(this).siblings('.second-menu').toggle();
          }
        });
        var secondMenu = '<div class="second-menu"><img class="avatar" src="../img/avatar/' + data.id + '.jpg"></div>';
        $node.append(secondMenuIcon).append(secondMenu);
      }
    });

  });

})(jQuery);