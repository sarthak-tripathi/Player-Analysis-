// npm i request -> to install request policy
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let request = require("request");
let cheerio = require("cheerio");
let ScoreCardObj = require("./ScoreCard"); //ye file link kar rhe scoreCard.js se
// console.log("before");


request(url,cb); 

function cb(error, response, html) 
{
    if(error){
        console.log(error);
    }else if(response.statusCode == 404){
        console.log("page not found");
    }else{
        // console.log(html);
        // console.log("html:", );
        dataExtracter(html);
    }
}
function dataExtracter(html){
    //searchTool
    let searchTool = cheerio.load(html);
    let anchorrep = searchTool('a[data-hover="View All Results"]');
    let link = anchorrep.attr("href"); 
    let fullMatchPageLink = `https://www.espncricinfo.com/${link}`;

    console.log("fullLink", fullMatchPageLink);
    //go to all match page
    request(fullMatchPageLink,AllMatchPageCb)
}
function AllMatchPageCb(error, response, html){
    if(error){
        console.log(error);
    }else if(response.statusCode == 404){
        console.log("page not found");
    }else{
        // console.log(html);
        // console.log("html:", );
        // dataExtracter(html);
        getAllScoreCardLink(html);
    }

}
function getAllScoreCardLink(html){
    console.log("'''''''''''''''''''''''''''''''''''''''''''''''''");
    let searchTool = cheerio.load(html);
    let scorecardArr = searchTool("a[data-hover='Scorecard']");
    for(let i = 0; i < scorecardArr.length; i++){
        let Link = searchTool(scorecardArr[i]).attr("href");
        // console.log(link);
        let FullAllMatchPageLink = `https://www.espncricinfo.com/${Link}`;
        console.log(FullAllMatchPageLink);
        ScoreCardObj.ProcessSingleMatch(FullAllMatchPageLink);
    } 

}
