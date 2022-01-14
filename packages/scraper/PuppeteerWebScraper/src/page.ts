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

    

    public async LoadPage() : Promise<void>{

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
    
        let numberofLoadmoreClicks = 0;
          
        let loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
    
          
        while (loadMoreVisible && numberofLoadmoreClicks < 1) {
            numberofLoadmoreClicks++;
            await this.page
                .click(selectorForLoadMoreButton)
                .catch(() => {});
            loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
            await delay(2000);
          
        }
        
    }

    public async Collect(): Promise<(string| null)[]>{

        const Hrefs = await this.page.evaluate(
            () => Array.from(
              document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'),
              a => a.getAttribute('href')
            )
        );
        
        console.log(`${Hrefs.length-1} articles found...`);



        return Hrefs;
        
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

            let time = await this.page.$(TimeSelector);
            let timeUpdate = await this.page.evaluate(el => el.innerText, time);
            IdTime = this.TimeConverter(timeUpdate);
        } catch (e){
            IdTime = date.toString();
        }

        try {     
            const TitleSelector = Varobj.TitleSelector;
            await this.page.waitForSelector(TitleSelector, {timeout: 2000});

            let title = await this.page.$(TitleSelector);

            IdTitle= await this.page.evaluate(el => el.innerText, title);

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

        const pagelink = 'https://www.nu.nl'+href;

        await this.page.goto(pagelink);
        
        
        let articleVal : string;
        let timeVal : string;
        let titleVal : string;
        let authorVal : string;


        try{
            const ArticleContentSelector = Varobj.ArticleContentSelector;
            await this.page.waitForSelector(ArticleContentSelector, {timeout: 2000});
            console.log("ARTICLE FOUND");

            let article = await this.page.$(ArticleContentSelector);
            articleVal = await this.page.evaluate(el => el.innerText, article);
            

        } catch (e){
            articleVal = "NO ARTICLE FOUND";
        }


        try{
            const TimeSelector = Varobj.TimeSelector
            await this.page.waitForSelector(TimeSelector, {timeout: 2000});
            console.log("TIME FOUND");

            let time = await this.page.$(TimeSelector);
            let timeUpdate = await this.page.evaluate(el => el.innerText, time);
            timeVal = this.TimeConverter(timeUpdate);
        } catch (e){
            timeVal = "NO TIME FOUND";
        }




        try {
            const TitleSelector = Varobj.TitleSelector
            await this.page.waitForSelector(TitleSelector, {timeout: 2000});
            console.log("TITLE FOUND");

            let title = await this.page.$(TitleSelector);

            titleVal= await this.page.evaluate(el => el.innerText, title);

        } catch (e){
            titleVal = "NO TITLE FOUND";
        }


        try{
            const AuthorSelector = Varobj.AuthorSelector
            await this.page.waitForSelector(AuthorSelector, {timeout: 2000});
            console.log("AUTHOR FOUND");

            let author = await this.page.$(AuthorSelector);
            authorVal = await this.page.evaluate(el => el.innerText, author);

        } catch(e){
            authorVal = "NO AUTHOR FOUND"
        }
        
    
        let stringData = JSON.stringify({Id: id,link: pagelink,title: titleVal, author: authorVal, date: timeVal, content: articleVal});
        let completeData: IArticle = JSON.parse(stringData);

        return completeData;

    }

    public Update(data: IArticle, obj : IArticle[]){

        let item = obj.findIndex(a => a.link == data.link);

        obj[item] = data

        console.log(`this item has been updated: ${obj[item].link}`);

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


    // Here we turn a text to a date we use to determine the last update
    public TimeConverter(Time: string){


        let re = /(?<CompleteTime>(?<TimeVal>[0-9]+|een)\s(?<TimeUnit>dagen|uur|dag|minuten|minuut))|(?<CompleteDate>(?<DateDate>[0-9]+)-(?<DateMonth>[0-9]+)-(?<DateYear>[0-9]+)\s(?<DateHour>[0-9]+):(?<DateMinute>[0-9]+))/g
        

        const timeMatch = Time.match(re);

        let Today = new Date();

            try {
                timeMatch?.forEach(element => {

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