"use strict"
var sql = require("sqlite3");
var db = new sql.Database("data.db");

db.serialize(create)

function create(){
    db.run("create table images (imID INTEGER PRIMARY KEY,description,filename,counter,creatorID)");
    db.run("create table users (creatorID INTEGER PRIMARY KEY,username,password,salt)");
    db.run("create table im2top (imID,topicID)");
    db.run("create table topics (topicID,topicName)");
    db.run("insert into images values(1,'Downloaded image','upload/1.png',0,0)");
    db.run("insert into im2top values(1,0)");
    db.run("insert into im2top values(1,1)");
    db.run("insert into images values(2,'Downloaded image','upload/2.png',0,0)");
    db.run("insert into im2top values(2,0)");
    db.run("insert into im2top values(2,1)");
    db.run("insert into images values(3,'Downloaded image','upload/4.png',0,0)");
    db.run("insert into im2top values(3,0)");
    db.run("insert into im2top values(3,1)");
    db.run("insert into images values(4,'Downloaded image','upload/5.png',0,0)");
    db.run("insert into im2top values(4,0)");
    db.run("insert into im2top values(4,1)");
    db.run("insert into images values(5,'SVG graphics of bridge','upload/bridge.png',0,0)");
    db.run("insert into im2top values(5,0)");
    db.run("insert into im2top values(5,2)");
    db.run("insert into images values(6,'SVG graphics of dolphin','upload/dolphin_line.png',0,0)");
    db.run("insert into im2top values(6,0)");
    db.run("insert into im2top values(6,2)");
    db.run("insert into images values(7,'SVG graphics of duck','upload/duck_line.png',0,0)");
    db.run("insert into im2top values(7,0)");
    db.run("insert into im2top values(7,2)");
    db.run("insert into images values(8,'SVG graphics of seagull 1','upload/seagull_line.png',0,0)");
    db.run("insert into im2top values(8,0)");
    db.run("insert into im2top values(8,2)");
    db.run("insert into images values(9,'SVG graphics of seagull 2','upload/seagull2_line.png',0,0)");
    db.run("insert into im2top values(9,0)");
    db.run("insert into im2top values(9,2)");
    db.run("insert into images values(10,'PNG artwork of dolphin','upload/dolphin.png',0,0)");
    db.run("insert into im2top values(10,0)");
    db.run("insert into im2top values(10,3)");
    db.run("insert into images values(11,'PNG artwork of duck','upload/duck.png',0,0)");
    db.run("insert into im2top values(11,0)");
    db.run("insert into im2top values(11,3)");
    db.run("insert into images values(12,'PNG artwork of seagull 1','upload/seagull.png',0,0)");
    db.run("insert into im2top values(12,0)");
    db.run("insert into im2top values(12,3)");
    db.run("insert into images values(13,'PNG artwork of seagull 2','upload/seagull2.png',0,0)");
    db.run("insert into im2top values(13,0)");
    db.run("insert into im2top values(13,3)");

    db.run("insert into images values(14,'Artwork with ducks','upload/1a.png',0,0)");
    db.run("insert into im2top values(14,0)");
    db.run("insert into im2top values(14,4)");
    db.run("insert into images values(15,'Artwork with dolphin','upload/2b.png',0,0)");
    db.run("insert into im2top values(15,0)");
    db.run("insert into im2top values(15,4)");
    db.run("insert into images values(16,'Artwork with water in color','upload/2c.png',0,0)");
    db.run("insert into im2top values(16,0)");
    db.run("insert into im2top values(16,4)");
    db.run("insert into images values(17,'Artwork with drawn bridge','upload/4c.png',0,0)");
    db.run("insert into im2top values(17,0)");
    db.run("insert into im2top values(17,4)");
    db.run("insert into images values(18,'Artwork with balloons in color','upload/5a.png',0,0)");
    db.run("insert into im2top values(18,0)");
    db.run("insert into im2top values(18,4)");
    db.run("insert into images values(19,'Artwork with seagulls','upload/6b.png',0,0)");
    db.run("insert into im2top values(19,0)");
    db.run("insert into im2top values(19,4)");
    db.run("insert into images values(20,'Artwork with bridge','upload/8a.png',0,0)");
    db.run("insert into im2top values(20,0)");
    db.run("insert into im2top values(20,3)");
    db.run("insert into users values(0,'root','root',0)");
    db.run("insert into topics values(4,'mixture')");
    db.run("insert into topics values(3,'png')");
    db.run("insert into topics values(2,'svg')");
    db.run("insert into topics values(1,'downloaded')");
    db.run("insert into topics values(0,'all')");
    console.log("Done")
}
