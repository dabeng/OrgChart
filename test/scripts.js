// 'use strict';

(function($){

  $(function() {

    var DataSourceHR = {
  'name': 'Root',
  'className': 'root-level',
  'children': [{
    'name': 'Operations',
    'title': '20686470717.56',
    'className': 'top-level',
    'children': [{
      'name': 'Computer Resources',
      'title': '24792.08',
      'className': 'bottom-level'
    }, {
      'name': 'Consulting Sales',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'Controllers Office',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'Facilities Resources',
      'title': '731.48',
      'className': 'bottom-level'
    }, {
      'name': 'Finance',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'HR and Administration Managment',
      'title': '751890.23',
      'className': 'bottom-level'
    }, {
      'name': 'Human Resources',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'International Sales',
      'title': '2000',
      'className': 'bottom-level'
    }, {
      'name': 'Leasing',
      'title': '92',
      'className': 'bottom-level'
    }, {
      'name': 'M1, Seattle Manufacturing Plant',
      'title': '20433725346.66',
      'className': 'bottom-level'
    }, {
      'name': 'M3, Dallas Manufacturing Plant 2',
      'title': '251697380.07',
      'className': 'bottom-level'
    }, {
      'name': 'New Orleans inv.org. M7',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'No Department',
      'title': '24686.03',
      'className': 'bottom-level'
    }, {
      'name': 'Phoenix inv.org. M6',
      'title': '2990',
      'className': 'bottom-level'
    }, {
      'name': 'Purchasing',
      'title': '34303.5',
      'className': 'bottom-level'
    }, {
      'name': 'Sales Central',
      'title': '48410.7',
      'className': 'bottom-level'
    }, {
      'name': 'Sales East',
      'title': '23175',
      'className': 'bottom-level'
    }, {
      'name': 'Sales Mid-Atlantic',
      'title': '21065.65',
      'className': 'bottom-level'
    }, {
      'name': 'Sales SouthEast',
      'title': '19500',
      'className': 'bottom-level'
    }, {
      'name': 'Sales West',
      'title': '0',
      'className': 'bottom-level'
    }, {
      'name': 'Service Contracts',
      'title': '49555.83',
      'className': 'bottom-level'
    }, {
      'name': 'Vision Operations Inventory',
      'title': '44798.329999999994',
      'className': 'bottom-level'
    }]
  }, {
    'name': 'Project Mfg (Vision MRC)',
    'title': '0',
    'className': 'top-level',
    'children': [{
      'name': 'Sales East',
      'title': '0',
      'className': 'bottom-level'
    }]
  }, {
    'name': 'Vision Construction',
    'title': '13192.2',
    'className': 'top-level',
    'children': [{
      'name': 'Texas Inventory',
      'title': '13192.2',
      'className': 'bottom-level'
    }]
  }]
};

$('#Org-container').orgchart({
  'data': DataSourceHR,
  'nodeContent': 'title',
    'zoom': 'true',
    'pan': 'true',
  'exportButton': true,
  'exportFilename': 'MyHR'
});

})

})(jQuery);