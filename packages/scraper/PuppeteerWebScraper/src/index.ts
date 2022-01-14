import { Page} from "./page.js";
import { Compare } from "./compare.js";
import puppeteer from 'puppeteer';
import fs from "fs";
import {IArticle} from "./iarticle";
import { IConfig } from './iconfig';
import { setgroups } from "process";
import { setInterval } from "timers/promises";

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
      

      const Var = fs.readFileSync(`src/config.json`, 'utf8');
      const Varobj:IConfig = JSON.parse(Var);
      
      const path = Varobj.PathToDataFile;

      const scraper = new Page(browser,page);

      const compare = new Compare();

      let visible = true;

      let data = Array();

      let ScrpOrUpdt = [true, false];


      for (let index = 0; index < 1;) {

        let dataobj: IArticle[] = [];

        if (fs.existsSync(path)){
          let data = fs.readFileSync(`data/baseline.json`, 'utf8');
          dataobj = JSON.parse(data);
          dataobj = scraper.DeleteOldData(dataobj);
        }
    
        await scraper.LoadPage(visible);
    
        console.log("Page is loaded");
    
        await scraper.LoadArticles();
    
        console.log("Articles are loaded");
    
        const AllHrefs = await scraper.Collect();

        console.log("Hrefs are collected");
    
        if (AllHrefs != null){

          for(let i=0; i < AllHrefs.length; i++){

            let href = AllHrefs[i];
            let id = await scraper.GetId(href);


            console.log("[Id]: Id is collected");


            if (!fs.existsSync(path)){ScrpOrUpdt[0] = true}

            else{ ScrpOrUpdt = compare.CompareId(id);}

              if (ScrpOrUpdt[0] == true){
                let articledata:IArticle = await scraper.GetData(href, id);


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
    const timer = new Timer(Varobj.IdleTimeMin);
    console.log("Waiting...");
    await timer.doTimer();


  };
}
 }


async function delay(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function Run() {
  const start = new Main();
  const [browser, page] = await start.Setup();
  await start.Scrape(browser,page);
    
  
}

Run();


