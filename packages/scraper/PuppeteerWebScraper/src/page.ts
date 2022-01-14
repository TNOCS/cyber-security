import { TIMEOUT } from 'dns';
import puppeteer from 'puppeteer';
import { text } from 'stream/consumers';
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

    

    public async LoadPage(visible : boolean) : Promise<void>{

        const Var = fs.readFileSync(`src/config.json`, 'utf8');
        const Varobj:IConfig = JSON.parse(Var);

        const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));


        await this.page.goto(Varobj.Webpage);


       

        await delay(2000);

        try{
            const PopupSelector = Varobj.PopupSelector;
            await this.page.waitForSelector(PopupSelector, {timeout: 5000});
            await delay(2000);
            await this.page.click(PopupSelector);
        } catch(e){
            return;
        }

        console.log("Page is ready");

    }

    public async LoadArticles(): Promise<void>{

        const Var = fs.readFileSync(`src/config.json`, 'utf8');
        const Varobj:IConfig = JSON.parse(Var);

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
    
        const selectorForLoadMoreButton = Varobj.LoadMoreButton;
    
        let numberofloadmoreclicks = 0;
          
        let loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
    
          
        while (loadMoreVisible && numberofloadmoreclicks < 1) {
            numberofloadmoreclicks++;
            await this.page
                .click(selectorForLoadMoreButton)
                .catch(() => {});
            loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
            await delay(2000);
          
        }
        
    }

    public async Collect(): Promise<(string| null)[]>{

        const hrefs1 = await this.page.evaluate(
            () => Array.from(
              document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'),
              a => a.getAttribute('href')
            )
        );
        
        console.log(`${hrefs1.length-1} articles found...`);



        return hrefs1;
        
    }


    public async GetId(href: (string | null)): Promise<(string)>{

        const Var = fs.readFileSync(`src/config.json`, 'utf8');
        const Varobj:IConfig = JSON.parse(Var);
        
        const page = 'https://www.nu.nl'+href;

        let IdTime
        let IdTitle

        let date = new Date();

        await this.page.goto(page);

        try{
            
            const TimeSelector = Varobj.TimeSelector;
            await this.page.waitForSelector(TimeSelector, {timeout: 2000});

            let Time = await this.page.$(TimeSelector);
            let TimeUpdate = await this.page.evaluate(el => el.innerText, Time);
            IdTime = this.TimeConverter(TimeUpdate);
        } catch (e){
            IdTime = date.toString();
        }

        try {     
            const TitleSelector = Varobj.TitleSelector;
            await this.page.waitForSelector(TitleSelector, {timeout: 2000});

            let Title = await this.page.$(TitleSelector);

            IdTitle= await this.page.evaluate(el => el.innerText, Title);

        } catch (e){
            IdTitle = "NO TITLE FOUND";
        }

        const id = IdTitle+"/^/"+IdTime;

        
        return id
    }


    public async GetData(href : string | null, id : string): Promise<IArticle>{

        const Var = fs.readFileSync(`src/config.json`, 'utf8');
        const Varobj:IConfig = JSON.parse(Var);

        console.log(`Extracting from: ${href}`);

        var data = Array();

        const pagelink = 'https://www.nu.nl'+href;

        await this.page.goto(pagelink);
        
        
        let Articleval : string;
        let Timeval : string;
        let Titleval : string;
        let Authorval : string;


        try{
            const ArticleContentSelector = Varobj.ArticleContentSelector;
            await this.page.waitForSelector(ArticleContentSelector, {timeout: 2000});
            console.log("ARTICLE FOUND");

            let Article = await this.page.$(ArticleContentSelector);
            Articleval = await this.page.evaluate(el => el.innerText, Article);
            

        } catch (e){
            Articleval = "NO ARTICLE FOUND";
        }


        try{
            const TimeSelector = Varobj.TimeSelector
            await this.page.waitForSelector(TimeSelector, {timeout: 2000});
            console.log("TIME FOUND");

            let Time = await this.page.$(TimeSelector);
            let TimeUpdate = await this.page.evaluate(el => el.innerText, Time);
            Timeval = this.TimeConverter(TimeUpdate);
        } catch (e){
            Timeval = "NO TIME FOUND";
        }




        try {
            const TitleSelector = Varobj.TitleSelector
            await this.page.waitForSelector(TitleSelector, {timeout: 2000});
            console.log("TITLE FOUND");

            let Title = await this.page.$(TitleSelector);

            Titleval= await this.page.evaluate(el => el.innerText, Title);

        } catch (e){
            Titleval = "NO TITLE FOUND";
        }


        try{
            const AuthorSelector = Varobj.AuthorSelector
            await this.page.waitForSelector(AuthorSelector, {timeout: 2000});
            console.log("AUTHOR FOUND");

            let Author = await this.page.$(AuthorSelector);
            Authorval = await this.page.evaluate(el => el.innerText, Author);

        } catch(e){
            Authorval = "NO AUTHOR FOUND"
        }
        
    
        let stringdata = JSON.stringify({Id: id,link: pagelink,title: Titleval, author: Authorval, date: Timeval, content: Articleval});
        let completedata: IArticle = JSON.parse(stringdata);

        return completedata;

    }

    public Update(data: IArticle, obj : IArticle[]){

        let Item = obj.findIndex(a => a.link == data.link);

        obj[Item] = data

        console.log(`this item has been updated: ${obj[Item].link}`);

        return obj;
    } 

    public DeleteOldData(Obj:IArticle[]){

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

    public TimeConverter(Time: string){


        let re = /(?<CompleteTime>(?<TimeVal>[0-9]+|een)\s(?<TimeUnit>dagen|uur|dag|minuten|minuut))|(?<CompleteDate>(?<DateDate>[0-9]+)-(?<DateMonth>[0-9]+)-(?<DateYear>[0-9]+)\s(?<DateHour>[0-9]+):(?<DateMinute>[0-9]+))/g
        

        const TimeMatch = Time.match(re);
        let TimeGroups = Time.matchAll(re);

        let Today = new Date();

            try {
                TimeMatch?.forEach(element => {

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

                        if (SplitHour[0] == "een"){
                            ValueHour = 1;
                        }else{
                            ValueHour = parseInt(SplitHour[0]);
                        }
                        

                        Today.setHours(Today.getHours() - ValueHour);
                    }

                    else if (MinuteConditions.some(el => element.includes(el))){
                        let SplitMinute = element.split(" ");

                        let ValueMinute = parseInt(SplitMinute[0]);  

                        Today.setMinutes(Today.getMinutes() - ValueMinute);
                    }

                    else if (FullDateConditions.some(el => element.includes(el))){
                        let SplitDatetime = element.split(" ");
                        let SplitDate = SplitDatetime[0].split("-");
                        let SplitTime = SplitDatetime[1].split(":");
          
                        SplitDate.forEach(element => {
                            let ValueDate = parseInt(element);
                            let indexDate = SplitDate.indexOf(element);
                            

                            if (indexDate == 0){
                                Today.setDate(ValueDate);
                                console.log(`added date: ${Today.toString()}` );      
                            }else if (indexDate == 1){
                                Today.setMonth(ValueDate-1);
                                console.log(`added month: ${Today.toString()}` );
                            }else if (indexDate == 2){
                                Today.setFullYear(2000+ValueDate);
                                console.log(`added year: ${Today.toString()}` );
                            }
                        });


                        SplitTime.forEach(el => {
                            let ValueTime = parseInt(el);
                            let indexTime = SplitTime.indexOf(el);
                            
                            if (indexTime == 0){
                                Today.setHours(ValueTime);
                                console.log(`added hour: ${Today.toString()}` );
                            }if (indexTime == 1){
                                Today.setMinutes(ValueTime);
                                console.log(`added minutes: ${Today.toString()}` );
                            }
                        })

                        console.log("Done");

                    }
                   
                });
            } catch(e){
                console.log("TO TIME FOUND, USING CURRENT TIME");
                Today.setSeconds(0);
                return Today.toString();
            }
        
        Today.setSeconds(0);
        return Today.toString();

    } 
}