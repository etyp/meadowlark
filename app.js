var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var nodemailer = require('nodemailer');

// Init app
var app = express();

// Logging config (environment based)
switch (app.get('env')) {
	case 'development':
		app.use(require('morgan')('dev'));
		break;
	case 'production':
		// express-logger module
		app.use(require('express-logger')({
			path: __dirname + '/log/requests.log'
		}));
		break;
}

// Local modules
var fortune = require('./lib/fortune');
var credentials = require('./credentials');

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

// Middleware for cookie parsing
app.use(require('cookie-parser')(credentials.cookieSecret));
// Middleware for sessions
app.use(require('express-session')());

// Flash message middleware
app.use(function(req, res, next) {
	// if we have a flash msg, move it to local context & clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});


// Routes ===================================
app.get('/', function(req, res) {
	res.cookie('eric', 'rah rah rah i was here');
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

app.get('/newsletter', function(req, res) {
	res.render('newsletter', {
		csrf: 'CSRF token here!'
	});
});

app.post('/process', function(req, res) {
	if (req.xhr || req.accepts('json, html') === 'json') {
		res.send({
			success: true
		});
	} else {
		console.log("Form querystring: " + req.query.form);
		console.log("CSRF token: " + req.body._csrf);
		console.log("Name field: " + req.body.name);
		console.log("Email field: " + req.body.email);
		res.redirect(303, '/thank-you');
	}
});

app.get('/thank-you', function(req, res) {
	res.render("thank-you");
});

// File upload route handlers
app.get('/contest/vacation-photo', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if (err) return res.redirect(303, '/error');
		console.log("received fields: ");
		console.log(fields);
		console.log("received files: ");
		console.log(files);
		res.redirect(303, '/thank-you');
	});
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

function startServer() {
	// Create http server, listen on port
	http.createServer(app).listen(app.get('port'), function() {
		console.log("App started in " + app.get('env') + " env. Listening on port " + app.get('port'));
	});
}

if (require.main === module) {
	// application run directly, start app server
	startServer();
}
else {
	// application imported as a module via require.
	// Export function to create server
	module.exports = startServer;
}

