const express = require("express");
const bcryptjs = require("bcryptjs");
const router = express.Router();
const userModel = require("../models/userModel");
const rentalModel = require("../models/rentalModel");

router.get("/", (req, res) => {

    let rentals;

    if (req.session && req.session.user) {
        const userId = req.session.user._id;

        userModel.findById(userId)
        .then(user => {
            const cartRentals = user.cart.map((item) => item.rental._id.toString());


            rentalModel.find({ featuredRental: true })
            .then(data => {

                rentals = data.map(rental => rental.toObject());
            
                rentals.forEach((rental) => {
                    rental.isInCart = cartRentals.includes(rental._id.toString());
                    //rentalObj[rental._id] = rental;
                });

                res.render("home", {
                    rentals,
                    title: "Home",
                    css: false,
                    script: true,
                    src: "star-rating",
                })

            })
            .catch((err) => {
                console.error(err);
            });
        })
    }
    else {
        rentalModel.find({ featuredRental: true})
        .then(data => {
            rentals = data.map(rental => rental.toObject());

            res.render("home", {
                rentals,
                title: "Home",
                css: false,
                script: true,
                src: "star-rating",
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }
})

router.get("/home", (req, res) => {
    res.redirect("/");
})

router.get("/sign-up", (req, res) => {
    res.render("sign-up", {
        title: "Sign Up",
        css: true,
        href: "log-in",
        script: true,
        src: "password-hide-show"
    });
})

router.get("/log-in", (req, res) => {
    res.render("log-in", {
        title: "Log In",
        css: true,
        href: "log-in",
        script: true,
        src: "password-hide-show"
    });
})

router.get("/welcome", (req, res) => {
    res.render("welcome", {
        title: "Welcome",
        css: true,
        href: "welcome"
    });
})



// Set up post routes
router.post("/log-in", (req, res) => {
    const {email, password, clerkorcust} = req.body;

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
        
        userModel.findOne({email})
            .then(user => {
                if(user) {
                    // User found
                    console.log("Email found");
                    // Compare password
                    bcryptjs.compare(password, user.password)
                        .then(isMatched => {
                            if (isMatched) {
                                // Passwords match
                                console.log("Password matches");

                                // Create a new session by storing the user document (object) to the session
                                req.session.user = user;
                                req.session.isClerk = clerkorcust === "Clerk";
                                res.locals.user = req.session.user;
                                res.locals.isClerk = req.session.isClerk;
                                console.log(req.session.user);

                                if (req.session.isClerk) {
                                    res.redirect("/rentals/list");
                                }
                                else {
                                    res.redirect("/cart");
                                }
                            }
                            else {
                                // Passwords do not match
                                console.log("Password does not match");
                                passedValidation = false;
                                validationMessages.password = "Sorry, you entered an invalid password";

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
                } 
                else {
                    // User not found
                    console.log("Email not found");
                    passedValidation = false;
                    validationMessages.email = "Sorry, you entered an invalid email"

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

router.post("/sign-up", (req, res) => {
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

        userModel.findOne({email})
            .then(user => {
                if(user) {
                    console.log(`User with email address ${email} already exists.`);
                    passedValidation = false;
                    validationMessages.email = "Email already exists."
                }

                if (passedValidation) {
                    const newUser = new userModel({fname, lname, email, password});
                    newUser.save()
                        .then(userSaved => {
                            console.log(`User ${userSaved.fname} has been added to the database.`);
                        })
                        .catch(err => {
                            console.log(`Error adding user to the database ... ${err}`);
                        });
            
            
                    const sgMail = require("@sendgrid/mail");
                    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            
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
                        res.redirect("welcome");
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
            .catch(err => {
                console.error(`Failed to find document: ${err}`)
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


router.get("/cart", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk === false) {

        const userId = req.session.user._id;

        res.locals.user = req.session.user;
        res.locals.isClerk = req.session.isClerk;

        userModel.findById(userId)
        .populate("cart.rental")
        .lean()
        .then((user) => {

            const cartItems = user.cart;

            // Calculate the total price for all cart items
            const subTotal = cartItems.reduce((acc, item) => {
                const rentalPrice = item.rental.pricePerNight;
                const nights = item.nights;
                const price = rentalPrice * nights;
                return acc + price;
            }, 0);

            const VAT = subTotal * 0.1;

            const grandTotal = subTotal + VAT;

            res.render("cart", { 
                user,
                css: true,
                href: "list",
                subTotal,
                VAT,
                grandTotal
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
    }
    else {
        res.status(401).send("You are not authorized to view this page");
    }
})

router.post("/cart/add/:id", (req, res) => {

    if (req.session && req.session.user && req.session.isClerk === false) {

        const rentalId = req.params.id;
        const userId = req.session.user._id;

        userModel.findOneAndUpdate(
            { _id: userId, "cart.rental": rentalId },
            { $inc: { "cart.$.nights": 1 } },
            { new: true }
        )
        .then(user => {
            if (user) {
                res.redirect(`/cart#cart-${rentalId}`);
            } else {
                rentalModel.findById(rentalId)
                .then(rental => {
                    if (rental) {
                        userModel.findOneAndUpdate(
                            { _id: userId },
                            { $push: { cart: { rental: rentalId, nights: 1 } } },
                            { new: true }
                        )
                        .then(user => {
                            console.log(`Rental ${rentalId} added to user ${user.fname}'s cart`)
                            res.redirect(`/cart#cart-${rentalId}`);
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).send("Internal Server Error");
                        });
                    } else {
                        res.status(401).send(`Rental ${rentalId} not found!`);
                    }
                })
                .catch(err => {
                    res.status(401).send(`Rental ${rentalId} not found! ... ${err}`);
                });
            }
        })
        .catch(err => {
            res.status(401).send(`User ${userId} not found! ... ${err}`);
        });

    } else {
        res.status(401).send("You are not authorized to view this page");
    }
    
});


router.post("/cart/remove-one/:id", (req, res) => {

    if (req.session && req.session.user && req.session.isClerk === false) {

        const rentalId = req.params.id;
        const userId = req.session.user._id;

        userModel.findOneAndUpdate(
            { _id: userId, "cart.rental": rentalId },
            { $inc: { "cart.$.nights": -1 } },
            { new: true }
        )
        .then(user => {
            if (user) {
                res.redirect(`/cart#cart-${rentalId}`);
            } else {
                res.status(401).send(`Rental ${rentalId} not found in cart!`);
            }
        })
        .catch(err => {
            res.status(401).send(`User ${userId} not found! ... ${err}`);
        });

    } else {
        res.status(401).send("You are not authorized to view this page");
    }
    
});


router.get("/cart/remove/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk === false) {
      const rentalId = req.params.id;
      const userId = req.session.user._id;
  
      userModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { cart: { rental: rentalId } } },
        { new: true }
      )
        .then((user) => {
          if (user) {
            res.redirect("/cart");
          } else {
            res.status(401).send(`User ${userId} not found!`);
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    } else {
      res.status(401).send("You are not authorized to view this page");
    }
  });
  


router.get("/log-out", (req, res) => {
    req.session.destroy();
    res.locals.user = null;
    res.locals.isClerk = null;
    res.redirect("/log-in");
})

router.get("/forgot-password-1", (req, res) => {
    res.render("forgot-password-1", {
        title: "Forgot Password",
        css: true,
        href: "log-in"
    });
})

router.post("/forgot-password-1", (req, res) => {
    const {email} = req.body;

    let passedValidation = true;
    let validationMessages = {};

    if (typeof email !== "string" || email.trim().length === 0) {
        passedValidation = false;
        validationMessages.email = "You must specify an email address";
    }

    if (passedValidation) {
        
        userModel.findOne({email})
            .then(user => {
                if(user) {
                    // User found
                    console.log("Email found");
                    res.redirect(`/forgot-password-2/${user._id}`);
                } 
                else {
                    // User not found
                    console.log("Email not found");
                    passedValidation = false;
                    validationMessages.email = "Sorry, you entered an invalid email"

                    res.render("forgot-password-1", {
                        title: "Forgot Password",
                        css: true,
                        href: "log-in",
                        validationMessages,
                        values: req.body
                    });                    
                }
            })
            .catch(err => {
                console.log(`Error in finding the user ... ${err}`);
                res.redirect(`/forgot-password-1`);
            });
    } else {
        res.render("forgot-password-1", {
            title: "Forgot Password",
            css: true,
            href: "log-in",
            validationMessages,
            values: req.body
        });
    }
})
let mainOtp;
router.get("/forgot-password-2/:id", (req, res) => {
    const id = req.params.id;

    userModel.findById(id)
        // .lean()
        .then(user => {
            if (!user) {
                console.log(`User with ID ${id} not found`);
                res.redirect(`/forgot-password-1`);
            }
            else {
                mainOtp = "";
                for (let i = 0; i < 6; i++) {
                    mainOtp += String(Math.floor(Math.random() * 10)); 
                }

                const sgMail = require("@sendgrid/mail");
                sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            
                const msg = {
                    to: user.email,
                    from: "sunchit333@gmail.com",
                    subject: "Password Change Request",
                    html: `Dear ${user.fname},
                    <p>Your One Time Password is ${mainOtp}</p>`
                };
        
                sgMail.send(msg)
                .then(() => {
                    res.render("forgot-password-2", {
                        title: "Forgot Password",
                        css: true,
                        href: "log-in",
                        id
                    })
                })
                .catch(err => {
                    console.log(err);
        
                    res.redirect(`/forgot-password-1`);
                    
                });                
            }
        })
        .catch(err => {
            console.log(`Error in finding the user ... ${err}`);
            res.redirect(`/forgot-password-1`);
        });
})


router.post("/forgot-password-2/:id", (req, res) => {
    const id = req.params.id;
    let passedValidation = true;
    let validationMessages = {};
    userModel.findById(id)
        // .lean()
        .then(user => {
            if (!user) {
                console.log(`User with ID ${id} not found`);
                res.redirect(`/forgot-password-1`);
            }
            else {
                const {otp} = req.body;
                if (mainOtp !== otp) {
                    passedValidation = false;
                    validationMessages.otp = "Wrong OTP entered. Please try again."

                    res.render(`forgot-password-2`, {
                        title: 'Forgot Password',
                        css: true,
                        href: "log-in",
                        validationMessages,
                        id
                    })
                } else {
                    res.redirect(`/forgot-password-3/${id}`);
                }
            }
        })
        .catch(err => {
            console.log(`Error in finding the user ... ${err}`);
            res.redirect(`/forgot-password-1`);
        });
    
})


router.get("/forgot-password-3/:id", (req, res) => {
    const id = req.params.id;

    userModel.findById(id)
        // .lean()
        .then(user => {
            if (!user) {
                console.log(`User with ID ${id} not found`);
                res.redirect(`/forgot-password-1`);
            }
            else {
                res.render("forgot-password-3", {
                    title: "Forgot Password",
                    css: true,
                    href: "log-in",
                    id,
                    script: true,
                    src: "password-hide-show"
                })
            }
        })
        .catch(err => {
            console.log(`Error in finding the user ... ${err}`);
            res.redirect(`/forgot-password-1`);
        });;
})


router.post("/forgot-password-3/:id", (req, res) => {
    const id = req.params.id;
    let {password, confirmPassword} = req.body;

    let passedValidation = true;
    let validationMessages = {};

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

    if (confirmPassword !== password) {
        passedValidation = false;
        validationMessages.confirmPassword = "Passwords do not match"
    }

    if (passedValidation) {
        userModel.findById(id)
        // .lean()
        .then(user => {
            if (!user) {
                console.log(`User with ID ${id} not found`);
                res.redirect(`/forgot-password-1`);
            }
            else {
                // Generating a unique salt
                bcryptjs.genSalt()
                .then(salt => {
                    // Hash the password using the generated salt
                    bcryptjs.hash(password, salt)
                        .then(hashedPwd => {
                            // The password was hashed
                            password = hashedPwd;

                            userModel.updateOne({
                                    _id: id
                                }, { 
                                    $set: 
                                    {
                                        "password": password
                                    }
                                })
                                .then(() => {
                                    res.redirect("/log-in");
                                })
                                .catch(error => {
                                    console.log(error);
                                    //res.status(500).send('Error updating image');
                                    res.render("forgot-password-3", {
                                        title: "Forgot Password",
                                        css: true,
                                        href: "log-in",
                                        validationMessages,
                                        values: req.body,
                                        script: true,
                                        src: "password-hide-show",
                                        id
                                    } )
                                });
                                
                            })

                        })
                        .catch(err => {
                            console.log(`Error occurred when hashing ... ${err}`);
                            res.render("forgot-password-3", {
                                title: "Forgot Password",
                                css: true,
                                href: "log-in",
                                validationMessages,
                                values: req.body,
                                script: true,
                                src: "password-hide-show",
                                id
                            } )
                        })
                .catch(err => {
                    console.log(`Error occurred when salting ... ${err}`);
                    res.render("forgot-password-3", {
                        title: "Forgot Password",
                        css: true,
                        href: "log-in",
                        validationMessages,
                        values: req.body,
                        script: true,
                        src: "password-hide-show",
                        id
                    } )
                })
            }
        })
    }
    else {
        res.render("forgot-password-3", {
            title: "Forgot Password",
            css: true,
            href: "log-in",
            validationMessages,
            values: req.body,
            script: true,
            src: "password-hide-show",
            id
        } )
    }
})

module.exports = router;