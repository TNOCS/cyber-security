import fs from "fs";
import {IArticle} from "./iarticle";
import {IConfig} from "./iconfig";

export class Compare{

    public compareId(id: string) : boolean[] {

        let canScrape = true

        let isUpdated = false;

        const idTitle = id.split("/^/")[0];
        const idDate = id.split("/^/")[1];

    

        let data = fs.readFileSync(`data/baseline.json`, 'utf8');
        let obj : IArticle[]= JSON.parse(data);


        let containTitle = obj.filter(a => a.title == idTitle);
        if (containTitle.length > 0){
            isUpdated = this.updated(containTitle[0].date ,idDate);
            if(!isUpdated)
            { 
                canScrape = false; }
        }else{ 
            return [canScrape = true, isUpdated];}
       

         return [canScrape, isUpdated]
    }

    public updated(olddate: string, newdate: string): boolean{
        let isUpdated = false;
        
        let oldDate = new Date(olddate);
        let newDate = new Date(newdate);


        let dif = newDate.getTime() - oldDate.getTime();
        if ((dif/1000) > 3600){isUpdated = true}        
        
        return isUpdated;
    }

}
