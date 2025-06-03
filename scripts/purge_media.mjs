import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDir = "./src/content";
const mediaDir = "./src/media";

// Recursively get all files in a directory
function getAllFiles(dir, files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

// Extract all media references from frontmatter and markdown body
function extractMediaRefs(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let refs = new Set();

  // Try to parse frontmatter if present
  try {
    const parsed = matter(content);
    const fm = JSON.stringify(parsed.data);
    // Find all ../../media/....webp or similar
    const fmMatches = fm.match(/(\.\.\/\.\.\/media\/[a-zA-Z0-9._\-]+)/g) || [];
    fmMatches.forEach((m) => refs.add(path.normalize(m)));

    // Also check markdown body
    const bodyMatches = parsed.content.match(/(\.\.\/\.\.\/media\/[a-zA-Z0-9._\-]+)/g) || [];
    bodyMatches.forEach((m) => refs.add(path.normalize(m)));
  } catch (e) {
    // fallback: just scan the file for media refs
    const matches = content.match(/(\.\.\/\.\.\/media\/[a-zA-Z0-9._\-]+)/g) || [];
    matches.forEach((m) => refs.add(path.normalize(m)));
  }

  return refs;
}

// Main
const contentFiles = getAllFiles(contentDir).filter(f => f.endsWith(".md"));
const referenced = new Set();

contentFiles.forEach((file) => {
  extractMediaRefs(file).forEach(ref => referenced.add(ref));
});

// Normalize referenced paths to just the filename (since mediaDir is flat)
const referencedFiles = new Set(
  Array.from(referenced)
    .map(ref => path.basename(ref))
);

const mediaFiles = fs.readdirSync(mediaDir);

let purged = 0;
mediaFiles.forEach((file) => {
  if (!referencedFiles.has(file)) {
    fs.unlinkSync(path.join(mediaDir, file));
    console.log("Purged:", file);
    purged++;
  }
});

console.log(`Done. Purged ${purged} unreferenced files from ${mediaDir}.`);