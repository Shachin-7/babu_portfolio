import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Colors & Body
css = re.sub(r'--hh-bg:#ffffff;', r'--hh-bg:#e1decb;', css)
css = re.sub(r'--hh-accent:#e8ef3a;', r'--hh-accent:#f2fa00;', css)
css = re.sub(r'--hh-giant:#1c2447;', r'--hh-giant:var(--hh-accent);', css)

# 2. Hide .hh-title
css = re.sub(r'\.hh-title\{[^}]+\}', r'.hh-title{display:none;}', css)

# 3. Navigation position (above heading, horizontal)
# In reference, nav is just above the heading.
# Nav currently has padding:2.2svh 3.2vw 0;
css = re.sub(r'\.hh-nav\{[^}]+\}', r'.hh-nav{display:flex;justify-content:space-between;padding:12vh 4vw 0;position:absolute;top:55vh;left:0;right:0;z-index:10;font-weight:800;font-size:clamp(12px,1vw,15px);letter-spacing:0.02em;text-transform:uppercase;}', css)

# 4. Giant Text (fill width, yellow, top)
css = re.sub(r'\.hh-giant\{[^}]+\}', r'.hh-giant{position:absolute;top:0;left:0;right:0;padding-top:0;z-index:1;will-change:transform,opacity;}', css)

# 5. Portrait
# Reference portrait overlaps the giant text, bottom aligned.
# Currently left:50%;bottom:0; z-index:3.
# Keep as is, it's already centered and bottom aligned.

# 6. Hero Heading
# Reference: White, left aligned over left chest.
css = re.sub(r'\.hh-headline\{[^}]+\}', r'.hh-headline{position:absolute;z-index:4;left:max(4vw,calc(50% - 320px));top:65vh;transform:none;text-align:left;font-family:var(--hh-black);font-size:clamp(40px,5.8vw,90px);line-height:1;letter-spacing:-0.03em;color:#ffffff;text-shadow:none;pointer-events:none;will-change:opacity,transform;}', css)

# 7. CTAs
# Reference: Yellow background, black text.
css = re.sub(r'\.hh-ctas\{[^}]+\}', r'.hh-ctas{position:absolute;z-index:5;left:max(4vw,calc(50% - 320px));top:calc(65vh + 180px);transform:none;display:flex;gap:16px;}', css)
css = re.sub(r'\.hh-btn\{[^}]+\}', r'.hh-btn{background:var(--hh-accent);color:#000000;font-family:var(--hh-sans);font-weight:800;font-size:clamp(14px,1vw,16px);border:none;border-radius:12px;cursor:pointer;padding:14px 28px;text-decoration:none;display:inline-block;box-shadow:none;will-change:transform,opacity;}', css)

# 8. Floating Cards (Glassmorphism)
card_css = r'.hh-chip{position:absolute;z-index:4;background:linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));border:1px solid rgba(255,255,255,0.3);border-radius:12px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:var(--hh-ink);display:flex;align-items:center;gap:12px;padding:16px 22px;box-shadow:0 12px 30px rgba(0,0,0,0.06);will-change:transform,opacity;}'
css = re.sub(r'\.hh-chip\{[^}]+\}', card_css, css)
css = re.sub(r'\.hh-chip \.hh-big\{[^}]+\}', r'.hh-chip .hh-big{font-family:var(--hh-black);font-size:clamp(22px,2vw,30px);color:var(--hh-accent);line-height:0.9;text-shadow:0 1px 2px rgba(0,0,0,0.1);}', css)
css = re.sub(r'\.hh-chip \.hh-cap\{[^}]+\}', r'.hh-chip .hh-cap{font-family:var(--hh-sans);font-weight:700;font-size:clamp(11px,0.9vw,13px);line-height:1.2;color:#ffffff;}', css)

# Adjust chip positions based on reference (Left side of heading)
css = re.sub(r'\.hh-chip\.hh-c1\{[^}]+\}', r'.hh-chip.hh-c1{left:max(1vw,calc(50% - 550px));top:55vh;}', css)
css = re.sub(r'\.hh-chip\.hh-c2\{[^}]+\}', r'.hh-chip.hh-c2{left:max(4vw,calc(50% - 480px));top:78vh;}', css)

# Right attributes card
attr_css = r'.hh-attrs{position:absolute;z-index:4;left:min(calc(50% + 320px),calc(100% - 280px - 2vw));top:60vh;background:linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));border:1px solid rgba(255,255,255,0.3);border-radius:16px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:24px 28px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 30px rgba(0,0,0,0.06);will-change:opacity,transform;}'
css = re.sub(r'\.hh-attrs\{[^}]+\}', attr_css, css)
css = re.sub(r'\.hh-attr\{[^}]+\}', r'.hh-attr{display:flex;align-items:center;gap:10px;color:#ffffff;font-family:var(--hh-sans);font-weight:700;font-size:clamp(13px,1.05vw,16px);}', css)

# 9. Bottom Paragraphs
# Reference: Far bottom left/right, small font.
css = re.sub(r'\.hh-corner-l\{[^}]+\}', r'.hh-corner-l{position:absolute;left:4vw;bottom:6vh;z-index:4;font-size:clamp(12px,1vw,14px);line-height:1.5;font-weight:500;color:var(--hh-ink);max-width:240px;will-change:opacity;}', css)
css = re.sub(r'\.hh-corner-r\{[^}]+\}', r'.hh-corner-r{position:absolute;right:4vw;bottom:6vh;z-index:4;font-size:clamp(12px,1vw,14px);line-height:1.5;font-weight:500;color:var(--hh-ink);text-align:left;max-width:320px;will-change:transform,opacity;}', css)


# Fix SVG in HTML
html = re.sub(r'<svg viewBox="[^"]+" preserveAspectRatio="[^"]+" style="[^"]+">\s*<text[^>]+>BABU</text>\s*</svg>',
              r'<svg viewBox="0 0 1000 400" preserveAspectRatio="none" style="width: 100%; height: 50vh;"><text x="50%" y="380" text-anchor="middle" style="fill:var(--hh-giant); font-family: \'Bebas Neue\', sans-serif;" font-size="520" textLength="980" lengthAdjust="spacingAndGlyphs">BABU</text></svg>', html)

html = html.replace('?v=102', '?v=103')

with open('/Users/sha/babu-portfolio/hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
