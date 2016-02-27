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
          center: ol.proj.transform([-87.6297980, 41.8781140], 'EPSG:4326', 'EPSG:3857'),
          zoom: 12
        })
      });

    $('body').prepend(map.getViewport());

    var datascource = {
      'name': 'Lao Lao',
      'title': 'general manager',
      'relationship': '001',
      'position': [-87.6297980, 41.8781140],
      'children': [
        { 'name': 'Bo Miao', 'title': 'department manager', 'relationship': '110', 'position': [-0.1277580, 51.5073510]},
        { 'name': 'Su Miao', 'title': 'department manager', 'relationship': '110', 'position': [151.2069900, -33.8674870]},
        { 'name': 'Yu Jie', 'title': 'department manager', 'relationship': '110', 'position': [-43.1728960, -22.9068470]},
        { 'name': 'Yu Li', 'title': 'department manager', 'relationship': '110', 'position': [37.6173000, 55.7558260]},
        { 'name': 'Hong Miao', 'title': 'department manager', 'relationship': '110', 'position': [13.4049540, 52.5200070]},
        { 'name': 'Yu Wei', 'title': 'department manager', 'relationship': '110', 'position': [-74.0059410, 40.7127840]},
        { 'name': 'Chun Miao', 'title': 'department manager', 'relationship': '110', 'position': [103.8198360, 1.3520830]},
        { 'name': 'Yu Tie', 'title': 'department manager', 'relationship': '110', 'position': [2.3522220, 48.8566140] }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeTitle': 'name',
      'nodeContent': 'title',
      'createNode': function($node, data) {
        $node.on('click', function() {
          map.getView().setCenter(ol.proj.transform(data.position, 'EPSG:4326', 'EPSG:3857'));
        });
      }
    });

  });

})(jQuery);