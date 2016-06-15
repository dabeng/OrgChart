'use strict';

(function($){

  $(function() {

    var topLevelDs = {
      'name': 'Lao Lao',
      'dept': 'president office',
      'children': [
        { 'name': 'Bo Miao', 'dept': 'product dept' },
        { 'name': 'Su Miao', 'dept': 'R&D dept' },
        { 'name': 'Hong Miao', 'dept': 'finance dept' },
        { 'name': 'Chun Miao', 'dept': 'HR dept' }
      ]
    };

    var middleLevelDs = {
      'name': 'Su Miao',
      'dept': 'R&D dept',
      'children': [
        { 'name': 'Tie Hua', 'dept': 'backend group' },
        { 'name': 'Hei Hei', 'dept': 'frontend group' }
      ]
    };

    var bottomLevelDs = {
      'name': 'Hei Hei',
      'dept': 'frontend group',
      'children': [
        { 'name': 'Pang Pang', 'dept': 'frontend group' },
        { 'name': 'Xiang Xiang', 'dept': 'frontend group' },
        { 'name': 'Er Xiang', 'dept': 'frontend group' },
        { 'name': 'San Xiang', 'dept': 'frontend group' }
      ]
    };

    $('#chart-container').orgchart({
      'data' : topLevelDs,
      'nodeContent': 'dept'
    });

  });

})(jQuery);