const {
  Scraper,
  Root,
  DownloadContent,
  OpenLinks,
  CollectContent,
} = require("nodejs-web-scraper");
const fs = require("fs");

(async () => {
  const config = {
    baseSiteUrl: `https://kioskkiosk.com/`,
    startUrl: `https://kioskkiosk.com/`,
    filePath: "./kiosk-images/",
    concurrency: 10, //Maximum concurrent jobs. More than 10 is not recommended.Default is 3.
    maxRetries: 3, //The scraper will try to repeat a failed request few times(excluding 404). Default is 5.
    logPath: "./kiosk-logs/", //Highly recommended: Creates a friendly JSON for each operation object, with all the relevant data.
  };

  const scraper = new Scraper(config); //Create a new Scraper instance, and pass config to it.

  //Now we create the "operations" we need:

  const root = new Root(); //The root object fetches the startUrl, and starts the process.

  //Any valid cheerio selector can be passed. For further reference: https://cheerio.js.org/
  const article = new OpenLinks(
    ".grid-view-item__link.grid-view-item__image-container",
    { name: "article" }
  ); //Opens each room page.

  const image = new DownloadContent(".product-featured-img", { name: "image" }); //Downloads images.

  const title = new CollectContent(".product-single__title", { name: "title" }); //"Collects" the text from each H1 element.

  const story = new CollectContent(".product-single__description", {
    name: "story",
  }); //"Collects" the the article body.


  root.addOperation(article);
  article.addOperation(image);
  article.addOperation(title);
  article.addOperation(story);

//const images = new DownloadContent("img");

//root.addOperation(images);

  await scraper.scrape(root);

  const articles = article.getData(); //Will return an array of all article objects(from all categories), each
  //containing its "children"(titles,stories and the downloaded image urls)

  //If you just want to get the stories, do the same with the "story" variable:
  const stories = story.getData();

  fs.writeFile("./kiosk-articles.json", JSON.stringify(articles), () => {}); //Will produce a formatted JSON containing all article pages and their selected data.

  fs.writeFile("./kiosk-stories.json", JSON.stringify(stories), () => {});
})();
