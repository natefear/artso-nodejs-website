// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server: change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use.
var http = require("http");
var fs = require("fs");
var formidable = require("formidable");
var ejs = require("ejs");
var util = require('util');
var randomstring = require("randomstring");
var sql = require("sqlite3");
var db = new sql.Database("data.db");
var utf = require("utf8");
var crypto = require("crypto");
var OK = 200, NotFound = 404, BadType = 415, Error = 500,Redirect = 302;
var types, banned;
start(8080);

// Start the http service.  Accept only requests from localhost, for security.
function start(port) {
    types = defineTypes();
    banned = [];
    banUpperCase("./public/", "");
    var service = http.createServer(handle);
    service.listen(port, "localhost");
    var address = "http://localhost";
    if (port != 80) address = address + ":" + port;
    console.log("Server running at", address);
}

// Serve a request by delivering a file.
function handle(request, response) {
    console.log("new request");
    var url = request.url.toLowerCase();
    var requestTopic = "";
    var login = 1;
    var user = -1;
    console.log(url);
    if(url.startsWith("/?topicsearch=")){
        requestTopic = url.split("=")[1];
        console.log(requestTopic);
        url = "/";
    }
    if(url.startsWith("/?logout")){
        //clear session
        console.log('logout');
        var req = url.split("/?logout");
        console.log(req);
        console.log(req[1].length);
        if(req[1].length != 0 && req[1].startsWith("?topicsearch=")){
            requestTopic = url.split("=")[1];
        }
        //redirect
        url = "/";
    }
    if(url.startsWith("/?rfaildupe") || url.startsWith("/?rsuccess") || url.startsWith("/?rfailnomatch") || url.startsWith("/?lfail") || url.startsWith("/?rnomatch")){
        console.log("get data message url");
        url = "/";
    }
    if(url.startsWith("/home")){
        //console.log("length:");
        //console.log(request.headers.cookie.length);
        if(typeof request.headers.cookie == "undefined" || request.headers.cookie.length < 20 ){
            url = "/";
            console.log("not logged user");
            response.writeHead(Redirect,{Location: "/"});
            response.end();
            login = 0;
        }else{
            var req = url.split("/home");
            console.log("home page");
            console.log(req);
            console.log(req[1].length);
            if(req[1].length != 0 && req[1].startsWith("?topicsearch=")){
                requestTopic = url.split("=")[1];
                console.log(url);
                console.log(requestTopic);
            }else{
                var tmp = request.headers.cookie.split("=")[1];
                user = tmp.charAt(5);
                console.log(request.headers.cookie.split("=")[1]);
                console.log(user);
                
                if(req[1].length != 0 && req[1].startsWith("?update=")){
                    requestTopic = url.split("=")[1];
                    //console.log("remove");
                    console.log(requestTopic);
                    var stmt1 = db.prepare("Delete from images where imID == ? and creatorID == ?");
	                stmt1.run(requestTopic,user);
     		        stmt1.finalize();
                    var stmt2 = db.prepare("Delete from im2top where imID == ?");
	                stmt2.run(requestTopic);
     		        stmt2.finalize();
                    //console.log("deleteted");
                }
                requestTopic = "all";
                }
            url = "/home.html";
        }
    }
    console.log(request.headers.cookie,user);
    //url = url.toLowerCase();
    if (url.endsWith("/")) url = url + "index.html";
    if (isBanned(url)) return fail(response, NotFound, "URL has been banned");
    var type = findType(url);
    console.log(url);
    if (type == null) return fail(response, BadType, "File type unsupported");
    var file = "./public" + url;
    var ending = file.substr(file.length - 3);
    //console.log(request.method.toLowerCase());
    if(login){
        if (request.method.toLowerCase() == 'post') {
            console.log('post');
            //login = 1; 
            if(url.startsWith("/home")){
                var form = new formidable.IncomingForm();
                form.uploadDir = "./";
                //form.keepExtensions;
                form.parse(request,par);
            }else{
                processForm(request, response);
            }
        //console.log("requeste ID :",ID);
        //console.log(requestTopic);
       //fs.readFile(file,{encoding:"utf8"}, ready);
        }else if(type == "application/xhtml+xml"){
            console.log("this is " + type)
            fs.readFile(file,{encoding:"utf8"}, ready);
        }else{
        //console.log(cookies.get( "unsigned" ));
            fs.readFile(file,ready);
        }
    }
    //data = {title:"Bristol theme",images:["1.png","2.png","3.png","4.png"]};
    //var tmp = swig.renderFile(file,data);
    //console.log(tmp)
    //    console.log('post here');
    function ready(err, content) { deliver(response, type, err, content,requestTopic,login,user); }
    function par(err,fields,files){ upload(err,fields,files,request,response,file);}
}

//Upload function for new images that first finds the highest ID of an image in the database to assign its increment to the new image. Application of AUTOINCREMENT would require to querry the database again for the ID.
function upload(err,fields,files,request,response,file){
    if(err) throw err;
    var querry = "select Max(imID) as m from images";
    var tmp = request.headers.cookie.split("=")[1];
    var user = tmp.charAt(5);
    //console.log(querry)
    db.all(querry,read);
    function read(err,rows) { uploadImage(err,response,rows,files,fields,request,file,user); }
}

//Moves the uploaded image into respective folder on the server.
function uploadImage(err,response,rows,files,fields,request,file,user){
    if(err) throw err;
    console.log("DB output");
    console.log(files);
    console.log(rows);
    var index = rows[0].m + 1;
    var type = files.fileID.type.split("/")[1];
    var description = fields.description;
    console.log(type);
    var topic = fields.topics;
    var filePath = files.fileID.path;
    var newFile = "public/upload/"+index + "."+type;
    var path = "/upload/"+index+"."+type;
    console.log(newFile);
    fs.rename(filePath,newFile,move);
    function move(err) { moveFile(err,response,path,description,index,topic,user)};
}

//Once the file is moved; the topic ID has to be querried by the topic name
function moveFile(err,response,path,description,index,topic,user){
    if(err) throw err;
    console.log("Uploaded");
    console.log(topic); 
    var stmt3 = db.prepare("select * from topics where topicName == ?");
    stmt3.all(topic,read);
    stmt3.finalize();
    function read(err,rows) {topicName(err,rows,response,path,description,index,topic,user);}
    //var querry = "insert into images (imID,description,filename,counter,creatorID) values ("+index+",'"+description+"','"+path+"',0,'"+crID+"')";
    //db.all(querry);
    //response.write("File uploaded");
}

//The data corresponding to the image such as filename, image ID, description, topic ID and topic name are fed into respective tables
function topicName(err,rows,response,path,description,index,topicName,user){
    if(err || rows.length > 1) throw err;
    console.log(rows);
    var topicID = rows[0].topicID;

    var stmt4 = db.prepare("insert into images (imID,description,filename,counter,creatorID) values ( ?, ?, ?, ?, ? )");
    stmt4.run(index,description,path,0,user);
    stmt4.finalize();
    
    var stmt5 = db.prepare("insert into im2top (imID,topicID) values (? , ?)");
    stmt5.run(index,topicID);
    stmt5.finalize();

    var stmt6 = db.prepare("insert into im2top (imID,topicID) values (? , ?)");
    stmt6.run(index,0);
    stmt6.finalize();

    response.writeHead(Redirect,{Location: "/home"});
    response.end();
}


// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (url.startsWith(b)) return true;
    }
    return false;
}

// Find the content type to respond with, or undefined.
function findType(url) {
    var dot = url.lastIndexOf(".");
    var extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content,requestTopic,login,user) {
    if (err) return fail(response, NotFound, "File not found");
    var typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    if(type == "application/xhtml+xml"){
        console.log(requestTopic);
        var topic = requestTopic.split("_")[0];
        var limit = requestTopic.split("_")[1];
        var querry;
        console.log("topic " + topic,topic.length);
        console.log("limit " + limit);
        if(limit == null){
            limit = 4;
        }else{
            limit = parseInt(limit);
            if(!Number.isInteger(limit)){
                return fail(response,NotFound,"Wrong search input");
            }
        }
        if(topic.length == 0){
            topic = "all";
            limit = -1;
        }
        if(user == -1){

            var stmt7 = db.prepare("select images.filename,images.description,topics.topicName from images join im2top on images.imID == im2top.imID join topics on topics.topicID == im2top.topicID where topics.topicName == ?");
            stmt7.all(topic,read);
            stmt7.finalize();
            
        }else{
       
            var stmt8 = db.prepare("select images.filename,images.description, images.imID from images where creatorID == ?");
            limit = -2;
            stmt8.all(user,read);
            stmt8.finalize();
  
        }
        //console.log(querry)
        //db.all(querry,read);
    }else{
        response.write(content);
        response.end();
    }
    function read(err,rows) { fill(err,response,rows,content,topic,limit,user); }
}

//Fills in the HTML template of image gallery with images of the required topic
function fill(err,response,rows,content,topic,limit,user){
    if(err) throw err;
    var username = [];
    var filename = [];
    var desc = [];
    var imID = [];
    var more = 1;
    var home = 0;
    console.log(rows);
    console.log(limit);
    if(limit == -1){
        limit = 8;
        topic = "Sample";
        more = 0;
    }else if(limit == -2){
        limit = rows.length;
        more = 0;
        topic = "All your uploaded images";
        home = 1;
    }else{
        console.log(limit,rows.length);
        if(rows.length <= limit) more = 0;
    }
    for(var i = 0; i < limit; i++){
        var obj = rows[i];
        for (var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            if(attrName == "username"){
                username.push(attrValue);
            }
            if(attrName == "filename"){
                filename.push(attrValue);
            }
            if(attrName == "description"){
                desc.push(attrValue);
            }
            if(attrName == "imID" && home == 1){
               imID.push(attrValue); 
            }
            //console.log(attrName,attrValue)
        }
    }
    //console.log(rows);
    if(rows.length == 0){
        if(user == -1){
            console.log("Empty");
            topic = "Requested topic is not in the database";
        }else{
            topic = "You have not uploaded any image";
        }
    }else{
        topic = capLetter(topic);

    }
    data = {title:topic,images:filename,description:desc,more:more,home:home,imID:imID};
    console.log(data);
    var ret = ejs.render(content,data);
    response.write(ret);
    response.end();
}


function processForm(request, response) {
    var form = new formidable.IncomingForm();
    form.parse(request, par);
    function par(err,fields,files) { parseForm(err,fields,files,request,response) };
}

//Each form provided on the website has to be parsed and its features obtained.
function parseForm(err, fields, files,request,response) {
    if(err) throw err;
    var result = [];
    for(var i in fields){
       var split = fields[i].split(":");
       result.push(i, split[0]);
    }
    if(result.length == 4){
       console.log('login');
       //console.log(response);
       var stmt9 = db.prepare("select username, password, salt, creatorID from users where username == ?");
       stmt9.all(result[1],comp);
       stmt9.finalize();
       
    }else if(result.length == 6){
       console.log('register');
       if(result[3] == result[5]){
          var stmt10 = db.prepare("select username, password, salt from users where username == ?");
          stmt10.all(result[1],dup);
          stmt10.finalize();

       }
       else{
          console.log('passwords dont match');
          if(request.url.startsWith("/?topicsearch=")){
              newurl = request.url + "&rnomatch";
          }else{
              newurl = "/?rnomatch";
          }
          response.writeHead(Redirect,{Location: newurl});
          response.end();
      }
    }
    function comp(err,rows) { compare(err,rows,request,response,result)};
    function dup(err,rows){ duplicate(err,rows,request,response,result)};
}

//searches if the provided username e-mail is not in the database already
function duplicate(err,rows,request,response,result) {
    if(err) throw err;
    if(rows.length == 0){
        var salt = randomstring.generate(12);
        var hash = crypto.createHash('sha256');
        var hashUpdate = hash.update(result[3]+salt,'utf8');
        var hashedPword = hashUpdate.digest('hex');         
        var stmt11 = db.prepare("insert into users (username,password,salt) values (?, ?, ?)");
	    stmt11.all(result[1],hashedPword,salt);
     	stmt11.finalize();        
        console.log('registered user');
        if(request.url.startsWith("/?topicsearch=")){
            newurl = request.url + "&rsuccess";
        }else{
            newurl = "/?rsuccess";
        }
    }else{
        console.log('username already taken');
        if(request.url.startsWith("/?topicsearch=")){
            newurl = request.url + "&rfaildupe";
        }else{
            newurl = "/?rfaildupe";
        }
    }
    response.writeHead(Redirect,{Location: newurl});
    response.end();
}

//compares the login information with the data present in the database
function compare(err,rows,request,response,result) {
    if(err) throw err;
    var newurl;
    if(rows.length == 0){
        console.log("Username does not exist");
        if(request.url.startsWith("/?topicsearch=")){
            newurl = request.url + "&lfail";
        }else{
            newurl = "/?lfail";
        }
        response.writeHead(Redirect,{Location: newurl});
        response.end();
    }else{
        var obj = rows[0];
        for (var key in obj){
            if(key == "password"){
               var password = obj[key];
            }else if(key == "creatorID"){
                var id = obj[key];
            }else if (key == "salt"){
                var salt = obj[key];
            }
        }
        console.log(password);
        console.log(result[3]);
        var hash = crypto.createHash('sha256');
        var hashUpdate = hash.update(result[3]+salt,'utf8');
        var hashedInput = hashUpdate.digest('hex');
        var typeHeader;
        if(password == hashedInput){
            console.log('user logged in');
            console.log(id);
            var cook = "mycookie=" + randomstring.generate(5) +id+ randomstring.generate(5);
            typeHeader = {
                    'Set-Cookie': cook,
                    'Content-Type': "application/xhtml+xml",
                    'Location': "/home"
            };
                    //console.log(response);
                    //console.log(typeHeader);
            response.writeHead(Redirect, typeHeader);
            response.end();
                //request.csession['id'] = id;
                //cookies.set( "unsigned", "foo", { httpOnly: false } );
        } else {
            console.log('login details incorrect');
            if(request.url.startsWith("/?topicsearch=")){
                 newurl = request.url + "&lfail";
            }else{
                 newurl = "/?lfail";
            }
            typeHeader = {
                'Content-Type': "application/xhtml+xml",
                'Location': newurl
            };
        }
        response.writeHead(Redirect,typeHeader);
        response.end();
    }
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as xhtml ("application/xhtml+xml").  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: for a more complete list, install
// the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}

function capLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
}
