import fetch from "node-fetch";
import Cheerio from "cheerio";

export class Scraper {
    public URL: string;
    public Scraped: string;

    constructor(url: string) {
        this.URL = url;
    }

    async Scrape() {
        const Fetched = await fetch("https://wouldurather.io/", {

        });

        this.Scraped = await Fetched.text();
        return Cheerio.load(this.Scraped);
    }

    async GetId(Id: string) {
        const Scraped = await this.Scrape();
        return Scraped.root().attr("id", Id).text();
    }

    async GetClassName(Name: string) {
        const Scraped = await this.Scrape();
        return Scraped.root().attr("class", Name).text();
    }
}