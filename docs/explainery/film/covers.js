// Zrzuty okładek 3D materiałów z lokalnej aplikacji (przezroczyste tło, z ilustracją okładki).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 1600 }, deviceScaleFactor: 3 });
  for (const slug of process.argv.slice(2)) {
    await p.goto('http://localhost:3100/wiedza/' + slug, { waitUntil: 'networkidle' });
    const el = p.locator('div[class*="group/book"]').first(); await el.scrollIntoViewIfNeeded();
    await p.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
    // przezroczyste mają być tylko elementy NAD okładką w drzewie (tło strony), nie sama okładka
    await el.evaluate((n) => { for (let a = n.parentElement; a; a = a.parentElement) { a.style.setProperty('background', 'transparent', 'important'); a.style.setProperty('box-shadow', 'none', 'important'); a.style.setProperty('border-color', 'transparent', 'important');
      for (const s of a.children) if (!s.contains(n)) s.style.setProperty('visibility', 'hidden', 'important'); } });
    await p.waitForTimeout(400);
    await el.screenshot({ path: `covers/${slug}.png`, omitBackground: true });
  }
  await b.close();
})();
