var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer';
//const fs = require('fs');
//TEST CLASS
export class testClass {
    constructor() { }
    ;
    collectarticles() {
        return __awaiter(this, void 0, void 0, function* () {
            const devider = "------------------------------------------------------------------------------------------------------------------------------------------------------------";
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            var data = Array();
            const browser = yield puppeteer.launch({ headless: false });
            const page = yield browser.newPage();
            yield page.goto('https://www.nu.nl/binnenland');
            delay(2000);
            console.log('t');
            yield page.waitForNavigation();
            delay(3000);
            console.log('tesst');
            yield page.goto('https://www.nu.nl/binnenland');
            //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            delay(1000);
            //await page.evaluate(() => {
            //document.querySelector('button[type=submit]').click();   
            //return 
            //});
            //#region Load more Button
            const isElementVisible = (page, cssSelector) => __awaiter(this, void 0, void 0, function* () {
                let visible = true;
                yield page
                    .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
                    .catch(() => {
                    visible = false;
                });
                return visible;
            });
            const selectorForLoadMoreButton = '[href="JavaScript:void(0)"]';
            const articleSelector = '[class="list list--thumb list--wide"] [data-type="article"]';
            let numberofloadmoreclicks = 0;
            let loadMoreVisible = yield isElementVisible(page, selectorForLoadMoreButton);
            console.log('load more test');
            while (loadMoreVisible && numberofloadmoreclicks < 4) {
                delay(1000);
                numberofloadmoreclicks++;
                //console.log(numberofloadmoreclicks)
                yield page
                    .click(selectorForLoadMoreButton)
                    .catch(() => { });
                loadMoreVisible = yield isElementVisible(page, selectorForLoadMoreButton);
            }
            console.log(numberofloadmoreclicks);
            // await page.waitForNavigation({
            //   waitUntil: 'networkidle0',
            // });
            //await page.waitForNavigation();
            //#endregion
            //#region Collect Hrefs from articles
            //await delay(4000);
            const hrefs1 = yield page.evaluate(() => Array.from(document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'), a => a.getAttribute('href')));
            console.log(`${hrefs1.length - 1} articles found...`);
            //await browser.close();
            // public async testfunction() {
            //   const testvar = "test";
            //   await new Promise<void>((resolve) => {
            //     setTimeout(() => {
            //       console.log(testvar);
            //       resolve();
            //     }, 600);
            //   });
            // }
        });
    }
}
