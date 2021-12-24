
import puppeteer from 'puppeteer';
//const fs = require('fs');

//TEST CLASS

export class testClass {
  constructor() {};

  public async collectarticles() : Promise<void>{

      const devider = "------------------------------------------------------------------------------------------------------------------------------------------------------------";
      const delay = ( ms: any) => new Promise(res => setTimeout(res, ms));


      var data = Array();
      const browser = await puppeteer.launch({headless:false });
      const page = await browser.newPage();



      await page.goto('https://www.nu.nl/binnenland');

      delay(2000);

      console.log('t');
      
      await page.waitForNavigation();

      delay(3000);

      console.log('tesst');

      await page.goto('https://www.nu.nl/binnenland');
      //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

      delay(1000);

      

      //await page.evaluate(() => {
      //document.querySelector('button[type=submit]').click();   
      //return 
      //});

  //#region Load more Button

      const isElementVisible = async (page:any, cssSelector:any) => {
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
      
      let loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);

      console.log('load more test');
      
      while (loadMoreVisible && numberofloadmoreclicks < 4) {
        delay(1000);
        numberofloadmoreclicks++;
        //console.log(numberofloadmoreclicks)
        await page
            .click(selectorForLoadMoreButton)
            .catch(() => {});
        loadMoreVisible = await isElementVisible(page, selectorForLoadMoreButton);
      
  }
      console.log(numberofloadmoreclicks);
  


      // await page.waitForNavigation({
      //   waitUntil: 'networkidle0',
      // });

      //await page.waitForNavigation();

  //#endregion



  //#region Collect Hrefs from articles

  //await delay(4000);
  const hrefs1 = await page.evaluate(
      () => Array.from(
        document.querySelectorAll('[class="list list--thumb list--wide"] [data-type="article"]'),
        a => a.getAttribute('href')
      )
  );
  
  console.log(`${hrefs1.length-1} articles found...`);

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
}
}
