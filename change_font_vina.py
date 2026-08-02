import re

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Playwrite US Trad with Vina Sans
html = html.replace('&family=Playwrite+US+Trad:wght@100..400', '&family=Vina+Sans')

# Update the SVG text element
html = html.replace("font-family: 'Playwrite US Trad', cursive; font-weight: 400;", "font-family: 'Vina Sans', sans-serif;")

# Bump cache (just increment whatever is there or force 125)
html = re.sub(r'hero\.css\?v=\d+', 'hero.css?v=125', html)

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
