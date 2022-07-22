/**
 * Configuration built by `npm run build`
 */
exports.prod = {
  collection: "https://canopy-iiif.vercel.app/iiif/collection/nez-perce.json",
  title: "Nez Percé (Nimíipuu)",
  hero: [
    "https://canopy-iiif.vercel.app/iiif/manifest/nez-perce/02-lawyer.json",
  ],
  metadata: ["Date", "Subject"],
};

/**
 * Configuration built by `npm run dev`
 */
exports.dev = {
  collection: "https://canopy-iiif.vercel.app/iiif/collection/nez-perce.json",
  title: "Nez Percé (Nimíipuu)",
  hero: [
    "https://canopy-iiif.vercel.app/iiif/manifest/nez-perce/02-lawyer.json",
  ],
  metadata: ["Date", "Subject"],
  seo: {
    analytics: "",
    metatags: {
      googleSiteVerification: "",
      twitter: {
        site: "",
        handle: "",
      }
    }
  }
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
