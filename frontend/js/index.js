/*
    TODO Have to implement private messaging, that is what's left of the project.

    ? FUTURE GOALS: Use Reactjs and MongoDB to store the chats if user wants and also deletes them

*/
const btnCreateGrp = document.getElementById("create-grp");
const btnJoinGrp = document.getElementById("join-grp");
const btnDmFrnd = document.getElementById("dm-frnd");

const searchname = document.getElementById("searchname");
const btnLogout = document.getElementById("logout");
const profileName = document.getElementsByClassName("profile-name");

const lobbyName = document.getElementById("lobby-name");
const contentContainer = document.getElementById("content-container");
const messageContainer = document.getElementById("message-container");
const btnSend = document.getElementById("send-message");
const message = document.getElementById("message");

function getCookies() {
	var cookies = document.cookie.split(";");

	var result = {};

	for (var i of cookies) {
		var cookie = i.trim().split("=");

		result[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
	}

	return result;
}
const cookies = getCookies();

for (div of profileName) {
	div.innerText = cookies.name;
}

var recentUser = "";

function displayMessage(type, name, msg) {
	name = name || "You";

	if (type === "create-room") {
		msg = "have created this room";

		messageEvent = `
            <div class="message-info">
                <span id="info-name">${name}</span> ${msg}.
            </div>
        `;
	} else {
		if (type === "user-join") {
			msg = "have connected";

			messageEvent = `
            <div class="message-info">
                <span id="info-name">${name}</span> ${msg}.
            </div>
        `;
		} else {
			const msgname =
				recentUser !== name
					? `<span class="message-name">${name}</span>`
					: ``;

			const margin = recentUser === name ? `4px` : `32px`;

			console.log(recentUser + " " + name);
			messageEvent = `
                <div class="message-card ${type}" style="margin-top:${margin};">
                    ${msgname}
                    <span class="message-body">${msg}</span>
                </div>
            `;

			recentUser = name;
		}
	}

	messageContainer.insertAdjacentHTML("beforeend", messageEvent);
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

var snackbarId = 0;
function displaySnackbar(msg) {
	// TODO Connect snackbar and uncomment all this code
	/*	snacktext.innerText = msg;

	snackbar.style.bottom = "5%";
	snackbar.style.visibility = "visible";
	snackbar.style.opacity = "1";

	snackbarId = setTimeout(() => {
		snackbar.style.bottom = "-40px";
		snackbar.style.visibility = "hidden";
		snackbar.style.opacity = "0";

		snackbarId = 0;
	}, 2000);*/
}

// * From here Socket.io listeners are placed.

const socket = io("http://localhost:4769");

socket.on("connect", () => {
	socket.emit("user-login", cookies.name);
});

// ? "new-msg" => When user sends a message in the room

socket.on("new-msg", (name, msg) => {
	console.log(name + " => " + msg);
	displayMessage("receiver", name, msg);
});

// ? "user-join" => When user joins the room

socket.on("user-join", name => {
	console.log(name + " have connected");
	displayMessage("user-join", name);
});

// * From here all the listeners are handled

var currRoom = "";

btnLogout.addEventListener("click", e => {
	const url = "http://localhost:4769/logout/";
	console.log("here");

	fetch(url, {
		method: "post"
	}).then(response => {
		if (response.redirected) window.location.href = response.url;
	});
});

function callSocket(type) {
	if (searchname.value !== "") {
		if (currRoom === searchname.value) {
			// TODO Display Snackbar here

			searchname.value = "Already in the room";
			return;
		}

		socket.emit(
			type,
			currRoom,
			searchname.value,
			cookies.name,
			response => {
				console.log(response);

				if (response === "OK") {
					if (contentContainer.style.visibility !== "visible") {
						contentContainer.style.visibility = "visible";
						contentContainer.style.opacity = "1";
					}

					if (currRoom !== "")
						socket.emit("user-leave", currRoom, cookies.name);

					currRoom = lobbyName.innerText = searchname.value;
					searchname.value = "";

					displayMessage(type);
				} else {
					console.log(response);

					// TODO Display Snackbar here with
				}
			}
		);
	} else {
		// TODO Display Snackbar here
		searchname.value = "Enter a room name!!!!";
	}
}

btnCreateGrp.addEventListener("click", e => {
	callSocket("create-room");
});

btnJoinGrp.addEventListener("click", e => {
	callSocket("user-join");
});
/*
btnDmFrnd.addEventListener("click", e => {
	if (searchname.value !== "") {
		if (currRoom === searchname.value) {
			// TODO Display Snackbar here

			searchname.value = "Already with the user";
			return;
		}

		socket.emit(
			"new-user",
			currRoom,
			searchname.value,
			cookies.name,
			response => {
				if (response === "OK") {
					if (contentContainer.style.visibility !== "visible") {
						contentContainer.style.visibility = "visible";
						contentContainer.style.opacity = "1";
					}

					currRoom = lobbyName.innerText = searchname.value;
					displayMessage("new-user");
				} else {
					console.log(response);

					// TODO Display Snackbar here
				}
			}
		);
	} else {
		// TODO Display Snackbar here
		searchname.value = "Enter a room name!!!!";
	}
});
*/
message.addEventListener("keydown", e => {
	if (e.key === "Enter") {
		btnSend.dispatchEvent(
			new MouseEvent("click", { bubbles: false, cancelable: false })
		);
	}
});

btnSend.addEventListener("click", e => {
	if (message !== "") {
		socket.emit("new-msg", currRoom, cookies.name, message.value);
		displayMessage("sender", cookies.name, message.value);
		message.value = "";
	}
});
