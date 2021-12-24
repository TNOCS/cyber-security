import { testClass } from "./testclass.js"; // NOTE the extension - needed for ES6
import { Page} from "./page.js";
import puppeteer from 'puppeteer';
import fs from "fs";

////////////////////////////////////////////////////////////////////////
//  
//  - check code for correct const/let usage
//  - add compare function to check for changes
//  - way to safe the articles
//  - config file
//
////////////////////////////////////////////////////////////////////////


async function Main() {

    const browser = await puppeteer.launch({headless:false, args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]});

    const path = './data/baseline.json';

    const page = await browser.newPage();

    const scraper = new Page(browser,page);

    const data = Array();

    await scraper.LoadPage();

    console.log("Page is loaded");

    await scraper.LoadArticles();

    console.log("Articles are loaded");

    const AllHrefs = await scraper.GetId();


    if (AllHrefs != null && !fs.existsSync(path)){
      for(let i=0; i < AllHrefs.length; i++){
        let href = AllHrefs[i];
        let articledata = await scraper.GetData(href);
        try{
          data.push(articledata);
        }catch(e){
          data.push("NO ARTICLE FOUND");
        }
      }
    
    let jsonData = JSON.stringify(data);
    fs.writeFile(`data/baseline.json`, jsonData, function(err) {
        if (err) {
          console.log(err);
        }
      });
    }

    data.forEach(el => {
      console.log(el);
    })
    
    //console.log(AllHrefs);



    browser.close();



}



//const collect = new testClass();

//collect.collectarticles();

Main();
