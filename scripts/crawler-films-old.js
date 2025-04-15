import fs from "node:fs";
import Crawler from "crawler";

const baseUrl = "https://artistrooms.org/films/";

const pages = [];
const seen = {};

const c = new Crawler({
  //maxConnections: 10,
  // This will be called for each crawled page
  callback: (error, res, done) => {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      console.log($("title").text());
    }
    done();
  },
});

c.queue([
  {
    uri: `${baseUrl}`,
    skipDuplicates: true,
    callback: (error, res, done) => {
      if (error) {
        console.log(error);
      } else {
        const $ = res.$;
        const baseUrl = new URL(res.options.uri);
        res.attrs = $("a[href]")
          .toArray()
          .map((el) => $(el).prop("href"));
        console.log($("title").text());
        $("a[href]")
          .toArray()
          .forEach(function (element) {
            const nextUrl = new URL($(element).prop("href"), baseUrl);
            if (
              nextUrl.pathname.indexOf(baseUrl.pathname) !== -1 &&
              !seen[nextUrl.pathname]
            ) {
              console.log(nextUrl.href, nextUrl.pathname);
              seen[nextUrl.pathname] = true;
              c.queue({
                uri: nextUrl.href,
                callback: (error, res, done) => {
                  if (error) {
                    console.log(error);
                  } else {
                    const $ = res.$;

                    let artists = $('.accordion__row').toArray()
                    .map(row => { 
                        return { 
                            artist: $('.js-accordion__header',row).first().text(), 
                            films: $('article',row).toArray()
                                .map(film=> { 
                                    return { 
                                        url: $('[data-video-url]',film).first().attr('data-video-url'), 
                                        title: $('h2',film).first().text() 
                                    } 
                                })
                        }
                    })
                    pages.push(artists);
                  }
                  done();
                },
              });
            }
          });
      }
      done();
    },
  },
]);

c.on("drain", () => {
  if (pages.length) console.log("x", pages.length);
  if (pages.length)
    fs.writeFileSync(
      "./scripts/pages-films.json",
      JSON.stringify(
        {artists:pages[0]},
        null,
        2
      )
    );
});
