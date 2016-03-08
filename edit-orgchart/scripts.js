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
          $('#selected-node').val(data.name)
            .data('nodechart', $node.closest('table'));
        });
      }
    });

    $('#btn-add-rootnode').on('click', function() {
      var rootnodeVal = $('.edit-panel.first').find('.new-node').val().trim();
      if (!rootnodeVal.length) {
        alert('Please input value for parent node');
        return;
      }
      $('#chart-container').orgchart('addParent', $('#chart-container').find('.node:first'), { 'name': rootnodeVal });
    });

    $('#btn-add-node').on('click', function() {
      var rootnodeVal = $('.edit-panel.second').find('.new-node').val().trim();
      var nodeChart = $('#selected-node').data('nodechart');
      if (!rootnodeVal.length) {
        alert('Please input value for new node');
        return;
      }
      if (!nodeChart) {
        alert('Please select one node in orgchart first');
        return;
      }
      $('#chart-container').orgchart('buildSiblingNode', {
        'siblings':[{ 'name': rootnodeVal, 'relationship': '110' }]
      }, nodeChart);
    });

  });

})(jQuery);