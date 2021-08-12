const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

// FormatMessage function
const formatMessage = require("./utils/messages");

// user util functions
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	uniqueUser,
} = require("./utils/users");

// Initializing express app
const app = express();

// Initializing http server for socket.io
const server = http.createServer(app);

// Initializing socket.io
const io = socketio(server);
const PORT = process.env.PORT || 3000;

const botname = `Chatistic Bot`;

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connects
io.on("connection", (socket) => {
	// check user is unique
	socket.on("newUser", (username) => {
		if (!uniqueUser(username)) {
			console.log("Username checks out! Welcome");
			// user is unique
			socket.emit("uniqueUser");
		} else {
			console.log("Sorry, username is already in use");
			socket.emit("duplicateUser");
		}
	});

	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		// Join room
		socket.join(user.room);

		//Welcome current user
		socket.emit("message", formatMessage(botname, "Welcome to Chatistic")); // Sending welcome message to the client

		//Broadcast when a user connects
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(botname, `${user.username} has joined the chat`)
			); // sending message to all the clients connected except the connecting client
	});

	//Runs when client disconnects
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage(botname, `${user.username} has left the chat.`)
			);

			//Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});

	// Listen for chatMessage
	socket.on("chatMessage", (msg) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit("message", formatMessage(user.username, msg));
	});
});

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
