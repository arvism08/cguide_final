
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _=require("lodash");
const encrypt =require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/C-guideDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  fname:String,
  lname:String
});

userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"]});

const commentSchema = new mongoose.Schema({
  comment: String,
  date: String
});

const postSchema = new mongoose.Schema({
  postNumber: String,
  date: String,
  userName: String,
  question: String,
  comments:[commentSchema]
});

const User = mongoose.model("User",userSchema);
const Post = mongoose.model("Post",postSchema);
const Comment = mongoose.model("Comment",commentSchema);

const c1 = new Comment({
  comment: "YES",
  date: "April 22,2021"
});

const c2 = new Comment({
  comment: "just focus on 2-3 things namely core subjects,DSA and Projects",
  date:"Apr 11,2021"
});

const c3 = new Comment({
  comment: "Focus on your studies and keep improving",
  date:"May 8,2020"
});

const p1 = new Post({
  postNumber: "p-1",
  date: "April 21,2021",
  userName:"kartik Patidar",
  question:"Is Amity University better than LPU and Sharda University ?",
  comments:[c1]
});

const p2 = new Post({
  postNumber: "p-2",
  date: "Apr 8,2021",
  userName:"Rajat Sharma",
  question:"I am 2nd Year BTech student .How can I grab Internship oppurtunity in my 2nd Year?",
  comments:[c2]
});

const p3 = new Post({
  postNumber: "p-3",
  date: "May 8,2020",
  userName:"neha Singh",
  question:"I have low CGPA and ATKT .Does this affect my interview for placements?",
  comments:[c3]
});

const defaultPosts = [p1,p2,p3];

let today=new Date();

let options = {
  day: "numeric",
  month: "long",
  year:"numeric"
};

let day=today.toLocaleDateString("en-US",options);

app.get("/",function(req, res){
  res.render("home");
});

app.get("/login",function(req, res){
  res.render("login",{
    stat:" "
  });
});


app.post("/register",function(req, res){
  fname=req.body.fname;
  lname=req.body.lname;

  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
    fname: req.body.fname,
    lname: req.body.lname
  });
  newUser.save();

  res.render("login",{
    stat:"You have successfully registerd to C-Guide !! Please login"
  });
});



app.post("/login",function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username},function(err, foundUser){
    if(err)
    {
      console.log(err);
    }else
    {
      if(foundUser)
      {
        if(foundUser.password == password)
        {
          Post.find({},function(err,foundPosts){

            if(foundPosts.length === 0)
            {
              Post.insertMany(defaultPosts,function(err){
                if(err)
                {
                  console.log(err);
                }else
                {
                  console.log("Posts added successfully to db");
                }

              });

              res.render("first",{
                fname: foundUser.fname,
                lname: foundUser.lname,
                posts: defaultPosts
              });
            }else
            {
              res.render("first",{
                fname:foundUser.fname,
                lname: foundUser.lname,
                posts: foundPosts
              });
            }
          });
        }else
        {
          res.render("login",{
            stat: "Wrong Password!! try again.."
          });
        }
      }else
      {
        res.render("login",{
          stat: "Your email is not registered"
        });
      }
    }
  });
});


app.get("/register",function(req, res){
  res.render("register");
});


app.get("/first",function(req,res){
  // console.log(username + "  " + password);

  User.findOne({email: username},function(err, foundUser){
    if(err)
    {
      console.log(err);
    }else
    {
      Post.find({},function(err,foundPosts){

        if(foundPosts.length === 0)
        {
          Post.insertMany(defaultPosts,function(err){
            if(err)
            {
              console.log(err);
            }else
            {
              console.log("Posts added successfully to db");
            }

          });
          res.render("first",{
            fname: foundUser.fname,
            lname: foundUser.lname,
            posts:defaultPosts
          });
        }else
        {
          res.render("first",{
            fname: foundUser.fname,
            lname: foundUser.lname,
            posts:defaultPosts
          });
        }
      });
    }
  });

});

app.post("/first",function(req,res){
  res.redirect("/askquestion");
});

app.get("/about",function(req,res){
  //console.log(username + "  " + password);
  User.findOne({email: username},function(err, foundUser){
    if(err)
    {
      console.log(err);
    }else
    {
      res.render("about",{
        fname:foundUser.fname,
        lname:foundUser.lname
      });
    }
  });
});

app.get("/askquestion",function(req,res){
  res.render("askQuestion",{
    fname:fname,
    lname:lname
  });
});

var pno ;
app.post("/getPostNo",function(req,res){
  pno = req.body.p_no;
  pno++;
//  console.log(pno);
});

app.post("/comment",function(req,res){
  const comment = req.body.comment_box;


  Post.findOne({postNumber: "p-" + pno},function(err , foundPost){
    if(err)
    {
      console.log(err);
    }else
    {
      const c = new Comment({
        comment: comment,
        date:day
      });
      c.save();
      foundPost.comments.push(c);
      foundPost.save();

      res.render("post",{
        fname:fname,
        lname:lname,
        post: foundPost
      });
    }
  });

});

app.post("/askquestion",function(req,res){
  const ques=req.body.question;
  var cur_no=0;

  Post.find({},function(err,foundPosts){
    if(err)
    {
      console.log(err);
    }else
    {
      var cnt = foundPosts.length;
      cnt++;

      const p = new Post({
        postNumber: "p-" + cnt,
        date: day,
        userName:"Sanskar Maliwad", //USERNAME
        question:ques,
        comments:[]
      });

      p.save();
    }
  });

});

app.get("/posts/:postName",function(req,res){
  var requestPost=req.params.postName;

      Post.findOne({postNumber: requestPost},function(err , foundPost){
        if(err)
        {
          console.log(err);
        }else
        {
          res.render("post",{
            fname: fname,
            lname: lname,
            post: foundPost
          });
        }
      });

});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
