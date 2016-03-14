/*
 * jQuery OrgChart Plugin
 * https://github.com/dabeng/OrgChart
 *
 * Demos of jQuery OrgChart Plugin
 * http://dabeng.github.io/OrgChart/local-datasource/
 * http://dabeng.github.io/OrgChart/ajax-datasource/
 * http://dabeng.github.io/OrgChart/ondemand-loading-data/
 * http://dabeng.github.io/OrgChart/option-createNode/
 * http://dabeng.github.io/OrgChart/export-orgchart/
 * http://dabeng.github.io/OrgChart/integrate-map/
 *
 * Copyright 2016, dabeng
 * http://dabeng.github.io/
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function($) {
  'use strict';

  $.fn.orgchart = function(options) {
    var defaultOptions = {
      nodeRelationship: 'relationship',
      nodeChildren: 'children',
      depth: 999,
      chartClass: '',
      exportButton: false,
      exportFilename: 'OrgChart',
      'parentNodeSymbol': 'fa-users'
    };

    switch (options) {
      case 'buildNode':
        return buildNode.apply(this, Array.prototype.splice.call(arguments, 1));
      case 'addChildren':
        return addChildren.apply(this, Array.prototype.splice.call(arguments, 1));
      case 'addParent':
        return addParent.apply(this, Array.prototype.splice.call(arguments, 1));
      case 'addSiblings':
        return addSiblings.apply(this, Array.prototype.splice.call(arguments, 1));
      default: // initiation time
        var opts = $.extend(defaultOptions, options);
        this.data('orgchart', { 'options' : opts });
    }

    // build the org-chart
    var $chartContainer = this;
    var data = opts.data;
    var $chart = $('<div>',{
      'class': 'orgchart' + (opts.chartClass !== '' ? ' ' + opts.chartClass : ''),
      'click': function(event) {
        if (!$(event.target).closest('.node').length) {
          $chart.find('.node.focused').removeClass('focused');
        }
      }
    });
    if ($.type(data) === 'object') {
      buildNode(data, $chart, 0, opts);
    } else {
      $.ajax({
        'url': data,
        'dataType': 'json',
        beforeSend: function () {
          $chart.append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>');
        }
      })
      .done(function(data, textStatus, jqXHR) {
        buildNode(data, $chart, 0, opts);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
      })
      .always(function() {
        $chart.children('.spinner').remove();
      });
    }
    $chartContainer.append($chart);

    // append the export button
    if (opts.exportButton) {
      var $exportBtn = $('<button>', {
        'class': 'oc-export-btn' + (opts.chartClass !== '' ? ' ' + opts.chartClass : ''),
        'text': 'Export',
        'click': function() {
          if ($(this).children('.spinner').length > 0) {
            return false;
          }
          var $mask = $chartContainer.find('.mask');
          if (!$mask.length) {
            $chartContainer.append('<div class="mask"><i class="fa fa-circle-o-notch fa-spin spinner"></i></div>');
          } else {
            $mask.removeClass('hidden');
          }
          html2canvas($chart[0], {
            'onrendered': function(canvas) {
              $chartContainer.find('.mask').addClass('hidden')
                .end().find('.oc-download-btn').attr('href', canvas.toDataURL())[0].click();
            }
          });
        }
      });
      var downloadBtn = '<a class="oc-download-btn' + (opts.chartClass !== '' ? ' ' + opts.chartClass : '') + '"'
        + ' download="' + opts.exportFilename + '.png"></a>';
      $chartContainer.append($exportBtn).append(downloadBtn);
    }

    return $chartContainer;
  };

  // determin whether the parent node of the specified node is visible on current chart view
  function getParentState($node) {
    if ($node.children('.spinner').length > 0) {
      return {};
    }
    var $parent = $node.closest('table').parent();
    if ($parent.is('td')) {
      if ($parent.closest('tr').siblings().is(':visible')) {
        return {"exist": true, "visible": true};
      }
      return {"exist": true, "visible": false};
    }
    return {"exist": false, "visible": false};
  }
  function getChildrenState($node) {
    if ($node.children('.spinner').length > 0) {
      return {};
    }
    var $children = $node.closest('tr').siblings();
    if ($children.length > 0) {
      if ($children.is(':visible')) {
        return {"exist": true, "visible": true};
      }
      return {"exist": true, "visible": false};
    }
    return {"exist": false, "visible": false};
  }
  function getSiblingsState($node) {
    if ($node.children('.spinner').length > 0) {
      return {};
    }
    var $siblings = $node.closest('table').parent('td').siblings();
    if ($siblings.length > 0) {
      if ($siblings.is(':visible')) {
        return {"exist": true, "visible": true};
      }
      return {"exist": true, "visible": false};
    }
    return {"exist": false, "visible": false};
  }

  // recursively hide the ancestor node and sibling nodes of the specified node
  function hideAncestorsSiblings($node, dtd) {
    if ($node.closest('table').closest('tr').siblings(':first').find('.spinner').length) {
      $node.closest('div.orgchart').data('inAjax', false);
    }
    // firstly, hide the sibling nodes
    if (getSiblingsState($node).visible) {
      hideSiblings($node, false);
    }
    // hide the links
    var $temp = $node.closest('table').closest('tr').siblings();
    var $links = $temp.slice(1);
    $links.css('visibility', 'hidden');
    // secondly, hide the superior nodes with animation
    var nodeOffset = $links.eq(0).outerHeight() + $links.eq(1).outerHeight();
    var $parent = $temp.eq(0).find('div.node');
    var grandfatherVisible = getParentState($parent).visible;
    if ($parent.length > 0 && $parent.is(':visible')) {
      $parent.animate({'opacity': 0, 'top': +nodeOffset}, 300, function() {
        $parent.removeAttr('style');
        $links.removeAttr('style');
        $temp.hide();
        if ($parent.closest('table').parent().is('.orgchart') || !grandfatherVisible) {
          dtd.resolve();
        }
      });
    }
    // if the current node has the parent node, hide it recursively
    if ($parent.length && grandfatherVisible) {
      hideAncestorsSiblings($parent, dtd);
    }

    return dtd.promise();
  }

  // show the parent node of the specified node
  function showAncestorsSiblings($node) {
    var dtd = $.Deferred();
    // just show only one superior level
    var $temp = $node.closest('table').closest('tr').siblings().show();

    // just show only one link
    $temp.eq(2).children().slice(1, $temp.eq(2).children().length - 1).hide();
    dtd.resolve();
    // show the the only parent node with animation
    $temp.eq(0).find('div.node')
      .animate({'opacity': 1, 'top': 0}, 300, function() {
        $(this).removeAttr('style');

      });

    return dtd.promise();
  }

  // recursively hide the descendant nodes of the specified node
  function hideDescendants($node) {
    var dtd = $.Deferred();
    if ($node.closest('tr').siblings(':last').find('.spinner').length) {
      $node.closest('div.orgchart').data('inAjax', false);
    }
    var $links = $node.closest('tr').siblings(':lt(2)');
    $links.css('visibility', 'hidden');
    var nodeOffset = $links.eq(0).outerHeight() + $links.eq(1).outerHeight();
    $.when(
      $node.closest('tr').siblings(':last').find('div.node')
      .animate({'opacity': 0, 'top': -nodeOffset}, 300)
    )
    .done(function() {
      $links.removeAttr('style');
      $node.closest('tr').siblings().hide();
      dtd.resolve();
    });

    return dtd.promise();
  }

  // show the children nodes of the specified node
  function showDescendants($node) {
    var dtd = $.Deferred();
    // firstly, just show the only one inferior level of the child nodes
    var $temp = $node.closest('tr').siblings().show();
    dtd.resolve();
    // secondly, display the child nodes with animation
    var isLeaf = $temp.eq(2).children('td').length > 1 ? true : false;
    var $children = isLeaf ? $temp.eq(2).find('div.node') :
      $temp.eq(2).find('tr:first').find('div.node');
    $.when(
       $children.animate({'opacity': 1, 'top': 0}, 300)
     )
    .done(function() {
      $children.removeAttr('style');
    });
    // lastly, remember to hide all the inferior nodes of child nodes of current node
    $children.each(function(index, child){
      $(child).closest('tr').siblings().hide();
    });

    return dtd.promise();
  }

  function attachAnimationToSiblings(justSiblings, $siblings, offset, dtd) {
    if ($siblings.length > 0) {
      $.when(
        $siblings.find('div.node')
          .animate({'opacity': 0, 'left': offset}, 300)
      )
      .done(function() {
        $siblings.hide();
        if (justSiblings) {
          $siblings.closest('.orgchart').css('opacity', 0);// hack for firefox
        }
        $siblings.parent().prev().prev().removeAttr('style');
        var $temp = $siblings.parent().prev().children();
        $temp.eq(0).removeAttr('style');
        $temp.eq($temp.length - 1).removeAttr('style');
        dtd.resolve();
      });
    }
  }

  // hide the sibling nodes of the specified node
  function hideSiblings($node, justSiblings) {
    var dtd = $.Deferred();
    var $nodeContainer = $node.closest('table').parent();
    if ($nodeContainer.siblings().find('.spinner').length) {
      $node.closest('div.orgchart').data('inAjax', false);
    }
    var nodeOffset = $node.outerWidth();
    // firstly, hide the links but take up space
    var $upperLink = $nodeContainer.parent().prev().prev();
    $upperLink.css('visibility', 'hidden')
    var $temp = $nodeContainer.parent().prev().children();
    $temp.slice(1, $temp.length -1).hide();
    $temp.eq(0).css('visibility', 'hidden');
    $temp.eq($temp.length - 1).css('visibility', 'hidden');
    // secondly, hide the sibling nodes with animation simultaneously
    attachAnimationToSiblings(justSiblings, $nodeContainer.prevAll(), +nodeOffset, dtd);
    attachAnimationToSiblings(justSiblings, $nodeContainer.nextAll(), -nodeOffset, dtd);

    return dtd.promise();
  }

  // show the sibling nodes of the specified node
  function showSiblings($node) {
    var dtd = $.Deferred();
    // firstly, show the sibling td tags
    var $siblings = $node.closest('table').parent().siblings().show();
    // secondly, show the links
    var $parent = $node.closest('table').closest('tr').siblings();
    var $lowerLinks = $parent.eq(2).children();
    $lowerLinks.slice(1, $lowerLinks.length -1).show();
    // thirdly, do some cleaning stuff
    if ($node.children('.topEdge').data('parentState').visible) {
      $siblings.each(function(index, sibling){
        $(sibling).find('div.node').closest('tr').siblings().hide();
      });
    } else {
      $parent.show();
    }
    dtd.resolve();
    // lastly, show the sibling nodes with animation
    $siblings.find('div.node').animate({'opacity': 1, 'left': 0}, 300);

    return dtd.promise();
  }

  // start up loading status for requesting new nodes
  function startLoadingStatus($arrow, $node, options) {
    var $chart = $node.closest('div.orgchart');
    if (typeof $chart.data('inAjax') !== 'undefined' && $chart.data('inAjax') === true) {
      return false;
    }

    $arrow.hide();
    $node.append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>');
    $node.children().not('.spinner').css('opacity', 0.2);
    $chart.data('inAjax', true);
    $('.oc-export-btn' + (options.chartClass !== '' ? '.' + options.chartClass : '')).prop('disabled', true);
    return true;
  }

  // terminate loading status for requesting new nodes
  function endLoadingStatus($arrow, $node, options) {
    var $chart = $node.closest('div.orgchart');
    $arrow.show();
    $node.find('.spinner').remove();
    $node.children().removeAttr('style');
    $chart.data('inAjax', false);
    $('.oc-export-btn' + (options.chartClass !== '' ? '.' + options.chartClass : '')).prop('disabled', false);
  }

  // whether the cursor is hovering over the node
  function isInAction($node) {
    return $node.children('.edge').attr('class').indexOf('fa-') > -1 ? true : false;
  }

  function switchUpDownArrow($arrow) {
    $arrow.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
  }

  function collapseArrow($node) {
    switchLeftRightArrow($node, false);
    $node.children('.topEdge')
      .removeClass('fa-chevron-up').addClass('fa-chevron-down');
    $node.children('.topEdge').data('parentState').visible = true;
  }

  function switchLeftRightArrow($node, isExpand) {
    if (isExpand) {
      $node.children('.leftEdge')
        .removeClass('fa-chevron-right').addClass('fa-chevron-left');
      $node.children('.rightEdge')
        .removeClass('fa-chevron-left').addClass('fa-chevron-right');
    } else {
      $node.children('.leftEdge')
        .removeClass('fa-chevron-left').addClass('fa-chevron-right');
      $node.children('.rightEdge')
        .removeClass('fa-chevron-right').addClass('fa-chevron-left');
    }
  }

  // create node
  function createNode(nodeData, opts) {
    // construct the content of node
    var $nodeDiv = $('<div>', { 'id': nodeData[opts.nodeId] })
      .addClass('node')
      .append('<div class="title">' + nodeData[opts.nodeTitle] + '</div>')
      .append(typeof opts.nodeContent !== 'undefined' ? '<div class="content">' + nodeData[opts.nodeContent] + '</div>' : '');
    // append 4 directions arrows
    var flags = nodeData[opts.nodeRelationship];
    if (Number(flags.substr(0,1))) {
      $nodeDiv.append('<i class="edge verticalEdge topEdge fa"></i>');
    }
    if(Number(flags.substr(1,1))) {
      $nodeDiv.append('<i class="edge horizontalEdge rightEdge fa"></i>' +
        '<i class="edge horizontalEdge leftEdge fa"></i>');
    }
    if(Number(flags.substr(2,1))) {
      $nodeDiv.find('.title').prepend('<i class="fa '+ opts.parentNodeSymbol + ' symbol"></i>')
      $nodeDiv.append('<i class="edge verticalEdge bottomEdge fa"></i>');
    }

    // define hover event handler
    $nodeDiv.on('mouseenter mouseleave', function(event) {
      var $node = $(this);
      var $edge = $node.children('.edge');
      var $topEdge = $node.children('.topEdge');
      var $rightEdge = $node.children('.rightEdge');
      var $bottomEdge = $node.children('.bottomEdge');
      var $leftEdge = $node.children('.leftEdge');
      var temp;
      if (event.type === 'mouseenter') {
        if ($topEdge.length) {
          temp = getParentState($node);
          if (!$.isEmptyObject(temp)) {
            $topEdge.data('parentState', temp);
          }
          if ($topEdge.data('parentState').visible) {
            $topEdge.removeClass('fa-chevron-up').addClass('fa-chevron-down');
          } else {
            $topEdge.removeClass('fa-chevron-down').addClass('fa-chevron-up');
          }
        }
        if ($bottomEdge.length) {
          temp = getChildrenState($node);
          if (!$.isEmptyObject(temp)) {
            $bottomEdge.data('childrenState', temp);
          }
          if($bottomEdge.data('childrenState').visible) {
            $bottomEdge.removeClass('fa-chevron-down').addClass('fa-chevron-up');
          } else {
            $bottomEdge.removeClass('fa-chevron-up').addClass('fa-chevron-down');
          }
        }
        if ($leftEdge.length) {
          temp = getSiblingsState($node);
          if (!$.isEmptyObject(temp)) {
            $rightEdge.data('siblingsState', temp);
            $leftEdge.data('siblingsState', temp);
          }
          if($leftEdge.data('siblingsState').visible) {
            switchLeftRightArrow($node, false);
          } else {
            switchLeftRightArrow($node, true);
          }
        }
      } else {
        $topEdge.add($bottomEdge).removeClass('fa-chevron-up fa-chevron-down');
        $rightEdge.add($leftEdge).removeClass('fa-chevron-right fa-chevron-left');
      }
    });

    // define click event handler
    $nodeDiv.on('click', function(event) {
      var $node = $(this);
      $node.closest('.orgchart').find('.focused').removeClass('focused');
      $node.addClass('focused');
    });

    // define click event handler for the top edge
    $nodeDiv.on('click', '.topEdge', function(event) {
      var $that = $(this);
      var $node = $that.parent();
      var parentState = $that.data('parentState');
      if ($node.children('.spinner').length) {
        return false;
      }
      if (parentState.exist) {
        if ($node.closest('table').closest('tr').siblings(':first').find('div.node').is(':animated')) {
          return ;
        }
        // hide the ancestor nodes and sibling nodes of the specified node
        if (parentState.visible) {
          var dtd = $.Deferred();
          $.when(hideAncestorsSiblings($node, dtd))
　　        .done(function(){
              parentState.visible = false;
              if ($node.children('.leftEdge').length) {
                $node.children('.leftEdge').data('siblingsState').visible = false;
                $node.children('.rightEdge').data('siblingsState').visible = false;
              }
              if (isInAction($node)) {
                switchUpDownArrow($that);
                switchLeftRightArrow($node, true);
              }
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        } // show the ancestors and siblings
        else {
          $.when(showAncestorsSiblings($node))
　　        .done(function(){
              parentState.visible = true;
              switchUpDownArrow($that);
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        }
      } else {
        // load the new parent node of the specified node by ajax request
        var nodeId = $that.parent()[0].id;
        // start up loading status
        if (startLoadingStatus($that, $node, opts)) {
        // load new nodes
          $.ajax({
            "url": opts.ajaxURL.parent + nodeId + "/",
            "dataType": "json"
          })
          .done(function(data, textStatus, jqXHR) {
            if ($node.closest('div.orgchart').data('inAjax')) {
              if (!$.isEmptyObject(data)) {
                addParent($node, data, opts);
              }
              parentState.exist = true;
            }
            // terminate the loading status
            endLoadingStatus($that, $node, opts);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            parentState.exist = true;
            // terminate the loading status
            endLoadingStatus($that, $node, opts);
          });
        }
      }
    });

    // bind click event handler for the bottom edge
    $nodeDiv.children('.bottomEdge').on('click', function(event) {
      var $that = $(this);
      var $node = $that.parent();
      var childrenState = $that.data('childrenState');
      if ($node.children('.spinner').length) {
        return false;
      }
      if (childrenState.exist) {
        if ($node.closest('tr').siblings(':last').find('div.node').is(':animated')) {
          return ;
        }
        // hide the descendant nodes of the specified node
        if (childrenState.visible) {
          $.when(hideDescendants($node))
　　        .done(function(){
              childrenState.visible = false;
              if (isInAction($node)) {
                switchUpDownArrow($that);
              }
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        } // show the descendants
        else {
          $.when(showDescendants($node))
　　        .done(function(){
              childrenState.visible = true;
              switchUpDownArrow($that);
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        }
      } else {
        // load the new children nodes of the specified node by ajax request
        var nodeId = $that.parent()[0].id;
        if (startLoadingStatus($that, $node, opts)) {
          $.ajax({
            "url": opts.ajaxURL.children + nodeId + "/",
            "dataType": "json"
          })
          .done(function(data, textStatus, jqXHR) {
            if ($node.closest('div.orgchart').data('inAjax')) {
              if (data.children.length) {
                addChildren($node, data, false, opts);
              }
              childrenState.exist = true;
            }
            endLoadingStatus($that, $node, opts);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            childrenState.exist = true;
            endLoadingStatus($that, $node, opts);
          });
        }
      }
    });

    // bind click event handler for the left and right edges
    $nodeDiv.on('click', '.leftEdge, .rightEdge', function(event) {
      var $that = $(this);
      var $node = $that.parent();
      var siblingsState = $that.data('siblingsState');
      if ($node.children('.spinner').length > 0) {
        return false;
      }
      if (siblingsState.exist) {
        if ($node.closest('table').parent().siblings().find('div.node').is(':animated')) {
          return ;
        }
        // hide the sibling nodes of the specified node
        if (siblingsState.visible) {
          $.when(hideSiblings($node, true))
　　        .done(function(){
              setTimeout(function() {
                $node.closest('.orgchart').css('opacity', '');// hack for firefox
                siblingsState.visible = false;
                if (isInAction($node)) {
                  switchLeftRightArrow($node, true);
                }
              }, 0);
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        } // show the siblings
        else {
          $.when(showSiblings($node))
　　        .done(function(){
              siblingsState.visible = true;
              collapseArrow($node);
            })
　　        .fail(function(){ console.log('failed to adjust the position of org-chart!'); });
        }
      } else {
        // load the new sibling nodes of the specified node by ajax request
        var nodeId = $that.parent()[0].id;
        var withParent = !$that.siblings('.topEdge').data('parentState').exist;
        var url = (withParent) ? opts.ajaxURL.families : opts.ajaxURL.siblings;
        if (startLoadingStatus($that, $node, opts)) {
          $.ajax({
            "url": url + nodeId + "/",
            "dataType": "json"
          })
          .done(function(data, textStatus, jqXHR) {
            if ($node.closest('div.orgchart').data('inAjax')) {
              if (data.siblings || data.children) {
                addSiblings($node, data, opts);
              }
              $node.children('.topEdge').data('parentState').exist = true;
              siblingsState.exist = true;
              if ($that.is('.leftEdge')) {
                $that.siblings('.rightEdge').data('siblingsState', {'exist': true, 'visible': true});
              } else {
                $that.siblings('.leftEdge').data('siblingsState', {'exist': true, 'visible': true});
              }
            }
            endLoadingStatus($that, $node, opts);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            siblingsState.exist = true;
            endLoadingStatus($that, $node, opts);
          });
        }
      }
    });
    // remedy the defect of css selector -- there is not "previous sibling" selector
    $nodeDiv.children('.leftEdge').on('mouseenter mouseleave', function(event) {
      if (event.type === 'mouseenter') {
        var $rightEdge = $(this).siblings('.rightEdge');
        if (!getSiblingsState($(this)).visible) {
          $rightEdge.addClass('rightEdgeMoveRight');
        } else {
          $rightEdge.addClass('rightEdgeMoveLeft');
        }
      } else {
        $(this).siblings('.rightEdge').removeClass('rightEdgeMoveRight rightEdgeMoveLeft');
      }
    });

    // allow user to append dom modification after finishing node create of orgchart 
    if (opts.createNode) {
      opts.createNode($nodeDiv, nodeData);
    }

    return $nodeDiv;
  }
  // recursively build the tree
  function buildNode (nodeData, $appendTo, level, opts, callback) {
    var $table = $('<table>');

    // Construct the node
    var $nodeRow = $('<tr>');
    var $nodeCell = $('<td colspan="2">');
    var $childNodes = nodeData[opts.nodeChildren];
    if ($childNodes && $childNodes.length > 1) {
      $nodeCell.attr("colspan", $childNodes.length * 2);
    }
    var $nodeDiv = createNode(nodeData, opts);
    $nodeCell.append($nodeDiv);
    $nodeRow.append($nodeCell);
    $table.append($nodeRow);

    if ($childNodes && $childNodes.length > 0) {
      // recurse until leaves found or to the level specified
      var $childNodesRow;
      var $downLineRow = $('<tr>');
      var $downLineCell = $("<td/>").attr("colspan", $childNodes.length * 2);
      $downLineRow.append($downLineCell);

      // draw the connecting line from the parent node to the horizontal line
      var $downLine = $('<div class="down"></div>');
      $downLineCell.append($downLine);
      if (level + 1 < opts.depth) {
        $table.append($downLineRow);
      } else {
        $table.append($downLineRow.hide());
      }

      // draw the horizontal lines
      var $linesRow = $('<tr>');
      $.each($childNodes, function() {
        var $left = $('<td class="right top">&nbsp;</td>');
        var $right = $('<td class="left top">&nbsp;</td>');
        $linesRow.append($left).append($right);
      });

      // horizontal line shouldn't extend beyond the first and last child branches
      $linesRow.find("td:first").removeClass("top").end().find("td:last").removeClass("top");
      if (level + 1 < opts.depth) {
        $table.append($linesRow);
      } else {
        $table.append($linesRow.hide());
      }
      $childNodesRow = $('<tr>');
      $.each($childNodes, function() {
        var $td = $('<td class="node-container"/>');
        $td.attr("colspan", 2);
        // recurse through children lists and items
        if (callback) {
          buildNode(this, $td, level + 1, opts, callback);
        } else {
          buildNode(this, $td, level + 1, opts);
        }
        if (level + 1 < opts.depth) {
          $childNodesRow.append($td);
        } else {
          $childNodesRow.append($td).hide();
        }
      });
      $table.append($childNodesRow);
    }

    $appendTo.append($table);

    // fire up callback every time of building up a node
    if (callback) {
      callback();
    }

  }

  // build the child nodes of specific node
  function buildChildNode ($appendTo, nodeData, opts, callback) {
    var $childNodes = nodeData.children || nodeData.siblings;
    var $table;
    if (Object.keys(nodeData).length > 1) {
      $table = $('<table>');

      // create the node
      var $nodeRow = $('<tr>');
      var $nodeCell = $('<td>');
      var $nodeDiv = createNode(nodeData, opts ? opts : this.data('orgchart').options);
      $nodeCell.append($nodeDiv);
      $nodeRow.append($nodeCell);
      $table.append($nodeRow);
    } else {
      $appendTo.find('td:first').attr('colspan', $childNodes.length * 2);
    }

    if ($childNodes && $childNodes.length > 0) {
      // recurse until leaves found (-1) or to the level specified
      var $downLineRow = $('<tr>');
      var $downLineCell = $('<td>').attr("colspan", $childNodes.length * 2);
      $downLineRow.append($downLineCell);

      // draw the connecting line from the parent node to the horizontal line
      var $downLine = $('<div class="down">');
      $downLineCell.append($downLine);
      if (Object.keys(nodeData).length > 1) {
        $table.append($downLineRow);
      } else {
        $appendTo.append($downLineRow);
      }

      // Draw the horizontal lines
      var $linesRow = $('<tr>');
      $.each($childNodes, function() {
        var $left = $('<td class="right top">&nbsp;</td>');
        var $right = $('<td class="left top">&nbsp;</td>');
        $linesRow.append($left).append($right);
      });

      // horizontal line shouldn't extend beyond the first and last child branches
      $linesRow.find("td:first").removeClass("top").end().find("td:last").removeClass("top");

      if (Object.keys(nodeData).length > 1) {
        $table.append($linesRow);
      } else {
        $appendTo.append($linesRow);
      }

      var $childNodesRow = $('<tr>');
      $.each($childNodes, function() {
        var $td = $("<td class='node-container'/>");
        $td.attr("colspan", 2);
        // recurse through children lists and items
        if (callback) {
          buildChildNode.call($appendTo.closest('.orgchart').parent(), $td, this, opts, callback);
        } else {
          buildChildNode.call($appendTo.closest('.orgchart').parent(), $td, this, opts);
        }
        $childNodesRow.append($td);
      });

      if (Object.keys(nodeData).length > 1) {
        $table.append($childNodesRow);
      } else {
        $appendTo.append($childNodesRow);
      }
    }

    if (Object.keys(nodeData).length > 1) {
      $appendTo.append($table);
    }

    // fire up callback every time of building up a node
    if (callback) {
      callback();
    }

  }
  // exposed method
  function addChildren($node, data, opts) {
    var dtd = $.Deferred();
    var count = 0;
    $.when(buildChildNode.call($node.closest('.orgchart').parent(), $node.closest('table'), data, opts, function() {
        if (++count === data.children.length + 1) {
          dtd.resolve();
          return dtd.promise();
        }
      }))
　　  .done(function(){
        $node.children('.bottomEdge').data('childrenState', { 'exist': true, 'visible': true });
        if (isInAction($node)) {
          switchUpDownArrow($node.children('.bottomEdge'));
        }
      })
　　  .fail(function(){
        console.log('failed to add children nodes');
      });
  }

  // build the parent node of specific node
  function buildParentNode(nodeData, opts) {
    var dtd = $.Deferred();
    var $table = $('<table>');

    // Construct the node
    var $nodeRow = $('<tr>');
    var $nodeCell = $('<td colspan="2">');
    nodeData[(opts && opts.nodeRelationship) ? opts.nodeRelationship : 'relationship'] = '001';
    var $nodeDiv = createNode(nodeData, opts ? opts : this.data('orgchart').options);
    $nodeCell.append($nodeDiv);
    $nodeRow.append($nodeCell);
    $table.append($nodeRow);

    // recurse until leaves found (-1) or to the level specified
    var $downLineRow = $('<tr>');
    var $downLineCell = $('<td colspan="2">');
    $downLineRow.append($downLineCell);

    // draw the connecting line from the parent node to the horizontal line
    var $downLine = $('<div class="down">');
    $downLineCell.append($downLine);
    $table.append($downLineRow);


    // Draw the horizontal lines
    var $linesRow = $('<tr>');
    var $left = $('<td class="right top">&nbsp;</td>');
    var $right = $('<td class="left top">&nbsp;</td>');
    $linesRow.append($left).append($right);

    // horizontal line shouldn't extend beyond the first and last child branches
    $linesRow.find("td:first").removeClass("top").end().find("td:last").removeClass("top");
    $table.append($linesRow);

    var oc = this.children('.orgchart');
    oc.prepend($table).children('table:first')
      .append($('<tr>').append($('<td class="node-container" colspan="2">')))
      .children().children('tr:last').children()
      .append(oc.children('table').last());

    dtd.resolve();
    return dtd.promise();
  }

  // exposed method
  function addParent($node, data, opts) {
    $.when(buildParentNode.call($node.closest('.orgchart').parent(), data, opts))
　　  .done(function(){
        $node.children('.title').after('<i class="edge verticalEdge topEdge fa"></i>')
          .data('parentState', { 'exist': true, 'visible': true });
        if (isInAction($node)) {
          switchUpDownArrow($node.children('.topEdge'));
        }
      })
　　  .fail(function(){
        console.log('failed to add parent node');
      });
  }

  // subsequent processing of build sibling nodes
  function complementLine($oneSibling, siblingCount, existingSibligCount) {
    var lines = '';
    for (var i = 0; i < existingSibligCount; i++) {
      lines += '<td class="left top">&nbsp;</td><td class="right top">&nbsp;</td>';
    }
    $oneSibling.parent().prevAll('tr:gt(0)').children()
      .attr('colspan', siblingCount * 2)
      .end().next().children(':first')
      .after($(lines));
  }

  // build the sibling nodes of specific node
  function buildSiblingNode($nodeChart, nodeData, opts) {
    var dtd = $.Deferred();
    var opts = opts || this.data('orgchart').options;
    var newSiblingCount = nodeData.siblings ? nodeData.siblings.length : nodeData.children.length;
    var existingSibligCount = $nodeChart.parent().is('.node-container') ? $nodeChart.closest('tr').children().length : 1;
    var siblingCount = existingSibligCount + newSiblingCount;
    var insertPostion = (siblingCount > 1) ? Math.floor(siblingCount/2 - 1) : 0;
    // just build the sibling nodes for the specific node
    if ($nodeChart.parent().is('td.node-container')) {
      var $parent = $nodeChart.closest('tr').prevAll('tr:last');
      if ($parent.is(':hidden')) {
        $parent.show();
      }
      $nodeChart.closest('tr').prevAll('tr:lt(2)').remove();
      var childCount = 0;
      buildChildNode.call($nodeChart.closest('.orgchart').parent(),$nodeChart.parent().closest('table'), nodeData, opts, function() {
        if (++childCount === newSiblingCount + 1) {
          if (existingSibligCount > 1) {
            complementLine($nodeChart.parent().closest('table').children().children('tr:last').children('td:first')
              .before($nodeChart.closest('td').siblings().andSelf().unwrap()), siblingCount, existingSibligCount);
          } else {
            complementLine($nodeChart.parent().closest('table').children().children('tr:last').children('td')
            .eq(insertPostion).after($nodeChart.closest('td').unwrap()), siblingCount, 1);
          }

          dtd.resolve();
          return dtd.promise();
        }
      });
    } else { // build the sibling nodes and parent node for the specific ndoe
      var nodeCount = 0;
      buildNode(nodeData, $nodeChart.closest('div.orgchart'), 0, opts,
        function() {
          if (++nodeCount === siblingCount) {
            complementLine($nodeChart.next().children().children('tr:last')
              .children().eq(insertPostion).after($('<td class="node-container" colspan="2">')
              .append($nodeChart)), siblingCount, 1);
            dtd.resolve();
            return dtd.promise();
        }
      });
    }

  }

  function addSiblings($node, data, opts) {
    $.when(buildSiblingNode.call($node.closest('.orgchart').parent(), $node.closest('table'), data, opts))
　　  .done(function(){
        $node.children('.topEdge').after('<i class="edge horizontalEdge rightEdge fa"></i>')
          .siblings('.bottomEdge').after('<i class="edge horizontalEdge leftEdge fa"></i>');
        $node.children('.rightEdge, .leftEdge').data('siblingsState',{ 'exist': true, 'visible': true });
        if (isInAction($node)) {
          collapseArrow($node);
        }
      })
　　  .fail(function(){
        console.log('failed to adjust the position of org-chart!');
      });
  }

})(jQuery);
