class OEmbed {
    constructor() {}

    async fetch(url) {
        const provider = this.getProvider(url);
        if (!provider) throw new Error('Unsupported provider');

        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }
        return response.json();
    }

    getProvider(url) {
        // Simple heuristic to determine the provider based on the URL
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('vimeo.com')) return 'vimeo';
        return null;
    }
}

const providers = {
    'youtube.com': 'https://www.youtube.com/oembed?url=%URL%&format=json';
}

module.exports = OEmbed;