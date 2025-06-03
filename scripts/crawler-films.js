import fs from "node:fs";
import Crawler from "crawler";

const baseUrl = "https://artistrooms.org/films/";

const pages = [];
const seen = {};

const c = new Crawler({
  callback: (error, res, done) => {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
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
              nextUrl.pathname.indexOf("/media") !== -1 &&
              !seen[nextUrl.href]
            ) {
              seen[nextUrl.href] = true;
              c.queue({
                uri: nextUrl.href,
                callback: (error, res, done) => {
                  if (error) {
                    console.log(error);
                  } else {
                    const $ = res.$;

                    const title = $("h1").first().text();
                    const body = $(".o-video__intro p")
                      .map(function () {
                        return $(this).text();
                      })
                      .toArray()
                      .join("\n\n");
                    const duration = $(".o-video__intro--duration h3")
                      .text()
                      .replace("Duration: ", "");
                    const url = $(".o-video__video iframe").first().attr("src");
                    const artists = [
                      $('a[href^="/artists/"][title^="Find out more about"]')
                        .first()
                        .text()
                        .replace("Find out more about ", ""),
                    ];

                    pages.push({
                      title,
                      body,
                      url,
                      duration,
                      artists,
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
  if (pages.length) console.log("x", pages.length);
  const artists = [];
  const uniqueArtists = [
    ...new Set(pages.map((page) => page.artists).flat()),
  ].sort((a, b) => a.split(" ").pop().localeCompare(b.split(" ").pop()));
  // console.log(uniqueArtists);
  uniqueArtists.forEach((artist) => {
    const films = pages.filter((page) => page.artists.includes(artist));
    artists.push({
      artist,
      films,
    });
  });

  fs.writeFileSync(
    "./scripts/pages-films.json",
    JSON.stringify({ artists: artists }, null, 2)
  );
});
