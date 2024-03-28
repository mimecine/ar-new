# A-R: Gallery Site

Features:

- Artists section with their bio, individual works, shows, and related videos
- Shows section with images, descriptions, and links to participating artists
- Films section with descriptions and embedded videos of films featuring works by gallery artists
- Venues section listing galleries, museums, and other venues that exhibit participating artists
- A map showing the locations of the venues and the shows that have been exhibited there
- Individual pages
- StaticCMS to manage content

## Deployment

Can be built locally and hosted as a static site on any web server like GitHub Pages, Netlify, or Vercel.
For the CMS to work externally Netlify is currently the only supported host due to its native support for StaticCMS. 

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run cms`             | Start a local instance of the cms                |
| `npm run astro -- --help` | Get help using the Astro CLI                     |


## Credit

All hail Astro.build