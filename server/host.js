var request = require("request");
var express = require('express');
var app = express();
var PythonShell = require('python-shell');

var timer = undefined;
var python_script_path = process.argv[2] || '';


var custom_timer = function(callback, delay) {
    var id, started, remaining = delay, running

    this.start = function() {
        running = true
        started = new Date()
        id = setTimeout(callback, remaining)
    }

    this.pause = function() {
        running = false
        clearTimeout(id)
        remaining -= new Date() - started
    }

    this.getTimeLeft = function() {
        if (running) {
            this.pause()
            this.start()
        }

        return remaining
    }

    this.getStateRunning = function() {
        return running
    }

    this.start()
};

var setOffTimer = function(timeout) {
	if (timer) {
		console.log('cancelling old timer');
		timer.pause();
		timer = undefined;
	}
	
	if (timeout != -1) {
		console.log('starting timer');
		timer = new custom_timer(function() {
			console.log('timer fired, switching off');
			PythonShell.run(python_script_path, {args:['AIRCON_ON']}, function (err, results) {
				res.json({});
			});
		}, timeout*1000);
	}
};

var getRemainingTimerDuration = function() {
	if (!timer) return -1;
	return Math.ceil(timer.getTimeLeft()/1000);
};

app.get('/init', function (req, res) {
	console.log('init');
	res.json({
		switching_off: getRemainingTimerDuration()
	});
});

app.get('/aircon/onoff/', function (req, res) {
	console.log('turn on/off');
	PythonShell.run(python_script_path, {args:['AIRCON_ON']}, function (err, results) {
		res.json({});
	});
});

app.get('/aircon/onoff/timer/:time', function (req, res) {
	console.log('turn on/off in ');
	var time = req.params.time;
	setOffTimer(time);
	res.json({});
});

app.get('/aircon/temperature/:temp', function (req, res) {
	var temp = req.params.temp;
	console.log('set temp to '+temp);
	PythonShell.run(python_script_path, {args:['AIRCON_'+temp!=-1?temp:'FAN']}, function (err, results) {
		res.json({});
	});
});

app.get('/aircon/fanspeed/:speed', function (req, res) {
	var speed = req.params.speed;
	console.log('set fanspeed to '+speed);
	PythonShell.run(python_script_path, {args:['AIRCON_SPEED_'+speed.toUpperCase()]}, function (err, results) {
		res.json({});
	});
});

app.get('/aircon/fantype/:type', function (req, res) {
	var type = req.params.type;
	console.log('set fantype to '+type);
	PythonShell.run(python_script_path, {args:['AIRCON_'+type.toUpperCase()]}, function (err, results) {
		res.json({});
	});
});

app.use(express.static('public'));

var port = process.env.PORT || 8080;

app.listen(port, function () {
  console.log('Listening on '+port+'...');
});