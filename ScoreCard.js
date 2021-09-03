let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard";
let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");

console.log("before");
function ProcessSingleMatch(url){
    request(url , cb);  //file link ki
}

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
    //team name
    let searchTool = cheerio.load(html);
    //this will search from the whole page and then we will collect small area.
    let bothIningArray = searchTool(".Collapsible");
    let scoreCard = "";
    for(let i =0 ; i < bothIningArray.length; i++){
        // scoreCard += searchTool(bothIningArray[i]).html(); is eak hi fill mei dono ining aa jayegi
        // scoreCard = searchTool(bothIningArray[i]).html(); // alag alag file mei ining aajayegi
        // fs.writeFileSync(`ining${i+1}.html` , scoreCard); //  alag alag file mei ining aajayegi.

        let TeamNameElem = searchTool(bothIningArray[i]).find("h5");//team ka name   
        let teamName = TeamNameElem.text();//isko run karne par inning bhi print ho rhi thi
        // console.log(teamName); 
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim(); //koi bhi bahar se data aarha hai na to usko trim kardo jise comparison mei koi problem na aye
        // console.log(teamName); idhar se team ke name mil jayega
        let BatsmenTableAllRow = searchTool(bothIningArray[i]).find(".table.batsman tbody tr");
        //sari rows ayegi par sari kaam ki nhi hogi.
        for(let j = 0 ; j < BatsmenTableAllRow.length; j++){
            let numberOfTds = searchTool(BatsmenTableAllRow[j]).find("td");
            //sari rows nhi leasakte kyuki eak row par data hai or eak row par commentry. commentary❌
            if(numberOfTds.length == 8){ 
                //yu are valid
                let playerName = searchTool(numberOfTds[0]).text();
                let runs = searchTool(numberOfTds[2]).text();
                let balls = searchTool(numberOfTds[3]).text();
                let fours = searchTool(numberOfTds[5]).text();
                let sixes = searchTool(numberOfTds[6]).text();


                //name venue date opponentTeam result runs ballfour six sr -> these thing we have to get...
                console.log(playerName, " played for" , teamName, "scored" , runs , "in" , balls , "with" , fours ,"four and",sixes,"sixes");
                processPlayer(playerName, teamName, runs, balls, fours, sixes);

            }
        }
        console.log("''''''''''''''''''''''''''''''''''");
    }
    // fs.writeFileSync("match.html" , scoreCard);//is eak hi fill mei dono ining aa jayegi

    //player name
}
function processPlayer(playerName,teamName,runs,balls,fours,sixes){
    let obj = {
        playerName,
        teamName,
        runs,
        balls,
        fours,
        sixes

    }
    //team File = folder
    let dirPath = path.join(__dirname,teamName);
    if(fs.existsSync(dirPath) == false){
        fs.mkdirSync(dirPath);
    }
    //player file
    let playerFilePath = path.join(dirPath,playerName +".json");
    let playerArr = [];
    if(fs.existsSync(playerFilePath) == false){                //player ki file pahle se bani hui hai, pura ipl ka data nikal rhe na.
       playerArr.push(obj); //first time entry daal rhe
    }else{
        //append agar pahle se data pdha hai to ,,,,, ya second time entry daal rhe
        playerArr = getContent(playerFilePath);
        playerArr.push(obj);
    }            
    //write in file
    // write in the files
    // writeContent(playerFilePath, playerArray);
    // writeContent(playerFilePath,playerArr);
    excelWriter(playerFilePath, playerArr, playerName);

}
// function getContent(playerFilePath){
//     let content = fs.readFileSync(playerFilePath);
//     return JSON.parse(content);  //buffer wagera mei data ataa to json mei convert karke bhej diya.

// }
function writeContent(playerFilePath,content){
    let jsondata = JSON.stringify(content);
    fs.writeFileSync(playerFilePath,jsondata);
}

//to conver into xl file

module.exports = {
     ProcessSingleMatch // file link

}

function excelWriter(filePath, json, sheetName) {
    // workbook create
    let newWB = xlsx.utils.book_new();
    // worksheet
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    // excel file create 
    xlsx.writeFile(newWB, filePath);
}
// // json data -> excel format convert
// // -> newwb , ws , sheet name
// // filePath
// read 
//  workbook get

function excelReader(filePath, SheetName){
    // if(fs.existsSync(filePath)== false){
    //     return [];
    // }
    //player workbook
    let wb = xlsx.readFile(filePath);
    //get a data in a particular sheetin that wb
    let excelData = wb.Sheet[SheetName];
    //sheet to join
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}
