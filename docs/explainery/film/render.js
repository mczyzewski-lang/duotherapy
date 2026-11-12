// node render.js <mode> [from] [to]   mode: stills | frames
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const tl = JSON.parse(fs.readFileSync(process.env.TL || 'timeline.json', 'utf8'));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(process.env.PAGE || 'film.html')); await p.evaluate((t) => window.setup(t), tl);
  const mode = process.argv[2];
  if (mode === 'stills') {
    const times = process.argv.slice(3).map(Number);
    for (const t of times) { await p.evaluate(async (x) => { await window.renderAt(x); window.guides(); }, t); await p.screenshot({ path: `still-${String(t).replace('.', '_')}.jpg`, type: 'jpeg', quality: 80 }); }
  } else {
    const fps = 30, from = Number(process.argv[3]), to = Number(process.argv[4]);
    for (let f = from; f < to; f++) { await p.evaluate((x) => window.renderAt(x), f / fps); await p.screenshot({ path: `${process.env.OUT || 'frames'}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 }); }
    console.log('done', from, to);
  }
  await b.close();
})();
