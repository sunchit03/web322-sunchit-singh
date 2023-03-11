/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Sunchit Singh
* Student ID    : 169146214
* Course/Section: WEB322 NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const rentalList = require("./models/rentals-db");

// Set up dotenv
const dotenv = require("dotenv");
dotenv.config({path: "./config/keys.env"});

// Set up express
const app = express();

// Set up Handlebars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}));
app.set("view engine", ".hbs");

// Set up body parser
app.use(express.urlencoded({extended: false}));

// Make the assets folder public
app.use(express.static(path.join(__dirname, "/assets")));


// Add your routes here
// e.g. app.get() { ... }

app.get("/", (req, res) => {
    // res.sendFile(path.join(__dirname, "/views/home.hbs"));
    res.render("home", {
        rentals: rentalList.getFeaturedRentals(),
        title: "Home",
        css: false,
        script: true,
        src: "star-rating"
    })
})

app.get("/home", (req, res) => {
    res.render("home", {
        rentals: rentalList.getFeaturedRentals(),
        title: "Home",
        css: false,
        script: true,
        src: "star-rating"
    });
})

app.get("/rentals", (req, res) => {
    res.render("rentals", {
        rentalList: rentalList.getRentalsByCityAndProvince(),
        title: "Rentals",
        css: true,
        href: "rentals",
        script: true,
        src: "star-rating"
    });
})

app.get("/sign-up", (req, res) => {
    res.render("sign-up", {
        title: "Sign Up",
        css: true,
        href: "log-in",
        script: true,
        src: "password-hide-show"
    });
})

app.get("/log-in", (req, res) => {
    res.render("log-in", {
        title: "Log In",
        css: true,
        href: "log-in",
        script: true,
        src: "password-hide-show"
    });
})

app.get("/welcome", (req, res) => {
    res.render("welcome", {
        title: "Welcome",
        css: true,
        href: "welcome"
    });
})

app.post("/log-in", (req, res) => {
    console.log(req.body);
    const {email, password} = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if (typeof email !== "string" || email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "You must specify an email address";
    }

    if (password.trim().length === 0) {
        passedValidation = false;
        validationMessages.password = "You must specify a password";
    }

    if (passedValidation) {
        // res.redirect("welcome");
        res.render("home", {
            rentals: rentalList.getFeaturedRentals(),
            title: "Home",
            css: false,
            script: true,
            src: "star-rating"
        });
    } else {
        res.render("log-in", {
            title: "Log In",
            css: true,
            href: "log-in",
            script: true,
            src: "password-hide-show",
            validationMessages,
            values: req.body
        });
    }
})

app.post("/sign-up", (req, res) => {
    console.log(req.body);
    const {fname, lname, email, password} = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if (typeof fname !== "string" || fname.trim().length === 0) {
        passedValidation = false;
        validationMessages.fname = "You must specify your first name";
    }

    if (typeof lname !== "string" || lname.trim().length === 0) {
        passedValidation = false;
        validationMessages.lname = "You must specify your last name";
    }

    // https://www.w3resource.com/javascript/form/email-validation.php
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (typeof email !== "string" || email.trim().length === 0 || !email.match(emailRegex)) {
        passedValidation = false;

        if (typeof email !== "string" || email.trim().length === 0) {
            validationMessages.email = "You must specify an email address";
        }
        else {
            validationMessages.email = "Please enter a valid email address.";
        }
    }

    // https://www.w3resource.com/javascript/form/password-validation.php
    let passwordRegex = /^(?!\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,12}(?<!\s)$/

    if (typeof password !== "string" || password.trim().length === 0 || !password.match(passwordRegex)) {
        passedValidation = false;

        if (typeof password !== "string" || password.trim().length === 0) {
            validationMessages.password = "You must specify a password";
        }
        else {
            validationMessages.password = "Your password must be between 8 and 12 characters long and include a combination of uppercase and lowercase letters, numbers, and special characters.";
        }

        validationMessages.password = "Your password must be between 8 and 12 characters long and include a combination of uppercase and lowercase letters, numbers, and special characters.";
    }    

    if (passedValidation) {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

        const body = 'This is a test email using SendGrid from Node.js';
        const msg = {
            to: email,
            from: "sunchit333@gmail.com",
            subject: "Welcome",
            html: `Dear ${fname},
            <p>Welcome to StayOnTheGo, your ultimate destination for comfortable and enjoyable lodging options. We offer a wide range of properties to suit your unique travel needs, and our user-friendly platform makes it easy to book your preferred accommodation. Our team is available 24/7 to assist you, and our properties are equipped with modern amenities to ensure your comfort.</p>

            <p>Thank you for choosing StayOnTheGo as your lodging partner. We are committed to providing you with a seamless and enjoyable experience, and we can't wait to host you soon.</p>
            
            <p>Best regards,
            <br>
            Sunchit Singh
            </p>`
        };

        sgMail.send(msg)
        .then(() => {
            res.redirect("welcome")
        })
        .catch(err => {
            console.log(err);

            res.render("sign-up", {
                title: "Sign Up",
                css: true,
                href: "log-in",
                script: true,
                src: "password-hide-show",
                validationMessages,
                values: req.body
            });
            
        });

    } else {
        res.render("sign-up", {
            title: "Sign Up",
            css: true,
            href: "log-in",
            script: true,
            src: "password-hide-show",
            validationMessages,
            values: req.body
        });
    }
})

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);