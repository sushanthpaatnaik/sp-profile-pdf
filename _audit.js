const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1000,height:1200} });
  await p.goto('file:///home/user/sp-profile-pdf/index.html',{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(3000);
  await p.emulateMedia({media:'print'});

  const data = await p.evaluate(() => {
    const MM = 210/793.7;                 // px -> mm at 96dpi A4
    const PT = 0.75;                      // px -> pt
    const out = [];
    document.querySelectorAll('.page').forEach(pg => {
      const pr = pg.getBoundingClientRect();
      let minPt = 99, tiny = [], nearest = 99, sizes = new Set();
      const walk = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        const t = n.textContent.trim();
        if (!t) continue;
        const el = n.parentElement;
        if (!el || el.closest('.rail,.rail-toggle')) continue;
        const cs = getComputedStyle(el);
        const pt = parseFloat(cs.fontSize) * PT;
        sizes.add(Math.round(pt*10)/10);
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (pt < minPt) minPt = pt;
        if (pt < 6) tiny.push({ pt: Math.round(pt*10)/10, txt: t.slice(0,32) });
        const d = Math.min(r.left-pr.left, pr.right-r.right, r.top-pr.top, pr.bottom-r.bottom) * MM;
        if (d < nearest) nearest = d;
      }
      out.push({ id: pg.id, minPt: Math.round(minPt*10)/10, tinyCount: tiny.length,
                 tinySample: tiny.slice(0,3), nearestEdgeMm: Math.round(nearest*10)/10,
                 distinctSizes: [...sizes].sort((a,b)=>a-b).length });
    });
    return out;
  });

  console.log('page  minPt  <6pt  distinctSizes  nearestTextToTrim(mm)');
  data.forEach(d=>{
    const flag = (d.minPt<5.5?' TYPE-TOO-SMALL':'') + (d.nearestEdgeMm<8?' TIGHT-MARGIN':'');
    console.log(`${d.id.replace('page-','').padStart(4)}  ${String(d.minPt).padStart(5)}  ${String(d.tinyCount).padStart(4)}  ${String(d.distinctSizes).padStart(13)}  ${String(d.nearestEdgeMm).padStart(20)}${flag}`);
  });
  const allSizes = await p.evaluate(()=>{
    const s=new Set();
    document.querySelectorAll('.page *').forEach(el=>{
      if(el.closest('.rail,.rail-toggle'))return;
      if(el.textContent.trim()) s.add(Math.round(parseFloat(getComputedStyle(el).fontSize)*0.75*10)/10);
    });
    return [...s].sort((a,b)=>a-b);
  });
  console.log('\ndistinct type sizes used across the document:', allSizes.length);
  console.log(allSizes.join(', '));
  await b.close();
})();
