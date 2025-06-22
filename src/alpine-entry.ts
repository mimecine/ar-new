import type { Alpine } from "alpinejs";
import persist from "@alpinejs/persist";
import { isFromEU } from "detect-europe-js";


export default (Alpine: Alpine) => {
  Alpine.plugin(persist);
  Alpine.magic(
    "getPoster",
    () => async (url: string) => await fetchPoster(url)
  );

  Alpine.data("cookieConsent", () => ({
    state: Alpine.$persist("unknown").as("cookieConsent"),

    init() {
      this.dispatchEvent();
    },

    dialogue: {
      ["x-show"]() {
        return isFromEU() && this.state == "unknown";
      },
    },

    accept: {
      ["@click"]() {
        this.state = "accepted";

        this.dispatchEvent();
      },
    },

    decline: {
      ["@click"]() {
        this.state = "declined";

        this.dispatchEvent();
      },
    },

    dispatchEvent() {
      document.dispatchEvent(
        new CustomEvent("cookieConsent", {
          detail: this.state,
        })
      );
    },
  }));
};



async function fetchPoster(url: string): Promise<string | null> {


  const vimeoRegex = /https?:\/\/(www\.)?vimeo\.com\/(\d+)/;
  const youtubeRegex =
    /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

  if (vimeoRegex.test(url)) {
    const videoId = url.match(vimeoRegex)?.[2];
    if (videoId) {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
      );
      const data = await response.json();
      return data.thumbnail_url || null;
    }
  } else if (youtubeRegex.test(url)) {
    const videoId = url.match(youtubeRegex)?.[2];
    if (videoId) {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await response.json();
      return data.thumbnail_url || null;
    }
  }

  return null;
}
