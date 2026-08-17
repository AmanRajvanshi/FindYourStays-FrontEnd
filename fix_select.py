import re

files = [
    'src/pages/admin/propertyPages/addProperty.jsx',
    'src/pages/admin/propertyPages/editProperty.jsx'
]

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    content = re.sub(r'(data=\{sharingTypeOptions\})', r'\1 block', content)
    content = re.sub(r'(data=\{occupancyTypeOptions\})', r'\1 block', content)
    
    with open(path, 'w') as f:
        f.write(content)
