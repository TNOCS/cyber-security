import puppeteer from 'puppeteer';
import { IArticle } from './iarticle';
import { IConfig } from './iconfig';
import fs from "fs";

export class Page{

    public browser: puppeteer.Browser;
    public page: puppeteer.Page;


    constructor(b:puppeteer.Browser, p:puppeteer.Page){
        this.browser = b;
        this.page = p;

    };

    

    public async loadPage() : Promise<void>{

        const readFile = fs.readFileSync(`src/config.json`, 'utf8');
        const varObj:IConfig = JSON.parse(readFile);

        const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));


        await this.page.goto(varObj.webpage);

        await delay(2000);

        try{
            const popupSelector = varObj.popupSelector;
            await this.page.waitForSelector(popupSelector, {timeout: 5000});
            await delay(2000);
            await this.page.click(popupSelector);

        } catch(e){
            return;
        }

        console.log("Page is ready");

    }

    public async loadArticles(): Promise<void>{

        const readFile = fs.readFileSync(`src/config.json`, 'utf8');
        const varObj:IConfig = JSON.parse(readFile);

        const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));
        
        const isElementVisible = async (page:puppeteer.Page, cssSelector:string) => {
            let visible = true;
            await page
                .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
                .catch(() => {
                    visible = false;
                });
            return visible;
            };
    
        const selectorForLoadMoreButton = varObj.loadMoreButton;
    
        let numberOfLoadmoreClicks = 0;
          
        let loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
    
          
        while (loadMoreVisible && numberOfLoadmoreClicks < 1) {
            numberOfLoadmoreClicks++;
            await this.page
                .click(selectorForLoadMoreButton)
                .catch(() => {});
            loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
            await delay(2000);
          
        }
        
    }

    public async collect(): Promise<(string| null)[]>{

        const hrefs = await this.page.evaluate(
            () => Array.from(
              document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'),
              a => a.getAttribute('href')
            )
        );
        
        console.log(`${hrefs.length-1} articles found...`);



        return hrefs;
        
    }

    public async getId(href: (string | null)): Promise<(string)>{

        const readFile = fs.readFileSync(`src/config.json`, 'utf8');
        const varObj:IConfig = JSON.parse(readFile);
        
        const page = 'https://www.nu.nl'+href;

        let idTime
        let idTitle

        let date = new Date();

        await this.page.goto(page);

        try{
            
            const timeSelector = varObj.timeSelector;
            await this.page.waitForSelector(timeSelector, {timeout: 2000});

            let time = await this.page.$(timeSelector);
            let timeUpdate = await this.page.evaluate(el => el.innerText, time);
            idTime = this.timeConverter(timeUpdate);
        } catch (e){
            idTime = date.toString();
        }

        try {     
            const titleSelector = varObj.titleSelector;
            await this.page.waitForSelector(titleSelector, {timeout: 2000});

            let title = await this.page.$(titleSelector);

            idTitle= await this.page.evaluate(el => el.innerText, title);

        } catch (e){
            idTitle = "NO TITLE FOUND";
        }

        const id = idTitle+"/^/"+idTime;

        
        return id
    }

    public async getData(href : string | null, id : string): Promise<IArticle>{

        const readFile = fs.readFileSync(`src/config.json`, 'utf8');
        const varObj:IConfig = JSON.parse(readFile);

        console.log(`Extracting from: ${href}`);

        const pageLink = 'https://www.nu.nl'+href;

        await this.page.goto(pageLink);
        
        
        let articleVal : string;
        let timeVal : string;
        let titleVal : string;
        let authorVal : string;


        try{
            const articleContentSelector = varObj.articleContentSelector;
            await this.page.waitForSelector(articleContentSelector, {timeout: 2000});
            console.log("ARTICLE FOUND");

            let article = await this.page.$(articleContentSelector);
            articleVal = await this.page.evaluate(el => el.innerText, article);
            

        } catch (e){
            articleVal = "NO ARTICLE FOUND";
        }


        try{
            const timeSelector = varObj.timeSelector
            await this.page.waitForSelector(timeSelector, {timeout: 2000});
            console.log("TIME FOUND");

            let time = await this.page.$(timeSelector);
            let timeUpdate = await this.page.evaluate(el => el.innerText, time);
            timeVal = this.timeConverter(timeUpdate);
        } catch (e){
            timeVal = "NO TIME FOUND";
        }




        try {
            const titleSelector = varObj.titleSelector
            await this.page.waitForSelector(titleSelector, {timeout: 2000});
            console.log("TITLE FOUND");

            let title = await this.page.$(titleSelector);

            titleVal= await this.page.evaluate(el => el.innerText, title);

        } catch (e){
            titleVal = "NO TITLE FOUND";
        }


        try{
            const authorSelector = varObj.authorSelector
            await this.page.waitForSelector(authorSelector, {timeout: 2000});
            console.log("AUTHOR FOUND");

            let author = await this.page.$(authorSelector);
            authorVal = await this.page.evaluate(el => el.innerText, author);

        } catch(e){
            authorVal = "NO AUTHOR FOUND"
        }
        
    
        let stringData = JSON.stringify({Id: id,link: pageLink,title: titleVal, author: authorVal, date: timeVal, content: articleVal});
        let completeData: IArticle = JSON.parse(stringData);

        return completeData;

    }

    public update(data: IArticle, obj : IArticle[]){

        let item = obj.findIndex(a => a.link == data.link);

        obj[item] = data

        console.log(`this item has been updated: ${obj[item].link}`);

        return obj;
    } 

    public deleteOldData(Obj:IArticle[]){

        for (let index = 0; index < Obj.length; index++) {
            const element = Obj[index];

            let date = new Date(element.date)
            let today = new Date();

            let dif = today.getTime()- date.getTime();
            dif = (dif)/(1000*60*60*24);
            if (dif > 15){
                Obj.splice(index, 1);
                
            }
        }
        return Obj

        
    }


    // Here we turn a text to a date we use to determine the last update
    public timeConverter(time: string){


        let re = /(?<completeTime>(?<timeVal>[0-9]+|een)\s(?<timeUnit>dagen|uur|dag|minuten|minuut))|(?<completeDate>(?<dateDate>[0-9]+)-(?<dateMonth>[0-9]+)-(?<dateYear>[0-9]+)\s(?<dateHour>[0-9]+):(?<dateMinute>[0-9]+))/g
        

        const timeMatch = time.match(re);

        let today = new Date();

            try {
                timeMatch?.forEach(element => {

                    const dayConditions = ["dagen", "dag"];
                    const hourConditions = ["uur"];
                    const minuteConditions = ["minuut", "minuten"];

                    const fullDateConditions = ["-", ":"];
 
                    if (dayConditions.some(el => element.includes(el))) {
                        let splitDay = element.split(" ");
                        
                        let valueDay = parseInt(splitDay[0]);                  


                        today.setDate(today.getDate() - valueDay);
                    }

                    else if (hourConditions.some(el => element.includes(el))) {
                        let splitHour = element.split(" ");
                        let valueHour = 0;

                        if (splitHour[0] == "een"){
                            valueHour = 1;
                        }else{
                            valueHour = parseInt(splitHour[0]);
                        }
                        

                        today.setHours(today.getHours() - valueHour);
                    }

                    else if (minuteConditions.some(el => element.includes(el))){
                        let splitMinute = element.split(" ");

                        let valueMinute = parseInt(splitMinute[0]);  

                        today.setMinutes(today.getMinutes() - valueMinute);
                    }

                    else if (fullDateConditions.some(el => element.includes(el))){
                        let splitDatetime = element.split(" ");
                        let splitDate = splitDatetime[0].split("-");
                        let splitTime = splitDatetime[1].split(":");
          
                        splitDate.forEach(element => {
                            let valueDate = parseInt(element);
                            let indexDate = splitDate.indexOf(element);
                            

                            if (indexDate == 0){
                                today.setDate(valueDate);
                                console.log(`added date: ${today.toString()}` );      
                            }else if (indexDate == 1){
                                today.setMonth(valueDate-1);
                                console.log(`added month: ${today.toString()}` );
                            }else if (indexDate == 2){
                                today.setFullYear(2000+valueDate);
                                console.log(`added year: ${today.toString()}` );
                            }
                        });


                        splitTime.forEach(el => {
                            let valueTime = parseInt(el);
                            let indexTime = splitTime.indexOf(el);
                            
                            if (indexTime == 0){
                                today.setHours(valueTime);
                                console.log(`added hour: ${today.toString()}` );
                            }if (indexTime == 1){
                                today.setMinutes(valueTime);
                                console.log(`added minutes: ${today.toString()}` );
                            }
                        })

                        console.log("Done");

                    }
                   
                });
            } catch(e){
                console.log("TO TIME FOUND, USING CURRENT TIME");
                today.setSeconds(0);
                return today.toString();
            }
        
            today.setSeconds(0);
        return today.toString();

    } 
}