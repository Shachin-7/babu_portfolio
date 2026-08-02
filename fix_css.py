import re

with open('/Users/sha/babu-portfolio/hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update .hh-headline
css = re.sub(
    r'\.hh-headline\{([^}]+)\}',
    r'.hh-headline{\1}',
    css
)
# Let's do exact replacements.
