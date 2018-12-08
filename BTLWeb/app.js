var express = require('express');
var path = require('path');
var mongojs = require('mongojs');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var session = require('express-session');
var User = require('./model/user');
const Nexmo = require('nexmo');
var flash = require('connect-flash');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var scanf = require("sscanf");
// set database
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1');
var db = mongoose.connection;
var List_user_connected=[];
// init app
var list_user=[]
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require('crypto');
app.use(methodOverride('_method'));
var storage1=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/upload')
    },
    filename: function(req,file,cb){
        cb(null,"k.png")
    }

})
var upload1 = multer({storage: storage1})

var loi;


// check loi
var ascII ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
// viet ham check password nhap vao
function checkPassword(temp){
    if(temp.length < 6) return 1;//"Mật khẩu phải lớn hơn hoặc bằng 6 kí tự";
    else{
        for(var i=0; i<temp.length; i++){
            var check = temp.substring(i,i+1);
            if(ascII.indexOf(check) == -1)
            return  2;//"Mật khẩu chỉ được chứa chữ cái viết hoa,viết thường hoặc số";
        }
    }
    return 0;
}
var ascii ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-:()%., áàạảãâấầậẩẫăắằặẳẵÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴéèẹẻẽêếềệểễÉÈẸẺẼÊẾỀỆỂỄóòọỏõôốồộổỗơớờợởỡÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠúùụủũưứừựửữÚÙỤỦŨƯỨỪỰỬỮíìịỉĩÍÌỊỈĨđĐýỳỵỷỹÝỲỴỶỸ\r\n\r\n"
// viet ham check input va text area nhap vao
function checkInput(temp){
    if(temp){
    for(var i=0; i<temp.length; i++){
        var check = temp.substring(i,i+1);
        var x ="."
        if((ascii.indexOf(check) == -1 )) 
       {
           console.log("Vị trí "+i+" Phần tử: "+check);
            return  1;//"input chỉ được chứa chữ cái viết hoa,viết thường hoặc số";
       }
    }
    return 0;
}else{
    return 1;
}
}


var asciii ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@."
function checkEmail(temp){
    for(var i=0; i<temp.length; i++){
        var check = temp.substring(i,i+1);
        if(asciii.indexOf(check) == -1)
        return  1;//"input chỉ được chứa chữ cái viết hoa,viết thường hoặc số";
    }
    return 0;
}


//Check phone
function checkPhoneNumber(phone) {
    if (phone.length!=0) {
    phone = phone.replace('84', '0');
    phone = phone.replace('+84', '0');
    phone = phone.replace(/ /g, '');
        var firstNumber = phone.substring(0, 2);
        if ((firstNumber == '09' || firstNumber == '08'|| firstNumber == '03') && phone.length == 10) {
            if (phone.match(/^\d{10}/)) {
                return 0;
            }
        } else if (firstNumber == '01' && phone.length == 11) {
            if (phone.match(/^\d{11}/)) {
                return 0;
            }
        }
    }
    return 1;
}


//check vode

function checkCode(code){
var inclu = "1234567890";
if(code.length!=4){
    return 1;
}else{
for(var i=0;i<4;i++){
    if(inclu.indexOf(code[i])==-1)
    return 1
}
}
return 0;
}

// set the views
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set public
app.use(express.static(path.join(__dirname,'public')));

// thiết lập  Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


const mongoURI = 'mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1uploadfiles';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
// middleware được gọi ở từng request, kiểm tra session lấy ra passport.user nếu chưa có thì tạo rỗng.
app.use(passport.initialize());
// lấy thông tin user rồi gắn vào req.user 
app.use(passport.session());

  // Connect Flash
  app.use(flash());

//global vars
app.use(function(req,res,next){
//  res.locals.success_msg = req.flash('success_msg');
  //res.locals.error_msg = req.flash('error_msg');
  //res.locals.error = req.flash('error');
    res.locals.errors = null;
    res.locals.user = req.user || null;
    res.locals.mail = req.mail || null;
    res.locals.phone = req.phone || null;  
    next();
});
// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));
var dsproduct=[];

  var Mongo = require('mongodb').MongoClient;
  Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
      var dbo = db.db("databaseofmoki")
dbo.collection("users").find().toArray(function(err,res){
    for(var i=0;i<res.length;i++)
    list_user.push(res[i].username)
})
db.close();
  })
  Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
      var dbo = db.db("databaseofmoki")
dbo.collection("TempSP").find().toArray(function(err,res){
dsproduct=res;
    db.close();
  })
})
var phone_chat;

// register
app.get('/signup',function(req,res){
    res.render('register');
    });

//Nexmo

const nexmo = new Nexmo({
    apiKey: '4e8d7f7e',
    apiSecret: 'OT5rGAHzKaFqtztV'
  }, { debug: true });

// Catch form submit
var code,code1 ;
var name1;
var username1;
var email1;
var password1;
var PhoneNumber1;
app.post('/signup', (req, res) => {
    var PhoneNumber = req.body.PhoneNumber;
    var password = req.body.password;
password1 = password;
PhoneNumber1 = PhoneNumber;
var checkphone = checkPhoneNumber(PhoneNumber);
var checkpassword = checkPassword(password);
if(checkphone!=0 || checkpassword !=0 ){
    res.json({code: "5",message:"Falied",data: "Số điện thoại hoặc mật khẩu không đúng"})
}else{
        //checking for email and username are already taken
            User.findOne({PhoneNumber: {
                "$regex": "^" + PhoneNumber + "\\b","$options": "i"
            }},function(err,phone){
                if (phone) {
                    res.json({code: "5",message:"Falied",data: "Số điện thoại đã được sử dụng"})
                }
                else {
                    var text = parseInt(Math.random()*(9999-1000)+1000);
                    code = text;
                    console.log(text);
                    res.json({code: "1",message:"Accept",data: {data: text, phone: PhoneNumber}});
                    //res.render("Confirm",{dt: text});
                }
            })
      
    }
  });

app.get("/sms_verify",function(req,res){
    res.render("Confirm");
})
app.post('/sms_verify', function(req,res){
     var code1 = req.body.code;
     var checkcode = checkCode(code1);
     if(checkcode==0){
    if(code == code1){
        var newUser = new User({
            email: "",
            username: "",
            status: "",
            firstname: "",
            lastname: "",
            avatar: "",
            address: "",
            city: "",
            password: password1,
            PhoneNumber:PhoneNumber1,
            follow: [],
            block: [],
            be_follow: []
        });
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            res.json({code: "1000", message: "OK", data: user});
        });
    }else{
        res.json({code: "5", message: "Failed", data: "Sai mã code"})
    }
}else{
    res.json({code: "5", message: "Failed", data: "Mã code gồm 4 chữ số"})
}
})

// forget Password
app.get('/forgetPassword',function(req,res){
    res.render("forgetPassword")
})
var avatarimg;
var storage2=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/upload')
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
        avatarimg=file.originalname;
    }
})


app.get("/updatelogin",function(req,res){
    res.render("updatelogin",{msg: false,sdt: PhoneNumber1});
})
var upload2 = multer({storage: storage2});
app.post("/update_register",upload2.single("Avatar"),function(req,res1){
var phone= req.body.sdt;
var username = req.body.username;
var email = req.body.Email;
var First = req.body.First;
var Last = req.body.Last;
var address = req.body.Address;
var City = req.body.City;
var checkphone = checkPhoneNumber(phone);
var checkusername = checkInput(username);
var checkemail = checkEmail(email);
var checkfirst = checkInput(First);
var checklast = checkInput(Last);
var checkaddress = checkInput(address);
var checkcity = checkInput(City);

if(checkphone!=0 || checkusername!=0 ||  checkemail!=0 ||  checkfirst!=0 ||  checklast!= 0||  checkaddress!=0 || checkcity !=0){
    res1.render("updatelogin",{msg: "Dữ liệu nhập vào không đúng",sdt: PhoneNumber1})   
} else{
var MongoClient = require('mongodb').MongoClient;
var url='mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1';
MongoClient.connect(url,function(err,db){
    if(err) throw err;
    var dbo = db.db("databaseofmoki");
    var where ={PhoneNumber : phone};
    var c = false;
    var query={$set: {avatar: avatarimg, email:email,username: username,firstname: First,lastname: Last, address: address, city: City}};

    dbo.collection("users").find().toArray(function(err,res){
        if(err) throw err;
       for(var i=0;i<res.length;i++){
        if(res[i].username==username){
            c=true;
            res1.render("updatelogin",{msg: "Tài khoản đã tồn tại",sdt: PhoneNumber1})  
            // res1.json({code: "5", message: "Falied", data: "Tài khoản đã tồn tại"});
            break;
        }
       }
       if(!c){
           dbo.collection("users").updateOne(where,query,function(err,res){
               if(err) throw err;
               res1.render("login")
            //   res1.json({code: "1000", message: "OK", data: ""})
           })
          }
       db.close();
    })
 
    })
}
})

var phoneInput;
app.post('/create_code_reset_password',function(req,res){
 phoneInput = req.body.phonenumber;
 var checkphone = checkPhoneNumber(phoneInput);
 if(checkphone!=0){
    res.json({code: "1005", message:"Unknown error", data: "Số điện thoại không đúng"})
 }else{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    MongoClient.connect(url,function(err,db){
        var dbo = db.db("databaseofmoki")
        if(err){
            res.json({code: "1001", message: "Can not connect to DB"})
        }else{
            dbo.collection('users').find({PhoneNumber:phoneInput}).toArray(function(err,user){
                if(err) throw err;
                if(user.length > 0){
                    var text = parseInt(Math.random()*(9999-1000)+1000);
                    code1 = text;
                          console.log(code1);
                          res.json({code: "1000", message:"OK", data: text})
                        //   res.render("resetPassword",{dt: text});
                      
                }else{
                    //res.redirect('forgetPassword');
                    res.json({code: "1005", message:"Unknown error", data: "Không tồn tại số điện thoại"})
                }
               db.close(); 
             });
        }
     
       });
    }
    });
      
app.get("/resetPassword", function(req,res){
res.render("resetPassword");


})
// resetpassword
app.post('/reset_Password',function(req,res){
    var resetPassword = req.body.resetPassword;
    var resetPassword2 = req.body.resetPassword2;
    var codeReset = req.body.codeReset;


    console.log(code1);
    var checkpassword = checkPassword(resetPassword);
    var checkpassword2 = checkPassword(resetPassword2);
    var checkcode = checkCode(codeReset);
    var err =[];
    if(checkpassword!=0 || checkpassword2 != 0 ){
       err.push({msg: "Mật khẩu không đúng"})
    }
    if(checkcode!=0){
        err.push({msg: "Mã xác nhận không đúng"})
    }
    if( checkpassword==0 && checkpassword2 == 0 && (resetPassword!=resetPassword2)){
        err.push({msg: "Mật khẩu không khớp"})
    }
    if(checkpassword==0 && checkpassword2 == 0 && checkcode==0 && (codeReset!=code1.toString()) ){
        err.push({msg: "Mã xác nhận không đúng"})
    }
    if(err.length!=0){
        res.json({code: "5", message: "Failed",data:err})
    }else{
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";

        MongoClient.connect(url, function(err, db) {
         if (err) throw err;
         var dbo = db.db("databaseofmoki");
        var password = {PhoneNumber: phoneInput}
        //bcrypt 
        var user ;
        dbo.collection("users").findOne(password, function(err, result) {
            if (err) throw err;
           
            user=result;
        });
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(resetPassword, salt, function(err, hash) {
            var newpass = { $set: {password: hash } };
            dbo.collection("users").updateOne(password, newpass, function(err, result) {
            if (err) throw err;
            console.log("Cập nhật mật khẩu thành công");

            res.json({code: "1000", message: "OK", data: user});
            db.close();
        });
   });       
   });
        });
    } 
});
var tenuser=0;


function change_alias(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/ầ|ấ|ậ|ẩ|ẫ/g,"â");
    str = str.replace(/ằ|ắ|ặ|ẳ|ẵ/g,"ă");
    str = str.replace(/à|á|ạ|ả|ã|â|ă/g,"a"); 
    str = str.replace(/ề|ế|ệ|ể|ễ/g,"ê")
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ờ|ớ|ợ|ở|ỡ/g,"ơ");
    str = str.replace(/ồ|ố|ộ|ổ|ỗ/g,"ô");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ơ/g,"o"); 
    str = str.replace(/ừ|ứ|ự|ử|ữ/g,"ư");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    str = str.replace(/ + /g," ");
    str = str.trim(); 
    return str;
}
// Hàm tìm kiếm
function search_name(X,Y){
    var X1 = X.toLowerCase();
    var Y1 = Y.toLowerCase();
    var X2 = change_alias(X1);
   var Y2 =  change_alias(Y1);
var chuoi1 = X2.split(" ");
var chuoi2 = Y2.split(" ");
    var lenX = chuoi1.length;
    var lenY = chuoi2.length;
    // for(var i=0;i<lenX ;i++){
    //     change_alias(X1[i]);
    // }
    // for(var i=0;i<lenY ;i++){
    //     change_alias(Y1[i]);
    // }
    var a = new Array(lenX+1);
    for(var i =0 ;i<lenX+1;i++){
        a[i] = new Array(lenY+1)
    }
    
    for(var i = lenX;i >= 0;i-- )
        a[i][lenY] = 0;
    
    for(var j = lenY;j >= 0;j-- ){
        a[lenX][j] = 0;
    }
    for(var i= lenX-1; i>=0; i--){
        for(var j=lenY-1;j>=0;j--){
            if(chuoi1[i]==chuoi2[j]) a[i][j] = a[i+1][j+1] + 1;
            else a[i][j] = a[i][j+1]>a[i+1][j]?a[i][j+1]:a[i+1][j];
        }
    }
    return a[0][0]
}
app.get("/moki.vn/:id",function(req,res){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
var key = req.params.id;
var data = new Array();
var data_num = new Array();
if(key=="Be-an"){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        var re = {name: key};
        dbo.collection("TempSP").find({attached: "Bé ăn"}).toArray( function(err, result) {
          if (err) throw err;
          res.render("searchpage",{kq: result,SP:dsproduct.reverse(),title: "Bé ăn"})
          db.close();
        });
      });
       }
else if(key=="Be-mac"){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("databaseofmoki");
            var re = {name: key};
            dbo.collection("TempSP").find({attached: "Bé mặc"}).toArray( function(err, result) {
              if (err) throw err;
              res.render("searchpage",{kq: result,SP:dsproduct.reverse(),title: "Bé mặc"})
              db.close();
            });
          });
           }
else if(key=="Be-ngu"){
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("databaseofmoki");
                var re = {name: key};
                dbo.collection("TempSP").find({attached: "Bé ngủ"}).toArray( function(err, result) {
                  if (err) throw err;
                  res.render("searchpage",{kq: result,SP:dsproduct.reverse(),title: "Bé ngủ"})
                  db.close();
                });
              });
               }
else if(key=="Be-tam"){
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("databaseofmoki");
                    var re = {name: key};
                    dbo.collection("TempSP").find({attached: "Bé tắm"}).toArray( function(err, result) {
                      if (err) throw err;
                      res.render("searchpage",{kq: result,SP:dsproduct.reverse(),title: "Bé tắm"})
                      db.close();
                    });
                  });
                   }
else if(key=="Be-ve-sinh"){
                    MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("databaseofmoki");
                        var re = {name: key};
                        dbo.collection("TempSP").find({attached: "Bé vệ sinh"}).toArray( function(err, result) {
                          if (err) throw err;
                          res.render("searchpage",{kq: result,SP:dsproduct.reverse(),title: "Bé vệ sinh"})
                          db.close();
                        });
                      });
                       }
else{

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        var re = {name: key};
        dbo.collection("TempSP").find().toArray( function(err, result) {
          if (err) throw err;
          for(var i = 0;i<result.length;i++){
          if(search_name(result[i].name +" "+ result[i].describle, key)>0){
              data.push(result[i]);
              data_num.push(search_name(result[i].name +" "+ result[i].describle, key));
          }
      }
           if(data.length!=0){
              for(var i = 0; i<data.length-1;i++){
                 var k2;
                 var max;
              for(var j=i+1;j<data.length;j++)
              if(data_num[i]<data_num[j]){
                  var k1;
                  k1=data_num[i];data_num[i]=data_num[j];data_num[j]=k1;
                  max = j;
                  k2=data[i];data[i]=data[j];data[j]=k2;
              }
          }
      }
          res.render("searchpage",{kq: data,SP:dsproduct.reverse(),title: key})
          db.close();
        });
      });


}

})

app.post("/get_my_likes",function(req,res){
var username = req.body.username;
var checkusername = checkInput(username);
if(checkusername!=0){
    res.json({code: "5", message: "Failed", data: "Tên user không đúng "})
}else{
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("databaseofmoki");
  dbo.collection("TempSP").find().toArray(function(err, result) {
    if (err) throw err;
    var likelis = [];
    for(var i =0 ;i<result.length;i++){
        var check = result[i].like.split(",");
        if(check.indexOf(username)!=-1)
        likelis.push({id: result[i]._id, name:result[i].name , price: result[i].price, image: result[i].image})
    }
    res.json({code: "1000", message: "OK", data:  likelis})
   //res.render("listlike",{kq: likelis,SP:result});
    db.close();
  });
});
}

})


app.post("/get_comment_products", function(req,res){
var product_id = req.body.product_id;
var index = req.body.index;
var count = req.body.count;
var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
    }
if(!check){
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err, db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("TempSP").findOne({_id: product_id}, function(er, result){
if(!result)
res.json({code: "5", message: "Failed", data: "Không tìm thấy sản phẩm"})
else{
    res.json({code: "1000", message: "OK", data: result.comment})
}
})
})
    }
    else{
        res.json({code: "5", message: "Failed", data: "Input không đúng"})
    }
})



app.post("/get_list_followed", function(req, res){
var user_id = req.body.user_id;
var index = req.body.index;
var count = req.body.count;
var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
}
if(!user_id) check = true;
if(!check){
var data_followed=[];
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1", function(err, db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("users").findOne({_id: mongoose.Types.ObjectId(user_id)}, function(er, result){
    if(!result){
        res.json({code: "1000", message: "OK", data: "Không tìm thấy thông tin user"});
        db.close();

    }else{

   for(var i=index; i<result.be_follow.length;i++){
   if(i-index<count){
    dbo.collection("users").findOne({username: result.be_follow[i]},function(erro, re){
        var followed = 0;
        if(re.be_follow.indexOf(result.username)!=-1)
        followed=1;
        data_followed.push({id: re._id, username: re.username, avatar: re.avatar, followed: followed});
    })
   }else{
       break;
   }
   }
  dbo.collection("users").find().toArray(function(er, r){
      if(er) throw er;
    res.json({code: "1000", message: "OK", data: data_followed})
  })
   
    }
})
})
}else{
res.json({code: "5", message: "Falied", data: "Input không đúng"})
}
})


app.post("/report_products", function(req,res){
var product_id = req.body.product_id;
var subject = req.body.subject;
var describle =  req.body.details;
var checksubject = checkInput(subject);
var checkdescrible = checkInput(describle);
if(!product_id || checksubject !=0 || checkdescrible !=0){
    res.json({code: "5", message: "Failed", data: "Mô tả không đúng"})
}
else{
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("TempSP").findOne({_id: product_id}, function(x, result){
if(x) throw x;
if(!result)
res.json({code: "5", message: "Falied", data: "Không tìm thấy sản phẩm"})
else{
var data_report =  result.report;
data_report.push({subject: subject, details: describle});
dbo.collection("TempSP").updateOne({_id: product_id}, {$set: {report: data_report}}, function(x, r){
db.close()
})
    res.json({code: "1000", message: "OK"})
}
})

})
}
})
app.post("/get_list_following", function(req, res){

    var user_id = req.body.user_id;
    var index = req.body.index;
    var count = req.body.count;

var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
}
if(!user_id) check = true;
    var data_followed=[];
    if(!check){
    Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1", function(err, db){
    if(err) throw err;
    var dbo = db.db("databaseofmoki");
    dbo.collection("users").findOne({_id: mongoose.Types.ObjectId(user_id)}, function(er, result){
        if(!result){
            res.json({code: "1000", message: "OK", data: "Không tìm thấy thông tin user"});
            db.close();
    
        }else{
    
       for(var i=index; i<result.follow.length;i++){
       if(i-index<count){
        dbo.collection("users").findOne({username: result.follow[i]},function(erro, re){
            var followed = 0;
            if(re.follow.indexOf(result.username)!=-1)
            followed=1;
            data_followed.push({id: re._id, username: re.username, avatar: re.avatar, followed: followed});
          
        })
          
       }else{
           break;
       }
       }
      dbo.collection("users").find().toArray(function(er, r){
          if(er) throw er;
        res.json({code: "1000", message: "OK", data: data_followed})
      })
       
        }
    })
    
    
    })
}else{
    res.json({code: "5", message: "Failed", data: "input không đúng"})
}
    })

app.post("/search_user", function(req, res){
var keyword = req.body.keyword;
var index = req.body.index;
var count = req.body.count;
var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
}
if(checkInput(keyword)!=0) check = true;
var data=[];
if(!check){
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1", function(err,db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("users").find().toArray(function(er, result){
for(var i=0;i<result.length;i++){
    if(search_name(result[i].username, keyword)> 0){
    data.push({id: result[i]._id, username: result[i].username, avatar: result[i].avatar});
    }
}

if(data.length>0){
    var final = [];
    for(var i=index ; i<data.length; i++){
        if(i-index<count)
         final.push(data[i]);
    }
    res.json({code: "1000", message: "OK", data: final})
}
else{
    res.json({code: "5", message: "Failed", data: data})
}
db.close();
})
})
}else{
    res.json({code: "5", message: "Failed", data: "Input không đúng"})
}
})


app.post("/check_password", function(req, res){
var username = req.body.phone;
var password = req.body.password;
var checkusername = checkPhoneNumber(username);
var checkpassword = checkPassword(password);
if(checkusername!=0 ||  checkpassword !=0){
    res.json({code: "5", message: "Failed", data: "Số điện thoại hoặc mật khẩu không đúng"})
}else{
    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
          res.json({code: "5", message: "Failed", data: "Không tìm thấy user"})
        }
       if(user){
        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                res.json({code: "1000", message: "OK", data: {is_correct: "1"}})
            } else {
              
            res.json({code: "1000", message: "OK", data: {is_correct: "0"}})
            }
        });
    };
    });

}
})

app.post("/get_user_listings", function(req,res){
var user_id = req.body.user_id;
var index = req.body.index;
var count = req.body.count;
var category_id = req.body.category_id;
var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
}
if(!user_id) check = true;
if(checkInput(category_id)!=0) check = true;
var user;
var datare=[];
if(!check){
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("users").findOne({_id: mongoose.Types.ObjectId(user_id)},function(e,r){
if(e) throw r;
if(r){
    dbo.collection("TempSP").find({shop: r.username, attached: category_id}).toArray(function(er, re){
        if(er)  throw er;
        for(var i=index;i<re.length;i++){
           if(i-index<count){
            datare.push(re[i]);
           }else{
               break;
           }
        }
    })
    dbo.collection("TempSP").find().toArray(function(er,ress){
        if(er) throw er;
        res.json({code: "1000", message: "OK", data: datare})
    })
}
else {
    res.json({code: "5", message: 'Failed', data: "Không tìm thấy user"})
}
    db.close();
})

})
// Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
// if(err) throw err;
// var dbo = db.db("databaseofmoki");

// if(user){
// dbo.collection("TempSP").find({shop: user.username, attached: category_id}).toArray(function(er, re){
//     if(er)  throw er;
//     for(var i=index;i<re.length;i++){
//        if(i-index<count){
//         datare.push(re[i]);
//        }else{
//            break;
//        }
//     }
// })
// dbo.collection("TempSP").find().toArray(function(er,ress){
//     if(er) throw er;
//     res.json({code: "1000", message: "OK", data: datare})
// })
// }else{
//     res.json({code: "5", message: "Faied", data: "Không tồn tại "})
// }
//})
}else{
res.json({code: "5", message: "Faied", data: "Input không đúng"})
}
})



app.post("/get_list_products", function(req,res){
    var index = req.body.index;
    var count = req.body.count;
    var category_id = req.body.category_id;
    var ch = "0123456789";
var check = false;
for(var i =0;i<index.length;i++){
if(ch.indexOf(index[i])==-1){
check = true;
break;
}
}
for(var i =0;i<count.length;i++){
    if(ch.indexOf(count[i])==-1){
    check = true;
    break;
    }
}
if(checkInput(category_id)!=0) check = true;
    var datare=[];
    if(!check){
    Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
    if(err) throw err;
    var dbo = db.db("databaseofmoki");
    dbo.collection("TempSP").find({attached: category_id}).toArray(function(er, re){
        if(er)  throw er;
        for(var i=index;i<re.length;i++){
           if(i-index<count){
            datare.push(re[i]);
           }else{
               break;
           }
        }
    })
    dbo.collection("TempSP").find().toArray(function(er,ress){
        if(er) throw er;
        res.json({code: "1000", message: "OK", data: datare})
    })
   
    })
}else{
    res.json({code: "5" , message: "Failed", data: "Input không đúng"})
}
    })

app.post("/search", function(req,res){
var keyword = req.body.keyword;
if(checkInput(keyword)==0){
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
var data = new Array();
var data_num = new Array();
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("databaseofmoki");
  dbo.collection("TempSP").find().toArray( function(err, result) {
    if (err) throw err;
    for(var i = 0;i<result.length;i++){
    if(search_name(result[i].name +" "+ result[i].describle, keyword)>0){
        data.push(result[i]);
        data_num.push(search_name(result[i].name +" "+ result[i].describle, keyword));
    }
}
     if(data.length!=0){
        for(var i = 0; i<data.length-1;i++){
           var k2;
           var max;
        for(var j=i+1;j<data.length;j++)
        if(data_num[i]<data_num[j]){
            var k1;
            k1=data_num[i];data_num[i]=data_num[j];data_num[j]=k1;
            max = j;
            k2=data[i];data[i]=data[j];data[j]=k2;
        }
    }
}
    res.json({code: "1000", message: "OK", data: data})
    db.close();
  });
});
}else{
    res.json({code: "5", message: "Failed", data: "Input không đúng"})
}


})

app.post("/search_product", function(req,res){
    var key = req.body.product_name;
    if(checkInput(key)==0){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    var data = new Array();
    var data_num = new Array();
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      var re = {name: key};
      dbo.collection("TempSP").find().toArray( function(err, result) {
        if (err) throw err;
        for(var i = 0;i<result.length;i++){
        if(search_name(result[i].name +" "+ result[i].describle, key)>0){
            data.push(result[i]);
            data_num.push(search_name(result[i].name +" "+ result[i].describle, key));
        }
    }
         if(data.length!=0){
            for(var i = 0; i<data.length-1;i++){
               var k2;
               var max;
            for(var j=i+1;j<data.length;j++)
            if(data_num[i]<data_num[j]){
                var k1;
                k1=data_num[i];data_num[i]=data_num[j];data_num[j]=k1;
                max = j;
                k2=data[i];data[i]=data[j];data[j]=k2;
            }
        }
    }
        res.render("searchpage",{kq: data,SP:dsproduct.reverse(),title:"Kết quả tìm kiếm"})
        db.close();
      });
    });
}else{
    res.render("searchpage",{kq: [],SP:dsproduct.reverse(),title:"Từ khóa chứa kí tự không hợp lệ"})
}
})
var listmyfollow=[];
var be_listmyfollow=[];

app.get("/resetPassword",function(req,res){
    res.render('resetPassword',{errors: false})
})


// ham duoc goi khi xac thực thành công để lưu thông tin user vào session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// giuos ta lấy dữ liệu user dựa vào thông tin lưu trên session và gắn vào req.user 
passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});
// login
app.get('/login',function(req,res){
    res.render('login');
    });

app.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login',successFlash:"Success", failureFlash: 'Invalid username or password.'}),function(req,res){

    });
 

//List like

app.get("/likeList/:id", function(req, res){
var title = req.params.id;
if(checkInput(title)==0){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("TempSP").find().toArray(function(err, result) {
        if (err) throw err;
        var likelis = [];
        for(var i =0 ;i<result.length;i++){
            var check = result[i].like.split(",");
            if(check.indexOf(title)!=-1)
            likelis.push(result[i])
        }
       res.render("listlike",{kq: likelis,SP:result});
        db.close();
      });
    });
}else{
   res.json({code: "5", message: "Failed", data: "Không tìm thấy user hoặc user chứa kí tự đặc biệt"})

}
})

// Danh sách theo dõi

app.get("/followList/:id", function(req, res){
var title = req.params.id;
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("users").findOne({username: title},function(err, result) {
        if (err) throw err;
      var bo = db.db("databaseofmoki");
      bo.collection("TempSP").find({}).toArray(function(err,result1){
        res.render("followList",{kq: result.follow,SP:result1});
        db.close();
      })
      db.close();
      });
    });


})


// Danh sách người theo dõi

app.get("/befollowList/:id", function(req, res){
    var title = req.params.id;
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("users").findOne({username: title},function(err, result) {
        if (err) throw err;
    var bo = db.db("databaseofmoki");
    bo.collection("TempSP").find({}).toArray(function(err,result1){
        res.render("befollowList",{kq: result.be_follow,SP:result1});
        db.close();
    })
    db.close();
      });
    });
})
var f1,f2,f3,user1;
// Thông tin tài khoản người dùng 
app.get("/userinformation/:id", function(req, res){
var title = req.params.id;
if(checkInput(title)==0){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";     
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("users").find({username: title}).toArray(function(err, result) {
        if (err) throw err;
     var bo = db.db("databaseofmoki");
     user1 = result;
     var lfollow=result[0].follow;
     var lfollowed=result[0].be_follow;
     var data=[];
     var data_be=[];
     for(var i=0;i<lfollow.length;i++){
        dbo.collection("users").findOne({username: lfollow[i]},function(err, lresult) {
            if (err) throw err;
            if(lresult)
            data.push(lresult)
        })
     }
     for(var i=0;i<lfollowed.length;i++){
        dbo.collection("users").findOne({username: lfollowed[i]},function(err, lresulted) {
            if (err) throw err;
            if(lresulted)
            data_be.push(lresulted)
        })
     }
     bo.collection("TempSP").find({shop: title}).toArray(function(err,result1){
         f1=data;
         f2=data_be;
         f3=result1;
        res.render("user",{kq: result,sp:result1,follow: data,followed: data_be});
        db.close();
     })
     db.close();
      });
    });
}else{
res.json({code: "5", message: "Failed", data: "Không tìm thấy user hoặc tên user chứa kí tự đặc biệt"})

}
})
var changeImage="";
var storage3=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./public/upload')
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
        changeImage=file.originalname;
    }
})
var upload3 = multer({storage: storage3});
// chỉnh sửa thông tin người dùng
app.get('/user/modifier/:id',function(req,res){
    var title = req.params.id;
    if(checkInput(title)==0){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        dbo.collection("users").find({username:title}).toArray(function(err,result){
            if(err) throw err;
         var bo=db.db("databaseofmoki");
         bo.collection("TempSP").find({}).toArray(function(err,result1){
            res.render("modifierUser",{user:result,SP:result1.reverse()});
         })
         db.close();
        })
    })
}else{
    res.json({code: "5", message: "Failed", data: "Không tìm thấy user hoặc tên user chứa kí tự đặc biệt"})
}
})
// Thông tin của 1 người dùng khác
app.get("/user/other/:id",function (req,res) {
    var dataname=req.params.id.split("&&");
    var title = dataname[0];
    if(checkInput(dataname[0])==0 && checkInput(dataname[1])==0){
    var checksame=false;
    if(dataname[0]==dataname[1])
    checksame=true;
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    MongoClient.connect(url,function(err,db){
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        dbo.collection("users").find({username: title}).toArray(function(err, result) {
            if (err) throw err;
            var checkfollow=false;
            var list_be_follow=result[0].be_follow;
for(var i=0;i<list_be_follow.length;i++){
    if(list_be_follow[i]==dataname[1]){
        checkfollow=true;
        break;
    }
}
         var bo = db.db("databaseofmoki");
         var lfollow=result[0].follow;
         var lfollowed=result[0].be_follow;
         var data=[];
         var data_be=[];
         for(var i=0;i<lfollow.length;i++){
            dbo.collection("users").findOne({username: lfollow[i]},function(err, lresult) {
                if (err) throw err;
                if(lresult)
                data.push(lresult)
            })
         }
         for(var i=0;i<lfollowed.length;i++){
            dbo.collection("users").findOne({username: lfollowed[i]},function(err, lresulted) {
                if (err) throw err;
                if(lresulted)
                data_be.push(lresulted)
            })
         }
         bo.collection("TempSP").find({shop: title}).toArray(function(err,result1){
            if(checksame){
                res.render("user",{kq: result,sp:result1,follow: data,followed: data_be});
            }else{
            res.render("otheruserinfomation",{kq: result,sp:result1,follow: data,followed: data_be,checkfollow: checkfollow});
            } 
        })
         db.close();
          });
    })
}else{
    res.json({code: "5", message: "Failed", data: "Không tìm thấy user hoặc tên user chứa kí tự đặc biệt"})
}
})

// chỉnh sửa thông tin người dùng
app.post('/user/modifier/:id',upload3.single("avatar"),function(req,res){
    var title = req.params.id;
    //check validator
    var city = req.body.city;
    var email = req.body.email;
    var address = req.body.address;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var x= req.body.phonenumber;
     var checkphone = checkPhoneNumber(x);
     var checkemail = checkEmail(email);
     var checkfirst = checkInput(firstname);
     var checklast = checkInput(lastname);
     var checkaddress = checkInput(address);
     var checkcity = checkInput(city);
     var checktitle = checkInput(title);
     if(checkphone!=0 || checktitle!=0 ||  checkemail!=0 ||  checkfirst!=0 ||  checklast!= 0||  checkaddress!=0 || checkcity !=0){ 
        var MongoClient = require("mongodb").MongoClient;
        var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var where ={username:title};
            var dbo = db.db("databaseofmoki");
                var bo=db.db("databaseofmoki");
                bo.collection("users").find(where).toArray(function(err,re){
                    if(err) throw err;
                    dbo.collection("TempSP").find({}).toArray(function(err,result){
                    res.render("user",{
                        errors:[{msg: "Dữ liệu nhập vào không đúng"}],
                        sp:f3,
                        kq:re,
                        follow: f1,
                        followed:f2
                    })
                    db.close();
                })
                db.close();
            })
        }) 
     } else{
        var MongoClient = require('mongodb').MongoClient;
        var url='mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1';
        MongoClient.connect(url,function(err,db){
            if(err) throw err;
            var dbo = db.db("databaseofmoki");
            var where ={PhoneNumber : x};
            var query={$set: {avatar: changeImage,firstname:firstname,email:email,lastname:lastname,city:city,address:address}};
            dbo.collection("users").updateOne(where,query,function(err,res){
                if(err) throw err;
            })
            dbo.collection("users").find({username:title}).toArray(function(err,result){
                    if(err) throw err;
                res.render('user',{kq:result,sp:f3,errors: false,    follow: f1,
                    followed:f2});
                db.close();
            })
            
        })
    }
})	
// change password
    app.get('/user/changePassword',function(req,res){
        console.log(req.user);
        res.render("changePassword");
    })
     app.post("/changePassword",function(req,res){
         var title = req.body.id;
         var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        var newPassword2 = req.body.newPassword2;
var checknewpassword = checkPassword(newPassword);
var checknewpassword2 = checkPassword(newPassword2);
    if(checknewpassword != 0 && checknewpassword2 !=0){
   // res.render("changePassword",{errors:errors});
   res.json({code: "5", message: "Failed", data: [" Mật khẩu không đúng"]})
    }else{
        // truy cap de lay mat khau cu
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
        MongoClient.connect(url,function(err,foundUser){
            if(err) throw err;
            var dbo = foundUser.db("databaseofmoki");
            dbo.collection("users").findOne({PhoneNumber: title},function(err,user){
                if(err) throw err;
                if(user){
                     User.comparePassword(oldPassword,user.password,function(err,isMatch){
                if(!isMatch) 
                // res.render("changePassword",{
                //     errors: [{msg : "Mật khẩu cũ không đúng"}]
                // });
                res.json({code: "5", message: "Failed", data: ["Mật khẩu cũ không đúng"]})
                if(isMatch){
             var newPass = {PhoneNumber:title};
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newPassword, salt, function(err, hash) {
                    var newpass = { $set: {password: hash } };
                    dbo.collection("users").updateOne(newPass, newpass, function(err, result) {
                    if (err) throw err;
                    console.log("Cập nhật mật khẩu thành công");
                    //res.redirect("/");
                    res.json({code: "1000", message: "OK", data: user})
                    foundUser.close();
                });
           });      
           });
        }
     })
     }else{
         res.json({code: "5", message: "Failed", data: ["Không tìm thấy user"]})
     }
    })
    })
}
     });

io.on("connection",function(socket){
    socket.on("ngat",function(){
        console.log("Ngắt kết nối")
    })
socket.on("connect",function(){
    console.log(" Có kết nối bị ngắt")
})
// log out
app.get('/logout/:id', function (req, res) {
    req.logout();
if(checkInput(req.params.id)==0){
for(var i=0;i<List_user_connected.length;i++)
if(List_user_connected[i].indexOf(req.params.id)!=-1)

{
    io.sockets.emit("delete-user",List_user_connected[i]);
    List_user_connected.splice(i,1);

}
}else{
    res.json({code: "5",message:  "Failed", data: "Input không đúng"})
}
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

//khi login thi chay middleware va goi den cai nay
passport.use(new LocalStrategy(
    function (username, password, done) {
        if(checkPhoneNumber(username)!=0 || checkPassword(password) !=0){
              return done(null, false, {code: "1000", message: "Số diện thoại hoặc mật khẩu không đúng" });
        }else{
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {  
                return done(null, false, {code: "1000", message: 'Unknown User' });
            }
           if(user){
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                
                    List_user_connected.push(user.username);
                    tenuser=user.username;
                    socket.phonechat=user.PhoneNumber;
                    io.sockets.emit("add-user",user.username);
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        };
        });
    }
    }));


socket.on("gui-comment",function(data){
    var  info = data.split("ooo");
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      var myquery = { _id : info[1] };

      var newvalues = { $set: {comment: info[2]+info[4]+":"+info[3]+"\n"} };

      dbo.collection("TempSP").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
      });
      dbo.collection(info[0]).updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
      });
      dbo.collection("TempSP").findOne(myquery, function(err, res) {
        if (err) throw err;
        io.sockets.emit("gui-comment",res.comment);
      });
      db.close();
    });
    
})
socket.on("like",function(data){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    var data = data.split("ooo");
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        var myquery = { _id : data[0] };
        var newvalues = { $set: {like: Likedata+data[2]+","} };
        dbo.collection("TempSP").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
        });
        dbo.collection(data[1]).updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
        });
        dbo.collection("TempSP").findOne(myquery, function(err, res) {
          if (err) throw err;
          Likedata = res.like;
          var numLike = res.like.split(",");
        io.sockets.emit("add-like",{numLike: numLike.length-1,likelist: numLike});
        });
        db.close();
      });

})


socket.on("unlike",function(data){
    var data = data.split("ooo");
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        var myquery = { _id : data[0] };
        var unlike = Likedata.split(",");
        for(var i=0;i<unlike.length;i++){
        if(unlike[i]==data[2])
        unlike.splice(i,1);
        }
        var l="";
        if(unlike.length==1){
            l="";
        }else{
        for(var i = 0;i<unlike.length-1;i++){
          l+=unlike[i]+",";
            }
        }
        var newvalues = { $set: {like: l} };
        dbo.collection("TempSP").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
        });
        dbo.collection(data[1]).updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
        });
        dbo.collection("TempSP").findOne(myquery, function(err, res) {
          if (err) throw err;
          Likedata = res.like;
          var numLike = res.like.split(",");
          io.sockets.emit("add-unlike",{numLike: numLike.length-1,likelist: numLike});
        });
        db.close();
      });

})


var listuser;
var MongoClient1 = require('mongodb').MongoClient;
var url1 = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
MongoClient1.connect(url1, function(err, db) {
if (err) throw err;
var dbo = db.db("databaseofmoki")
dbo.collection("users").find().toArray(function(err,res){
if(err) throw err
listuser=res;
db.close();
})
})


socket.on("follow",function(data){
var data=data.split("\n");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
for(var i=0; i<listuser.length;i++){
    if(listuser[i].username==data[0]){
    listmyfollow = listuser[i].follow;
    break;
    }
    }
listmyfollow.push(data[1])
for(var i=0; i<listuser.length;i++){
if(listuser[i].username==data[1]){
be_listmyfollow = listuser[i].be_follow;
break;
}
}
be_listmyfollow.push(data[0]);
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("databaseofmoki");
dbo.collection("users").updateOne({username: data[0]},{$set: {follow: listmyfollow}},function(err,res){
    if(err) throw err  
})
dbo.collection("users").updateOne({username: data[1]},{$set: {be_follow: be_listmyfollow}},function(err,res){
    if(err) throw err  
})
dbo.collection("users").findOne({username:data[0]},function(err,res){
if(err) throw err
listmyfollow = res.follow;
// io.sockets.emit("follow",be_listmyfollow.length)
})
dbo.collection("users").findOne({username:data[1]},function(err,res){
    if(err) throw err;
    
    be_listmyfollow = res.be_follow;
    })
    var MongoClient2 = require('mongodb').MongoClient;
var url2 = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
MongoClient2.connect(url2, function(err, db) {
if (err) throw err;
var dbo = db.db("databaseofmoki")
dbo.collection("users").find().toArray(function(err,res){
if(err) throw err
listuser=res;
db.close();
})
})
db.close();
})
})


socket.on("unfollow",function(data){
    var data=data.split("\n");
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    for(var i=0; i<listuser.length;i++){
        if(listuser[i].username==data[0]){
        listmyfollow = listuser[i].follow;
        break;
        }
        }
    for(var i=0;i<listmyfollow.length;i++){
        if(listmyfollow[i]==data[1])
          listmyfollow.splice(i,1);
        }
      for(var i=0; i<listuser.length;i++){
        if(listuser[i].username==data[0]){
        be_listmyfollow = listuser[i].be_follow;
        break;
        }
        }
    for(var i=0;i<be_listmyfollow.length;i++){
    if(be_listmyfollow[i]==data[0])
        be_listmyfollow.splice(i,1);
    }
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
    var dbo = db.db("databaseofmoki");

    dbo.collection("users").updateOne({username: data[0]},{$set:{follow: listmyfollow}},function(err,res){
        if(err) throw err  
    })
    dbo.collection("users").updateOne({username: data[1]},{$set: {be_follow: be_listmyfollow}},function(err,res){
        if(err) throw err  
    })
    dbo.collection("users").findOne({username:data[0]},function(err,res){
    if(err) throw err
    listmyfollow = res.follow;
    // io.sockets.emit("unfollow",be_listmyfollow.length)
    })
    dbo.collection("users").findOne({username: data[1]},function(err,res){
        if(err) throw err  
        be_listmyfollow=res.be_follow
    })

    var MongoClient2 = require('mongodb').MongoClient;
var url2 = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
MongoClient2.connect(url2, function(err, db) {
if (err) throw err;
var dbo = db.db("databaseofmoki")
dbo.collection("users").find().toArray(function(err,res){
if(err) throw err
listuser=res;
db.close();
})
})
    db.close();
    })
    })
    app.post("/chat",function(req,res){
    phone_chat=req.body.phone;
    res.json({code: "1000", message: "OK", data: ""})
    })
    socket.phonechat=phone_chat;
    socket.on("Client-send-messages",function(data){
        socket.emit("server-send",data)
        socket.to("socket.phonechat").emit("server-send",data);
    })
    socket.on("Admin-send-messages",function(data){
        socket.emit("Server-send-admin-message",data)
    })
});


server.listen(8084,function(){
    console.log('server started at port 8084');
});


// Mongo URI
var  test=0;
// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        test = filename;
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });
var imageFile;
// @route GET /
// @desc Loads form
app.get('/add_product', (req, res) => {
  gfs.files.find({filename: test}).toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('themsanpham', { files: false ,err: [{msg: loi}]});
    } else {
        imageFile = files;
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('themsanpham', { files: files,err:[{msg: loi}] });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/add_product');
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});
var Likedata;

app.get("/sp/sp/:_id",function(req,res){
    var title = req.params._id;
    title = title.split("*")
   var mongoClient = require('mongodb').MongoClient;
   var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    var _id = req.params._id;
    var query = {_id: title[0]};
    var withshop=[];
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        var checkfollow = false;
        dbo.collection("TempSP").findOne(query,function(err, result) {
            if(err) throw err;  
            dbo.collection("TempSP").find({shop: result.shop}).toArray(function(erro,resu){
               withshop=resu;
            }) 
            var bo = db.db("databaseofmoki");
bo.collection("users").findOne({username: result.shop},function(er,re){
if(er) throw er;
var list_be_follow=re.be_follow;
for(var i=0;i<list_be_follow.length;i++){
    if(list_be_follow[i]==title[1]){
        checkfollow=true;
        break;
    }
}
            Likedata = result.like;
            if(result.like==""){
                res.render('template',{
                    data: result,
                    SP:dsproduct.reverse(),
                    like: 0,
                    checklike : false,
                    likelist: [],
                    checkfollow: checkfollow,
                    withshop: withshop
                })
            }else{
                var checklike = false;
                var numLike = result.like.split(",")   
                    if(numLike.indexOf(title[1])!=-1)
                    checklike = true;      
                
            res.render('template',{
                data: result,
                SP:dsproduct.reverse(),
                like: numLike.length-1,
                checklike: checklike,
                likelist: numLike,
                checkfollow: checkfollow,
                withshop: withshop
            })
            db.close();
        }   
    
        
})
db.close();

        });
});
});

app.post("/get_product",function(req,res){
    var id=req.body.id;
   var mongoClient = require('mongodb').MongoClient;
   var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    var query = {_id: id};
    mongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("databaseofmoki");
        dbo.collection("TempSP").findOne(query,function(err, result) {
            if(err) throw err;  
if(!result){
    res.json({code:"1005", message:"Unknown error", data:""})
}else{

            dbo.collection("TempSP").find({shop: result.shop}).toArray(function(erro,resu){
               withshop=resu;
            }) 
            Likedata = result.like;
            if(result.like==""){
                res.json({code: "1000", message:"OK", data:{ data: result,
                    like: 0,
                    checklike : false,
                    likelist: []
                }})
            }else{
                var checklike = false;
                var numLike = result.like.split(",")   
                    if(numLike.indexOf(tenuser)!=-1)
                    checklike = true;      
                    res.json({code: "1000", message:"OK", data:{ data: result,
                        like: numLike.length-1,
                        checklike: checklike,
                        likelist: numLike
                    }})
            db.close();
        }   
    
    }

db.close();

        });
});
});
app.get('/deleteandupdate/:id',function(req,res){
    var _id = req.params.id;
    var query = {_id: _id};
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    test = 1;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("TempSP").findOne(query,function(err, result) {
        if (err) throw err;
        test = result.image;
        res.render('deleteandupdate',{err: [{msg: ""}],files: 0,data: result});
        test = 0;
        db.close();
      });
    });
})

//Xóa và chỉnh sửa sản phẩm
app.delete("/del_product",function(req,res){
    gfs.remove({ filename: req.body.delete, root: 'uploads' }, (err, gridStore) => {
        if (err) {
          return res.status(404).json({ err: err });
        }
      });
     
       var title = req.body.nameuser;
       var query = {image: req.body.delete}
       var MongoClient = require('mongodb').MongoClient;
       var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
       
       MongoClient.connect(url, function(err, db) {
         if (err) throw err;
         var dbo = db.db("databaseofmoki");
         dbo.collection("TempSP").deleteOne(query, function(err, obj) {
           if (err) throw err;
         });
          dbo.collection("TempSP").find({shop: title}).toArray(function(err, result) {
            if (err) throw err;
            res.render('user',{kq:user1,sp:result,errors: false,    follow: f1,
                followed:f2});
            db.close();
          });
       });
})


app.post("/edit_products",function(req,res){
    var name = req.body.nameproduct;
    var describle = req.body.describleproduct;
    var bargain1 = req.body.bargainproduct1;
    var bargain2 = req.body.bargainproduct2;
    var bargain3 = req.body.bargainproduct3;
    // var title = req.body.nameuser;
    var bargain;
    if(bargain1=='on')
    bargain = "Miễn phí";
    if(bargain2=='on')
    bargain = "Cho phép mặc cả";
    if(bargain3=='on')
    bargain = "Bán nhanh";
    var attached = req.body.attached;
    var state = req.body.state;
    var label = req.body.label;
    var weight = req.body.weight;
    var placesell = req.body.sell;
    var price = req.body.price;
var checkname = checkInput(name);
var checkdescrible = checkInput(describle);
var checbargain= checkInput(bargain);
var checkattached = checkInput(attached);
var checkstate = checkInput(state);
var checklabel = checkInput(label);
var checkweight = checkInput(weight);
var checkplace = checkInput(placesell);
var checkprice = checkInput(price);
    if(checkname!=0 || checkdescrible !=0 || checbargain !=0 || checkattached !=0 || checklabel !=0 || checkstate!=0 || checkweight !=0 || checkplace !=0 || checkprice !=0)
    //   errors = [{msg: "Bạn nhập thiếu dữ liệu"}];
   { 
       res.json({code: "5", message: "failed", data: "Dữ liệu không đúng"})
}
  else{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    var where = {_id: req.body.filename }
var query = {$set: {name: name,price: price,label: label, weight: weight, state: state,bargain:bargain,describle:describle,placeSell:placesell}};
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("databaseofmoki");
  dbo.collection("TempSP").updateOne(where,query, function(err, res) {
    if (err) throw err;
  });

   res.json({code: "1000", message: "OK", data: "Chỉnh sửa thành công"}) 
  db.close();
});

}
})



// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }
test=0;
    res.redirect('/themsanpham');
  });
});


app.delete('/deleteimage/:id', (req, res) => {
    gfs.remove({ filename: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
      test=0;
      res.redirect('/deleteandupdate');
    });
  });
  
// get_user_info
app.post("/get_user_info",function(req,res){
var id = req.body.id;
if(List_user_connected.indexOf(id)!=-1){
Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
if(err) throw err;
var dbo = db.db("databaseofmoki");
dbo.collection("users").findOne({username: id},function(er, user){
    if(user)
     res.json({code: "1000", message: "OK", data: user});
     else
     res.json({code: "1005", message: "Unknown error", data: "Không tìm thấy user"})

})
})
}else{
    Mongo.connect("mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1",function(err,db){
        if(err) throw err;
        var dbo = db.db("databaseofmoki");
        dbo.collection("users").findOne({username: id},function(er, user){
            if(user)
             res.json({code: "1000", message: "OK", data: [user._id,user.username,user.avatar]});
             else
             res.json({code: "1005", message: "Unknown error", data: "Không tìm thấy user"})
        })
        })

}
})

// Thêm sản phẩm
app.post("/add_product",upload.single('file'),function(req,res){
    if(!test){
        res.render('themsanpham',{files: imageFile,err: [{msg:"Error Unknown"}]});
    }else{
    var name = req.body.nameproduct;
    var describle = req.body.describleproduct;
    var bargain1 = req.body.bargainproduct1;
    var bargain2 = req.body.bargainproduct2;
    var bargain3 = req.body.bargainproduct3;
    var title = req.body.nameuser;
    var bargain;
    if(bargain1=='on')
    bargain = "Miễn phí";
    if(bargain2=='on')
    bargain = "Cho phép mặc cả";
    if(bargain3=='on')
    bargain = "Bán nhanh";
    
    var attached = req.body.name;
    var state = req.body.state;
    var label = req.body.label;
    var weight = req.body.weight;
   
    var placesell = req.body.sell;
    var price = req.body.price;
    var filename = test;
var checkname = checkInput(name);
var checkdescrible = checkInput(describle); 
var checbargain = checkInput(bargain1); 
var checkattached = checkInput(attached); 
var checkstate = checkInput(state);
var checklabel = checkInput(label); 
var checkweight = checkInput(weight); 
var errors=0;
if(checkname!=0 || checkdescrible !=0 || checbargain !=0 || checkattached !=0 || checklabel !=0 || checkstate!=0 || checkweight !=0)
      errors = [{code: "5" , message: "Failed", msg: "Dữ liệu không đúng!! Xin vui lòng nhập lại"}];
   if(errors){
    res.render('themsanpham',{files: imageFile,err: errors});
   }else{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
   var query = {_id: filename.toString().substring(0,filename.length-4),image: filename,name: name,price: price+" VNĐ",shop: title,label: label, weight: weight, state: state,placeSell:placesell,attached:attached,bargain:bargain,describle:describle,comment:"",like:"",  report: []};
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("databaseofmoki");
  dbo.collection("TempSP").insertOne(query, function(err, res) {
    if (err) throw err;
  });
  db.close();
  test=0;
  imageFile = 0;
  res.render('themsanpham',{files: imageFile, err: [{msg: "Ok"}]})
 //io.sockets.emit("add-product");
});
   }
    }
})

// Danh sách sản phẩm của người theo dõi

app.get("/list_product/:id", function(req, res){
    var title = req.params.id;
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("databaseofmoki");
      dbo.collection("TempSP").find({shop: title }).toArray(function(err, result) {
        if (err) throw err;
       res.render("listproductfollow",{kq: result,SP: dsproduct.reverse()});
        db.close();
      });
    });



})

app.get("/",function(req,res){
    var user = {username: ""}
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1";
var u="mongodb://KhanhPhanN:khanh2748@ds123664.mlab.com:23664/databaseofmoki?authSource=databaseofmoki&w=1"
var res2,res3,res4,res5;
var MongoClient1 = require('mongodb').MongoClient;
MongoClient1.connect(u, function(err, db) {
var db1 = db.db("databaseofmoki");

db1.collection("TempSP").find({attached: "Bé ngủ"}).toArray(function(err,r){
    res3=r;
    
})
db1.collection("TempSP").find({attached: "Bé tắm"}).toArray(function(err,r){
    res4=r;
})
db1.collection("TempSP").find({attached: "Bé ăn"}).toArray(function(err,r){
    res2=r;
})  
db1.collection("TempSP").find().toArray(function(err,r){
    res5=r;
})
db.close();
MongoClient.connect(u, function(err, db) {
    if (err) throw err;
    var dbo = db.db("databaseofmoki");
    dbo.collection("TempSP").find({attached: "Bé vệ sinh"}).toArray(function(err, result) {
      if (err) throw err;
      dbo.collection("TempSP").find({attached: "Bé mặc"}).toArray(function(err, res1){
        if (err) throw err;
        var datastateuser=[];
        for(var i=0;i<list_user.length;i++){
            if(List_user_connected.indexOf(list_user[i])!=-1){
                datastateuser.push({user: list_user[i], state: "on"})
            }else{
                datastateuser.push({user: list_user[i], state: "off"})
            }
        }

                    db.close();
                    res.render('homepage',{
                        bevesinh: result.reverse(),
                        bemac: res1.reverse(),
                        bean:res2.reverse(),
                        bengu:res3.reverse(),
                        betam:res4.reverse(),
                        SP: res5.reverse(),
                        UserOnline: datastateuser
                    })                  
      })
    });
  });
})
});