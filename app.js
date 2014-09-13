var express = require('express');

var app = express();

// Set up handlebars as our template engine
var handlebars = require('express3-handlebars');
app.engine('handlebars', handlebars({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);
// Set up static dir
app.use(express.static(__dirname + '/public'));

// Add middleware for testing
app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	next();
});

var fortune = require('./lib/fortune');

// Routes ===================================
app.get('/', function(req, res) {
	res.render('home');
});

app.get('/about', function(req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

app.get('/tours/hood-river', function (req, res) {
	res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function (req, res) {
	res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function (req, res) {
	res.render('tours/request-group-rate');
});


// ------------------------------

// Custom 404
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});
// Custom 500
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});


// Create http server, listen on port
app.listen(app.get('port'), function() {
	console.log("Listening on port " + app.get('port'));
});