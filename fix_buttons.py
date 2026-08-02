import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make headline text-align: center
css = re.sub(r'\.hh-headline\{([^\}]+)text-align:left;', r'.hh-headline{\1text-align:center;', css)

# Adjust buttons to be perfectly centered under the text block. Let's use left:50%; transform:translateX(-50%) for both.
css = re.sub(r'\.hh-headline\{position:absolute;z-index:4;left:50%;top:auto;bottom:16vh;transform:translateX\(-45%\);text-align:center;',
             r'.hh-headline{position:absolute;z-index:4;left:50%;top:auto;bottom:16vh;transform:translateX(-50%);text-align:center;', css)

css = re.sub(r'\.hh-ctas\{position:absolute;z-index:5;left:50%;top:auto;bottom:9vh;transform:translateX\(-45%\);',
             r'.hh-ctas{position:absolute;z-index:5;left:50%;top:auto;bottom:9vh;transform:translateX(-50%);', css)


with open('/Users/sha/babu-portfolio/hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('v=107', 'v=108')
with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

