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
/////////////////////////////////////////////////////////////
//                                                         //
//  - check code for correct const/let usage               // 
//  - add compare function to check for changes            //
//  - way to safe the articles                             //
//  - config file                                          //
//                                                         //
/////////////////////////////////////////////////////////////
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
    Scrape(browser, page) {
        return __awaiter(this, void 0, void 0, function* () {
            //const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));
            const path = './data/baseline.json';
            const scraper = new Page(browser, page);
            const compare = new Compare();
            let visible = true;
            let data = Array();
            let ScrpOrUpdt = [true, false];
            //const page = await browser.newPage();
            // Capture the json array as a object. check if its a new article, a needed update or a deletion, make function
            // that performs the task, at the end push the new data and write it as a file.
            for (let index = 0; index < 1;) {
                let dataobj = [];
                if (fs.existsSync(path)) {
                    let data = fs.readFileSync(`data/baseline.json`, 'utf8');
                    dataobj = JSON.parse(data);
                }
                yield scraper.LoadPage(visible);
                console.log("Page is loaded");
                yield scraper.LoadArticles();
                console.log("Articles are loaded");
                const AllHrefs = yield scraper.Collect();
                console.log("Hrefs are collected");
                //const Ids = await scraper.GetId(AllHrefs); 
                //&& !fs.existsSync(path
                if (AllHrefs != null) {
                    for (let i = 0; i < AllHrefs.length; i++) {
                        let href = AllHrefs[i];
                        let id = yield scraper.GetId(href);
                        console.log("[Id]: Id is collected");
                        if (!fs.existsSync(path)) {
                            ScrpOrUpdt[0] = true;
                        }
                        else {
                            ScrpOrUpdt = compare.CompareId(id);
                        }
                        if (ScrpOrUpdt[0] == true) {
                            let articledata = yield scraper.GetData(href, id);
                            if (ScrpOrUpdt[1] == true) {
                                dataobj = scraper.Update(articledata, dataobj);
                            }
                            else {
                                try {
                                    dataobj.push(articledata);
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
                let jsonData = JSON.stringify(dataobj);
                fs.writeFile(`data/baseline.json`, jsonData, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                console.log("ALL DONE");
                // function that counts down
                const timer = new Timer();
                console.log("Waiting...");
                yield timer.doTimer();
            }
            ;
        });
    }
}
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        // return await for better async stack trace support in case of errors.
        return yield new Promise(resolve => setTimeout(resolve, ms));
    });
}
//const timer = 2000
function Run() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = new Main();
        const [browser, page] = yield start.Setup();
        //start.Scrape(browser,page)
        yield start.Scrape(browser, page);
    });
}
Run();
//let scaper = new Compare();
//console.log(scaper.CompareId("24 verwaarloosde hondjes uit Geldermalsen maken het inmiddels beter/^/Tue Jan 12 2022 00:57:00 GMT+0100 (Midden-Europese standaardtijd)"));
//Main();
//const collect = new testClass();
//collect.collectarticles();
