const express = require('express');
const app = express();
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const saltRounds = 10;

mongoose.connect("mongodb+srv://Lucas113:Lucas17!@cluster0-sq0zj.mongodb.net/newUsers", { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,

});

const User = mongoose.model('user', userSchema);


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.set("view engine", "ejs")


app.post("/signUp", function (req, res) {

  const firstName =  _.capitalize(req.body.fName);
  const lastName = _.capitalize(req.body.lName);
  const username = _.capitalize(req.body.email);
  const password1 = req.body.password1;
  const password2 = req.body.password2;

  const fullName = firstName + " " + lastName

  User.findOne({username: username}, function (err, foundUser) {
    if (err) {
      console.log("no error");
    } else {
      if (foundUser) {
        res.render("login", {message: "There is an account associated with email, sign in."});

      } else {
        if (password1 == password2) {
          bcrypt.hash(password1, saltRounds, function(err, hash) {
            const newUser = new User ({
              firstName: firstName,
              lastName: lastName,
              username: username,
              password: hash,
            })
            newUser.save();
            res.render("homeScreen", {firstName: firstName, name: fullName , email: username})
          });



        } else {
          res.render("signUp", {message: "Passwords did NOT match. Please try again"})
        }

      }
    }
  })



});

app.post("/login", function (req, res) {
  const username = _.capitalize(req.body.username);
  const password = req.body.password;

  User.findOne({username: username}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result == true) {
            res.render("homeScreen", {firstName: foundUser.firstName, name: foundUser.firstName + " " + foundUser.lastName, email: username})
          } else {
            res.render("login", {message: "Username or password is incorrect."})
          }
});
      }else {
        console.log(foundUser);
        res.render("signUp", {message: "Username not found please sign up."})
      }

    }
  })
});

app.post("/deleteAccount", function (req, res) {
  res.render("deleteAccount", {message: "Enter you information below."})

});

app.post("/confirmDeletion", function (req, res) {
  const username = _.capitalize(req.body.username);
  const password = req.body.password;

  User.findOne({username: username}, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result == true) {
            User.deleteOne({username: username}, function (err) {
              if (err) {
                console.log(err);
              }
            })
            res.render("login", {message: "Your account was succesfully deleted"})
          } else {
            res.render("deleteAccount", {message: "Username or password is incorrect."})
          }
});
      } else {
        res.render("deleteAccount", {message: "Username or password is incorrect."})
      }

    }
  })
})

app.post("/logout", function (req, res) {
  res.render("login", {message: "You have succesfully logged out."});
})

app.get("/goBack", function (req, res) {
  res.render("login", {message: "Your account was Not deleted. Sign back in."})
})
app.get("/", function (req, res) {
  res.render("login", {message: null})
});

app.get("/signUp", function (req, res) {
  res.render("signUp", {message: null})
});
app.get("/login", function (req, res) {
  res.render("login", {message: null})
})

app.listen(process.env.PORT || 3000, function () {
  console.log("server is running");
}); 
