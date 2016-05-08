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
      'exportButton': true,
      'exportFilename': 'SportsChart',
      'parentNodeSymbol': 'fa-th-large',
      'createNode': function($node, data) {
        $node.on('click', function(event) {
          if (!$(event.target).is('.edge')) {
            $('#selected-node').val(data.name).data('node', $node);
          }
        });
      }
    })
    .on('click', '.orgchart', function(event) {
      if (!$(event.target).closest('.node').length) {
        $('#selected-node').val('');
      }
    });

    $('input[name="chart-state"]').on('click', function() {
      $('#edit-panel, .orgchart').toggleClass('view-state');
      if ($(this).val() === 'edit') {
        $('.orgchart').find('tr').removeClass('hidden')
          .find('td').removeClass('hidden')
          .find('.node').removeClass('slide-up slide-down slide-right slide-left');
      } else {
        $('#btn-reset').trigger('click');
      }
    });

    $('input[name="node-type"]').on('click', function() {
      var $this = $(this);
      if ($this.val() === 'parent') {
        $('#edit-panel').addClass('edit-parent-node');
        $('#new-nodelist').children(':gt(0)').remove();
      } else {
        $('#edit-panel').removeClass('edit-parent-node');
      }
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
      var nodeType = $('input[name="node-type"]:checked');
      if (nodeType.val() !== 'parent' && !$node) {
        alert('Please select one node in orgchart');
        return;
      }
      if (!nodeType.length) {
        alert('Please select a node type');
        return;
      }
      if (nodeType.val() === 'parent') {
        $('#chart-container').orgchart('addParent', { 'name': nodeVals[0] });
      } else if (nodeType.val() === 'siblings') {
        $('#chart-container').orgchart('addSiblings', $node,
          { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110' }; })
        });
      } else {
        var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
        if (!hasChild) {
          var rel = nodeVals.length > 1 ? '110' : '100';
          $('#chart-container').orgchart('addChildren', $node, {
              'children': nodeVals.map(function(item) {
                return { 'name': item, 'relationship': rel };
              })
            }, $.extend({}, $('#chart-container').data('orgchart').options, { depth: 0 }));
        } else {
          $('#chart-container').orgchart('addSiblings', $node.closest('tr').siblings('.nodes').find('.node:first'),
            { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110' }; })
          });
        }
      }
    });

    $('#btn-delete-nodes').on('click', function() {
      var $node = $('#selected-node').data('node');
      if (!$node) {
        alert('Please select one node in orgchart');
        return;
      }
      $('#chart-container').orgchart('removeNodes', $node);
      $('#selected-node').data('node', null);
    });

    $('#btn-reset').on('click', function() {
      $('.orgchart').trigger('click');
      $('#new-nodelist').find('input:first').val('').parent().siblings().remove();
      $('#node-type-panel').find('input').prop('checked', false);
    });

  });

})(jQuery);