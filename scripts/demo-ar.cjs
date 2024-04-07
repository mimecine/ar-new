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
    baseSiteUrl: `https://artistrooms.org/`,
    startUrl: `https://artistrooms.org/artists/`,
    filePath: "./ar-images/",
    concurrency: 10, //Maximum concurrent jobs. More than 10 is not recommended.Default is 3.
    maxRetries: 3, //The scraper will try to repeat a failed request few times(excluding 404). Default is 5.
    logPath: "./ar-logs/", //Highly recommended: Creates a friendly JSON for each operation object, with all the relevant data.
  };

  const scraper = new Scraper(config); //Create a new Scraper instance, and pass config to it.

  //Now we create the "operations" we need:

//   const root = new Root({
//     pagination: {
//       queryString: "q=artist%20rooms&time=past&type=event&page",
//       begin: 1,
//       end: 10,
//     },
//   }); //The root object fetches the startUrl, and starts the process.

  const root = new Root(); //The root object fetches the startUrl, and starts the process.

  //Any valid cheerio selector can be passed. For further reference: https://cheerio.js.org/
  const article = new OpenLinks('.o-teaser-listing-accordion__image a', {
    name: "artists",
  }); //Opens each artist page.

const title = new CollectContent("title", { name: "title" }); //"Collects" the text from each H1 element.
const featuredImage = new DownloadContent(".image-style-artist-image", {
     name: "featuredImage",
}); //Downloads images.

//   const image_caption = new CollectContent(".splash-header__image-caption", {
//     name: "image_caption",
//   }); //"Collects" the the article body.


//   const header = new CollectContent(".content__standfirst", { name: "header" }); //"Collects" the text from each H1 element.

//   const story = new CollectContent(".block-rich_text", { name: "story" }); //"Collects" the the article body.

  root.addOperation(article);
  article.addOperation(featuredImage);
//   article.addOperation(image_caption);
  article.addOperation(title);
//   article.addOperation(header);
//   article.addOperation(story);

  await scraper.scrape(root);

  const articles = article.getData(); //Will return an array of all article objects(from all categories), each
  //containing its "children"(titles,stories and the downloaded image urls)

  //If you just want to get the stories, do the same with the "story" variable:
//   const stories = story.getData();

  fs.writeFile("./ar-articles.json", JSON.stringify(articles), () => {}); //Will produce a formatted JSON containing all article pages and their selected data.

//   fs.writeFile("./ar-stories.json", JSON.stringify(stories), () => {});
})();
