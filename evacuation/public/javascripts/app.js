if(typeof(console) === 'undefined') {
    var console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
}

var bounds = new L.LatLngBounds(new L.LatLng(53.74, 3.2849), new L.LatLng(50.9584, 7.5147));

var stamen = new L.StamenTileLayer("toner-lite");

var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>'
});

var osm = L.tileLayer("http://tile.openstreetmap.nl/tiles/{z}/{x}/{y}.png", {
    format: 'image/png',
    transparent: true,
    attribution: "OpenStreetMap 2012"
});

var routes = [];
var start_popups = [];
var end_popups = [];

var map = L.map('map', {
  layers: [stamen],
  maxBounds: bounds
});

var baseMaps = {
    "Toner Lite": stamen,
    "Cloudmade": cloudmade,
    "OSM": osm
};

L.control.layers(baseMaps, {}, {position: 'bottomleft'}).addTo(map);


function updateWeather(geobj) {
  console.log(geobj);
    var city = geobj.city;
    console.log(city);
    var query = 'select * from geo.places where text="'+ city +'"';
    var now = new Date();
    var api = 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent(query) +'&rnd='+ now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';
    $.ajax({
      type: 'GET',
      url: api,
      dataType: 'json',
      success: function(data) {
        console.log(data);
        if (data.query.count > 0 ) {
            $('#weather').empty();
            $('#weather').weatherfeed([data.query.results.place.woeid], {woeid: true});
        }
      }
    });
    return true;
}


function doMoveEnd(obj) {
  var geobj = obj.reverseGeoResponse.reverseGeoResult;
  $('#weather').empty();
  updateWeather(geobj);
  return true;
}

function showPopup(obj) {
  var geobj = obj.reverseGeoResponse.reverseGeoResult;
  var radius = 40;

  latlong = new L.LatLng(geobj.latitude, geobj.longitude);
  
  L.marker(latlong).addTo(map)
      .bindPopup("U bevindt zich nabij " + geobj.formattedAddress);
  L.circle(latlong, radius).addTo(map);

  $('#weather').empty();
  // updateWeather(geobj);
  return true;
}

function onLocationFound(e) {
  var radius = e.accuracy / 2;
  $.ajax({
      url: 'https://api.tomtom.com/lbs/services/reverseGeocode/3/jsonp?point='+e.latlng.lat+'%2C'+e.latlng.lng+'&jsonp=showPopup&key=aztb7b4z64svu56d3wbvqd35',
      dataType: 'jsonp',
      jsonpCallbackString: 'showPopup'
  });
  return true;
}


function onMoveEnd() {
  var latlng = map.getCenter();
  $.ajax({
      url: 'https://api.tomtom.com/lbs/services/reverseGeocode/3/jsonp?point='+latlng.lat+'%2C'+latlng.lng+'&jsonp=doMoveEnd&key=aztb7b4z64svu56d3wbvqd35',
      dataType: 'jsonp',
      jsonpCallbackString: 'doMoveEnd'
  });
  return true;
}

function onLocationError(e) {
    alert(e.message);
}

map.on('moveend', onMoveEnd);
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});

var startingPoint, finishPoint;

function showStartPopup(obj) {
  var geobj = obj.reverseGeoResponse.reverseGeoResult;
  var latlong = new L.LatLng(geobj.latitude, geobj.longitude);
  startingPoint = latlong;
  return true;
}

function showEndPopup(obj) {
  var geobj = obj.reverseGeoResponse.reverseGeoResult;
  var latlong = new L.LatLng(geobj.latitude, geobj.longitude);
  finishPoint = latlong;

  return L.marker(latlong).addTo(map)
          .bindPopup("...naar " + geobj.formattedAddress + " (" + data.route.summary.totalDistanceMeters + " meter)").openPopup();
}

var mapClicked = 1;

map.on('click', function(e){
  mapClicked++;
  console.log(e);
  if(mapClicked % 2 === 0) {
    // Start of route
    $.ajax({
      url: "/edge?lat="+e.latlng.lat+"&lon="+e.latlng.lng
    }).done(function(data) {
        from_data = JSON.parse(data);
        var startpopup = L.marker(e.latlng).addTo(map)
            .bindPopup("Van " + from_data.osm_name + "...").openPopup();
        start_popups.push(startpopup);
      console.log(from_data);
    });
    return true;
  } else {
    // End of route

    $.ajax({
      url: "/edge?lat="+e.latlng.lat+"&lon="+e.latlng.lng
    }).done(function(data) {
        to_data = JSON.parse(data);
        var endpopup = L.marker(e.latlng).addTo(map)
            .bindPopup("Naar " + to_data.osm_name + "...").openPopup();
        end_popups.push(endpopup);
        console.log(to_data);

        $.ajax({
            url: "/route?startedge="+from_data.source+"&endedge="+to_data.target
        }).done(function(e) {
            route_data = JSON.parse(e);
            var latlngs = [];
            $.each(route_data, function(i,value) {
                latlngs.push(new L.LatLng(value.y1, value.x1));
            });
            var pl = new L.Polyline(latlngs, {color:'red', weight: 10, clickable: false}).addTo(map);

            routes.push(pl);

            if(window.zoomtoroute) {
              map.fitBounds(pl.getBounds());
            }
            
        });
    });
  }
});

$(document).ready(function() {

    // DAT.gui configuration
    var SimulationValues = function() {
      this.waterLevel = 0.0;
      this.zoomToRoute = false;
    };
    var simulation = new SimulationValues();

    // Instantiate dat.gui
    var gui = new dat.GUI();
    gui.remember(simulation);

    // Define dat.gui interface
    var reset_gui = {
      start: function() { console.log("Starting!"); },
      reset: function() { console.log("Resetting!"); }
    };

    var relocate_gui = {
      relocate: function() {
        console.log("Relocating!");
      }
    };


    // Define dat.gui folders
    var f1 = gui.addFolder("Scenario");

    var waterlevel_controller = f1.add(simulation, 'waterLevel', 0, 15).name("NAP (m)");
    var zoomtoroute_controller = f1.add(simulation, 'zoomToRoute').name('Zoom naar route');
    var reset_controller = f1.add(reset_gui, 'reset').name('Verwijder routes');
    var relocate_controller = f1.add(relocate_gui, 'relocate').name('Vind mij');

    waterlevel_controller.onChange(function(value) {
      console.log("Waterlevel: ", value);
    });

    zoomtoroute_controller.onChange(function(checked) {
      
      if(checked) {
        window.zoomtoroute = true;
      } else {
        window.zoomtoroute = false;
      }
    });

    reset_controller.onChange(function(event) {
        $.each(routes, function(i,v) {
          map.removeLayer(v);
        });
        $.each(start_popups, function(i,v) {
          map.removeLayer(v);
        });
        $.each(end_popups, function(i,v) {
          map.removeLayer(v);
        });
    });

    relocate_controller.onChange(function(event) {
      map.locate({setView: true, maxZoom: 16});
    });

});