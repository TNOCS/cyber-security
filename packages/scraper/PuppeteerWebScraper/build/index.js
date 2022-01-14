var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Page } from "./page.js";
import { Compare } from "./compare.js";
import puppeteer from 'puppeteer';
import fs from "fs";
// The timer used (per minute)
class Timer {
    constructor(counter = 2) {
        this.counter = counter;
        this.doTimer();
    }
    doTimer() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.counter; i++) {
                yield delay(60000);
                this.counter = this.counter - 1;
            }
        });
    }
}
class Main {
    constructor() {
    }
    // The browser is started and a new page is opened.
    Setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer.launch({ headless: false, args: [
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ] });
            const page = yield browser.newPage();
            return [browser, page];
        });
    }
    // This is the main scrape function
    Scrape(browser, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
            const path = Varobj.PathToDataFile;
            const scraper = new Page(browser, page);
            const compare = new Compare();
            let scrapeOrupdate = [true, false];
            // This loop runs forever. Or until the user stops the program (ctrl+c)
            for (let index = 0; index < 1;) {
                let dataObj = [];
                if (fs.existsSync(path)) {
                    let data = fs.readFileSync(`data/baseline.json`, 'utf8');
                    dataObj = JSON.parse(data);
                    dataObj = scraper.DeleteOldData(dataObj);
                }
                // This loads the correct news site
                yield scraper.LoadPage();
                console.log("Page is loaded");
                // This loads all the articles on the webpage
                yield scraper.LoadArticles();
                console.log("Articles are loaded");
                // This collects all the links from all the articles on the webpage
                const allHrefs = yield scraper.Collect();
                console.log("Hrefs are collected");
                if (allHrefs != null) {
                    for (let i = 0; i < allHrefs.length; i++) {
                        let href = allHrefs[i];
                        let id = yield scraper.GetId(href);
                        console.log("[Id]: Id is collected");
                        if (!fs.existsSync(path)) {
                            scrapeOrupdate[0] = true;
                        }
                        // This checks if a link should be scraped or not (new or old data)
                        else {
                            scrapeOrupdate = compare.CompareId(id);
                        }
                        if (scrapeOrupdate[0] == true) {
                            // This is the function that collects the data from a article 
                            let articleData = yield scraper.GetData(href, id);
                            // If a article has been updated we replace article here
                            if (scrapeOrupdate[1] == true) {
                                dataObj = scraper.Update(articleData, dataObj);
                            }
                            else {
                                try {
                                    // Here we push new data to the object
                                    dataObj.push(articleData);
                                }
                                catch (e) {
                                    console.log("NO ARTICLE FOUND");
                                }
                            }
                        }
                        else {
                            console.log("NO NEW ARTICLE SCRAPED");
                        }
                    }
                }
                // Here we store the data to the selected location
                let jsonData = JSON.stringify(dataObj);
                fs.writeFile(`data/baseline.json`, jsonData, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                // Start the Timer
                console.log("ALL DONE");
                const timer = new Timer(Varobj.IdleTimeMin);
                console.log("Waiting...");
                yield timer.doTimer();
            }
            ;
        });
    }
}
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new Promise(resolve => setTimeout(resolve, ms));
    });
}
// This function starts the process
function Run() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = new Main();
        const [browser, page] = yield start.Setup();
        yield start.Scrape(browser, page);
    });
}
Run();
