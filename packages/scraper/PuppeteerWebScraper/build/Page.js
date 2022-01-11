var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Page {
    constructor(b, p) {
        this.browser = b;
        this.page = p;
    }
    ;
    LoadPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            //browser = await puppeteer.launch({headless:false});
            //page = await browser.newPage();
            let Pages = yield this.browser.pages();
            //console.log(Pages);
            yield this.page.goto('https://www.nu.nl/binnenland');
            yield delay(2000);
            //const frames = await this.page.frames();
            //frames.forEach(eachframe => {
            //    console.log(`${eachframe}`);
            //});
            //await this.page.waitForSelector('[class="message-component message-button no-children focusable pg-accept-button sp_choice_type_11"]');
            //await this.page.click('[class="message-component message-button no-children focusable pg-accept-button sp_choice_type_11"]');
            //await this.page.waitForNavigation();
            yield delay(2000);
            const PopupSelector = '[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]';
            yield this.page.waitForSelector(PopupSelector);
            //const Xbutton = await page.evaluate( () => document.querySelector('[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]') as HTMLElement);
            yield this.page.click(PopupSelector);
            console.log("clicked button");
            //await page.waitForSelector('[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]');
            //await page.goto('https://www.nu.nl/binnenland');
            //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            //await delay(1000);
            console.log("Page is ready");
        });
    }
    LoadArticles() {
        return __awaiter(this, void 0, void 0, function* () {
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
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
            let loadMoreVisible = yield isElementVisible(this.page, selectorForLoadMoreButton);
            console.log('load more test');
            while (loadMoreVisible && numberofloadmoreclicks < 1) {
                numberofloadmoreclicks++;
                //console.log(numberofloadmoreclicks)
                yield this.page
                    .click(selectorForLoadMoreButton)
                    .catch(() => { });
                loadMoreVisible = yield isElementVisible(this.page, selectorForLoadMoreButton);
                yield delay(2000);
            }
            console.log(numberofloadmoreclicks);
            //await this.page.waitForNavigation({waitUntil:"domcontentloaded"});
            //this.browser.close();
            // await page.waitForNavigation({
            //   waitUntil: 'networkidle0',
            // });
            //await page.waitForNavigation();
        });
    }
    Collect() {
        return __awaiter(this, void 0, void 0, function* () {
            const hrefs1 = yield this.page.evaluate(() => Array.from(document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'), a => a.getAttribute('href')));
            console.log(`${hrefs1.length - 1} articles found...`);
            return hrefs1;
        });
    }
    GetId(href) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = 'https://www.nu.nl' + href;
            let IdTime;
            let IdTitle;
            let date = new Date();
            yield this.page.goto(page);
            try {
                yield this.page.waitForSelector('[data-type="article.header"] [class="update small"]', { timeout: 2000 });
                console.log("Id Time FOUND");
                let Time = yield this.page.$('[data-type="article.header"] [class="update small"]');
                let TimeUpdate = yield this.page.evaluate(el => el.innerText, Time);
                IdTime = this.TimeConverter(TimeUpdate);
            }
            catch (e) {
                IdTime = date.toString();
            }
            try {
                yield this.page.waitForSelector('[data-type="article.header"] [class="title fluid"]', { timeout: 2000 });
                console.log("Id TITLE FOUND");
                let Title = yield this.page.$('[data-type="article.header"] [class="title fluid"]');
                IdTitle = yield this.page.evaluate(el => el.innerText, Title);
            }
            catch (e) {
                IdTitle = "NO TITLE FOUND";
            }
            const id = IdTitle + IdTime;
            return id.replace(/[^0-9a-z]/gi, '-');
        });
    }
    // article [data-type="article.body"] [class="block-wrapper"]
    // title [data-type="article.header"] [class="block-wrapper section-nu"] [class="title fluid"]
    // time [data-type="article.header"] [class="block-wrapper section-nu"] [class="pubdate small"]
    // author [data-type="article.footer"] [class="author"]
    GetData(href, id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Extracting from: ${href}`);
            var data = Array();
            const pagelink = 'https://www.nu.nl' + href;
            yield this.page.goto(pagelink);
            let Articleval;
            let Timeval;
            let Titleval;
            let Authorval;
            //let Imgtitle = await this.page.$('[class="headerimage__image"]');
            try {
                yield this.page.waitForSelector('[data-type="article.body"] [class="block-wrapper"]', { timeout: 2000 });
                console.log("ARTICLE FOUND");
                let Article = yield this.page.$('[data-type="article.body"] [class="block-wrapper"]');
                Articleval = yield this.page.evaluate(el => el.innerText, Article);
            }
            catch (e) {
                Articleval = "NO ARTICLE FOUND";
            }
            try {
                yield this.page.waitForSelector('[data-type="article.header"] [class="update small"]', { timeout: 2000 });
                console.log("Id Time FOUND");
                let Time = yield this.page.$('[data-type="article.header"] [class="update small"]');
                let TimeUpdate = yield this.page.evaluate(el => el.innerText, Time);
                Timeval = this.TimeConverter(TimeUpdate);
            }
            catch (e) {
                Timeval = "NO TIME FOUND";
            }
            try {
                yield this.page.waitForSelector('[data-type="article.header"] [class="title fluid"]', { timeout: 2000 });
                console.log("TITLE FOUND");
                let Title = yield this.page.$('[data-type="article.header"] [class="title fluid"]');
                Titleval = yield this.page.evaluate(el => el.innerText, Title);
            }
            catch (e) {
                Titleval = "NO TITLE FOUND";
            }
            try {
                yield this.page.waitForSelector('[data-type="article.footer"] [class="author"]', { timeout: 2000 });
                console.log("AUTHOR FOUND");
                let Author = yield this.page.$('[data-type="article.footer"] [class="author"]');
                Authorval = yield this.page.evaluate(el => el.innerText, Author);
            }
            catch (e) {
                Authorval = "NO AUTHOR FOUND";
            }
            //console.log(data[0]);
            let completedata = JSON.stringify({ Id: id, link: pagelink, title: Titleval, author: Authorval, date: Timeval, content: Articleval });
            return completedata;
        });
    }
    TimeConverter(Time) {
        //Time to lowercase??
        //let re = /([0-9]+|een)\s(dagen|uur|dag|minuten|minuut)/g
        let re = /(?<CompleteTime>(?<TimeVal>[0-9]+|een)\s(?<TimeUnit>dagen|uur|dag|minuten|minuut))|(?<CompleteDate>(?<DateDate>[0-9]+)-(?<DateMonth>[0-9]+)-(?<DateYear>[0-9]+)\s(?<DateHour>[0-9]+):(?<DateMinute>[0-9]+))/g;
        const TimeMatch = Time.match(re);
        let TimeGroups = Time.matchAll(re);
        // for (let group of TimeGroups){
        //     console.log(group[0], group[1]);
        // }
        //console.log(TimeGroups);
        //console.log(TimeGroups?.CompleteDate);
        let Today = new Date();
        //update with group names?
        //if (TimeGroups?.CompleteTime != null){   ---- Groups have to work
        try {
            TimeMatch === null || TimeMatch === void 0 ? void 0 : TimeMatch.forEach(element => {
                const DayConditions = ["dagen", "dag"];
                const HourConditions = ["uur"];
                const MinuteConditions = ["minuut", "minuten"];
                const FullDateConditions = ["-", ":"];
                //const FullDateConditions = [":"];
                //other option = element.split(" ")[1] => 
                if (DayConditions.some(el => element.includes(el))) {
                    let SplitDay = element.split(" ");
                    let ValueDay = parseInt(SplitDay[0]);
                    Today.setDate(Today.getDate() - ValueDay);
                }
                else if (HourConditions.some(el => element.includes(el))) {
                    let SplitHour = element.split(" ");
                    console.log(SplitHour[0]);
                    let ValueHour = 0;
                    if (SplitHour[0] == "een") {
                        let ValueHour = 1;
                    }
                    else {
                        let ValueHour = parseInt(SplitHour[0]);
                    }
                    Today.setHours(Today.getHours() - ValueHour);
                }
                else if (MinuteConditions.some(el => element.includes(el))) {
                    let SplitMinute = element.split(" ");
                    let ValueMinute = parseInt(SplitMinute[0]);
                    Today.setMinutes(Today.getMinutes() - ValueMinute);
                }
                else if (FullDateConditions.some(el => element.includes(el))) {
                    let SplitDatetime = element.split(" ");
                    let SplitDate = SplitDatetime[0].split("-");
                    let SplitTime = SplitDatetime[1].split(":");
                    SplitDate.forEach(element => {
                        let ValueDate = parseInt(element);
                        let indexDate = SplitDate.indexOf(element);
                        if (indexDate == 0) {
                            Today.setDate(ValueDate);
                            console.log(`added date: ${Today.toString()}`);
                        }
                        else if (indexDate == 1) {
                            Today.setMonth(ValueDate - 1);
                            console.log(`added month: ${Today.toString()}`);
                        }
                        else if (indexDate == 2) {
                            Today.setFullYear(2000 + ValueDate);
                            console.log(`added year: ${Today.toString()}`);
                        }
                    });
                    SplitTime.forEach(el => {
                        let ValueTime = parseInt(el);
                        let indexTime = SplitTime.indexOf(el);
                        if (indexTime == 0) {
                            Today.setHours(ValueTime);
                            console.log(`added hour: ${Today.toString()}`);
                        }
                        if (indexTime == 1) {
                            Today.setMinutes(ValueTime);
                            console.log(`added minutes: ${Today.toString()}`);
                        }
                    });
                    console.log("Done");
                }
            });
        }
        catch (e) {
            console.log("TO TIME FOUND, USING CURRENT TIME");
            Today.setSeconds(0);
            return Today.toString();
        }
        Today.setSeconds(0);
        return Today.toString();
    }
}
