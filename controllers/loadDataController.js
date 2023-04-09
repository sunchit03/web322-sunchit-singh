const express = require("express");
const router = express.Router();
const rentalModel = require("../models/rentalModel");
const rentalList = require("../models/rentals-db");

router.get("/rentals", (req, res) => {
    if (req.session && req.session.user && req.session.isClerk) {
        
        rentalModel.count()
            .then((count) => {

                let already = false;
                if (count > 0) {
                    already = true;

                    res.render("load-data/rentals", {
                        title: "Load Data",
                        already
                    })
                }
                else {
                    
                    rentalModel.insertMany(rentalList.getAllRentals())
                    .then(() => {
                        console.log("Successfully inserted rentals into the database");
                        
                        res.render("load-data/rentals", {
                            title: "Load Data",
                            already
                        })
                    })
                    .catch((err) => {
                        console.error(err);
                        res.send('Error in adding rentals to the database.')
                    });

                } 
        
            })
            .catch((err) => {
                console.error(err);
                res.send('Error in counting the rentals in the database.')
            });
    
    } else {
        res.status(401).send("You are not authorized to add rentals");
    }

})

module.exports = router;