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
          $('#selected-node').val(data.name).data('node', $node);
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
      var $node = $('#selected-node').data('node');
      if (!rootnodeVal.length) {
        alert('Please input value for new node');
        return;
      }
      if (!$node) {
        alert('Please select one node in orgchart');
        return;
      }
      var nodeType = $('input[name="node-type"]:checked');
      if (!nodeType.length) {
        alert('Please select a node type');
        return;
      }
      if (nodeType.val() === 'siblings') {
        $('#chart-container').orgchart('addSiblings', $node, {
          'siblings': [{ 'name': rootnodeVal, 'relationship': '110' }]
        });
      } else {
        var hasChild = $node.parent().attr('colspan') > 2 ? true : false;
        $('#chart-container').orgchart('addChildren', $node, {
          'children': [{ 'name': rootnodeVal, 'relationship': '1' + (hasChild ? 1 : 0) + '0' }]
        });
      }
    });

  });

})(jQuery);