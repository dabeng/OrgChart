'use strict';

(function($){

  $.mockjax({
    url: '/orgchart/root-node',
    responseTime: 1000,
    contentType: 'application/json',
    responseText: {
      'className': 'root-node',
      'name': 'Lao Lao',
      'dept': 'president office',
      'children': [
        { 'name': 'Bo Miao', 'dept': 'product dept' },
        { 'className': 'drill-down asso-rd', 'name': 'Su Miao', 'dept': 'R&D dept' },
        { 'name': 'Hong Miao', 'dept': 'finance dept' },
        { 'name': 'Chun Miao', 'dept': 'HR dept' }
      ]
    }
  });

  $.mockjax({
    url: '/orgchart/asso-rd',
    responseTime: 1000,
    contentType: 'application/json',
    responseText: {
      'className': 'asso-rd drill-up',
      'name': 'Su Miao',
      'dept': 'R&D dept',
      'children': [
        { 'name': 'Tie Hua', 'dept': 'backend group' },
        { 'className': 'drill-down asso-frontend', 'name': 'Hei Hei', 'dept': 'frontend group' }
      ]
    }
  });

  $.mockjax({
    url: '/orgchart/asso-frontend',
    responseTime: 1000,
    contentType: 'application/json',
    responseText:  {
      'className': 'asso-frontend drill-up',
      'name': 'Hei Hei',
      'dept': 'frontend group',
      'children': [
        { 'name': 'Pang Pang', 'dept': 'frontend group' },
        { 'name': 'Xiang Xiang', 'dept': 'frontend group',
          'children': [
            { 'name': 'Xiao Xiao', 'dept': 'frontend group' },
            { 'name': 'Dan Dan', 'dept': 'frontend group' },
            { 'name': 'Zai Zai', 'dept': 'frontend group' }
          ]
        }
      ]
    }
  });

  function initOrgchart(rootClass) {
    $('#chart-container').orgchart({
      'chartClass': rootClass,
      'data' : '/orgchart/' + rootClass,
      'nodeContent': 'dept',
      'createNode': function($node, data) {
        if ($node.is('.drill-down')) {
          var assoClass = data.className.match(/asso-\w+/)[0];
          var drillDownIcon = $('<i>', {
            'class': 'fa fa-arrow-circle-down drill-icon',
            'click': function() {
              $('#chart-container').find('.orgchart:visible').addClass('hidden');
              if (!$('#chart-container').find('.orgchart.' + assoClass).length) {
                initOrgchart(assoClass);
              } else {
                $('#chart-container').find('.orgchart.' + assoClass).removeClass('hidden');
              }
            }
          });
          $node.append(drillDownIcon);
        } else if ($node.is('.drill-up')) {
          var assoClass = data.className.match(/asso-\w+/)[0];
          var drillUpIcon = $('<i>', {
            'class': 'fa fa-arrow-circle-up drill-icon',
            'click': function() {
              $('#chart-container').find('.orgchart:visible').addClass('hidden').end()
                .find('.drill-down.' + assoClass).closest('.orgchart').removeClass('hidden');
            }
          });
          $node.append(drillUpIcon);
        }
      }
    });
  }

  $(function() {

    initOrgchart('root-node');

  });

})(jQuery);