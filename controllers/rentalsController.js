const express = require("express");
const path = require("path");
const fs = require('fs');
const router = express.Router();
const rentalList = require("../models/rentals-db");
const rentalModel = require("../models/rentalModel");

router.get("/rentals", (req, res) => {

    rentalModel.find({})
        // .lean()
        .then((data) => {

            let rentals = data.map(rental => rental.toObject())

            res.render("rentals/rentals", {
                rentalList: rentalList.getRentalsByCityAndProvince(rentals),
                title: "Rentals",
                css: true,
                href: "rentals",
                script: true,
                src: "star-rating"
            });
        });    
})


router.get("/list", (req, res) => {
    
    if (req.session && req.session.user && req.session.isClerk) {
        
        const rentalObj = {};

        rentalModel.find({})
        // .lean()
        .then((data) => {   

            let rentals = data.map(rental => rental.toObject())

            const sortedRentals = rentals.sort((a, b) => a.headline.localeCompare(b.headline));       
            sortedRentals.forEach(rental => {
                rentalObj[rental._id] = rental;
            });
            console.log(res.locals);
            res.render("rentals/list", {
                rentals: rentalObj,
               title: "Rentals List",
               css: true,
               href: "list",
               script: true,
               src: "star-rating",
               list: true
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }
    else {
        res.status(401).send("You are not authorized to view this page");
    }
})

router.get("/add", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk) {       
        res.render("rentals/add", {
            title: "Add Rental",
            css: true,
            href: "edit"
        })
    }
    else {
        res.status(401).send("You are not authorized to add rentals");
    }
})


router.post("/add", (req, res) => {
    // TODO: Validate the form information.
    const { headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental } = req.body;

        // Create a new user model.
        const newRental = new rentalModel({ headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental });

        // Save the document to mongodb.
        newRental.save()
        .then(rentalSaved => {
            console.log(`Rental ${rentalSaved.headline} has been added to the database.`);

            // Create a unique name for the image, so that it can be stord in the file system.
            let uniqueName = `rental-pic-${rentalSaved._id}${path.parse(req.files.imageUrl.name).ext}`;

            // Copy the image data to a file in the "/assets/images" folder.
            req.files.imageUrl.mv(`assets/images/${uniqueName}`)
            .then(() => {
                // Update the document so it includes the unique name.
                rentalModel.updateOne({
                    _id: rentalSaved._id
                }, {
                    "imageUrl": uniqueName
                })
                .then(() => {
                    // Success
                    console.log("Updated the rental pic.");
                    res.redirect("/rentals/list");
                })
                .catch(err => {
                    console.log(`Error updating the rental's picture ... ${err}`);
                    res.render("rentals/add", {
                        title: "Add Rental",
                        css: true,
                        href: "edit",
                        values: req.body
                    });
                });
            })
            .catch(err => {
                console.log(`Error saving the rental's picture ... ${err}`);
                res.redirect("/rentals/list");
            });
        })
        .catch(err => {
            console.log(`Error adding rental to the database ... ${err}`);
            res.render("rentals/add", {
                title: "Add Rental",
                css: true,
                href: "edit",
                values: req.body
            });
        });
})


router.get("/edit/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk) {
        const id = req.params.id;
        rentalModel.findById(id)
        // .lean()
        .then((rental) => {
            if (!rental) {
                console.log(`Rental with ID ${id} not found`);
                res.redirect("rentals/list");
            }
            else {
                const {headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, rating, reviews, featuredRental} = rental;
                res.render("rentals/edit", {
                    title: "Edit Rental",
                    id,
                    headline,
                    numSleeps,
                    numBedrooms,
                    numBathrooms,
                    pricePerNight,
                    city,
                    province,
                    rating,
                    reviews,
                    featuredRental,
                    css: true,
                    href: "edit"
                })
            }
            
        })
        .catch((err) => {
            console.error(err);
            res.redirect(`/rentals/list`);
        });
    } else {
        res.status(401).send("You are not authorized to edit rentals");
    }
})

router.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    //const { headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, featuredRental } = req.body;
    console.log(req.body);
    let imgUrl;
    if (!req.files || !req.files.imageUrl) {
        rentalModel.findById(id)
        // .lean()
        .then((rental) => {
            imgUrl = rental.imageUrl;

            rentalModel.findByIdAndUpdate(id, req.body)
            .then(() => {

                rentalModel.updateOne({
                    _id: id
                }, { 
                    $set: 
                    {
                        "imageUrl": imgUrl
                    }
                })
                .then(() => {
                    res.redirect("/rentals/list");
                })
                .catch(error => {
                    console.log(error);
                    //res.status(500).send('Error updating image');
                    res.redirect(`/rentals/edit/${id}`);
                });
                
            })
            .catch(error => {
                console.log(error);
                //res.status(500).send('Error updating rental');
                res.redirect(`/rentals/edit/${id}`);
            });
        })
        .catch((err) => {
            console.error('Error finding rental');
            res.redirect(`/rentals/list`);
        })
    } else {

        // Create a unique name for the image, so that it can be stored in the file system.
        imgUrl = `rental-pic-${id}${path.parse(req.files.imageUrl.name).ext}`;
    
        // Copy the image data to a file in the "/assets/images" folder.
        req.files.imageUrl.mv(`assets/images/${imgUrl}`)
        .then(() => {
            rentalModel.findByIdAndUpdate(id, req.body)
            .then(() => {

                rentalModel.updateOne({
                    _id: id
                }, { 
                    $set: 
                    {
                        "imageUrl": imgUrl
                    }
                })
                .then(() => {
                    res.redirect("/rentals/list");
                })
                .catch(error => {
                    console.log(error);
                    //res.status(500).send('Error updating image');
                    res.redirect(`/rentals/edit/${id}`);
                });
                
            })
            .catch(error => {
                console.log(error);
                //res.status(500).send('Error updating rental');
                res.redirect(`/rentals/edit/${id}`);
            });
        })
        .catch(err => {
            console.log(`Error saving the rental's picture ... ${err}`);
            res.redirect("/rentals/list");
        });
}
})


router.get("/remove/:id", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk) {
        const id = req.params.id;
        rentalModel.findById(id)
        // .lean()
        .then((rental) => {
            if (!rental) {
                console.log(`Rental with ID ${id} not found`);
                res.redirect(`/rentals/list`);
            }
            else {
                const {headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, rating, reviews, featuredRental} = rental;
                res.render("rentals/remove", {
                    title: "Remove Rental",
                    id,
                    headline,
                    numSleeps,
                    numBedrooms,
                    numBathrooms,
                    pricePerNight,
                    city,
                    province,
                    rating,
                    reviews,
                    featuredRental,
                    css: true,
                    href: "edit"
                })
            }
            
        })
        .catch((err) => {
            console.error(err);
            res.redirect(`/rentals/list`);
        });
    } else {
        res.status(401).send("You are not authorized to remove rentals");
    }
})


router.post("/remove/:id", (req, res) => {
    const id = req.params.id;
    let imgUrl;
    rentalModel.findById(id)
        // .lean()
        .then((rental) => {
            imgUrl = rental.imageUrl;

            rentalModel.deleteOne({
                _id: id
            })
            .then(() => {
                fs.unlink(`assets/images/${imgUrl}`, (err) => {
                    if (err) {
                      console.error(err);
                    } else {
                    console.log('File deleted successfully');
                    }
                  });


                res.redirect("/rentals/list");
            })
            .catch(error => {
                console.log(error);
                //res.status(500).send('Error deleting rental');
                res.redirect(`/rentals/list`);
            });
        })
})

module.exports = router;