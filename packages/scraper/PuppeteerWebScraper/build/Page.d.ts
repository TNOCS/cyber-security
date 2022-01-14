import puppeteer from 'puppeteer';
import { IArticle } from './iarticle';
export declare class Page {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
    constructor(b: puppeteer.Browser, p: puppeteer.Page);
    LoadPage(): Promise<void>;
    LoadArticles(): Promise<void>;
    Collect(): Promise<(string | null)[]>;
    GetId(href: (string | null)): Promise<(string)>;
    GetData(href: string | null, id: string): Promise<IArticle>;
    Update(data: IArticle, obj: IArticle[]): IArticle[];
    DeleteOldData(Obj: IArticle[]): IArticle[];
    TimeConverter(Time: string): string;
}
