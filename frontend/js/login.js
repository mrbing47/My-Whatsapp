const username = document.getElementById("username");
const password = document.getElementById("password");

const errName = document.getElementById("err-name");
const errPass = document.getElementById("err-pass");

const login = document.getElementById("login");
const register = document.getElementById("register");

const snackbar = document.getElementById("snackbar");
const snacktext = document.getElementById("snacktext");
const snackbutton = document.getElementById("snackbutton");

let snackbarInterval = 0;

function changeSnackState(visible, msg) {
    msg = msg || "Enter all details";

    if (visible) {
        snacktext.innerText = msg;

        snackbar.style.bottom = "5%";
        snackbar.style.visibility = "visible";
        snackbar.style.opacity = "1";
    } else {
        snackbar.style.bottom = "-40px";
        snackbar.style.visibility = "hidden";
        snackbar.style.opacity = "0";
    }
}
function changeState(element, visible) {
    if (visible) {
        element.style.visibility = "visible";
        element.style.opacity = "1";

        if (snackbarInterval == 0) {
            changeSnackState(visible);

            snackbarInterval = setTimeout(() => {
                changeSnackState(false);
                snackbarInterval = 0;
            }, 2000);
        }
    } else {
        element.style.visibility = "hidden";
        element.style.opacity = "0";
    }
}

snackbutton.addEventListener("click", e => {
    console.log(snackbarInterval);
    if (snackbarInterval != 0) {
        clearTimeout(snackbarInterval);
        snackbarInterval = 0;
        changeSnackState(false);
    }
});

function validateInputFields() {
    const input_name = username.value;
    const input_pass = password.value;

    var result = {};

    if (input_name === "") {
        changeState(errName, true);
    } else {
        result.name = input_name;
        changeState(errName, false);
    }
    if (input_pass === "") {
        changeState(errPass, true);
    } else {
        result.password = input_pass;
        changeState(errPass, false);
    }

    return result;
}

function makeServerCall(route) {
    const res = validateInputFields();

    if (res.name && res.password) {
        fetch("http://localhost:4769/" + route, {
            method: "post",
            body: JSON.stringify({
                name: res.name,
                password: res.password
            }),
            redirect: "follow",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                console.log(response.redirected);
                return response.text();
            })
            .then(msg => {
                console.log(msg);
                /* if (msg.msg) {
                    console.log(msg.error);
                    if (snackbarInterval == 0) {
                        changeSnackState(true, msg.msg);

                        snackbarInterval = setTimeout(() => {
                            changeSnackState(false);
                            snackbarInterval = 0;
                        }, 2000);
                    }
                }*/
            });
    }
}

login.addEventListener("click", e => {
    makeServerCall("login");
});

register.addEventListener("click", e => {
    makeServerCall("register");
});

username.addEventListener("keypress", e => {
    if (errName.style.opacity === "1") {
        changeState(errName, false);
    }
    if (e.key === "Enter") {
        login.dispatchEvent(
            new MouseEvent("click", { bubbles: false, cancelable: false })
        );
    }
});

password.addEventListener("keypress", e => {
    if (errPass.style.opacity === "1") {
        changeState(errPass, false);
    }
    if (e.key === "Enter") {
        login.dispatchEvent(
            new MouseEvent("click", { bubbles: false, cancelable: false })
        );
    }
});
