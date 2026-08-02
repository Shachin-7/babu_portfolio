import re

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Nunito with Google Sans
html = html.replace('&family=Nunito:wght@800;900', '&family=Google+Sans:wght@400;500;700')

# Update the SVG text element
html = html.replace("font-family: 'Nunito', sans-serif; font-weight: 900;", "font-family: 'Google Sans', sans-serif; font-weight: 700;")

# Bump cache
html = html.replace('v=121', 'v=122')

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
