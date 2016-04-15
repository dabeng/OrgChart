  function getHierarchy($orgchart) {
    var $temp = $orgchart.find('tr:first');
    var subObj = { 'id': $temp.find('.node')[0].id };
    $temp.siblings(':last').children().each(function() {
      if (!subObj.children) { subObj.children = []; }
      subObj.children.push(getHierarchy($(this)));
    });
    return subObj;
  }