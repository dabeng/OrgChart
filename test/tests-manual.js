chai.should();

describe('orgchart', function () {

  var $container = $('#chart-container');
  var datascource = {
    'name': 'Lao Lao',
    'title': 'general manager',
    'children': [
      { 'name': 'Bo Miao', 'title': 'department manager' },
      { 'name': 'Su Miao', 'title': 'department manager',
        'children': [
          { 'name': 'Tie Hua', 'title': 'senior engineer' },
          { 'name': 'Hei Hei', 'title': 'senior engineer',
            'children': [
              { 'name': 'Pang Pang', 'title': 'engineer' },
              { 'name': 'Xiang Xiang', 'title': 'UE engineer' }
            ]
          }
        ]
      },
      { 'name': 'Hong Miao', 'title': 'department manager' },
      { 'name': 'Chun Miao', 'title': 'department manager' }
    ]
  };

  beforeEach(function () {
    var oc = $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title'
    });
  });
    
  afterEach(function () {
    $container.empty();
  });

  it('There will be an orgchart embeded in the container div after initialization', function () {
    var $chart = $container.find('.orgchart');

    $chart.length.should.equal(1);
  });
});