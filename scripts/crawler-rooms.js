import fs from "node:fs";
import Crawler from "crawler";

const xbaseUrl = "https://artistrooms.org/rooms/";

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
      const baseUrl = new URL(res.options.uri);
      res.attrs = $("a[href]")
        .toArray()
        .map((el) => $(el).prop("href"));
      $("a[href]")
        .toArray()
        .forEach(function (element) {
          const nextUrl = new URL($(element).prop("href"), baseUrl);
          if (
            nextUrl.pathname.indexOf('rooms') !== -1 && nextUrl.hostname === 'artistrooms.org' &&
            !seen[nextUrl.href]
          ) {
            seen[nextUrl.href] = true;
            c.queue({
              uri: nextUrl.href,
              callback: parsePage,
            });
          } else {
            // console.log("x", nextUrl.href);
          }
        });
    }
    done();
  },
});

c.queue([
  {uri: `https://artistrooms.org/rooms`},
]);
 for (let i = 0; i < 20; i++) {
   c.queue([{uri: `https://artistrooms.org/rooms/past-rooms?page=${i}`}]);
 }


c.on("drain", () => {
  if (pages.length) console.info("Rooms:", pages.length);
  if (pages.length)
    fs.writeFileSync(
      "./scripts/pages-rooms.json",
      JSON.stringify(
        pages.filter((el) => el.body.length),
        null,
        2
      )
    );
});

const parsePage = (error, res, done) => {
  if (error) {
    console.error(error);
  } else {
    const $ = res.$;

    const title = $('title').first().text();
    const body = $('.o-default__content--about p').map(function(){ return $(this).text().trim() }).toArray().join('\n\n')
    const images = $('.o-room__banner-image--slide img').map((i,img) => $(img).attr('src')).toArray()
    const startdate = $('time').first().attr('datetime')?.split('T').shift()
    const enddate = $('time').last().attr('datetime')?.split('T').shift()
    const venue = $('.o-room_detail-info__item:nth-child(2) p').first().text()?.trim()
    const url = $('.o-room__details__cta__visit a').first().attr('href')
    const map = $('.o-room__details__cta__map a').first().attr('href')
    const town = $('h1').first().text()?.split(/\s?,\s+/).pop();
    const artists = $('.o-room__links p a').map((i, el) => $(el).text()).toArray()

    pages.push({
      title,
      artists,
      venue,
      images,
      startdate,
      enddate,
      town,
      map,
      url,
      body,
    });
  }
  done();
}
