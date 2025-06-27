// Outputs: /builtwith.json

import { getCollection } from "astro:content";

let venues = await getCollection("venues");
const rooms = await getCollection("rooms");
venues.sort((a, b) => {
  return a.data.title.localeCompare(b.data.title);
});

let new_year = 0;
const output = {
  type: "FeatureCollection",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: venues.map((venue) => {
    venue.data.rooms = rooms
      .filter((room) => room.data.venue == venue.id)
      .map((room) => {
        return {
          title: room.data.title,
          id: room.id,
          date: room.data.startdate,
        };
      });
    venue.data.bodyHtml = venue.data.rooms
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((room) => {
        let year = new Date(room.date).getFullYear();
        if (new_year != year) {
          new_year = year;
          return `<span class="italic">${year}:</span> <a href="/rooms/${
            room.id
          }" class="text-black! font-default!">${room.title.replace(
            /,[^,]+$/,
            ""
          )}</a>`;
        } else {
          return `<a href="/rooms/${
            room.id
          }" class="text-black! font-default!">${room.title.replace(
            /,[^,]+$/,
            ""
          )}</a>`;
        }
      })
      .join("; ");
    venue.properties = venue.data;

    return {
      type: "Feature",
      geometry: JSON.parse(venue.data.geo) || [],
      properties: venue.data,
    };
  }),
};
const artists = await getCollection("artists");

export async function GET({ params, request }) {
  return new Response(JSON.stringify(output));
}
