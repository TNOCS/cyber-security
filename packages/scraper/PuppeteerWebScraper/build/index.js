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
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
            const path = Varobj.PathToDataFile;
            const scraper = new Page(browser, page);
            const compare = new Compare();
            let visible = true;
            let data = Array();
            let ScrpOrUpdt = [true, false];
            for (let index = 0; index < 1;) {
                let dataobj = [];
                if (fs.existsSync(path)) {
                    let data = fs.readFileSync(`data/baseline.json`, 'utf8');
                    dataobj = JSON.parse(data);
                    dataobj = scraper.DeleteOldData(dataobj);
                }
                yield scraper.LoadPage(visible);
                console.log("Page is loaded");
                yield scraper.LoadArticles();
                console.log("Articles are loaded");
                const AllHrefs = yield scraper.Collect();
                console.log("Hrefs are collected");
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
function Run() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = new Main();
        const [browser, page] = yield start.Setup();
        yield start.Scrape(browser, page);
    });
}
Run();
