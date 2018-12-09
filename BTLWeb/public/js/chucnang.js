var socket = io("http://localhost:8084");
 socket.on("gui-comment",function(data){
     $("#showcomment").val(data);
       $("#Comment").val("");
 })
 socket.on("add-product",function(){
     alert("Có sản phẩm mới được tải lên !! Vui lòng load lại trang để xem sản phẩm mới nhất");
 })
 socket.on("add-user",function(data){
    $("#"+data).html("on")
    $("#"+data).css("color","blue")
})
socket.on("delete-user",function(data){
    $("#"+data).html("off")
    $("#"+data).css("color","black")
})

 
socket.on("add-like",function(data){
    $("#listlike").html("");
$("#numlike").html(data.numLike);
for(var i=0;i<data.likelist.length-1;i++)
$("#listlike").append("<li>"+data.likelist[i]+"</li>")
})
socket.on("add-unlike",function(data){

    $("#listlike").html("");
$("#numlike").html(data.numLike);
for(var i=0;i<data.likelist.length-1;i++)
$("#listlike").append("<li>"+data.likelist[i]+"</li>")
    })
    socket.on("follow",function(data){
        $(".numfollowed").html(data);
    })
    socket.on("unfollow",function(data){
        $(".numfollowed").html(data);
    })
$(document).ready(function(){
    $(".pop-up-footer").hide();
    $(".ChatLog").hide();
    $("#moki_small").hide();
    $("#thongtin").hide();
    $("#theo_doi").hide();
    $("#duoctheodoi").hide();
    $(".user-out").hide();
    $("#mota-title").css("color","#f16e8e")
    $("#binhluan-title").css("color","black")
    $('#AlphaNav > ul > li > i').click(function () {
        $(this).closest('li').siblings().find('ul:visible').slideUp(); // ADDED
        $(this).closest('li').siblings().find('ul:visible').parent().find('i').toggleClass('fa-angle-double-up fa-angle-double-down'); // ADDED 2
        $(this).closest('li').find('ul').slideToggle();
        $(this).find('i').toggleClass('fa-angle-double-up fa-angle-double-down');
        
    });
    $("#modifier-user-1").hide();
    $("#modifier-user-2").hide();
    $("#modifier-user").click(function(){
        $(".user-out").show();
        $(".user-in").hide();
        $("#modifier-user-1").show();
        $("#modifier-user-2").show();
        $("#modifier-user").hide();
        $("#change-password").hide();
    })
    $("#modifier-user-2").click(function(){
        $(".user-out").hide();
        $(".user-in").show();
        $("#modifier-user-1").hide();
        $("#modifier-user-2").hide();
        $("#modifier-user").show();
        $("#change-password").show();
    })
    $(".delete-follow").click(function(){
        alert("ok")
    })
    $(".tab1").click(function(){
        $("#showsp").hide();
        $("#thongtin").show();
        $("#theo_doi").hide();
        $("#duoctheodoi").hide();
        $(".tab2").css("color","black");
        $(".tab1").css("color","aqua");
        $(".tab3").css("color","black");
        $(".tab4").css("color","black");
    })
    $(".tab2").click(function(){
        $("#thongtin").hide();
        $("#showsp").show();
        $("#theo_doi").hide();
        $("#duoctheodoi").hide();
        $(".tab2").css("color","aqua");
        $(".tab1").css("color","black");
        $(".tab3").css("color","black");
        $(".tab4").css("color","black");
    })
    $(".tab3").click(function(){
        $("#thongtin").hide();
        $("#showsp").hide();
        $("#theo_doi").show();
        $("#duoctheodoi").hide();
        $(".tab2").css("color","black");
        $(".tab1").css("color","black");
        $(".tab3").css("color","aqua");
        $(".tab4").css("color","black");
    })
    $(".tab4").click(function(){
        $("#thongtin").hide();
        $("#showsp").hide();
        $("#theo_doi").hide();
        $("#duoctheodoi").show();
        $(".tab2").css("color","black");
        $(".tab1").css("color","black");
        $(".tab3").css("color","black");
        $(".tab4").css("color","aqua");
    })
var stt=0;
var starImg= 0;
var endImg= $(".slide:last").attr("stt");
$(".slide").each(function(){
    if($(this).is(':visible'))
    stt=$(this).attr("stt")
})
$("#Next").click(function(){
    if(stt==endImg){
        stt=1;
    }
    next=++stt;
    $(".slide").hide();
    $(".slide").eq(next).show();
    $(".slide").eq(next-1).show();
    $(".slide").eq(next-2).show();
})
$("#Previous").click(function(){
    if(stt-2==starImg){
        stt=endImg;
        prev=stt++;
    }
    prev=--stt;
    $(".slide").hide();
    $(".slide").eq(prev-2).show();
    $(".slide").eq(prev-3).show();
    $(".slide").eq(prev-4).show();
})

var stt1=0;
var starImg1= 0;
var endImg1= $(".slide-shop:last").attr("stt-shop");
$(".slide-shop").each(function(){
    if($(this).is(':visible'))
    stt1=$(this).attr("stt-shop")
})
$("#Next-shop").click(function(){
    if(stt1==endImg1){
        stt1=2;
    }
    next1=++stt1;
    $(".slide-shop").hide();
    $(".slide-shop").eq(next1).show();
    $(".slide-shop").eq(next1-1).show();
    $(".slide-shop").eq(next1-2).show();
    $(".slide-shop").eq(next1-3).show();
})
$("#Previous-shop").click(function(){
    if(stt1-3==starImg1){
        stt1=endImg1;
        prev1=stt++;
    }
    prev1=--stt1;
    $(".slide-shop").hide();
    $(".slide-shop").eq(prev1).show();
    $(".slide-shop").eq(prev1-1).show();
    $(".slide-shop").eq(prev1-2).show();
    $(".slide-shop").eq(prev1-3).show();
})
setInterval(function(){$("#Next").click()},2000)
    $("#btn-report").click(function(){
        $(".text-report").slideToggle();
    });
    $("#send-report").click(function(){
        //socket.emit("report",{ subject: $("#subject").val(),Describle:  $("#textarea").val()});
        $.post("/report_products",{product_id: $("#code").html(), subject: $("#subject").val(), details: $("#textarea").val()}, function(data, status){
            if(data.code=="5"){
                alert(data.data);
            }else{
            
            $(".text-report").slideUp();
            $("#thanks-report").fadeTo(2500,1).fadeOut(2500);
            $("#textarea").val("");
            }
        })
       })
        if ($('.wrapper-nav').length > 0) {
            var _top = $('.wrapper-nav').offset().top - parseFloat($('.wrapper-nav').css('marginTop').replace(/auto/, 0));
            $(window).scroll(function(evt) {
                var _y = $(this).scrollTop();
                if (_y > _top) {
                    $('.wrapper-nav').addClass('fixed');
                    $('.main-1').css("margin-top", "30px")
                    $("#moki_small").show();
                } else {
                    $('.wrapper-nav').removeClass('fixed');
                    $('.main-1').css("margin-top", "0")
                    $("#moki_small").hide();
                }
            })
           
        }
    
        if ($('.wrapper-nav1').length > 0) {
            var _top1 = $('.wrapper-nav1').offset().top - parseFloat($('.wrapper-nav1').css('marginTop').replace(/auto/, 0));
            $(window).scroll(function(evt) {
                var _y1= $(this).scrollTop();
                var c=$("#footer_container").offset().top-500; 
                if (_y1 > _top1) {
                    $('.wrapper-nav1').addClass('fixed1');
                    if($(".fixed1").offset().top>c){
                     
                                $('.wrapper-nav1').removeClass('fixed1');
                        
                    }
                    // if($(".fixed1").offset().top<c && $(".fixed1").offset().top<$('.wrapper-nav1').offset().top){
                    //     $(window).scroll(function(evt) {
                    //         $('.wrapper-nav1').addClass('fixed1');
                    // })
                    // }
                } else {
                    $('.wrapper-nav1').removeClass('fixed1');
                }
               
        })
    }



   $("#listlike").hide()
   $("#numlike").hover(function(){

    $("#listlike").show()
   },function(){

    $("#listlike").hide()
   })
    socket.emit("list-sp");
    $("#like").click(function(){
        if( $("#like").attr("src")=="/imagei/like.png")
       {
           socket.emit("like",$("#code").html()+"ooo"+$("#attached").html()+"ooo"+$("#tenuser").val());
           $("#like").attr("src","/imagei/like1.png")
        }
        else{
            socket.emit("unlike",$("#code").html()+"ooo"+$("#attached").html()+"ooo"+$("#tenuser").val());
        $("#like").attr("src","/imagei/like.png")
        }
    })
    $("img#follow").click(function(){
        if( $("#follow").attr("src")=="/imagei/unfollow.png")
       {
           $("img#follow").attr("src","/imagei/follow.png")
           $("#theodoi").html("Đã theo dõi");
           $("#theodoi").attr("style","color: blue")
           socket.emit("follow",$("#tenuser").html()+"\n"+$("#name-user").html());
        }
        else
       { 
         socket.emit("unfollow",$("#tenuser").html()+"\n"+$("#name-user").html());
           $("img#follow").attr("src","/imagei/unfollow.png");
           $("#theodoi").html("Theo dõi");
           $("#theodoi").attr("style","color: rgb(177, 174, 171)")
    }
    })
    $("#mota").show();
    $("#binhluan").hide();
    $("#ht").hide()
    $("#mota").click(function(){
        mota();
    })
    $("#binhluan").click(function(){
        binhluan();
    })
    socket.emit("gui-thong-tin");
    $("#send").click(function(){
        socket.emit("gui-comment",$("#attached").html()+"ooo"+$("#code").html()+"ooo"+$("#showcomment").val()+"ooo"+$("#Comment").val()+"ooo"+$("#tenuser").val());
    })
$("#container_inner_content").show();
$("#container-register").hide();
$("#container-sms-verify").hide();
$("#container-updatelogin").hide();
$("#container_inner_nav").show()
$("#dangki").click(function(){
    $("#container_inner_content").hide();
    $("#container-register").show();
    $("#container-sms-verify").hide();
    $("#container-updatelogin").hide();
    $("#container_inner_nav").hide()
})
// POST đăng kí

$("#btdk").click(function(){
    var check1 = checkPhoneNumber($("#input").val());
    var check2 = checkPassword($("#password").val());
    if((check1 != 0) || (check2 != 0)) alert("Dữ liệu đầu vào chưa hợp lệ!");
    else{
        $.post("/signup",{PhoneNumber: $("#input").val(), password: $("#password").val()},function(data,status){
            if(data.code=="5"){
                alert(data.data);
             
            }
            else{
                window.location.href = "/sms_verify";
            }
            })
    }

})


// POST mã xác nhận
var sdt;
$("#code_verify").click(function(){
    $.post("/sms_verify",{code: $("#UserCodeVerify").val()},function(data, status){
if(data.code=="5"){
    alert(data.data);
}else{
    sdt=data.data.phone;
    window.location.href = "/updatelogin";
}
    })
})
// update login 
$("#btcn").click(function(){
    var check1 = checkEmail($("#email").val());
    var check2 = checkInput($("#username").val());
    var check3 = checkInput($("#firstname").val());
    var check4 = checkInput($("#lastname").val());
    var check5 = checkInput($("#address").val());
    var chech6 = checkInput($("#city").val());
    if((check1) || (check2) || (check3) || (check4) || (check5) || (check6)) 
    alert("Dữ liệu đầu vào chưa hợp lệ!");
    // else{
    //     $.post("/update_register",{})
    // }
})

// login
$("#btdn").click(function(){
    var check1 = checkPhoneNumber($("#input").val());
    var check2 = checkPassword($("#password").val());
    if(check1 || check2)
    alert("Dữ liệu đầu vào chưa hợp lệ!");
})

//Quên mật khẩu
$("#btfg").click(function(){
    $.post("/create_code_reset_password",{phonenumber: $("#input").val()},function(data,status){
    if(data.code=="1005"){,
   alert(data.data);
    }
    else{
        window.location.href = "/resetPassword";
    }
    })
    })

    // Đặt lại mật khẩu
    $("#btre").click(function(){
        $.post("/reset_Password",{codeReset: $("#input").val(),resetPassword: $("#password").val(),resetPassword2: $("#password2").val()},function(data,status){
        if(data.code=="5"){
            $("#err-fg").html("");
            for(var i=0;i<data.data.length;i++)
          { var err="<p>"+data.data[i].msg+"</p><br>"
           $("#err-fg").append(err);
        }
        }
        else{
            window.location.href = "/login";
        }
        })
        })
    
// Thay đổi mật khẩu


$("#btcp").click(function(){
    var check1 = checkPassword($("#password").val());
    var check2 = checkPassword($("#password2").val());
    if(check1 || check2)  alert("Dữ liệu đầu vào chưa hợp lệ!");
    else{
        $.post("/changePassword",{id: $("#p-change").val(),oldPassword: $("#input").val(),newPassword: $("#password").val(),newPassword2: $("#password2").val()},function(data,status){
            if(data.code=="5"){
                $("#err-fg").html("");
                for(var i=0;i<data.data.length;i++)
              { var err="<p>"+data.data[i]+"</p><br>"
               $("#err-fg").append(err);
            }
            }
            else{
                window.location.href = "/";
            }
            })
    }
    })
// update user information
$("#modifier-user-1").click(function(){
    var check1 = checkEmail($("#email").val());
    var check2 = checkInput($("#username").val());
    var check3 = checkInput($("#firstname").val());
    var check4 = checkInput($("#lastname").val());
    var check5 = checkInput($("#address").val());
    var chech6 = checkInput($("#city").val());
    if((check1) || (check2) || (check3) || (check4) || (check5) || (check6)) 
    alert("Dữ liệu đầu vào chưa hợp lệ!");
})

// them san pham
$("#add").click(function(){
    var check1 = checkInput($("#textinput").val());
    var check2 = checkInput($("#textarea").val());
    if(check1 || check2) alert("Dữ liệu đầu vào chưa hợp lệ!");
})


// Chỉnh sửa product
var x = {nameproduct: $("#textinput").val(), describleproduct: $("#textarea").val(), bargainproduct1: $("#bargainproduct1").val(), bargainproduct2: $("#bargainproduct2").val(), bargainproduct3: $("#bargainproduct3"), attached: $("#product-category-name").val(), state: $("#product-category-state").val(), label: $("#product-category-label").val(), weight: $("#product-category-weight").val(), sell: $("#product-place-sell").val(), price: $("#product-price-input").val(), filename: $("#filename").val()}
console.log(x)

  $("#edit_product").click(function(){
    var check1 = checkInput($("#textinput").val());
var check2 = checkInput($("#textarea").val());
if(check1 || check2) alert("Dữ liệu đầu vào chưa hợp lệ!");
else{
    $.post("/edit_products",{nameproduct: $("#textinput").val(), describleproduct: $("#textarea").val(), bargainproduct1: $("#bargainproduct1").val(), bargainproduct2: $("#bargainproduct2").val(), bargainproduct3: $("#bargainproduct3").val(), attached: $("#product-category-name").val(), state: $("#product-category-state").val(), label: $("#product-category-label").val(), weight: $("#product-category-weight").val(), sell: $("#product-place-sell").val(), price: $("#product-price-input").val(), filename: $("#filename").val()},function(data, status){
        alert(data.data);
          })
}
  })








})
function binhluan(){
$("#mota").hide();
$("#binhluan").show();
$("#ht").show();
$("#binhluan-title").css("color","#f16e8e")
$("#mota-title").css("color","black")
}
function  mota(){
    $("#mota").show();
    $("#binhluan").hide();
    $("#ht").hide();
    $("#mota-title").css("color","#f16e8e")
    $("#binhluan-title").css("color","black")
}


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


function checkEmail(email){
  
    if(email.length == 0){
      return 1;
    }else{
      var count = 0;
      for(var i=0; i<email.length; i++){
      if(email.substring(i,i+1).indexOf('@') != -1) count++;
    }
  
    if(count == 0){
     return 1;  
    }
    if(count > 1){
     return 1;   
    }
    if(count == 1){
      return 0;    
    }
    } 
  }

//Check phone
var number="0123456789";
  function checkPhoneNumber(phone){
    if(phone.length != 10 &&  phone.length != 11){
      return 1;
    }else{
      for(var i=0; i<phone.length; i++){
        var temp = phone.substring(i,i+1);
        if(number.indexOf(temp) == -1){
          return 1;
        }
      }
    }
    return 0;
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
