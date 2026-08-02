import re

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Google Sans with Playwrite US Trad
html = html.replace('&family=Google+Sans:wght@400;500;700', '&family=Playwrite+US+Trad:wght@100..400')

# Update the SVG text element
html = html.replace("font-family: 'Google Sans', sans-serif; font-weight: 700;", "font-family: 'Playwrite US Trad', cursive; font-weight: 400;")

# Bump cache
html = html.replace('v=123', 'v=124')

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
