import fs from "node:fs";
import Crawler from "crawler";

const baseUrl = "https://artistrooms.org/artists/";

const pages = [];
const seen = {};

const c = new Crawler({
  //maxConnections: 10,
  // This will be called for each crawled page
  callback: (error, res, done) => {
    if (error) {
      console.error(error);
    } else {
      const $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      // console.log($("title").text());
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
        console.error(error);
      } else {
        const $ = res.$;
        const baseUrl = new URL(res.options.uri);
        res.attrs = $("a[href]")
          .toArray()
          .map((el) => $(el).prop("href"));
        // console.log($("title").text());
        $("a[href]")
          .toArray()
          .forEach(function (element) {
            const nextUrl = new URL($(element).prop("href"), baseUrl);
            if (
              nextUrl.pathname.indexOf(baseUrl.pathname) !== -1 &&
              !seen[nextUrl.href]
            ) {
              seen[nextUrl.href] = true;
              c.queue({
                uri: nextUrl.href,
                callback: (error, res, done) => {
                  if (error) {
                    console.error(error);
                  } else {
                    const $ = res.$;

                    const title = $("h1").first().text();
                    const body = $(".o-default__content--about p")
                      .map(function () {
                        return $(this).text();
                      })
                      .toArray()
                      .join("\n\n");
                    const about = $(".o-default__content--about p").text();
                    const featuredImage = $(".o-artist__image img")
                      .first()
                      .attr("src");
                    const resources = $(".a-file__item")
                      .toArray()
                      .map((a) => $(a).attr('href'));

                    const works = $("article.o-gallery-image.o-teaser-modal")
                      .toArray()
                      .map((el) => {
                        const node_id = $(el).data("node-id");
                        const category_id = $(
                          `[data-node-id="${node_id}"] .gallery-image-teaser`
                        )
                          .first()
                          .data("category-id");

                        const category = $(
                          `[data-category-id="${category_id}"]`
                        )
                          .first()
                          .text();
                        const inventorynumber = $(el)
                          .attr("about")
                          .split("/")
                          .pop().toUpperCase();
                        const title = $("h2", el).first().text();
                        // subtitle -- abandoning for the moment as too messy to extract from source doc
                        const info = $("p.info", el).first().text();
                        const year = [title,info].join().match(/\d{4}/)?.slice(0)[0]; 
                        const credit = $(".details p", el)
                          .map(function () {
                            return $(this).text().replace(new RegExp(`#?${inventorynumber}`,"ig"), "").trim();
                          })
                          .toArray()
                          .join("\n\n");
                        const src = $("img", el).first().attr("src");

                        return {
                          inventorynumber,
                          node_id,
                          category_id,
                          category,
                          title,
                          info,
                          year,
                          credit,
                          src,
                        };
                      })
                      .filter((work) => work.title.length);
                    pages.push({
                      title,
                      body,
                      featuredImage,
                      resources,
                      works,
                    });
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
  if (pages.length) console.info("Artists:", pages.length);
  if (pages.length)
    fs.writeFileSync(
      "./scripts/pages-artists.json",
      JSON.stringify(
        pages.filter((el) => el.body.length),
        null,
        2
      )
    );
});
