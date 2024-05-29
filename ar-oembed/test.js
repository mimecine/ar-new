const OEmbed = require('.');

(async () => {
    const oEmbed = new OEmbed();
    try {
        const data = await oEmbed.fetch('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
})();
