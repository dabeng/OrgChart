'use strict';

(function($){

  $(function() {

    var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'watercolor'
            })
          }),
          new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'terrain-labels'
            })
          })
        ],
        target: 'pageBody',
        view: new ol.View({
          center: ol.proj.transform(
              // [-122.416667, 37.783333], 'EPSG:4326', 'EPSG:3857'),
            [-87.65, 41.883333], 'EPSG:4326', 'EPSG:3857'),
          zoom: 10
        })
      });

    $('body').prepend(map.getViewport());

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': '001',
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': '111' },
        { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Yu Li', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Hong Miao', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Yu Wei', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Chun Miao', 'title': 'department manager', 'relationship': '110' },
        { 'name': 'Yu Tie', 'title': 'department manager', 'relationship': '110' }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeTitle': 'name',
      'nodeContent': 'title',
      'createNode': function($node, data) {
        $node.on('click', function() {
          map.getView().setCenter(ol.proj.transform([-122.416667, 37.783333], 'EPSG:4326', 'EPSG:3857'));
        });
      }
    });

  });

})(jQuery);