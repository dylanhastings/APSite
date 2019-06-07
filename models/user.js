var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    isAdmin: Boolean,
    email:String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);