// https://expressjs.com/en/guide/routing.html


// REQUIRES
const express = require("express");
const app = express();
app.use(express.json());
const fs = require("fs");
const session = require("express-session");
const { JSDOM } = require('jsdom');
const { ppid } = require("process");

// just like a simple web server like Apache web server
// we are mapping file system paths to the app's virtual paths
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use(session(
    {
        secret: "extra text that no one will guess",
        name: "wazaSessionID",
        resave: false,
        // create a unique identifier for that client
        saveUninitialized: true
    })
);

app.get("/", function (req, res) {
    //Need to add code to check if user logged in
    // let doc = fs.readFileSync("./app/html/home.html", "utf8");

    if (req.session.loggedIn) {
        if (req.session.isAdmin) {
            let doc = fs.readFileSync("./app/html/admin.html", "utf8");
            //res.set("Server", "Wazubi Engine");
            //res.set("X-Powered-By", "Wazubi");
            res.send(doc);
        }
        let doc = fs.readFileSync("./app/html/splash.html", "utf8");
        //res.set("Server", "Wazubi Engine");
        //res.set("X-Powered-By", "Wazubi");
        res.send(doc);
    } else {

        let doc = fs.readFileSync("./app/html/splash.html", "utf8");
        //res.set("Server", "Wazubi Engine");
        //res.set("X-Powered-By", "Wazubi");
        res.send(doc);
    }
});

app.get("/users", function (req, res) {
    if (req.session.loggedIn && req.session.isAdmin) {
        const mysql = require("mysql2");
        const connection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "bby26"
        });
        connection.connect();
        connection.execute(
            "SELECT * FROM users",
            function (error, results) {
                console.log("results:", results);
                myResults = results;
                if (error) {
                    console.log(error);
                }
                res.send(results);
            });
        connection.end();
    }
})


app.get("/login", function (req, res) {
    if (req.session.loggedIn) {
        res.redirect("/");
    } else {
        let doc = fs.readFileSync("./app/html/login.html", "utf8");
        res.send(doc)
    }
});

app.get("/profile", function (req, res) {

    // check for a session first!
    if (req.session.loggedIn) {

        res.send("Welcome sir");

    } else {
        // not logged in - no session and no access, redirect to home!
        res.redirect("/");
    }

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/username", function (req, res){
    res.send(req.session.username);
})
app.post("/login", function (req, res) {

    const mysql = require("mysql2");
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "bby26"
    });
    connection.connect();
    connection.execute(
        "SELECT * FROM users WHERE username = ?",
        [req.body.username],
        function (error, results) {
            console.log("results:", results);
            myResults = results;
            if (error) {
                console.log(error);
            }
            if (results[0] != null && req.body.password == results[0].pw) {
                req.session.loggedIn = true;
                req.session.userID = results[0].userID;
                req.session.username = results[0].username;
                req.session.email = results[0].email;
                req.session.isAdmin = results[0].isAdmin;
                req.session.save(function (err) {
                });
                res.send({ status: "success", msg: "Logged in." });
            } else {
                res.send({ status: "fail", msg: "User account not found." });
            }
        });
    connection.end();
});

app.get("/signup.html", function (req, res) {
    let doc = fs.readFileSync("./app/html/signup.html", "utf8");

    // just send the text stream
    res.send(doc);
});

app.get("/signup", function (req, res) {
    let doc = fs.readFileSync("./app/html/signup.html", "utf8");

    // just send the text stream
    res.send(doc);
});

app.get("/nav", function (req, res) {
    let doc = fs.readFileSync("./app/templates/nav.html", "utf8");
    res.send(doc);
})


app.get("/footer", function (req, res) {
    let doc = fs.readFileSync("./app/templates/footer.html", "utf8");
    res.send(doc);
})

app.get("/splash", function (req, res) {
    let doc = fs.readFileSync("./app/html/splash.html", "utf8");
    res.send(doc);
})

// for page not found (i.e., 404)
app.use(function (req, res, next) {
    // this could be a separate file too - but you'd have to make sure that you have the path
    // correct, otherewise, you'd get a 404 on the 404 (actually a 500 on the 404)
    res.status(404).send("<html><head><title>Page not found!</title></head><body><p>Nothing here.</p></body></html>");
});


// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log("Example app listening on port " + port + "!");
});
