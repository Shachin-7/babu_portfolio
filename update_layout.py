import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Nav right below BABU
css = re.sub(r'\.hh-nav\{display:flex;justify-content:space-between;padding:12vh 4vw 0;position:absolute;top:55vh;left:0;right:0;z-index:10;font-weight:800;font-size:clamp\(12px,1vw,15px\);letter-spacing:0\.02em;text-transform:uppercase;\}',
             r'.hh-nav{display:flex;justify-content:space-between;padding:0 4vw;position:absolute;top:51vh;left:0;right:0;z-index:10;font-weight:800;font-size:clamp(12px,1vw,15px);letter-spacing:0.02em;text-transform:uppercase;}', css)

# 2. Power Applied Differently & CTAs at bottom center (left aligned text, centered block)
css = re.sub(r'\.hh-headline\{position:absolute;z-index:4;left:max\(4vw,calc\(50% - 320px\)\);top:65vh;transform:none;text-align:left;font-family:var\(--hh-black\);font-size:clamp\(40px,5\.8vw,90px\);line-height:1;letter-spacing:-0\.03em;color:#ffffff;text-shadow:none;pointer-events:none;will-change:opacity,transform;\}',
             r'.hh-headline{position:absolute;z-index:4;left:50%;top:auto;bottom:18vh;transform:translateX(-45%);text-align:left;font-family:var(--hh-black);font-size:clamp(40px,5.8vw,90px);line-height:1;letter-spacing:-0.03em;color:#ffffff;text-shadow:none;pointer-events:none;will-change:opacity,transform;}', css)

css = re.sub(r'\.hh-ctas\{position:absolute;z-index:5;left:max\(4vw,calc\(50% - 320px\)\);top:calc\(65vh \+ 180px\);transform:none;display:flex;gap:16px;\}',
             r'.hh-ctas{position:absolute;z-index:5;left:50%;top:auto;bottom:8vh;transform:translateX(-45%);display:flex;gap:12px;}', css)
css = re.sub(r'gap:12px;\}', r'gap:12px;}', css) # Catch if I already changed it to 12px

# 3. 25+ Years card near the center, bring it below
css = re.sub(r'\.hh-chip\.hh-c1\{left:max\(1vw,calc\(50% - 550px\)\);top:55vh;\}',
             r'.hh-chip.hh-c1{left:50%;top:auto;bottom:2vh;transform:translateX(-50%);z-index:10;}', css)

# 4. Hide hh-c2 just in case to reduce clutter or move it? Let's leave hh-c2 where it is.

with open('/Users/sha/babu-portfolio/hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

