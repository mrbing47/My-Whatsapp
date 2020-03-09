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
var Rooms = {};

const frontendFolder = path.join(__dirname, "../frontend/");

/*
    TODO: a way to store the socket of the user whenever the connection establishes
 */

app.use(cookieParser());
app.use(express.static(frontendFolder, { index: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(moragn("short"));

app.get("/", (req, res) => {
    console.log(req.cookies.name);

    if (
        !req.cookies.hasOwnProperty("name") &&
        !Users.hasOwnProperty(req.cookies.name)
    ) {
        console.log("\n\n\nINSIDE IF\n\n\n");
        res.redirect("/login");
    } else {
        console.log("\n\n\nELSE\n\n\n");
        res.sendFile(frontendFolder + "html/index.html");
    }
});

app.get("/login", (req, res) => {
    console.log("\n\n\nINSIDE LOGIN\n\n\n");
    res.sendFile(frontendFolder + "html/login.html");
});

app.post("/login", (req, res) => {
    if (Users.hasOwnProperty(req.body.name)) {
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
    if (!Users.hasOwnProperty(req.body.name)) {
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
                    socket: null
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
    socket.on("create-room", (room, name) => {
        console.log("User " + name + " joined room " + room);
    });

    socket.on("new-msg", (room, name, msg) => {
        socket.to(room).broadcast.emit("new-msg", room, name, msg);
    });

    socket.on("new-user", (room, name) => {
        socket.to(room).broadcast.emit("new-user", room, name);
    });
});

const PORT = process.env.PORT || 4769;
http.listen(PORT, () => {
    console.log("Listening to PORT " + PORT);
});
