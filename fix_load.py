import re

with open('/Users/sha/babu-portfolio/index.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the load listener with a safer boot
safe_boot = """  function boot(){ build(); onScroll(); render(); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot);
  }
"""

js = re.sub(r'  function boot\(\)\{ build\(\); onScroll\(\); render\(\); \}\n  if \(document\.fonts && document\.fonts\.ready\) document\.fonts\.ready\.then\(boot\);\n  else window\.addEventListener\(\'load\', boot\);\n  window\.addEventListener\(\'load\', \(\) => \{ build\(\); onScroll\(\); \}\);', safe_boot, js)

with open('/Users/sha/babu-portfolio/index.js', 'w', encoding='utf-8') as f:
    f.write(js)

