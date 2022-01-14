import { testClass } from "./testclass.js"; // NOTE the extension - needed for ES6
import { Page} from "./page.js";
import { Compare } from "./compare.js";
import puppeteer from 'puppeteer';
import fs from "fs";
import {Article} from "./article";
import { setgroups } from "process";
import { setInterval } from "timers/promises";

/////////////////////////////////////////////////////////////
//                                                         //
//  - check code for correct const/let usage               // 
//  - add compare function to check for changes            //
//  - way to safe the articles                             //
//  - config file                                          //
//                                                         //
/////////////////////////////////////////////////////////////

class Timer {
  constructor(public counter = 2) {
      this.doTimer();
  }
  async doTimer() {
      for (let i = 0; i < this.counter; i++) {
          await delay(60000);
          this.counter = this.counter - 1;
      }
  }
}

class Main{

  constructor(){  
  }
    
    public async Setup(): Promise<[puppeteer.Browser, puppeteer.Page]>{
      const browser = await puppeteer.launch({headless:false, args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
        ]});
      const page = await browser.newPage();

      return [browser, page];

    }

    public async Scrape(browser: puppeteer.Browser, page: puppeteer.Page) {   
      
      //const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));
  
      const path = './data/baseline.json';

      const scraper = new Page(browser,page);

      const compare = new Compare();

      let visible = true;

      let data = Array();

      let ScrpOrUpdt = [true, false];
  
      //const page = await browser.newPage();


      // Capture the json array as a object. check if its a new article, a needed update or a deletion, make function
      // that performs the task, at the end push the new data and write it as a file.


      for (let index = 0; index < 1;) {

        let dataobj: Article[] = [];

        if (fs.existsSync(path)){
          let data = fs.readFileSync(`data/baseline.json`, 'utf8');
          dataobj = JSON.parse(data);
        }
    
        await scraper.LoadPage(visible);
    
        console.log("Page is loaded");
    
        await scraper.LoadArticles();
    
        console.log("Articles are loaded");
    
        const AllHrefs = await scraper.Collect();

        console.log("Hrefs are collected");
    
        //const Ids = await scraper.GetId(AllHrefs); 
    
    
        //&& !fs.existsSync(path
    
        if (AllHrefs != null){

          for(let i=0; i < AllHrefs.length; i++){

            let href = AllHrefs[i];
            let id = await scraper.GetId(href);


            console.log("[Id]: Id is collected");


            if (!fs.existsSync(path)){ScrpOrUpdt[0] = true}

            else{ ScrpOrUpdt = compare.CompareId(id);}

              if (ScrpOrUpdt[0] == true){
                let articledata:Article = await scraper.GetData(href, id);


                if (ScrpOrUpdt[1] == true){
                  dataobj = scraper.Update(articledata, dataobj);
                    
                } else{

                  try{
                    dataobj.push(articledata);
                  }catch(e){
                    console.log("NO ARTICLE FOUND");
                  }

                }
                
          }else{
            console.log("NO NEW ARTICLE SCRAPED");
          }
        
          
        
    }
    
  }
    
    let jsonData = JSON.stringify(dataobj);
        fs.writeFile(`data/baseline.json`, jsonData, function(err) {
            if (err) {
              console.log(err);
            }
          });

    console.log("ALL DONE");
    // function that counts down
    const timer = new Timer();
    console.log("Waiting...");
    await timer.doTimer();


  };
}
 }


async function delay(ms: number) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

//const timer = 2000

async function Run() {
  const start = new Main();
  const [browser, page] = await start.Setup();

  //start.Scrape(browser,page)
  await start.Scrape(browser,page);
    
  
}

Run();
//let scaper = new Compare();
//console.log(scaper.CompareId("24 verwaarloosde hondjes uit Geldermalsen maken het inmiddels beter/^/Tue Jan 12 2022 00:57:00 GMT+0100 (Midden-Europese standaardtijd)"));




//Main();

//const collect = new testClass();

//collect.collectarticles();
