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
    })
    .on('click', '.orgchart', function(event) {
      if (!$(event.target).closest('.node').length) {
        $('#selected-node').val('');
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

    $('#btn-add-input').on('click', function() {
      $('#new-nodelist').append('<li><input type="text" class="new-node"></li>');
    });

    $('#btn-remove-input').on('click', function() {
      var inputs = $('#new-nodelist').children('li');
      if (inputs.length > 1) {
        inputs.last().remove();
      }
    });

    $('#btn-add-nodes').on('click', function() {
      var nodeVals = [];
      $('#new-nodelist').find('.new-node').each(function(index, item) {
        var validVal = item.value.trim();
        if (validVal.length) {
          nodeVals.push(validVal);
        }
      });
      var $node = $('#selected-node').data('node');
      if (!nodeVals.length) {
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
          'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110' }; })
        });
      } else {
        var hasChild = $node.parent().attr('colspan') > 2 ? true : false;
        $('#chart-container').orgchart('addChildren', $node, {
          'children': [{ 'name': nodeVals, 'relationship': '1' + (hasChild ? 1 : 0) + '0' }]
        });
      }
    });

    $('#btn-reset').on('click', function() {
      $('.orgchart').trigger('click');
      $('#new-nodelist').find('input:first').val('').parent().siblings().remove();
      $('#node-type-panel').find('input').prop('checked', false);
    });

  });

})(jQuery);