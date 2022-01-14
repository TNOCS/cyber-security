import { Page} from "./page.js";
import { Compare } from "./compare.js";
import puppeteer from 'puppeteer';
import fs from "fs";
import {IArticle} from "./iarticle";
import { IConfig } from './iconfig';

// The timer used (per minute)
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
    

    // The browser is started and a new page is opened.
    public async Setup(): Promise<[puppeteer.Browser, puppeteer.Page]>{
      const browser = await puppeteer.launch({headless:false, args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
        ]});
      const page = await browser.newPage();

      return [browser, page];

    }

    // This is the main scrape function
    public async Scrape(browser: puppeteer.Browser, page: puppeteer.Page) {   
      

      const Var = fs.readFileSync(`src/config.json`, 'utf8');
      const Varobj:IConfig = JSON.parse(Var);
      
      const path = Varobj.PathToDataFile;

      const scraper = new Page(browser,page);

      const compare = new Compare();

      let scrapeOrupdate = [true, false];

      // This loop runs forever. Or until the user stops the program (ctrl+c)
      for (let index = 0; index < 1;) {

        let dataObj: IArticle[] = [];

        if (fs.existsSync(path)){
          let data = fs.readFileSync(`data/baseline.json`, 'utf8');
          dataObj = JSON.parse(data);
          dataObj = scraper.DeleteOldData(dataObj);
        }
        
        // This loads the correct news site
        await scraper.LoadPage();
    
        console.log("Page is loaded");

        // This loads all the articles on the webpage
        await scraper.LoadArticles();
    
        console.log("Articles are loaded");
    
        // This collects all the links from all the articles on the webpage
        const allHrefs = await scraper.Collect();

        console.log("Hrefs are collected");
    
        if (allHrefs != null){

          for(let i=0; i < allHrefs.length; i++){

            let href = allHrefs[i];
            let id = await scraper.GetId(href);


            console.log("[Id]: Id is collected");


            if (!fs.existsSync(path)){scrapeOrupdate[0] = true}

            // This checks if a link should be scraped or not (new or old data)
            else{ scrapeOrupdate = compare.CompareId(id);}

              if (scrapeOrupdate[0] == true){

                // This is the function that collects the data from a article 
                let articleData:IArticle = await scraper.GetData(href, id);

                // If a article has been updated we replace article here
                if (scrapeOrupdate[1] == true){
                  dataObj = scraper.Update(articleData, dataObj);
                    
                } else{

                  try{
                    // Here we push new data to the object
                    dataObj.push(articleData);
                  }catch(e){
                    console.log("NO ARTICLE FOUND");
                  }

                }
                
          }else{
            console.log("NO NEW ARTICLE SCRAPED");
          }
        
          
        
    }
    
  }
    // Here we store the data to the selected location
    let jsonData = JSON.stringify(dataObj);
        fs.writeFile(`data/baseline.json`, jsonData, function(err) {
            if (err) {
              console.log(err);
            }
          });

    // Start the Timer
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
// This function starts the process
async function Run() {
  const start = new Main();
  const [browser, page] = await start.Setup();
  await start.Scrape(browser,page);
    
  
}

Run();


