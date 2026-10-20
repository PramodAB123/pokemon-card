// Per-route SEO tags. index.html ships the homepage defaults; card pages
// override them so Google treats each /username as its own page.
const SITE = "https://gitastro.vercel.app";
const INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX = "noindex, follow";

function setAttr(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function setCanonical(path = "/") {
  const url = SITE + path;
  setAttr('link[rel="canonical"]', "href", url);
  setAttr('meta[property="og:url"]', "content", url);
}

export function setIndexable(indexable) {
  const value = indexable ? INDEX : NOINDEX;
  setAttr('meta[name="robots"]', "content", value);
  setAttr('meta[name="googlebot"]', "content", value);
}

export function resetSeo() {
  setCanonical("/");
  setIndexable(true);
}
