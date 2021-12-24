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
function Main() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({ headless: false, args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ] });
        const path = './data/baseline.json';
        const page = yield browser.newPage();
        const scraper = new Page(browser, page);
        const data = Array();
        yield scraper.LoadPage();
        console.log("Page is loaded");
        yield scraper.LoadArticles();
        console.log("Articles are loaded");
        const AllHrefs = yield scraper.GetId();
        if (AllHrefs != null && !fs.existsSync(path)) {
            for (let i = 0; i < AllHrefs.length; i++) {
                let href = AllHrefs[i];
                let articledata = yield scraper.GetData(href);
                try {
                    data.push(articledata);
                }
                catch (e) {
                    data.push("NO ARTICLE FOUND");
                }
            }
            let jsonData = JSON.stringify(data);
            fs.writeFile(`data/baseline.json`, jsonData, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        data.forEach(el => {
            console.log(el);
        });
        //console.log(AllHrefs);
        browser.close();
    });
}
//const collect = new testClass();
//collect.collectarticles();
Main();
