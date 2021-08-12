const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//Get Username and Room from url
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room users
socket.on("roomUsers", ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
	console.log(message);
	outputMessage(message);

	// Scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
	e.preventDefault(); //prevents default submit behaviour

	// Get message text
	const msg = e.target.elements.msg.value;

	//Emit message to server
	socket.emit("chatMessage", msg);

	//Clear input field
	e.target.elements.msg.value = "";
	e.target.elements.msg.focus();
});

// Output message to DOM
const outputMessage = ({ username, time, text }) => {
	const div = document.createElement("div");
	div.classList.add("message");
	div.innerHTML = `<p class="meta">${
		username === "Chatistic Bot"
			? '<i class="fas fa-robot"></i>'
			: '<i class="fas fa-user"></i>'
	} ${username} <span>${time}</span></p>
						<p class="text">
							${text}
                        </p>`;
	document.querySelector(".chat-messages").appendChild(div);
};

// Add room name to DOM
const outputRoomName = (room) => (roomName.innerText = room);

// Add users list to DOM
const outputUsers = (users) =>
	(userList.innerHTML = `${users
		.map((user) => `<li>${user.username}</li>`)
		.join("")}`);
