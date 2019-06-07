var express                 =require("express"),
    app                     =express(),
    fs                      =require('fs'),
    upload                  =require("express-fileupload"),
    bodyParser              =require("body-parser"),
    mongoose                =require("mongoose"),
    User                    =require("./models/user"),
    Job                     =require("./models/jobs"),
    passport                =require("passport"),
    multer                  =require("multer"),
    nodemailer              =require("nodemailer"),
    cloudinary              =require("cloudinary"),
    LocalStrategy           =require("passport-local"),
    passportLocalMongoose   =require("passport-local-mongoose");


// SCHEMA SETUP
var invoiceSchema= new mongoose.Schema({
    vendor: String,
    invoiceNumber: String,
    invoiceAmount:Number,
    invoiceDate: String,
    projectManager: String,
    imageUrl:String,
    invoiceStatus:String,
    rejectionReason:String,
    statusChangeDate:String,
    notes:String,
    jobBreakdown: { type : Array , "default" : [] }
});


   
//cloudinary set up 
var storage = multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,Date.now()+file.originalname);
    }
});
var imageFilter=function(req,file,cb){
    // accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)){
        return cb(new Error('Only image files are allowed!'),false);
    }
    cb(null,true)
};
var upload=multer({storage:storage,fileFilter:imageFilter})

cloudinary.config({
    cloud_name:'djoqjmxax',
    api_key:112485178951451,
    api_secret:"g_n5m7fcTtJF8uHPZNIrehD6HEQ"
});
// db setup
mongoose.connect("mongodb://localhost/apsystem");

app.use(express.static("public"));
// app.use('/required', express.static('required'));
app.use(bodyParser.urlencoded({extended:true}));
// app.use(upload());

app.set("view engine","ejs");

// MULTER STORAGE SETUP
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'file/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
 
var upload = multer({ storage: storage });


app.use(require("express-session")({
    secret:"AP approval system secret",
    resave:false,
    saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







// Compiling Schema in to model
var InvoiceObj = mongoose.model("InvoiceObj",invoiceSchema);


// InvoiceObj.create({
//         vendor: "JC Roman",
//         invoiceNumber: "20190412",
//         invoiceAmount:12000.00,
//         invoiceDate: "4/12/2019",
//         projectManager: "Bill Guy",
//         imageUrl:"https://i.pinimg.com/originals/bd/4d/64/bd4d644cc52a3fea49a26561d924e4dd.jpg"
//     },function(err,invoice){
//         if(err){
//             console.log(err);
//         }else{
//             console.log(invoice + " added!");
//         }
//     });




app.get("/",isLoggedIn,function(req,res){
    // res.render("home",{shared:sharedProperties(req)});
    res.render("home");
    
    // res.render("home",{username:req.user.username});
});


app.get("/register",isLoggedIn,isAdmin,function(req,res){
   res.render("register"); 
});
app.post("/register",function(req,res){
    User.register(new User({username: req.body.username,firstname: req.body.firstname,lastname: req.body.lastname,isAdmin:req.body.admin}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
        });
    });
    
    
});

app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function(req,res){
    res.redirect("/");
});


app.get("/unapproved",isLoggedIn,function(req,res){
    var approver = req.user.firstname + " " + req.user.lastname;
    console.log(approver);
    if(req.user.username=="admin"){
        InvoiceObj.find({invoiceStatus:"pending"}, function(err, allInvoices){
           if(err){
               console.log(err);
           } else {
              res.render("unapproved",{invoiceobjs:allInvoices,username:req.user.username});
           }
        }).sort({vendor:1});    
    }else{
        InvoiceObj.find({projectManager:approver, invoiceStatus:"pending"}, function(err, allInvoices){
           if(err){
               console.log(err);
           } else {
              res.render("unapproved",{invoiceobjs:allInvoices,username:req.user.username});
           }
        }).sort({vendor:1});
    }
    // res.render("unapproved",{invoices:invoices});
});

app.get("/approved",isLoggedIn,function(req,res){
    var approver = req.user.firstname + " " + req.user.lastname;
    if(req.user.username=="admin"){
        InvoiceObj.find({invoiceStatus:"approved"}, function(err, allInvoices){
           if(err){
               console.log(err);
           } else {
              res.render("approvedrejected",{invoiceobjs:allInvoices,username:req.user.username});
           }
        }).sort({vendor:1});    
    }else{
        InvoiceObj.find({projectManager:approver,invoiceStatus:"approved"}, function(err, allInvoices){
           if(err){
               console.log(err);
           } else {
              res.render("approvedrejected",{invoiceobjs:allInvoices});
           }
        }).sort({vendor:1});
    }
    // res.render("unapproved",{invoices:invoices});
});
app.get("/adminDashboard",isLoggedIn,isAdmin,function(req,res){
    res.render("adminDashboard");
    
});
app.get("/invoiceStatus/:id/",function(req,res){
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    // invoiceID=invoiceID.toString();
    console.log(invoiceID);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            res.render("invoiceStatus",{invoice:foundInvoice});
        }
    });
});
app.get("/invoiceStatus/:id/display",function(req,res){
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            res.render("displayFinal",{invoice:foundInvoice});
        }
    });
    
});

app.get("/rejected",isLoggedIn,function(req,res){
    var approver = req.user.firstname + " " + req.user.lastname;
        if(req.user.username=="admin"){
            InvoiceObj.find({invoiceStatus:"rejected"}, function(err, allInvoices){
               if(err){
                   console.log(err);
               } else {
                  res.render("approvedrejected",{invoiceobjs:allInvoices,username:req.user.username});
               }
            }).sort({vendor:1});    
        }else{
            InvoiceObj.find({projectManager:approver,invoiceStatus:"rejected"}, function(err, allInvoices){
               if(err){
                   console.log(err);
               } else {
                  res.render("approvedrejected",{invoiceobjs:allInvoices});
               }
            }).sort({vendor:1});
        }
});
app.get("/rejected/:id/",function(req,res){
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    // invoiceID=invoiceID.toString();
    console.log(invoiceID);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            res.render("invoiceStatus",{invoice:foundInvoice});
        }
    });
});

// upload pdf, convert to jpeg, upload both to cloudinary and display one as thumbnail and the other as pdf
app.post("/uploadInvoices",isLoggedIn,isAdmin,upload.single('image'),function(req,res){
    var vendor=req.body.vendor;
    var invoiceNumber=req.body.invoiceNumber;
    var invoiceAmount= req.body.invoiceAmount;
    var invoiceDate=req.body.invoiceDate;
    var projectManager=req.body.projectManager;
    // var imageUrl= req.body.imageUrl;
    // var imageUrl = result.secure_url;
    var imageUrl=req.body.image;
    var image = "";
    var imageUpload=req.body.imageUpload;
    var invoiceStatus="pending";
    
    checkIfDuplicate(vendor,invoiceNumber);
    
    cloudinary.uploader.upload(req.file.path,function(result){
        // add cloudinary URL for the image to the campground object under image property
        // req.body.image
        req.body.image= result.secure_url;
        // console.log(req.body.image);
        imageUrl=req.body.image;
        image=req.body.image;
    
    // console.log(imageUrl + "test");
    
    var newInvoiceInfo={vendor:vendor,invoiceNumber:invoiceNumber,invoiceAmount:invoiceAmount,invoiceDate:invoiceDate,projectManager:projectManager,imageUrl:image,invoiceStatus:invoiceStatus};
    // console.log(imageUrl);
    console.log(newInvoiceInfo);
    InvoiceObj.create(newInvoiceInfo,function(err,newlyCreated){
    // InvoiceObj.create(invoiceUpload,function(err,newlyCreated){
        if(err){
        console.log(err);
        }else{
            res.redirect("/unapproved");
            // email(imageUrl,'dylanhastings01893@gmail.com');

        }
    });
    });
    
    
});
function checkIfDuplicate(vendorName,invoiceNum){
    InvoiceObj.count({vendor:vendorName,invoiceNumber:invoiceNum}, function (err, count){ 
        if(count>0){
            throw new Error('Invoice Already Exists!'); 
        }else{
            console.log("document does not exist");
        }
    }); 
    
    
}


app.get("/unapproved/:id/", function(req, res){
    // mongoose.Types.ObjectId
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    var jobs=[];
    // invoiceID=invoiceID.toString();
    Job.find({},function(err,allJobs){
        if(err){
            console.log(err);
        }else{
            jobs=allJobs;
        }
            
    }).sort({jobNumber:1});
    console.log(invoiceID);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            // email(foundInvoice.imageUrl,req.params.id,'dylanhastings01893@gmail.com');
            res.render("invoiceScreen",{invoice:foundInvoice,jobs:jobs});
            // console.log(jobs);
        }
    });
    
    
    
});
app.post("/unapproved/:id/:status/",function(req,res){
    // console.log("checked: " +req.body.options)
    var now=new Date();
    var date = (now.getMonth()+1)+'/'+now.getDate()+'/'+now.getFullYear(); 
    date += ' @ '+(now.getHours())+':'+now.getMinutes()+':'+now.getSeconds(); 
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    console.log(invoiceID);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            // res.render("invoiceStatus",{invoice:foundInvoice});
            // email(foundInvoice.image,'dylanhastings01893@gmail.com');
            console.log(foundInvoice.imageUrl);
            // email(foundInvoice,'dylanhastings01893@gmail.com',)
            statusEmail(foundInvoice,'dylanhastings01893@gmail.com',req.body.options);
        }
    });
    InvoiceObj.updateOne({_id: mongoose.mongo.ObjectId(req.params.id)}, {$set:{invoiceStatus:req.body.options,statusChangeDate: date, notes:req.body.notes,jobBreakdown:[req.body.jobNotes]}}, {new: true},function(err, result) {
        if (err){
            console.log(err);
        }else{
        res.redirect("/unapproved");
        }
    });
   
   
    // console.log(req.body.jobNotes);
    
});
app.get("/unapproved/:id/:status/",function(req,res){
    // console.log("status: " + req.params.status);
    
    var invoiceID = mongoose.mongo.ObjectId(req.params.id);
    InvoiceObj.findById(invoiceID,function(err,foundInvoice){
        if(err){
            console.log(err);
        }else{
            res.render("invoiceStatus",{invoice:foundInvoice});
        }
    });

});

app.get("/uploadInvoices",isAdmin,function(req,res){
    User.find({}, function(err, allUsers){
       if(err){
           console.log(err);
       } else {
          res.render("uploadInvoices",{users:allUsers});
       }
    });
    // res.render("uploadInvoices",users);
});
app.get("/uploadBudget",function(req,res){
  res.render("uploadFile");
});


// POST
app.post('/uploadBudget', upload.single('myFile'), function(req, res, next){
  var file = req.file;
  var jobNumber=req.body.jobNumber.toUpperCase();
  var jobDescription=req.body.jobDescription;
  console.log(file);
  var str=[];
  if (!file) {
    var error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  fs.readFile(file.path, 'utf8', function(err, contents) {
    str = formatImport(contents)
    // res.render("uploadDisplay",{budget:str});
    var newJob={jobNumber:jobNumber,jobDescription:jobDescription,budget:str}
    Job.create(newJob,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            console.log(newlyCreated);
            res.redirect("/");
        }
    });
});





});


app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req,res,next){
    var test="test";
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
function isAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.isAdmin===true){
        return next();
    }
    res.redirect("/");
}
function sharedProperties(req){
    var data={
        approver: req.user.firstname + " " + req.user.lastname,
        user:req.user.username,
        firstname:req.user.firstname,
        lastname:req.user.lastname
    };
    return data;
}
function formatImport(content){
  // SEPERATE BUDGET IN TO LINES
  var str = splitImportLines(content);
  // REMOVE EVERYTHING EXCEPT PHASE, COST CODE, AND DESCRIPTION
  str = removeBadItems(str);
  return str;
}

function splitImportLines(content){
  var str=content
  // SPLIT IN TO ARRAY
  str = str.split(',');
  // LOOP THROUGH ARRAY AND CHANGE EVERY UNIT VALUE TO *-*
  for(var i = 0; i<str.length; i++){
    if(i%20==0){
      str[i]="*-*";
    }
  }
  // SPLIT ARRAY BY *-*
  str=str.toString().split("*-*");
  return str;
}
function removeBadItems(content){
  var str = content;
  str= str.filter(function(e){return e}); 
  var array=[];
  for(var i = 0; i<str.length; i++){
    var list=str[i].split(',');
    array.push(list[1] + "-" + list[3] + ": " + list[4]);
    // console.log(list[1]);
    // console.log(list[3]);
    // console.log(list[4]);
  }
  
  return array;  
}
function email(invoice,email){
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dylanhastingsmcg@gmail.com',
        pass: 'Mcg4842#'
        }
    });
    const mailOptions = {
     from: 'dylanhastingsmcg@gmail.com', // sender address
     to: email, // list of receivers
     subject: 'Invoice ', // Subject line
      html: '<img src="' + invoice.imageUrl.replace(".pdf",".jpg") + '"><br><br><p>Approve|Reject'// plain text body
    // html:"<body><style>.relative{position:relative;width:600px;}.absolute-text{position:absolute;left: 75px;bottom: 500px;font-size:14px;font-family:\"vedana\";background:rgba(251,251,251,.65) !important;padding:10px 20px;width:100%;text-align:center;border-top-style: dotted;border-bottom-style: dotted;}.absolute-text.amount{left: 75px;bottom: 115px; b}.absolute-text.jobs{left: 75px;bottom: 300px;}.absolute-text a{font-size:16px;color:#b92b27;}img{width:700px;height:850px;}</style><div class="relative"><img src="<%= invoice.imageUrl.replace(".pdf",".jpg") %>" alt=""><p class="absolute-text"><%=invoice.invoiceStatus.toUpperCase(); %> By: <%= invoice.projectManager %> on: <%=invoice.statusChangeDate %></a> </p><br><p class="absolute-text jobs">Breakdown / Notes: => <%= invoice.jobBreakdown %></a> </p><p class="absolute-text amount">Total: <%=invoice.invoiceAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); %></a> </p></div></body>"
    
};
    transporter.sendMail(mailOptions, function (err, info) {
       if(err)
         console.log(err)
       else
         console.log(info);
    });
console.log('sent email');
}

function statusEmail(invoice,email,status){
    var fs = require("fs");
    var nodemailer = require("nodemailer");
    var ejs = require("ejs");
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'dylanhastingsmcg@gmail.com',
            pass: 'Mcg4842#'
        }
    });
    
    ejs.renderFile(__dirname + "/views/displayFinal.ejs", { invoice: invoice }, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        var mainOptions = {
            from: '"Dylan Hastings" dylanhastingsmcg@gmail.com',
            to: "dylan.hastings@mcgfiber.com",
            subject: 'Hello, world',
            html: data
        };
        console.log("html data ======================>", mainOptions.html);
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    }
    
    });
    console.log('sent email');
}

app.set('port', process.env.PORT || 3000);
app.set('host', process.env.HOST || '3.15.23.88');

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('host') + ':' + app.get('port'));
  console.log("Run curl http://169.254.169.254/latest/meta-data/public-ipv4 to get public IP address");
  
});



// app.listen(process.env.PORT,process.env.IP,function(){
//     console.log("Server has started");
// });