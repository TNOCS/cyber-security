import { TIMEOUT } from 'dns';
import puppeteer from 'puppeteer';
import { text } from 'stream/consumers';
import { Article } from './article';

export class Page{

    public browser: puppeteer.Browser;
    public page: puppeteer.Page;


    constructor(b:puppeteer.Browser, p:puppeteer.Page){
        this.browser = b;
        this.page = p;

    };

    public async LoadPage(visible : boolean) : Promise<void>{

        const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));

        //browser = await puppeteer.launch({headless:false});
        //page = await browser.newPage();

        //let Pages = await this.browser.pages();

        //console.log(Pages);
  
  
        await this.page.goto('https://www.nu.nl/binnenland');
  
        

        //const frames = await this.page.frames();

        //frames.forEach(eachframe => {
        //    console.log(`${eachframe}`);
        //});
        

        //await this.page.waitForSelector('[class="message-component message-button no-children focusable pg-accept-button sp_choice_type_11"]');
        

        //await this.page.click('[class="message-component message-button no-children focusable pg-accept-button sp_choice_type_11"]');

        
        //await this.page.waitForNavigation();

       

        await delay(2000);

        try{
            const PopupSelector = '[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]';
            await this.page.waitForSelector(PopupSelector, {timeout: 5000});
            await delay(2000);
            await this.page.click(PopupSelector);
        } catch(e){
            return;
        }

        
  

        //const Xbutton = await page.evaluate( () => document.querySelector('[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]') as HTMLElement);

       
        

        //await page.waitForSelector('[class="overlay webpush-popup active"] [class="fa fa-times overlay-close trackevent"]');
  
        //await page.goto('https://www.nu.nl/binnenland');
        //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  
        //await delay(1000);

        console.log("Page is ready");

    }

    public async LoadArticles(): Promise<void>{

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
    
    
        const selectorForLoadMoreButton = '[href="JavaScript:void(0)"]';
        const articleSelector = '[class="list list--thumb list--wide"] [data-type="article"]';
    
        let numberofloadmoreclicks = 0;
          
        let loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
    
          
        while (loadMoreVisible && numberofloadmoreclicks < 1) {
            numberofloadmoreclicks++;
            //console.log(numberofloadmoreclicks)
            await this.page
                .click(selectorForLoadMoreButton)
                .catch(() => {});
            loadMoreVisible = await isElementVisible(this.page, selectorForLoadMoreButton);
            await delay(2000);
          
        }

        

        //await this.page.waitForNavigation({waitUntil:"domcontentloaded"});

        

        //this.browser.close();
      
    
    
          // await page.waitForNavigation({
          //   waitUntil: 'networkidle0',
          // });
    
          //await page.waitForNavigation();
        
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
        
        const page = 'https://www.nu.nl'+href;

        let IdTime
        let IdTitle

        let date = new Date();

        await this.page.goto(page);

        try{
            
            await this.page.waitForSelector('[data-type="article.header"] [class="update small"]', {timeout: 2000});

            let Time = await this.page.$('[data-type="article.header"] [class="update small"]');
            let TimeUpdate = await this.page.evaluate(el => el.innerText, Time);
            IdTime = this.TimeConverter(TimeUpdate);
        } catch (e){
            IdTime = date.toString();
        }

        try {     
            await this.page.waitForSelector('[data-type="article.header"] [class="title fluid"]', {timeout: 2000});

            let Title = await this.page.$('[data-type="article.header"] [class="title fluid"]');

            IdTitle= await this.page.evaluate(el => el.innerText, Title);

        } catch (e){
            IdTitle = "NO TITLE FOUND";
        }

        const id = IdTitle+"/^/"+IdTime;

        
        return id
    }

    // article [data-type="article.body"] [class="block-wrapper"]

    // title [data-type="article.header"] [class="block-wrapper section-nu"] [class="title fluid"]

    // time [data-type="article.header"] [class="block-wrapper section-nu"] [class="pubdate small"]

    // author [data-type="article.footer"] [class="author"]

    public async GetData(href : string | null, id : string): Promise<Article>{

        console.log(`Extracting from: ${href}`);

        var data = Array();

        const pagelink = 'https://www.nu.nl'+href;

        await this.page.goto(pagelink);
        
        
        let Articleval : string;
        let Timeval : string;
        let Titleval : string;
        let Authorval : string;

        //let Imgtitle = await this.page.$('[class="headerimage__image"]');

        

        try{
            
            await this.page.waitForSelector('[data-type="article.body"] [class="block-wrapper"]', {timeout: 2000});
            console.log("ARTICLE FOUND");

            let Article = await this.page.$('[data-type="article.body"] [class="block-wrapper"]');
            Articleval = await this.page.evaluate(el => el.innerText, Article);
            

        } catch (e){
            Articleval = "NO ARTICLE FOUND";
        }


        try{
            
            await this.page.waitForSelector('[data-type="article.header"] [class="update small"]', {timeout: 2000});
            console.log("Id Time FOUND");

            let Time = await this.page.$('[data-type="article.header"] [class="update small"]');
            let TimeUpdate = await this.page.evaluate(el => el.innerText, Time);
            Timeval = this.TimeConverter(TimeUpdate);
        } catch (e){
            Timeval = "NO TIME FOUND";
        }




        try {
            
            await this.page.waitForSelector('[data-type="article.header"] [class="title fluid"]', {timeout: 2000});
            console.log("TITLE FOUND");

            let Title = await this.page.$('[data-type="article.header"] [class="title fluid"]');

            Titleval= await this.page.evaluate(el => el.innerText, Title);

        } catch (e){
            Titleval = "NO TITLE FOUND";
        }


        try{
            
            await this.page.waitForSelector('[data-type="article.footer"] [class="author"]', {timeout: 2000});
            console.log("AUTHOR FOUND");

            let Author = await this.page.$('[data-type="article.footer"] [class="author"]');
            Authorval = await this.page.evaluate(el => el.innerText, Author);

        } catch(e){
            Authorval = "NO AUTHOR FOUND"
        }
        

        //console.log(data[0]);
    
        let stringdata = JSON.stringify({Id: id,link: pagelink,title: Titleval, author: Authorval, date: Timeval, content: Articleval});
        let completedata: Article = JSON.parse(stringdata);

        //let completedataobj = 
        return completedata;

    }

    public Update(data: Article, obj : Article[]){

        let Item = obj.findIndex(a => a.link == data.link);

        //console.log(`${obj[Item].author,obj[Item].content,obj[Item].date,obj[Item].link, obj[Item].title}`)

        obj[Item] = data

        console.log(`this item has been updated: ${obj[Item].link}`);

        return obj;


    } 

    public TimeConverter(Time: string){

        //Time to lowercase??

        //let re = /([0-9]+|een)\s(dagen|uur|dag|minuten|minuut)/g

        let re = /(?<CompleteTime>(?<TimeVal>[0-9]+|een)\s(?<TimeUnit>dagen|uur|dag|minuten|minuut))|(?<CompleteDate>(?<DateDate>[0-9]+)-(?<DateMonth>[0-9]+)-(?<DateYear>[0-9]+)\s(?<DateHour>[0-9]+):(?<DateMinute>[0-9]+))/g
        

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