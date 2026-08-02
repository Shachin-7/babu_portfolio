import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Move both cards a little right: change calc(50% - 480px) to calc(50% - 440px)
css = css.replace('calc(50% - 480px)', 'calc(50% - 420px)')

# 2. Make .hh-c1 landscape and slightly larger
# Right now .hh-chip.hh-c1 has: left:...;top:...;bottom:...;transform:...
# Let's add the landscape flex rules to .hh-c1
c1_replacement = r'.hh-chip.hh-c1{left:max(4vw,calc(50% - 420px));top:auto;bottom:26vh;transform:none;flex-direction:row;align-items:center;padding:26px 32px;gap:16px;}'
css = re.sub(r'\.hh-chip\.hh-c1\{left:max\(4vw,calc\(50% - 420px\)\);top:auto;bottom:26vh;transform:none;\}', c1_replacement, css)

# Make .hh-c1 text slightly larger
css += "\n.hh-chip.hh-c1 .hh-big{font-size:clamp(26px,2.5vw,36px);}"
css += "\n.hh-chip.hh-c1 .hh-cap{font-size:clamp(12px,1vw,15px);}"

# 3. Increase .hh-c2 size (keep it portrait)
c2_replacement = r'.hh-chip.hh-c2{left:max(4vw,calc(50% - 420px));top:auto;bottom:6vh;padding:28px 24px;gap:12px;}'
css = re.sub(r'\.hh-chip\.hh-c2\{left:max\(4vw,calc\(50% - 420px\)\);top:auto;bottom:6vh;\}', c2_replacement, css)
css += "\n.hh-chip.hh-c2 .hh-big{font-size:clamp(26px,2.5vw,36px);}"
css += "\n.hh-chip.hh-c2 .hh-cap{font-size:clamp(12px,1vw,15px);}"

with open('/Users/sha/babu-portfolio/hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('v=111', 'v=112')
with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
