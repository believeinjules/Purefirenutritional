"""
Generates a complete Supabase SQL migration from products.ts
"""
import json, re, sys

with open('client/src/data/products.ts', 'r') as f:
    ts = f.read()

# Extract the products array as a string
start = ts.index('export const products: Product[] = [') + len('export const products: Product[] = [')
# Find matching closing bracket
depth = 1
i = start
while i < len(ts) and depth > 0:
    if ts[i] == '[':
        depth += 1
    elif ts[i] == ']':
        depth -= 1
    i += 1
products_str = ts[start:i-1]

# Convert TypeScript object literal to JSON-parseable string
def ts_to_json(s):
    # Remove single-line comments
    s = re.sub(r'//[^\n]*', '', s)
    # Add quotes around unquoted keys
    s = re.sub(r'(\n\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)', r'\1"\2"\3', s)
    # Replace single quotes with double quotes (for string values)
    # Handle trailing commas before } or ]
    s = re.sub(r',(\s*[}\]])', r'\1', s)
    return s

# Parse products manually using regex since TS isn't valid JSON
# Extract each product block
def extract_products(ts_content):
    products = []
    # Find all top-level product objects
    i = 0
    while i < len(ts_content):
        if ts_content[i] == '{':
            # Find matching closing brace
            depth = 1
            j = i + 1
            while j < len(ts_content) and depth > 0:
                if ts_content[j] == '{':
                    depth += 1
                elif ts_content[j] == '}':
                    depth -= 1
                j += 1
            block = ts_content[i:j]
            products.append(block)
            i = j
        else:
            i += 1
    return products

def get_field(block, field):
    """Extract a field value from a TS object block"""
    # String field
    m = re.search(rf'"{field}"\s*:\s*"((?:[^"\\]|\\.)*)"', block)
    if not m:
        m = re.search(rf'\b{field}\s*:\s*"((?:[^"\\]|\\.)*)"', block)
    if m:
        return m.group(1).replace('\\"', '"').replace('\\n', '\n').replace("\\'", "'")
    
    # Number field
    m = re.search(rf'\b{field}\s*:\s*([0-9.]+)', block)
    if m:
        return float(m.group(1))
    
    # Boolean field
    m = re.search(rf'\b{field}\s*:\s*(true|false)', block)
    if m:
        return m.group(1) == 'true'
    
    return None

def get_array_field(block, field):
    """Extract an array field"""
    m = re.search(rf'\b{field}\s*:\s*\[([^\]]*)\]', block, re.DOTALL)
    if not m:
        return []
    arr_str = m.group(1)
    items = re.findall(r'"((?:[^"\\]|\\.)*)"', arr_str)
    return [i.replace('\\"', '"') for i in items]

def sql_escape(s):
    if s is None:
        return 'NULL'
    s = str(s).replace("'", "''")
    return f"'{s}'"

def sql_json(arr):
    if not arr:
        return "'[]'::jsonb"
    escaped = json.dumps(arr, ensure_ascii=False)
    escaped = escaped.replace("'", "''")
    return f"'{escaped}'::jsonb"

product_blocks = extract_products(products_str)
print(f"Found {len(product_blocks)} products", file=sys.stderr)

sql_lines = []
sql_lines.append("-- =====================================================")
sql_lines.append("-- FULL PRODUCTS MIGRATION - Generated from products.ts")
sql_lines.append("-- Run in Supabase SQL Editor")
sql_lines.append("-- =====================================================")
sql_lines.append("")
sql_lines.append("-- Add series_info column if it doesn't exist")
sql_lines.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS series_info TEXT;")
sql_lines.append("")
sql_lines.append("-- Clear existing products and re-insert all")
sql_lines.append("TRUNCATE TABLE products;")
sql_lines.append("")
sql_lines.append("INSERT INTO products (id, name, description, category, price_usd, price_eur, image, image_alt, sizes, rating, benefits, ingredients, usage, series_info, variants, in_stock) VALUES")

rows = []
for block in product_blocks:
    pid = get_field(block, 'id')
    if not pid:
        continue
    
    name = get_field(block, 'name') or ''
    description = get_field(block, 'description') or ''
    category = get_field(block, 'category') or 'PEPTIDE BIOREGULATORS'
    price_usd = get_field(block, 'priceUSD') or 0
    price_eur = get_field(block, 'priceEUR') or 0
    image = get_field(block, 'image')
    image_alt = get_field(block, 'imageAlt')
    sizes = get_field(block, 'sizes') or 1
    rating = get_field(block, 'rating') or 4.8
    usage = get_field(block, 'usage')
    series_info = get_field(block, 'seriesInfo')
    
    benefits = get_array_field(block, 'benefits')
    ingredients = get_array_field(block, 'ingredients')
    
    # Extract variants
    variants_match = re.search(r'\bvariants\s*:\s*\[', block)
    variants_json = '[]'
    if variants_match:
        start_v = variants_match.end() - 1
        depth = 1
        j = start_v + 1
        while j < len(block) and depth > 0:
            if block[j] == '[':
                depth += 1
            elif block[j] == ']':
                depth -= 1
            j += 1
        variants_str = block[start_v:j]
        # Parse variant objects
        variant_blocks = extract_products(variants_str)
        variants = []
        for vb in variant_blocks:
            v = {
                'id': get_field(vb, 'id'),
                'name': get_field(vb, 'name'),
                'priceUSD': get_field(vb, 'priceUSD'),
                'priceEUR': get_field(vb, 'priceEUR'),
                'image': get_field(vb, 'image'),
                'imageAlt': get_field(vb, 'imageAlt'),
                'inStock': get_field(vb, 'inStock'),
            }
            v = {k: val for k, val in v.items() if val is not None}
            if v.get('id'):
                variants.append(v)
        if variants:
            variants_json = json.dumps(variants, ensure_ascii=False).replace("'", "''")
    
    row = (
        f"({sql_escape(pid)}, {sql_escape(name)}, {sql_escape(description)}, "
        f"{sql_escape(category)}, {price_usd}, {price_eur}, "
        f"{sql_escape(image) if image else 'NULL'}, "
        f"{sql_escape(image_alt) if image_alt else 'NULL'}, "
        f"{int(sizes)}, {rating}, "
        f"{sql_json(benefits)}, "
        f"{sql_json(ingredients)}, "
        f"{sql_escape(usage) if usage else 'NULL'}, "
        f"{sql_escape(series_info) if series_info else 'NULL'}, "
        f"'{variants_json}'::jsonb, "
        f"true)"
    )
    rows.append(row)

sql_lines.append(',\n'.join(rows) + ';')
sql_lines.append("")
sql_lines.append(f"-- Total: {len(rows)} products inserted")

with open('supabase-full-products-migration.sql', 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated SQL with {len(rows)} products")
