import re

# 1. Update index.html
with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

timeline_html = """    <!-- 01 — About Section (Timeline) -->
    <section id="about" class="jr-timeline scroll-anchor" aria-labelledby="about-heading" style="margin-top: 100px;">
      <div class="sec-label mono" id="about-heading" style="position: absolute; top: -40px; left: 0;">01 &mdash; About Me &amp; My Journey</div>
      
      <div style="max-width:760px; margin-bottom:8vh; position: relative; z-index: 2;">
        <h2 style="font-weight:900;font-size:clamp(38px,6vw,72px);letter-spacing:-.03em;line-height:1.02;font-family:'Archivo Black',sans-serif;">About Me (&amp;)<br>My Journey</h2>
        <p style="margin-top:24px;font-size:18px;line-height:1.65;color:var(--muted);max-width:500px;">Twenty-five years ago I started as a development engineer in Madurai. What happened after that is easier to show than explain.</p>
      </div>

      <svg class="jr-tsvg" id="tsvg" aria-hidden="true">
        <path id="tpath"></path>
        <g id="tnodes"></g>
      </svg>

      <article class="jr-tcard jr-right jr-reveal">
        <div class="jr-yr">'99</div>
        <h3>Starting out at TVS Cherry</h3>
        <p>Led NPI teams launching new products into fiercely competitive industrial markets. Learned the discipline that still runs everything: ship what customers actually need, on time.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>Development Engineer</b>@tvs &middot; Madurai, India</span>
        </div>
      </article>

      <article class="jr-tcard jr-left jr-reveal">
        <div class="jr-yr">'04</div>
        <h3>Eleven years inside GE</h3>
        <p>Built multi-generation product plans blending demand forecasting with profitability analysis &mdash; presenting power solutions to utilities, industrial customers, and consultants across two continents.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>Senior Lead Systems Engineer</b>@ge &middot; India &amp; Plainville, CT</span>
        </div>
      </article>

      <article class="jr-tcard jr-right jr-reveal">
        <div class="jr-yr">'10</div>
        <h3>Sharpening the commercial edge</h3>
        <p>Completed an MS in Management at Rensselaer Polytechnic Institute while working full-time &mdash; the pivot from pure engineering into product and commercial leadership.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>MS in Management</b>@rpi &middot; Hartford, CT</span>
        </div>
      </article>

      <article class="jr-tcard jr-left jr-reveal">
        <div class="jr-yr">'15</div>
        <h3>Going global</h3>
        <p>Directed global commercialization strategy for power distribution &mdash; go-to-market, launch execution, channel readiness, competitive intelligence, and the financial cases behind every investment.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>Global Product Marketing Leader</b>@ge &middot; Plainville, CT</span>
        </div>
      </article>

      <article class="jr-tcard jr-right jr-reveal">
        <div class="jr-yr">'18</div>
        <h3>Mission-critical at ABB</h3>
        <p>Leading commercial strategy for Automatic Transfer Switches, energy management, and digital power across North America &mdash; value built on uptime, N+1/2N redundancy, and lifecycle cost.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>Product Marketing Manager</b>@abb &middot; Bloomfield, CT</span>
        </div>
      </article>

      <article class="jr-tcard jr-left jr-reveal">
        <div class="jr-yr">Now</div>
        <h3>5&times; and still climbing</h3>
        <p>Delivered 5&times; revenue growth within three years of a new product launch, with the portfolio positioned for 3&times; against the 2025 baseline as data center demand accelerates.</p>
        <div class="jr-foot">
          <span class="jr-ava"><img src="assets/portrait-cutout.webp" alt=""></span>
          <span class="jr-who"><b>Director-level leadership</b>Electrification &amp; Data Centers</span>
        </div>
      </article>
    </section>"""

pattern_replace = re.compile(r'<!-- 01 — About Section \(MacBook Scroll\) -->.*?<\/section>', re.DOTALL)
html = pattern_replace.sub(timeline_html, html)

# Also update the cache version to ?v=98
html = html.replace('?v=97', '?v=98')

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update index.css
with open('/Users/sha/babu-portfolio/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

timeline_css = """
/* ================= TIMELINE + CONNECTOR ================= */
.jr-timeline{
  position:relative;
  display:flex;flex-direction:column;gap:14vh;
  padding-top:6vh;
}
.jr-tsvg{
  position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible;
}
.jr-tsvg path{
  fill:none;stroke:#111111;stroke-width:2.5;stroke-linecap:round;
}
.jr-tsvg circle{
  fill:#e8ef3a;stroke:#111111;stroke-width:2.5;
  transform-box:fill-box;transform-origin:center;
  transform:scale(0);transition:transform .45s cubic-bezier(.34,1.56,.64,1);
}
.jr-tsvg circle.on{transform:scale(1)}

.jr-tcard{
  position:relative;z-index:1;
  width:min(580px,88%);
  background: #fdfdfd;
  border:1px solid rgba(0,0,0,.08);
  border-radius:26px;
  padding:44px 46px;
  box-shadow:0 30px 70px rgba(0,0,0,.06);
}
.jr-tcard.jr-left{align-self:flex-start}
.jr-tcard.jr-right{align-self:flex-end}
.jr-yr{
  font-family:'Archivo Black',var(--sans);
  font-size:clamp(52px,5.6cqw,84px);line-height:.9;letter-spacing:-.02em;
  color:#e8ef3a;text-shadow:0 1px 0 rgba(0,0,0,.15);
}
.jr-tcard h3{margin-top:18px;font-weight:800;font-size:clamp(22px,2.3cqw,30px);letter-spacing:-.02em}
.jr-tcard p{margin-top:12px;font-size:15.5px;line-height:1.6;color:var(--muted)}
.jr-foot{margin-top:26px;display:flex;align-items:center;gap:12px}
.jr-ava{width:44px;height:44px;border-radius:50%;overflow:hidden;background:#c9c4b6;flex:none}
.jr-ava img{width:100%;height:100%;object-fit:cover;object-position:top}
.jr-who{font-size:13px;color:var(--muted);line-height:1.4}
.jr-who b{display:block;color:var(--ink)}

.jr-reveal{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.jr-reveal.jr-in{opacity:1;transform:none}

@media(max-width:960px){
  .jr-timeline{gap:8vh}
  .jr-tcard{width:100%;padding:30px 24px}
  .jr-tcard.jr-left,.jr-tcard.jr-right{align-self:stretch}
  .jr-tsvg{display:none}
}
"""

if ".jr-timeline{" not in css:
    with open('/Users/sha/babu-portfolio/index.css', 'a', encoding='utf-8') as f:
        f.write(timeline_css)

# 3. Update index.js
with open('/Users/sha/babu-portfolio/index.js', 'r', encoding='utf-8') as f:
    js = f.read()

timeline_js = """
// ─────────────────────────────────────────────────────────────────────────────
// Timeline Logic
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => matchMedia('(max-width:960px)').matches;

  /* reveals */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add('jr-in'); io.unobserve(e.target); }
  }), { threshold:.14 });
  document.querySelectorAll('.jr-reveal').forEach(el => io.observe(el));

  /* connector curve */
  const tl    = document.getElementById('about');
  const svg   = document.getElementById('tsvg');
  const path  = document.getElementById('tpath');
  const nodesG= document.getElementById('tnodes');
  if (!tl || !svg || !path) return;

  let L = 0, cum = [], circles = [];
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  function anchors(){
    const tlRect = tl.getBoundingClientRect();
    const cards = [...tl.querySelectorAll('.jr-tcard')];
    const pts = [];
    cards.forEach((c,i) => {
      const r = c.getBoundingClientRect();
      const left = c.classList.contains('jr-left');
      const entry = { x:(left ? r.right : r.left) - tlRect.left, y:(r.top + r.height*0.22) - tlRect.top };
      const exit  = { x:(left ? r.right : r.left) - tlRect.left, y:(r.top + r.height*0.78) - tlRect.top };
      pts.push({entry, exit});
    });
    return pts;
  }

  function build(){
    if (isMobile()){ path.removeAttribute('d'); nodesG.innerHTML=''; return; }
    const tlRect = tl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${tlRect.width} ${tlRect.height}`);
    svg.setAttribute('width', tlRect.width);
    svg.setAttribute('height', tlRect.height);

    const pts = anchors();
    if (pts.length < 2) return;

    let d = `M ${pts[0].exit.x} ${pts[0].exit.y}`;
    const probe = document.createElementNS('http://www.w3.org/2000/svg','path');
    cum = [];
    for (let i=0; i<pts.length-1; i++){
      const a = pts[i].exit, b = pts[i+1].entry;
      const vy = (b.y - a.y);
      d += ` C ${a.x} ${a.y + vy*0.45}, ${b.x} ${b.y - vy*0.45}, ${b.x} ${b.y}`;
      if (i < pts.length-2){
        const c = pts[i+1].exit;
        d += ` L ${c.x} ${c.y}`;
      }
      probe.setAttribute('d', d);
      cum.push(probe.getTotalLength());
    }

    path.setAttribute('d', d);
    L = path.getTotalLength();
    path.style.strokeDasharray = L;
    path.style.strokeDashoffset = reduced ? 0 : L;

    nodesG.innerHTML = '';
    circles = [];
    const nodePts = [ {p:pts[0].exit, at:0} ];
    for (let i=1; i<pts.length; i++) nodePts.push({ p:pts[i].entry, at:cum[i-1] });
    nodePts.forEach(n => {
      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx', n.p.x); c.setAttribute('cy', n.p.y); c.setAttribute('r', 7);
      if (reduced) c.classList.add('on');
      nodesG.appendChild(c);
      circles.push({ el:c, at:n.at });
    });
  }

  let target=0, p=0;
  function onScroll(){
    const r = tl.getBoundingClientRect();
    target = clamp((innerHeight*0.62 - r.top) / r.height, 0, 1);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { build(); onScroll(); }, 150); });

  function render(){
    if (!reduced && !isMobile() && L){
      p += (target - p) * .1;
      const drawn = L * p;
      path.style.strokeDashoffset = L - drawn;
      circles.forEach(c => c.el.classList.toggle('on', drawn >= c.at - 1));
    }
    requestAnimationFrame(render);
  }

  function boot(){ build(); onScroll(); render(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else window.addEventListener('load', boot);
  window.addEventListener('load', () => { build(); onScroll(); });
});
"""

if "Timeline Logic" not in js:
    with open('/Users/sha/babu-portfolio/index.js', 'a', encoding='utf-8') as f:
        f.write(timeline_js)

