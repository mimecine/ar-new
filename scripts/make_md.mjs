// run with node --experimental-modules

import fs from "node:fs";
import yaml from "yaml";
import artists from "./artists.json" with { type: "json" };
import rooms from "./rooms.json" with { type: "json" };
import films from "./films.json" with { type: "json" };
import dotenv from "dotenv";
import { Client }  from "@googlemaps/google-maps-services-js";

dotenv.config();
const client = new Client({}); // Create your client

async function getCoordinates(place) {
  try {
    const response = await client.geocode({
      params: {
        address: place,
        key: process.env.GOOGLE_API_KEY 
      }
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return response.data.results[0];
    } else {
      console.error("Geocoding failed:", response.data.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}





async function makeArtistMD(){
    fs.mkdirSync('./src/content/artists/',{recursive:true});
    for(const _a of artists){
        (async (_a) => {
            let a = _a;
            let slug = slugify(a.title);
            let path = `./src/content/artists/${slug}.md`;
            let body = a.body;
            delete a.body;
            a.featuredImage = '../../media/'+ await existOrDownload('https://artistrooms.org'+a.featuredImage,'./src/media/');
            a.works = await Promise.all(a.works?.filter(w=>w.src).map(async w => {w.src = '../../media/'+ await existOrDownload('https://artistrooms.org'+w.src,'./src/media/'); return w;}));
            let fm = yaml.stringify(a);

            try {
            fs.writeFileSync(
                path,
                `---\n${fm}\n---\n\n${body}`
            );
            } catch (e) {
                console.log(e);
            }
        })(_a)
    }
}
async function makeRoomsMD(){
    fs.mkdirSync('./src/content/rooms/',{recursive:true});
    fs.mkdirSync('./src/content/venues/',{recursive:true});
    for(let _a of rooms.rooms){
        (async (_a) => {
            let a = _a;
            a.title = a.title.replace(/ \| Artist Rooms/,"")
            let [title,town = ""] = a.title.split(/\s*,\s*/);
            let slug = slugify(a.title +" "+ a.venue)
            let room_path = `./src/content/rooms/${slug}.md`;

            a.images = await Promise.all(a.images.map(async i => {i = '../../media/'+ await existOrDownload(i,'./src/media/'); return i}));

            let body = a.body;
            delete a.body;

            if(a.venue!= null){
                //let [title, town = ""] = a.venue.split(/\s*,\s*/);
                let _v = {};
                _v.title = a.venue;
                _v.town = town;
                a.venue = slugify(a.venue);
                _v.address = a.address; delete a.address;
                _v.map = a.map; delete a.map;
                if( a.url){
                    try {
                        let {protocol,host} = new URL(a.url);
                        _v.url = `${protocol}//${host}/`;
                    } catch (e) {
                        console.log("Room has invalid URL", slug, a.url);
                        delete a.url;
                    }
                }


                try {
                    const R = await getCoordinates(
                        `${_v.title} ${_v.address} UK`
                    );
                    _v.geo = JSON.stringify({type:'Point',coordinates: [ R.geometry.location.lng, R.geometry.location.lat]});
                    _v.address = R.formatted_address; 
                    _v.plus_code = R.plus_code?.global_code;  
                    console.log(_v.address, _v.geo) 
                } catch (e) {
                    console.log("Geocoding didn't succeed: ", a.venue, e)
                }

                let venue_path = `./src/content/venues/${a.venue}.md`;
                try {
                    fs.writeFileSync(
                        venue_path,
                        `---\n${ yaml.stringify(_v) }\n---\n\n`
                    );
                } catch (e) {
                    console.log("Room can't be written", slug, e);
                }
            } else {
                console.log("Room has no venue", slug);
            }

            if( a.artists != null ){
                try {
                    a.artists = a.artists.map(artist => slugify(artist));
                } catch (e) {
                    console.log("Room has invalid artist", slug, a.artists);
                    a.artists = [];
                }
            } else {
                a.artists = [];
                console.log("Room has no artists", slug, a.artists );
            }


            let fm = yaml.stringify(a);

            try {
                fs.writeFileSync(
                    room_path,
                    `---\n${fm}\n---\n\n${body}`
                );
            } catch (e) {
                console.log("Room can't be written", slug, e);
            }
        })(_a)
    }
}

async function makeFilmsMD(){
    fs.mkdirSync('./src/content/films/',{recursive:true});
    for(const a of films[0].artists){
        for(const f of a.films){
            f.artists = [slugify(a.artist)];
            let path = `./src/content/films/${slugify(f.title)}.md`;
            let fm = yaml.stringify(f);

            try {
            fs.writeFileSync(
                path,
                `---\n${fm}\n---\n\n`
            );
            } catch (e) {
                console.log(e);
            }
        }
    }
}

async function existOrDownload(url, folder){
    let _url = new URL(url);
    let filename = decodeURIComponent(_url.pathname.split("/").pop()).replace(/[^a-zA-Z0-9.]+/g,'-');
    let local = `${folder}/${filename}`;
    if(!fs.existsSync(local)){

        console.log("Downloading", local);
        try {
            let res = await fetch(url);
           let blob = await res.blob();
            let buffer = Buffer.from(await blob.arrayBuffer());
            
            fs.writeFileSync(local, buffer);
            return filename;
        } catch (e) {
            console.log("Can't write", local, e);
        }
    } else {
        //console.log("Already downloaded", process.cwd(), local);
        return filename;
    }
}
function slugify(text) {
    return text.toString().toLowerCase()
       .replace(/\s+/g, '-')           // Replace spaces with -
       .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
       .replace(/\-\-+/g, '-')         // Replace multiple - with single -
       .replace(/^-+/, '')             // Trim - from start of text
       .replace(/-+$/, '');            // Trim - from end of text
}
await makeArtistMD();
await makeRoomsMD();
await makeFilmsMD();

