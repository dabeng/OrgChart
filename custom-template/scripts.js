'use strict';

(function($){

  $(function() {

    var datasource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'office': '白城',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'office': '北京' },
        { 'name': 'Su Miao', 'title': 'department manager', 'office': '北戴河',
          'children': [
            { 'name': 'Tie Hua', 'title': 'senior engineer', 'office': '北戴河' },
            { 'name': 'Hei Hei', 'title': 'senior engineer', 'office': '北戴河',
              'children': [
                { 'name': 'Pang Pang', 'title': 'engineer', 'office': '北戴河' },
                { 'name': 'Xiang Xiang', 'title': 'UE engineer', 'office': '北戴河' }
              ]
            }
          ]
        },
        { 'name': 'Yu Jie', 'title': 'department manager', 'office': '长春' },
        { 'name': 'Yu Li', 'title': 'department manager', 'office': '长春' },
        { 'name': 'Hong Miao', 'title': 'department manager', 'office': '长春' },
        { 'name': 'Yu Wei', 'title': 'department manager', 'office': '长春' },
        { 'name': 'Chun Miao', 'title': 'department manager', 'office': '长春' },
        { 'name': 'Yu Tie', 'title': 'department manager', 'office': '长春' }
      ]
    };

    var nodeTemplate = function(data) {
      return `
        <span class="office">${data.office}</span>
        <div class="title">${data.name}</div>
        <div class="content">${data.title}</div>
      `;
    };

    var oc = $('#chart-container').orgchart({
      'data' : datasource,
      'nodeTemplate': nodeTemplate
    });

  });

})(jQuery);