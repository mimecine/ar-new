// Restore file/directory cached in previous builds.
// Does not do anything if:
//  - the file/directory already exists locally
//  - the file/directory has not been cached yet
export const onPreBuild = async function ({ utils }) {
    await utils.cache.restore('./node_modules/.astro/')
  }
  
  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  export const onPostBuild = async function ({ utils }) {
    await utils.cache.save('./node_modules/.astro/')
  }