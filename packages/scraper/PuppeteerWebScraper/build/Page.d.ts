import puppeteer from 'puppeteer';
export declare class Page {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
    constructor(b: puppeteer.Browser, p: puppeteer.Page);
    LoadPage(): Promise<void>;
    LoadArticles(): Promise<void>;
    GetId(): Promise<(string | null)[]>;
    GetData(href: string | null): Promise<string>;
    TimeConverter(Time: string): string;
}
