'use strict';

(function($){

  $(function() {

    var datascource = {
      'name': 'Ball game',
      'relationship': '001',
      'children': [
        { 'name': 'Football', 'relationship': '110' },
        { 'name': 'Basketball', 'relationship': '110' },
        { 'name': 'Volleyball', 'relationship': '110' }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeTitle': 'name',
      'exportButton': true,
      'exportFilename': 'SportsChart',
      'parentNodeSymbol': 'fa-th-large',
      'createNode': function($node, data) {
        $node.on('click', function() {
          $('#selected-node').val(data.name);
        });
      }
    });

    $('#btn-add-node').on('click', function() {
      $('#chart-container').orgchart('buildParentNode',{
        'name': $('#new-nodelist').find('.new-node').first().val().trim(),
        'relationship': '001'
      });
    });

  });

})(jQuery);