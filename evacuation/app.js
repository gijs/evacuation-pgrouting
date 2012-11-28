var config = require('./config');
var express = require('express');
var http = require('http');
var path = require('path');
var pg = require('pg');


// Initialize application
var app = express();


// Configure Express
app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  // app.set('view engine', 'ejs');
  app.set('view engine', 'html');
  // app.enable('view cache');
  app.engine('html', require('hogan-express'));
  app.set('layout', 'layout');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('our secret here'));
  app.use(express.session());
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var client = new pg.Client(config.pg.conString);
client.connect();


app.get('/edge',
function(req, res) {

  var lonlat = [req.query.lon, req.query.lat];
  
  var search_factor = 20;

  var lon = parseFloat(lonlat[0]);
  var lat = parseFloat(lonlat[1]);
  var lonmin = parseFloat(lon - search_factor);
  var latmin = parseFloat(lat - search_factor);
  var lonplus = parseFloat(lon + search_factor);
  var latplus = parseFloat(lat + search_factor);

  var sql = "SELECT id, \
              osm_name,\
              source, \
              target, \
              geom_way, \
              ST_Distance( \
                geom_way, \
                ST_GeometryFromText(\'POINT("+lon+" "+lat+")\', 4326)) AS dist \
             FROM \
                nl_2po_4pgr \
             WHERE \
                geom_way && \
                ST_Setsrid(\'BOX3D("+lonmin+" "+latmin+","+lonplus+" "+latplus+")\'::box3d, 4326) \
             ORDER BY \
                dist \
             LIMIT 1";
  var query = client.query(sql, []);

  query.on('row', function(row) {
    return res.json(JSON.stringify(row));
  });
  query.on('error', function(error) {
    console.log(error);
  });
});

app.get('/route',
function(req, res) {

  var startEdge = parseFloat(req.query.startedge);
  var endEdge = parseFloat(req.query.endedge);

  var sql = "SELECT * FROM shortest_path( \
               'SELECT id, \
                       source::int4 AS source, \
                       target::int4 AS target, \
                       cost::float8, \
                       reverse_cost::float8 AS reverse_cost \
                FROM \
                       nl_2po_4pgr', \
                       "+startEdge+", "+endEdge+", true, true) \
                INNER JOIN nl_2po_4pgr \
                ON edge_id = nl_2po_4pgr.id";

  client.query(sql, function(err, result) {
    //NOTE: error handling not present
    var json = JSON.stringify(result.rows);
    console.log(json);
    res.json(json);
  });
});

app.get('/',
function(req, res) {
    res.render('index.html', {});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
