const request = require("request");
const cheerio = require("cheerio");

const start = "https://artistrooms.org/artists/";

function crawl(url, callback, options ) {
    options = options || {cache:{}};
  if (options.cache[url]) {
    return;
  }
  options.cache[url] = url;
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);
      callback($, options);
    }
  });
}

// Start the crawler
crawl("https://artistrooms.org/artists/", ($,options = {cache:{}} ) => {

  const links = $("a[href*='artists/']").map((i, link) => $(link).prop("href"));

  console.log($("title").text(), links.length);

  links.each((i, link) => {
    const absoluteUrl = new URL(link,'https://artistrooms.org/');
    console.log(absoluteUrl.href, $("title").text());

    // Check if the URL is on the same domain
    if (absoluteUrl.hostname === new URL(options.cache.url).hostname) {
      crawl(absoluteUrl.href, ($) => {
        console.log($("title").text());
      }, options);
    }
  });
});
