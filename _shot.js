const { chromium } = require('playwright-core');
const pages=(process.argv[2]||'1-20').split('-').map(Number);
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1000,height:1400}, deviceScaleFactor:1.3 });
  await p.goto('file:///home/user/sp-profile-pdf/index.html',{waitUntil:'networkidle',timeout:120000});
  await p.waitForTimeout(2500); await p.emulateMedia({media:'print'});
  const out='/tmp/claude-0/-home-user-sp-profile-pdf/f4731350-d6bf-5a10-985c-3529f4c8e402/scratchpad/render';
  for(let i=pages[0];i<=pages[1];i++){const el=await p.$(`#page-${i}`); if(el) await el.screenshot({path:`${out}/r-${String(i).padStart(2,'0')}.png`});}
  const bad=await p.evaluate(()=>{const res=[];document.querySelectorAll('.page').forEach(pg=>{const pr=pg.getBoundingClientRect();
    pg.querySelectorAll('*').forEach(el=>{if(el.closest('.rail,.rail-toggle')||el.classList.contains('decor')||el.classList.contains('glow-gold'))return;
      const r=el.getBoundingClientRect(); if(!r.width||!r.height)return;
      const w=Math.max(r.bottom-pr.bottom,r.right-pr.right,pr.top-r.top,pr.left-r.left);
      if(w>3)res.push({page:pg.id,px:Math.round(w)});});});return res;});
  console.log('overflow:',JSON.stringify(bad));
  await b.close();
})();
