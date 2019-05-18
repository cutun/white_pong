/* LOADING THE MODULES NEEDED TO RUN THE WEBSERVER */
const express = require('express')			// module used to create the web server
	, path = require('path')				// module used to get the absolute path of a file
	, bodyParser = require('body-parser')	// module used to parse what the cliend sent
	, http = require('http')				// module used to talk to a client
	, request = require('request')
	, Io = require('socket.io')
	;


/* GLOBAL CONSTANTS */
const app = express()						// Creating a variable: app, to receive and respond to client's requests
	, port = process.env.PORT || 8000						// Defining what port to use to talk to the client
	, server = http.createServer(app)		// Creating the web server and storing it in a variable: app
	, io = Io(server)
	;


let speed = 1;
let leftPosition = 44;
let rightPosition = 44;
let paddleHeight = 12;
let leftSpeed = 0;
let rightSpeed = 0;
let players = [];

/* MIDDLEWARE TO LOOK AT THE REQUEST BEFORE HANDLING IT */
app.use(bodyParser.json({					// Limiting the amount of data the client can send to 50mb
	limit: '50mb'
}));

app.use(bodyParser.urlencoded({ 			// Allowing the body parser to parse many different types of requests
	extended: true
}));

/* ROUTES TO HANDLE THE REQUEST */

app.get('/', (req, res, next) => {

	request.get('https://minh.wisen.space/pong.html').pipe(res);

});

function startSocketServer() {
	io.on('connection', function(socket) {
		players.push(socket);
		if(players.length > 2) {
			socket.emit('goaway', 'go away');
		}

		if(players.length === 2) {
			socket.emit('start', {
				speed,
				leftPosition,
				rightPosition,
				paddleHeight,
				leftSpeed,
				rightSpeed
			});
		}

		if(players.length === 1) {
			socket.emit('waiting', 'bring your friends');
		}
		// LETS DETERMINE WHEN THE USER DISCONNECTS
		socket.on('disconnect', function(socket) {
			players = players.filter(player => player.id !== socket.id);

		});
		
		socket.on('leftPaddleUp', function() {
			leftSpeed = -1*speed;
			io.emit('leftPaddleUp', {leftSpeed});
		});
		socket.on('leftPaddleStop', function() {
			leftSpeed = 0;
			io.emit('leftPaddleStop', {leftSpeed});
		});
		socket.on('leftPaddleDown', function() {
			leftSpeed = Speed;
			io.emit('leftPaddleDown', {leftSpeed});
		});
		socket.on('rightPaddleUp', function() {
			rightSpeed = -1*speed;
			io.emit('rightPaddleUp', {rightSpeed});
		});
		socket.on('rightPaddleStop', function() {
			rightSpeed = 0;
			io.emit('rightPaddleStop', {rightSpeed});
		});
		socket.on('rightPaddleDown', function() {
			rightSpeed = Speed;
			io.emit('rightPaddleDown', {rightSpeed});
		});

	});
}

function startServer() {
	startSocketServer();
	server.on('listening', () => {				// Calling a function when the server starts listening for requests
		var addr = server.address()
			, bind = typeof addr === 'string'
				? 'pipe ' + addr
				: 'port ' + addr.port
			;
		console.log('Listening on ' + bind);	// Logging a message to terminal
	});
	server.listen(port);						// Telling the server to start listening
}

startServer();