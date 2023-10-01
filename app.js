//jshint esversion:6
require('dotenv').config();
// from abovee line now dotenv is active and running
// now need is to define our environment variable
const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require("mongoose");

// using passport 
// here first we tell our app to use session package
const session = require('express-session');
const passport  = require("passport");
const passportLocalMongoose =  require("passport-local-mongoose");
// const md5 = require("md5");

// now we will be using bcrypt hashing 

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// done using encrypt


const app = express();

// console.log(process.env.API_KEY);

// const encrypt = require("mongoose-encryption");
// now we will use hash function instead of encryption
app.use(express.static("public"));

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
    extended:true
}));

// initialize session with some initial configuration

app.use(session({
    secret: "this is the secret",
    resave: false,
    saveUninitialized: false
}));

// now we tell our app to initialize passport
//  and to use passport session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/userDB");
// mongoose.connect("mongodb://localhost:27017/userDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

const userSchema = new mongoose.Schema({
    email:String,
    password: String
});

// add passport plugin to userSchema 
userSchema.plugin(passportLocalMongoose);

// encryption key
// const secret  = "this is secret";
// cut it from here when we use env file 

// now grabbing the secret from the .env file
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"] });
// userSchema is now encrypted ( only password)
  
const User =  new  mongoose.model("User",userSchema);

// serialize and deserialize 

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});
app.get("/register", function(req,res){
    res.render("register");
});

app.get("/logout", function(req,res){
    // res.render("home");
    req.logout(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
    // res.redirect("/");
});
app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});
// app.post("/register", async function(req,res){ // Use async/await
//     try {
//         const newUser = new User({
//             email: req.body.username,
//             // password: req.body.password
//             // now using hashfunction md5 we will turn the password entered by user into hashvalue
//             password: md5(req.body.password)
//         });
//         await newUser.save();
//         res.render("secrets");
//     } catch (err) {
//         console.error(err);
//         res.redirect("/register"); // Handle errors by redirecting to the registration page
//     }
// });


//for encrpyt

// app.post("/register", async function(req,res){ // Use async/await
//    bcrypt.hash(req.body.password,saltRounds,async function(err,hash){
//     try {
//         const newUser = new User({
//             email: req.body.username,
//             password: hash
//         });
//         await newUser.save();
//         res.render("secrets");
//     } catch (err) {
//         console.error(err);
//         res.redirect("/register"); // Handle errors by redirecting to the registration page
//     }
//    })
// });

app.post("/register", function(req,res){
    
     User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
     });

});

app.post("/login", function(req,res){
       
    const user =  new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});
// app.post("/login",async function(req,res){
//     const username = req.body.username;
    // now in hashing we will convert the password entered by user into hashvalue 
    // using hashfunction and then check if it is the same value as stored in the mongoose
    //  database for the particular user email id 

    // const password = md5(req.body.password);

    // now while using encrypt we update the password
    
//     const password = req.body.password;
//     try{
//         const foundUser = await User.findOne({email: username}).exec();
//         if(foundUser){
//             // bcrypt provide us the compare function
//             bcrypt.compare(password,foundUser.password,function(err,result){
//                 if(result === true){
//                     res.render("secrets");
//                 }
//             })
//             // res.render("secrets");
//         }else{
//             res.render("login",{error: "Invalid username or password"});
//         }
//      }catch(err){
//         console.error(err);
//         res.render("login",{error : "An error occured"});
//      }

// });


app.listen(3000,function(){
    console.log("server started on port 3000");
});