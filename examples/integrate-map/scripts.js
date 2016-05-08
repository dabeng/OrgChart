'use strict';

(function($){

  $(function() {

    var map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.Stamen({
            layer: 'watercolor'
          }),
          preload: 4
        }),
        new ol.layer.Tile({
          source: new ol.source.Stamen({
            layer: 'terrain-labels'
          }),
          preload: 1
        })
      ],
      target: 'pageBody',
      view: new ol.View({
        center: ol.proj.transform([-87.6297980, 41.8781140], 'EPSG:4326', 'EPSG:3857'),
        zoom: 10
      })
    });

    $('body').prepend(map.getViewport());

    var datascource = {
      'name': 'Lao Lao',
      'title': 'President Office',
      'position': [-87.6297980, 41.8781140],
      'children': [
        { 'name': 'Bo Miao', 'title': 'Administration  Dept.', 'position': [-83.0457540, 42.3314270]},
        { 'name': 'Su Miao', 'title': 'R & D Dept.', 'position': [-81.6943610, 41.4993200]},
        { 'name': 'Yu Jie', 'title': 'Product Dept.', 'position': [-71.0588800, 42.3600820]},
        { 'name': 'Yu Li', 'title': 'Legal Dept.', 'position': [-74.0059410, 40.7127840]},
        { 'name': 'Hong Miao', 'title': 'Finance Dept.', 'position': [-80.8431270, 35.2270870]},
        { 'name': 'Yu Wei', 'title': 'Security Dept.', 'position': [-81.6556510, 30.3321840]},
        { 'name': 'Chun Miao', 'title': 'HR Dept. ', 'position': [-81.3792360, 28.5383350]},
        { 'name': 'Yu Tie', 'title': 'Marketing Dept.', 'position': [-80.1917900, 25.7616800] }
      ]
    };

    $('#chart-container').orgchart({
      'data' : datascource,
      'nodeContent': 'title',
      'createNode': function($node, data) {
        $node.on('click', function() {
          var view = map.getView();
          var duration = 2000;
          var start = +new Date();
          var pan = ol.animation.pan({
            duration: duration,
            source:  view.getCenter(),
            start: start
          });
          var bounce = ol.animation.bounce({
            duration: duration,
            resolution: 4 * view.getResolution(),
            start: start
          });
          map.beforeRender(pan, bounce);
          view.setCenter(ol.proj.transform(data.position, 'EPSG:4326', 'EPSG:3857'));
        });
      }
    });

  });

})(jQuery);