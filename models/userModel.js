const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    cart: [{
        rental: { type: mongoose.Schema.Types.ObjectId, ref: 'rentals', required: true },
        nights: { type: Number, required: true, default: 1 }
    }]
});

userSchema.pre("save", function(next) {
    let user = this;

    // Generating a unique salt
    bcryptjs.genSalt()
        .then(salt => {
            // Hash the password using the generated salt
            bcryptjs.hash(user.password, salt)
                .then(hashedPwd => {
                    // The password was hashed
                    console.log(`password : ${user.password}`);
                    user.password = hashedPwd;
                    console.log(`new password : ${user.password}`);
                    next();
                })
                .catch(err => {
                    console.log(`Error occurred when hashing ... ${err}`);
                })
        })
        .catch(err => {
            console.log(`Error occurred when salting ... ${err}`);
        })
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;