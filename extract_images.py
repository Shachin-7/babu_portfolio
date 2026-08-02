import re
import base64

with open('/Users/sha/babu-portfolio/journey-v3.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all base64 data URIs
matches = list(re.finditer(r'data:image/webp;base64,([^"]+)', html))

if len(matches) >= 1:
    blur_data = base64.b64decode(matches[0].group(1))
    with open('/Users/sha/babu-portfolio/assets/blur-portrait.webp', 'wb') as f:
        f.write(blur_data)
    # Replace in HTML
    html = html.replace(matches[0].group(0), 'assets/blur-portrait.webp')

if len(matches) >= 2:
    ava_data = base64.b64decode(matches[1].group(1))
    with open('/Users/sha/babu-portfolio/assets/avatar.webp', 'wb') as f:
        f.write(ava_data)
    # Replace in HTML
    html = html.replace(matches[1].group(0), 'assets/avatar.webp')

# Save as journey.html
with open('/Users/sha/babu-portfolio/journey.html', 'w', encoding='utf-8') as f:
    f.write(html)
