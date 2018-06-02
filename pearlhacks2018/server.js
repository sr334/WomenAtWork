var express = require('express'),
app = express(),
port = process.env.PORT || 3000,
bodyParser = require('body-parser');
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var path = require('path');
app.use(express.static(path.join(__dirname, 'static')));

app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

var routes = require('./api/routes/routes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('waw-duke RESTful API server started on: ' + port);
