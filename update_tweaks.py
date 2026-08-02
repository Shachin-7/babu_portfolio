import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update font-family for headline to Story Script and reduce font-size slightly
css = re.sub(r'font-family:var\(--hh-black\);font-size:clamp\(40px,5\.8vw,90px\);',
             r"font-family:'Story Script', cursive;font-size:clamp(32px,4.5vw,76px);", css)

# 2. Adjust headline and CTAs position so CTAs are right below headline
css = re.sub(r'\.hh-headline\{([^\}]+)bottom:18vh;', r'.hh-headline{\1bottom:16vh;', css)
css = re.sub(r'\.hh-ctas\{([^\}]+)bottom:8vh;', r'.hh-ctas{\1bottom:8vh;', css) # This leaves about 8vh gap, wait, let's make it tighter.
css = re.sub(r'\.hh-headline\{([^\}]+)bottom:16vh;', r'.hh-headline{\1bottom:16vh;', css)
css = re.sub(r'\.hh-ctas\{([^\}]+)bottom:8vh;', r'.hh-ctas{\1bottom:9vh;', css) 

# 3. Portrait boxes for chips
# .hh-chip currently has display:flex;align-items:center;gap:12px;padding:16px 22px;
css = re.sub(r'\.hh-chip\{([^\}]+)display:flex;align-items:center;gap:12px;padding:16px 22px;',
             r'.hh-chip{\1display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:24px 20px;', css)

# 4. Position 25+ years (.hh-c1) above 5x revenue (.hh-c2) on the left side
css = re.sub(r'\.hh-chip\.hh-c1\{left:50%;top:auto;bottom:2vh;transform:translateX\(-50%\);z-index:10;\}',
             r'.hh-chip.hh-c1{left:max(4vw,calc(50% - 480px));top:40vh;transform:none;bottom:auto;}', css)
css = re.sub(r'\.hh-chip\.hh-c2\{left:max\(4vw,calc\(50% - 480px\)\);top:78vh;\}',
             r'.hh-chip.hh-c2{left:max(4vw,calc(50% - 480px));top:62vh;}', css)

# Add Story Script to HTML
html = html.replace('family=Anton&display=swap', 'family=Anton&family=Story+Script&display=swap')
html = html.replace('v=106', 'v=107')

with open('/Users/sha/babu-portfolio/hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

