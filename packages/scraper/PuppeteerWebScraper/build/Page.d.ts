import puppeteer from 'puppeteer';
import { Article } from './article';
export declare class Page {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
    constructor(b: puppeteer.Browser, p: puppeteer.Page);
    LoadPage(visible: boolean): Promise<void>;
    LoadArticles(): Promise<void>;
    Collect(): Promise<(string | null)[]>;
    GetId(href: (string | null)): Promise<(string)>;
    GetData(href: string | null, id: string): Promise<Article>;
    Update(data: Article, obj: Article[]): Article[];
    TimeConverter(Time: string): string;
}
