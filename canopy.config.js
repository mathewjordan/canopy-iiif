/**
 * Configuration built by `npm run build`
 */
exports.prod = {
  collection:
    "https://canopy-iiif.vercel.app/fixtures/iiif/collection/nez-perce.json",
  title: "Nez Percé (Nimíipuu)",
  hero: [
    "https://canopy-iiif.vercel.app/fixtures/iiif/manifest/nez-perce/02-lawyer.json",
  ],
  metadata: ["Date", "Subject"],
};

/**
 * Configuration built by `npm run dev`
 */
exports.dev = {
  collection:
    "http://localhost:5001/fixtures/iiif-dev/collection/north-american.json",
  title: "Nez Percé (Nimíipuu)",
  hero: [
    "http://localhost:5001/fixtures/iiif-dev/manifest/nez-perce/02-lawyer.json",
  ],
  metadata: ["Date", "Subject"],
};

/**
 * Canopy globals regardless of environment
 */
exports.globals = {
  slugify: {
    lower: true,
    strict: true,
    trim: true,
  },
};
