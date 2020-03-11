/*
    TODO Have to implement private messaging, that is what's left of the project.

    ? FUTURE GOALS: Use Reactjs and MongoDB to store the chats if user wants and also deletes them

*/

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
	cookie: "socket-sid"
});
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const moragn = require("morgan");

var Users = {};
var Rooms = new Set();

const frontendFolder = path.join(__dirname, "../frontend/");

app.use(cookieParser());
app.use(express.static(frontendFolder, { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(moragn("short"));

app.get("/", (req, res) => {
	if (req.cookies.name && Users[req.cookies.name]) {
		res.sendFile(frontendFolder + "html/index.html");
	} else {
		res.redirect("/login");
	}
});

app.get("/login", (req, res) => {
	res.sendFile(frontendFolder + "html/login.html");
});

app.post("/login", (req, res) => {
	if (Users[req.body.name]) {
		bcrypt.compare(
			req.body.password,
			Users[req.body.name].password,
			(err, result) => {
				if (err)
					res.send({
						msg: "Server Error",
						error: err
					});
				else {
					if (result) {
						res.cookie("name", req.body.name);
						res.redirect("/");
					} else {
						res.send({
							msg: "Wrong Credentials",
							error:
								"wrong input password, check you password carefully"
						});
					}
				}
			}
		);
	} else {
		res.send({
			msg: "Wrong Credentials",
			error: "No user was found in the database, try registering yourself"
		});
	}
});

app.post("/register", (req, res) => {
	if (!Users[req.body.name]) {
		return bcrypt.hash(req.body.password, 12, (err, hash) => {
			if (err) {
				return res.send({
					msg: "Server Issues!!",
					error: err
				});
			} else {
				Users[req.body.name] = {
					name: req.body.name,
					password: hash,
					socket: undefined
				};
				res.cookie("name", req.body.name);
				res.redirect("/");
			}
		});
	} else {
		res.send({
			msg: "User already exists",
			error:
				"provided username already exists in the database, try to login"
		});
	}
});

app.post("/logout", (req, res) => {
	console.log(req.url);
	res.clearCookie("name");
	res.redirect("/login");
});

io.on("connection", socket => {
	console.log("User connected " + socket.id);

	socket.on("user-login", name => {
		Users[name]["socket"] = socket;
	});

	socket.on("create-room", (prevRoom, currRoom, name, ack) => {
		console.log("here");

		if (!Rooms.has(currRoom)) {
			if (prevRoom !== "") socket.leave(prevRoom);
			socket.join(currRoom);

			Rooms.add(currRoom);

			console.log("User " + name + " joined room " + currRoom);

			ack("OK");
		} else {
			ack("Room already exists!!!");
		}
	});

	socket.on("new-msg", (room, name, msg) => {
		socket.to(room).broadcast.emit("new-msg", name, msg);
	});

	socket.on("user-join", (prevRoom, currRoom, name, ack) => {
		if (Rooms.has(currRoom)) {
			if (prevRoom !== "") socket.leave(prevRoom);
			socket.join(currRoom);

			socket.to(currRoom).broadcast.emit("user-join", name);

			ack("OK");
		} else {
			ack("No Room was found!!!");
		}
	});

	socket.on("user-leave", (currRoom, name) => {});
});

const PORT = process.env.PORT || 4769;
http.listen(PORT, () => {
	console.log("Listening to PORT " + PORT);
});
