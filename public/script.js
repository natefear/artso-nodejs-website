document.addEventListener("DOMContentLoaded", function(){

    var logout = document.querySelector("#logout");
    if(logout != null){
       logout.addEventListener("click", function (e) {
          window.location.href = "/?logout";
          document.cookie="mycookie=null;";
       });
    }

    var login = document.querySelector("#login");
    if(login != null){
       login.addEventListener("click", function (e) {
          document.querySelector("#loginform").style.display = "block";	
	      document.querySelector("#signupform").style.display = "none";	
       });
    }
   
    var uploadform = document.querySelector("#upload");
    if(uploadform != null){
       uploadform.addEventListener("click", function (e) {
          document.querySelector("#uploadform").style.display = "block";	
       });
    }

    var signup = document.querySelector("#signup");
    if(signup != null){
        signup.addEventListener("click", function (e) {
            document.querySelector("#signupform").style.display = "block";
	        document.querySelector("#loginform").style.display = "none";		
        });
    }
 
    var check = document.querySelector("#signupbut");
    if(check != null){
        check.addEventListener("click", function (e) {
            var p1 = document.querySelector("#password1").value;
            var p2 = document.querySelector("#password2").value;
            var signform = document.querySelector("#signform");
            if(signform.checkValidity() == true && p1 != p2){
                e.preventDefault();
                alert('Passwords do not match, please try again!');
            }		
        });
    }

    var menuicon = document.querySelector(".icon");  
    if(menuicon != null){
        menuicon.addEventListener("click", function (e) {
            var tNav = document.getElementById("tNav");
            if (tNav.className === "topPanel") {
                tNav.className += " responsive";
            } else {
                tNav.className = "topPanel";
            }
        });
    }

    var close = document.getElementsByClassName("close");
    var closeFunction = function() {
	    id = this.parentElement.id;
	    document.querySelector("#"+id).style.display = 'none';
    };
    for (var i = 0; i < close.length; i++) {
	    close[i].addEventListener('click', closeFunction, false);
    }
    
    var images = document.getElementsByTagName('img'); 
    var srcArr = [];
    for(var i = 0; i < images.length; i++) {
       if(i > 1){
          var res = "upload/" + images[i].src.split("/")[4];
          srcArr.push(res);
       }
    }
    
    var description = document.getElementsByClassName('desc'); 
    var descArr = [];
    for(var i = 0; i < description.length; i++) {
       descArr.push(description[i].innerHTML);
    }

    var gallery = document.getElementsByClassName("images");
    var galleryFunction = function() {

            if(window.innerWidth > 500){
	            var imgsrc = this.getElementsByTagName("img")[0].getAttribute("src");
	            document.querySelector("#photoLarge").src = imgsrc;
	            document.querySelector("#photoviewer").style.display = "block";
                var desc = this.getElementsByClassName("desc")[0].innerHTML;
                document.querySelector("#description").innerHTML = desc;
                document.querySelector("#description").style.display = "block";
            }else{
                alert("page not wide enough for gallery!");
            }
    };
    for (var i = 0; i < gallery.length; i++) {
	    gallery[i].addEventListener('click', galleryFunction, false);
    }
    var index;
    var next = document.querySelector("#next");
    if(next != null){
        next.addEventListener("click", function (e) {       
           imgsrc = "upload/" + document.querySelector("#photoLarge").src.split("/")[4];
           for(var i = 0; i < srcArr.length; i++){
              if(imgsrc == srcArr[i]){
                 index = i +1
                 break;
              }
           }
           if(index < srcArr.length){
              document.querySelector("#photoLarge").src = srcArr[index];
              document.querySelector("#description").innerHTML = descArr[index];
           }
           else {
              alert('No more photos to display!');
           }
        });
    }

    var prev = document.querySelector("#prev");
    if(prev != null){
        prev.addEventListener("click", function (e) {
           imgsrc = "upload/" + document.querySelector("#photoLarge").src.split("/")[4];
           for(var i = 0; i < srcArr.length; i++){
              if(imgsrc == srcArr[i]){
                 index = i - 1
                 break;
              }
           }
           if(index >= 0){
              document.querySelector("#photoLarge").src = srcArr[index];
              document.querySelector("#description").innerHTML = descArr[index];
           }
           else {
              alert('No more photos to display!');
           }  
        });
    }

    window.addEventListener('resize', function(e) {
        if(document.getElementById("photoviewer").offsetWidth < 340 && document.querySelector("#photoviewer").style.display == "block"){
            document.querySelector("#photoviewer").style.display = "none";
            alert("page not wide enough for gallery!");
        }
    });

    url = window.location.search.substr(1);
    res = url.split("&");
    if(url == "lfail" || res[1] =="lfail" ){
       document.querySelector("#loginform").style.display = "block";
       alert("Username or password incorrect!");
       if(res[1] == "lfail") document.location.href = "/?"+res[0];
       else document.location.href = "/";    
    }

    if(url == "logout") {
       alert("You have been logged out successfully!");
    }

    if(url == "rfaildupe" || res[1] =="rfaildupe"){
       document.querySelector("#signupform").style.display = "block";
       alert("Sorry that email address has already been registered!");
       if(res[1] == "rfaildupe") document.location.href = "/?"+res[0];
       else document.location.href = "/";
    }

    if(url == "rfailnomatch" || res[1] =="rfailnomatch"){
       document.querySelector("#signupform").style.display = "block";
       alert("Sorry the passwords you entered do not match!");
    }

    if(url == "rsuccess" || res[1] =="rsuccess"){
       alert("Registration successful!");
       if(res[1] == "rsuccess") document.location.href = "/?"+res[0];
       else document.location.href = "/";   
    }

    var more = document.querySelector(".more");
    if(more != null){
        more.addEventListener("click",function (e) {
            var url = document.location.href;
            console.log(url);
            //var number = currentUrl.startsWith("_");
            if(url.endsWith("#")) url = url.slice(0,-1);
            var number = url.split("_")[1];
            var nextPage = url.split("_")[0];
            console.log(number);
            if(number == null){
                number = 8;
            }else{
                number = parseInt(number) + 16;
            }
            nextPage = nextPage + "_" + number + "_";
            console.log(number);
            console.log(nextPage);
            document.location.href = nextPage;
        });
    }

    var removeImages = document.getElementsByClassName("remove");
    var removeFunction = function(){
        var id = this.getAttribute("name");
        document.location.href = "/home?update=" + id;
    }
    if(removeImages != null){
        for(var i = 0; i < removeImages.length;i++){
            console.log(i);
            removeImages[i].addEventListener('click',removeFunction,false);
        }    
    }
    var extension = document.querySelector("#uploadbut");
    if(extension != null){
        extension.addEventListener("click", function (e) {
            var fileInp = document.querySelector("#fileInp");
            if(!fileInp.files[0].name.match(/.(jpg|jpeg|png|gif)$/i)){
                e.preventDefault();
                alert('File not an image, please try again!');
            }       
        });
    }
});
