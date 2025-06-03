// run with node --experimental-modules

import fs from "node:fs";
import yaml from "yaml";
import artists from "./pages-artists.json" assert { type: "json" };
import rooms from "./pages-rooms.json" assert { type: "json" };
import films from "./pages-films.json" assert { type: "json" };
import dotenv from "dotenv";
import { Client } from "@googlemaps/google-maps-services-js";
import sharp from "sharp";

dotenv.config();
const client = new Client({}); // Create your client

async function getCoordinates(place) {
  try {
    const response = await client.geocode({
      params: {
        address: place,
        key: process.env.GOOGLE_API_KEY,
      },
    });

    if (response.data.status === "OK") {
      // console.log(response.data.results[0]);
      // const location = response.data.results[0].geometry.location;
      return response.data.results[0];
    } else {
      console.error("Geocoding failed:", response.data.status);
    }
  } catch (error) {
    //console.error("Error:", error);
  }
}

async function makeArtistMD() {
  fs.mkdirSync("./src/content/artists/", { recursive: true });
  for (const _a of artists) {
    (async (_a) => {
      let a = _a;
      let slug = slugify(a.title);
      let path = `./src/content/artists/${slug}.md`;
      let body = a.body;
      delete a.body;

      a.resources = a.resources?.map((r) => {
        return {
          path: r,
          title: r
            .replace(/^.*\/|(\.\w{2,4}$)|[\W_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .trim(),
        };
      });

      if (a.featuredImage) var ext = a.featuredImage.split(".").pop();
      a.featuredImage =
        "../../media/" +
        (await existOrDownload(
          "https://artistrooms.org" + a.featuredImage,
          "./src/media/",
          slugify(`${a.title}-featured`)
        ));
      a.works = await Promise.all(
        a.works
          ?.filter((w) => w.src)
          .map(async (w) => {
            w.src =
              "../../media/" +
              (await existOrDownload(
                "https://artistrooms.org" + w.src,
                "./src/media/",
                slugify(`${a.title}-${w.inventorynumber}-${w.title}`)
              ));
            return w;
          })
      );
      a.resources = await Promise.all(
        a.resources?.map(async (r) => {
          if (r.path.startsWith("http")) {
            r.path = r.path.replace(
              "https://artistrooms.org",
              "https://artistrooms.org/"
            );
          } else {
            r.path =
              "../../media/" +
              (await existOrDownload(
                "https://artistrooms.org" + r.path,
                "./src/media/",
                slugify(`${a.title}-${r.title}`)
              ));
          }
          return r;
        })
      );
      let fm = yaml.stringify(a);

      try {
        fs.writeFileSync(path, `---\n${fm}\n---\n\n${body}`);
      } catch (e) {
        console.log(e);
      }
    })(_a);
  }
}
async function makeRoomsMD() {
  fs.mkdirSync("./src/content/rooms/", { recursive: true });
  fs.mkdirSync("./src/content/venues/", { recursive: true });
  for (let _a of rooms) {
    (async (_a) => {
      let a = _a;
      a.title = a.title.replace(/ \| Artist Rooms/, "");
      let slug = slugify(a.title);
      a.ongoing = false;

      a.images = a.images?.map((im) => {
        return {
          src: im,
          title: im
            .replace(/^.*\/|(\.\w{2,4}$)|[\W_-]+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .trim(),
          alt: "",
          credits: "",
          caption: "",
          copyright: "",
        };
      });

      a.images = await Promise.all(
        a.images
          .map((i) => i)
          .map(async (i, index) => {
            i =
              "../../media/" +
              (await existOrDownload(
                i.src,
                "./src/media/",
                slugify(`${a.title}-${a.venue}-${a.startdate}-${index}`)
              ));
            return {
              src: i,
              title: i
                .replace(/^.*\/|(\.\w{2,4}$)|[\W_-]+/g, " ")
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .trim(),
              alt: "",
              credits: "",
              caption: "",
              copyright: `© `,
            };
          })
      );

      let body = a.body;
      delete a.body;

      if (a.venue?.length) {
        a.venue = a.venue.replace(/&/g, "and");
        let _v = {};
        _v.title = a.venue;
        _v.town = a.town;
        a.venue = slugify(a.venue);
        _v.map = a.map;
        delete a.map;
        if (a.url) {
          try {
            let { protocol, host } = new URL(a.url);
            _v.url = `${protocol}//${host}/`;
          } catch (e) {
            console.log("Room has invalid URL", slug, a.url);
            delete a.url;
          }
        }

        try {
          let where = _v.title;
          if (where == "Tate Britain") {
            where = "Tate Britain Millbank";
          }
          if (where == "Tate Modern") {
            where = "Tate Modern Bankside";
          }
          const R = await getCoordinates(`${where} ${_v.town} UK`);
          _v.geo = JSON.stringify({
            type: "Point",
            coordinates: [R.geometry?.location.lng, R.geometry?.location.lat],
          });
          _v.address = R.formatted_address;
          _v.plus_code = R.plus_code?.global_code;

          //console.log([a.title,_v.title, _v.town, _v.address].join(';'))
        } catch (e) {
          console.log("Geocoding didn't succeed: ", a.venue, e);
        }

        let venue_path = `./src/content/venues/${a.venue}.md`;
        try {
          fs.writeFileSync(venue_path, `---\n${yaml.stringify(_v)}\n---\n\n`);
        } catch (e) {
          console.log("Venue can't be written", slug, e);
        }
      } else {
        console.log("Room has no venue", slug);
      }

      if (a.artists != null) {
        try {
          a.artists = a.artists.map((artist) => slugify(artist));
        } catch (e) {
          console.log("Room has invalid artist", slug, a.artists);
          a.artists = [];
        }
      } else {
        a.artists = [];
        console.log("Room has no artists", slug, a.artists);
      }

      let fm = yaml.stringify(a);

      try {
        let slug_counter = 1;
        while (fs.existsSync(`./src/content/rooms/${slug}.md`)) {
          slug = slugify(a.title + " " + slug_counter++);
        }
        let room_path = `./src/content/rooms/${slug}.md`;

        fs.writeFileSync(room_path, `---\n${fm}\n---\n\n${body}`);
      } catch (e) {
        console.log("Room can't be written", slug, e);
      }
    })(_a);
  }
}

async function makeFilmsMD() {
  fs.mkdirSync("./src/content/films/", { recursive: true });
  for (const a of films.artists) {
    for (const f of a.films) {
      f.artists = [slugify(a.artist)];
      let path = `./src/content/films/${slugify(f.title)}.md`;
      let body = f.body;
      delete f.body;
      let fm = yaml.stringify(f);

      try {
        fs.writeFileSync(path, `---\n${fm}\n---\n\n${body}`);
      } catch (e) {
        console.log(e);
      }
    }
  }
}

async function existOrDownload(url, folder, slug) {
  let _url = new URL(url, "https://artistrooms.org/");
  let originalFilename = decodeURIComponent(
    _url.pathname.split("/").pop()
  ).replace(/[^a-zA-Z0-9.]+/g, "-");
  let ext = originalFilename.split(".").pop();
  let isImage = false;
  let filename, local;

  // We'll check the content type after fetching
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // Download if not present
  if (slug) {
    filename = slug; // We'll add extension after content-type check
  } else {
    filename = originalFilename.replace(/\.[^/.]+$/, "");
  }

  // We'll check if either .webp or original extension exists
  let webpLocal = `${folder}/${filename}.webp`;
  let origLocal = `${folder}/${filename}.${ext}`;

  if (fs.existsSync(webpLocal)) {
    return `${filename}.webp`;
  }
  if (fs.existsSync(origLocal)) {
    return origLocal;
  }

  console.log("Downloading", url);
  try {
    let res = await fetch(_url);
    let contentType = res.headers.get("content-type") || "";
    let blob = await res.blob();
    let buffer = Buffer.from(await blob.arrayBuffer());

    if (contentType.includes("image/")) {
      // Save as webp
      local = webpLocal;
      await sharp(buffer)
        .resize(1600, 1600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 100 })
        .toFile(local);
      console.log("Saved as", local);
      return `${filename}.webp`;
    } else {
      // Save with original extension
      local = origLocal;
      fs.writeFileSync(local, buffer);
      console.log("Saved as", local);
      return local;
    }
  } catch (e) {
    console.log("Can't write", local, e);
  }
}
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
await makeArtistMD();
await makeRoomsMD();
await makeFilmsMD();
