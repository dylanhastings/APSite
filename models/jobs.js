var mongoose=require("mongoose");

var JobSchema=new mongoose.Schema({
    jobNumber:String,
    jobDescription:String,
    budget: { type : Array , "default" : [] }

});

module.exports=mongoose.model("Job",JobSchema);