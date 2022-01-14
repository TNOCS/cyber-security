var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
export class Page {
    constructor(b, p) {
        this.browser = b;
        this.page = p;
    }
    ;
    LoadPage(visible) {
        return __awaiter(this, void 0, void 0, function* () {
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            yield this.page.goto(Varobj.Webpage);
            yield delay(2000);
            try {
                const PopupSelector = Varobj.PopupSelector;
                yield this.page.waitForSelector(PopupSelector, { timeout: 5000 });
                yield delay(2000);
                yield this.page.click(PopupSelector);
            }
            catch (e) {
                return;
            }
            console.log("Page is ready");
        });
    }
    LoadArticles() {
        return __awaiter(this, void 0, void 0, function* () {
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
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
            const selectorForLoadMoreButton = Varobj.LoadMoreButton;
            let numberofloadmoreclicks = 0;
            let loadMoreVisible = yield isElementVisible(this.page, selectorForLoadMoreButton);
            while (loadMoreVisible && numberofloadmoreclicks < 1) {
                numberofloadmoreclicks++;
                yield this.page
                    .click(selectorForLoadMoreButton)
                    .catch(() => { });
                loadMoreVisible = yield isElementVisible(this.page, selectorForLoadMoreButton);
                yield delay(2000);
            }
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
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
            const page = 'https://www.nu.nl' + href;
            let IdTime;
            let IdTitle;
            let date = new Date();
            yield this.page.goto(page);
            try {
                const TimeSelector = Varobj.TimeSelector;
                yield this.page.waitForSelector(TimeSelector, { timeout: 2000 });
                let Time = yield this.page.$(TimeSelector);
                let TimeUpdate = yield this.page.evaluate(el => el.innerText, Time);
                IdTime = this.TimeConverter(TimeUpdate);
            }
            catch (e) {
                IdTime = date.toString();
            }
            try {
                const TitleSelector = Varobj.TitleSelector;
                yield this.page.waitForSelector(TitleSelector, { timeout: 2000 });
                let Title = yield this.page.$(TitleSelector);
                IdTitle = yield this.page.evaluate(el => el.innerText, Title);
            }
            catch (e) {
                IdTitle = "NO TITLE FOUND";
            }
            const id = IdTitle + "/^/" + IdTime;
            return id;
        });
    }
    GetData(href, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const Var = fs.readFileSync(`src/config.json`, 'utf8');
            const Varobj = JSON.parse(Var);
            console.log(`Extracting from: ${href}`);
            var data = Array();
            const pagelink = 'https://www.nu.nl' + href;
            yield this.page.goto(pagelink);
            let Articleval;
            let Timeval;
            let Titleval;
            let Authorval;
            try {
                const ArticleContentSelector = Varobj.ArticleContentSelector;
                yield this.page.waitForSelector(ArticleContentSelector, { timeout: 2000 });
                console.log("ARTICLE FOUND");
                let Article = yield this.page.$(ArticleContentSelector);
                Articleval = yield this.page.evaluate(el => el.innerText, Article);
            }
            catch (e) {
                Articleval = "NO ARTICLE FOUND";
            }
            try {
                const TimeSelector = Varobj.TimeSelector;
                yield this.page.waitForSelector(TimeSelector, { timeout: 2000 });
                console.log("TIME FOUND");
                let Time = yield this.page.$(TimeSelector);
                let TimeUpdate = yield this.page.evaluate(el => el.innerText, Time);
                Timeval = this.TimeConverter(TimeUpdate);
            }
            catch (e) {
                Timeval = "NO TIME FOUND";
            }
            try {
                const TitleSelector = Varobj.TitleSelector;
                yield this.page.waitForSelector(TitleSelector, { timeout: 2000 });
                console.log("TITLE FOUND");
                let Title = yield this.page.$(TitleSelector);
                Titleval = yield this.page.evaluate(el => el.innerText, Title);
            }
            catch (e) {
                Titleval = "NO TITLE FOUND";
            }
            try {
                const AuthorSelector = Varobj.AuthorSelector;
                yield this.page.waitForSelector(AuthorSelector, { timeout: 2000 });
                console.log("AUTHOR FOUND");
                let Author = yield this.page.$(AuthorSelector);
                Authorval = yield this.page.evaluate(el => el.innerText, Author);
            }
            catch (e) {
                Authorval = "NO AUTHOR FOUND";
            }
            let stringdata = JSON.stringify({ Id: id, link: pagelink, title: Titleval, author: Authorval, date: Timeval, content: Articleval });
            let completedata = JSON.parse(stringdata);
            return completedata;
        });
    }
    Update(data, obj) {
        let Item = obj.findIndex(a => a.link == data.link);
        obj[Item] = data;
        console.log(`this item has been updated: ${obj[Item].link}`);
        return obj;
    }
    DeleteOldData(Obj) {
        for (let index = 0; index < Obj.length; index++) {
            const element = Obj[index];
            let date = new Date(element.date);
            let today = new Date();
            let dif = today.getTime() - date.getTime();
            dif = (dif) / (1000 * 60 * 60 * 24);
            if (dif > 15) {
                Obj.splice(index, 1);
            }
        }
        return Obj;
    }
    TimeConverter(Time) {
        let re = /(?<CompleteTime>(?<TimeVal>[0-9]+|een)\s(?<TimeUnit>dagen|uur|dag|minuten|minuut))|(?<CompleteDate>(?<DateDate>[0-9]+)-(?<DateMonth>[0-9]+)-(?<DateYear>[0-9]+)\s(?<DateHour>[0-9]+):(?<DateMinute>[0-9]+))/g;
        const TimeMatch = Time.match(re);
        let TimeGroups = Time.matchAll(re);
        let Today = new Date();
        try {
            TimeMatch === null || TimeMatch === void 0 ? void 0 : TimeMatch.forEach(element => {
                const DayConditions = ["dagen", "dag"];
                const HourConditions = ["uur"];
                const MinuteConditions = ["minuut", "minuten"];
                const FullDateConditions = ["-", ":"];
                if (DayConditions.some(el => element.includes(el))) {
                    let SplitDay = element.split(" ");
                    let ValueDay = parseInt(SplitDay[0]);
                    Today.setDate(Today.getDate() - ValueDay);
                }
                else if (HourConditions.some(el => element.includes(el))) {
                    let SplitHour = element.split(" ");
                    let ValueHour = 0;
                    if (SplitHour[0] == "een") {
                        ValueHour = 1;
                    }
                    else {
                        ValueHour = parseInt(SplitHour[0]);
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
