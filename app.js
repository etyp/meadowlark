var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Set up bodyParser
app.use(bodyParser());

// Set up handlebars as our template engine
var handlebars = require('express3-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			console.log("in helper");
			return null;
		}
	}
});
app.engine('handlebars', handlebars.engine);
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

app.get('/tours/hood-river', function(req, res) {
	res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function(req, res) {
	res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function(req, res) {
	res.render('tours/request-group-rate');
});

app.get('/newsletter', function (req, res) {
	res.render('newsletter', { csrf: 'CSRF token here!' });
});

app.post('/process', function (req, res) {
	if (req.xhr || req.accepts('json, html') === 'json') {
		res.send({success: true});
	}
	else {
		console.log("Form querystring: "+req.query.form);
		console.log("CSRF token: "+req.body._csrf);
		console.log("Name field: "+req.body.name);
		console.log("Email field: "+req.body.email);
		res.redirect(303, '/thank-you');
	}
});

app.get('/thank-you', function (req, res) {
	res.render("thank-you");
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