// Outputs: /builtwith.json


import { getCollection } from "astro:content";

let venues = await getCollection("venues")
const rooms = await getCollection("rooms")
venues.sort(
  (a, b) => { return a.data.title.localeCompare(b.data.title); }
);

venues = venues.map((venue)=>{
  venue.data.rooms = rooms.filter((room)=> room.data.venue == venue.slug ).map((room)=>{ return {title:room.data.title,slug:room.slug,date:room.data.startdate} })
  return venue;
})

const artists = await getCollection("artists");

export async function GET({params, request}) {
    return new Response(
      JSON.stringify(venues)
    )
  }