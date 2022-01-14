import fs from "fs";
import {IArticle} from "./iarticle";
import {IConfig} from "./iconfig";

export class Compare{

    public CompareId(id: string) : boolean[] {

        let canscrape = true

        let isUpdated = false;

        const Idtitle = id.split("/^/")[0];
        const Iddate = id.split("/^/")[1];

    

        let data = fs.readFileSync(`data/baseline.json`, 'utf8');
        let obj : IArticle[]= JSON.parse(data);


        let containTitle = obj.filter(a => a.title == Idtitle);
        if (containTitle.length > 0){
            isUpdated = this.Updated(containTitle[0].date ,Iddate);
            if(!isUpdated)
            { 
                canscrape = false; }
        }else{ 
            return [canscrape = true, isUpdated];}
       

         return [canscrape, isUpdated]
    }

    public Updated(olddate: string, newdate: string): boolean{
        let isUpdated = false;
        
        let oldDate = new Date(olddate);
        let newDate = new Date(newdate);


        let dif = newDate.getTime() - oldDate.getTime();
        if ((dif/1000) > 3600){isUpdated = true}        
        
        return isUpdated;
    }

}
