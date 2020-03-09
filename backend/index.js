const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

var Users = {};

const frontendFolder = path.join(__dirname, "../frontend/");

app.use(cookieParser());
app.use(express.static(frontendFolder));
app.use(express.json());

app.get("/", (req, res) => {
    console.log(frontendFolder);
    // if (req.cookies.hasOwnProperty("name")) {
    res.sendFile(frontendFolder + "html/index.html");
    // } else {
    //     console.log("here");
    //     res.redirect("/login");
    // }
});

app.get("/login", (req, res) => {
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
                    console.log(result);
                    res.redirect("/");
                }
            }
        );
    } else {
        res.send({
            msg: "User does not Exist",
            error: "No user was found in the database, try registering yourself"
        });
    }
});

app.post("/register", (req, res) => {
    if (!Users.hasOwnProperty(req.body.name)) {
        bcrypt.hash(req.body.password, 12, (err, hash) => {
            if (err) {
                return res.send({
                    msg: "Server Issues!!",
                    error: err
                });
            }

            Users[req.body.name] = {
                name: req.body.name,
                password: hash
            };
            res.redirect("/");
        });
    } else {
        console.log("here");
        res.send({
            msg: "User already exists",
            error:
                "provided username already exists in the database, try to login"
        });
    }
});

io.on("connection", socket => {
    console.log(socket);
});

const PORT = process.env.PORT || 4769;
http.listen(PORT, () => {
    console.log("Listening to PORT " + PORT);
});
