import re

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Anton with Nunito (ExtraBold 800 and Black 900)
html = html.replace('&family=Anton', '&family=Nunito:wght@800;900')

# Update the SVG text element
html = html.replace("font-family: 'Anton', sans-serif;", "font-family: 'Nunito', sans-serif; font-weight: 900;")

# Bump cache
html = html.replace('v=117', 'v=118')

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
