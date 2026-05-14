import re

with open('client/src/data/products.ts', 'r') as f:
    content = f.read()

original_len = len(content)

# Fix 1: seriesInfo accidentally placed inside variants array (no comma after inStock)
content = re.sub(r'(inStock: (?:true|false))\n(\s+seriesInfo:[^\n]+\n)', r'\1\n', content)

# Fix 2: missing comma before seriesInfo field
content = re.sub(r'([\]\"a-z0-9])\n(\s+seriesInfo:)', r'\1,\n\2', content)

# Fix 3: remove any seriesInfo that snuck inside variants arrays
lines = content.split('\n')
cleaned = []
in_variants = False
brace_depth = 0

for line in lines:
    stripped = line.strip()
    if 'variants: [' in line:
        in_variants = True
        brace_depth = 0
    if in_variants:
        if '{' in stripped:
            brace_depth += stripped.count('{')
        if '}' in stripped:
            brace_depth -= stripped.count('}')
        if ']' in stripped and brace_depth <= 0:
            in_variants = False
        if in_variants and stripped.startswith('seriesInfo:'):
            continue
    cleaned.append(line)

content = '\n'.join(cleaned)

with open('client/src/data/products.ts', 'w') as f:
    f.write(content)

series_count = content.count('seriesInfo:')
missing = re.findall(r'[^,\n]\n\s+seriesInfo:', content)
print(f'Done. seriesInfo fields: {series_count}, potential missing commas: {len(missing)}')
