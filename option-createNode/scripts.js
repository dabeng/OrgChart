'use strict';

(function($){

  $(function() {

    var datascource = {
      'id': '1',
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': { 'children_num': 8 },
      'children': [
        { 'id': '2', 'name': 'Bo Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '3', 'name': 'Su Miao', 'title': 'department manager', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 7 },
          'children': [
            { 'id': '4', 'name': 'Tie Hua', 'title': 'senior engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
            { 'id': '5', 'name': 'Hei Hei', 'title': 'senior engineer', 'relationship': { 'children_num': 2, 'parent_num': 1,'sibling_num': 1 },
              'children': [
                { 'id': '6', 'name': 'Pang Pang', 'title': 'engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }},
                { 'id': '7', 'name': 'Xiang Xiang', 'title': 'UE engineer', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 1 }}
              ]
            }
          ]
        },
        { 'id': '8', 'name': 'Yu Jie', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '9', 'name': 'Yu Li', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '10', 'name': 'Hong Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '11', 'name': 'Yu Wei', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '12', 'name': 'Chun Miao', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }},
        { 'id': '13', 'name': 'Yu Tie', 'title': 'department manager', 'relationship': { 'children_num': 0, 'parent_num': 1,'sibling_num': 7 }}
      ]
    };

 $('#chart-container').orgchart({
    'data' : datascource,
    'depth': 2,
    'nodeTitle': 'name',
    'nodeContent': 'title',
    'nodeID': 'id',
    'createNode': function($node, data) {
      // attach relatedId used for switch between employee/group charts
      // $node.data('relatedId', (data.group) ? data.group.id: '');
      // $node.children('.title').attr('title', data.realname);

      // add strikethrough to terminated employees
      // if (data.is_terminated) {
      //   $node.find('.title').addClass('inactive');
      // }

      // append 2nd menu including detailed info of node
      var nodePrompt = $('<i>', {
        'class': 'fa fa-info-circle second-menu-icon',
        click: function() {
          $(this).siblings('.second-menu').toggle();
        }
      });
      // var secondMenu =
      //   '<div class="second-menu">' +
      //     '<div class="popover right oc-popupmenu">' +
      //       '<div class="arrow"></div>' +
      //       '<h2 class="popover-title"></h2>' +
      //       '<div class="popover-content">' +
      //       '<dl class="oc-popupmenu-info"></dl>' +
      //       '</div>' +
      //    '</div>' +
      //     '</div>';
var secondMenu = '<div class="second-menu"><img class="avatar" src="../img/avatar/' + data.id + '.jpg"></div>';
      $node.append(nodePrompt).append(secondMenu);

      // contruct the url of realname
      // var url = window.location.origin;
      // var urlConstructContent = {
      //   'text': data.realname,
      //   'href': url + '/employee/' + data.uid,
      //   'click': function(event) {
      //       event.stopPropagation();
      //   }
      // };
      // var urlElement = $('<a>', urlConstructContent);
      // if (data.is_terminated) {
      //   urlElement.addClass('inactive');
      // }

      // append detailed info to 2nd menu
      // $node.find('.popover-title').append(urlElement);
      // var extraInfo = $node.find('.oc-popupmenu-info');
      // extraInfo.append($('<dt><div class="user-img" style="background-image: url(\'avatar.jpg\')">'))
      //   .append($('<dt>kerberos</dt><dd>' + data.uid + '</dd>'))
      //   .append($('<dt>title</dt><dd>' + data.title + '</dd>'))
      //   .append($('<dt>group</dt><dd>' + ((data.group) ? data.group.name : '') + '</dd>'))
      //   .append($('<dt class="email">email</dt><dd>'));
      // var emailList = extraInfo.find('dt.email').next('dd');
      // data.email.forEach(function(mail) {
      //   emailList.append($('<a href="mailto:' + mail + '">' + mail + '</a><br/>'));
      // });
    }
  });

  });

})(jQuery);