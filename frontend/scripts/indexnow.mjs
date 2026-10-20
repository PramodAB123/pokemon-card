// Notify IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep…) that the
// site's pages changed. Run after each deploy:  npm run indexnow
// Google does not use IndexNow; submit the sitemap in Search Console instead.
import { readFileSync } from "node:fs";

const HOST = "gitastro.vercel.app";
const KEY = "f8f248f0d8c3c150c52d40bc799e58c3"; // must match public/<KEY>.txt
const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

// The key file must be live before engines will accept the ping
const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  console.error(`Key file https://${HOST}/${KEY}.txt is not live yet. Deploy first.`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
if (res.status >= 400) process.exit(1);
