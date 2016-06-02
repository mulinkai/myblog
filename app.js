var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 1024 * 100,
            backups: 1,
            category: 'normal'
        }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger('normal');
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO}));
//app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO, format: ':method :url :status :hostname'}));
/*app.configure(function () {
	
})*/
app.set('view engine', 'ejs');
app.set('views', __dirname + '/app/views');

app.use('/public', express.static(__dirname + '/static'));
app.use('/static', express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
		resave: false,
		saveUninitialized: true,
	    secret: 'secret',
	    cookie:{
	      maxAge: 1000*60*30
	    }
	}));

require('./config/routes')(app);

module.exports = app;

//启动程序
var server = http.createServer(app);
server.listen(3000, function (err) {
	console.log(' - Server start at *:3000');
});
