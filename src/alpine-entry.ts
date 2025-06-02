import type { Alpine } from 'alpinejs'
import persist from '@alpinejs/persist'

import { extract } from '@extractus/oembed-extractor';

async function getPoster(url: string): Promise<string | null> {
    try {
        const data = await extract(url);
        console.log('Extracted data:', data);
        return data.thumbnail_url || null;
    } catch (error) {
        console.error('Error fetching poster:', error);
        return null;
    }
}


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.magic('getPoster',  () => async (url: string) => await fetchPoster(url));
}

// fetch poster from vimeo/youtube url using async fetch by using https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F115165445%3Fh%3D2c35f6a2bb and the corresponding oembed endpoint for youtube

async function fetchPoster(url: string): Promise<string | null> {
    const vimeoRegex = /https?:\/\/(www\.)?vimeo\.com\/(\d+)/;
    const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

    if (vimeoRegex.test(url)) {
        const videoId = url.match(vimeoRegex)?.[2];
        if (videoId) {
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
            const data = await response.json();
            return data.thumbnail_url || null;
        }
    } else if (youtubeRegex.test(url)) {
        const videoId = url.match(youtubeRegex)?.[2];
        if (videoId) {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            const data = await response.json();
            return data.thumbnail_url || null;
        }
    }

    return null;
}           
// Example usage
// (async () => {
//     const poster = await fetchPoster('https://vimeo.com/115165445');
