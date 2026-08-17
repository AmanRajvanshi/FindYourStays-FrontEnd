import re

files = [
    'src/pages/admin/propertyPages/addProperty.jsx',
    'src/pages/admin/propertyPages/editProperty.jsx'
]

def replace_headers(content):
    # Fix "Amenities" header
    content = re.sub(
        r'<div className="col-span-1 md:col-span-12 flex items-center justify-between">\s*<h5>\s*<u>(.*?)</u>\s*(<span.*?>.*?</span>)?\s*</h5>',
        r'<div className="col-span-1 md:col-span-12 flex items-center justify-between border-b pb-2 mb-3 mt-4">\n              <h5 className="text-lg font-semibold text-gray-800 m-0">\n                \1\n                \2\n              </h5>',
        content,
        flags=re.DOTALL
    )
    # Fix "Property Media" and "Meta Information" which might not have the flex container
    # Wait, some might just be <h5><u>Meta Information</u></h5>
    content = re.sub(
        r'<h5>\s*<u>(.*?)</u>\s*(<span.*?>.*?</span>)?\s*</h5>',
        r'<div className="col-span-1 md:col-span-12 border-b pb-2 mb-3 mt-4">\n              <h5 className="text-lg font-semibold text-gray-800 m-0">\n                \1\n                \2\n              </h5>\n            </div>',
        content,
        flags=re.DOTALL
    )
    return content

def replace_checkbox_grid(content):
    # For Amenities and Nearby Facilities, wrap the mapping in a nice grid.
    # It currently looks like:
    # {amenities.map((amenities, index) => (
    #   <div className="col-lg-2 mb-2" key={index}>
    #      ...
    #   </div>
    # ))}
    
    # We will just replace `col-lg-2 mb-2` or `col-lg-3` with `col-span-1` and wrap the map in a grid?
    # Actually, the entire form is already in a `grid grid-cols-1 md:grid-cols-12 gap-6`.
    # If we just replace `<div className="col-lg-2 mb-2" key={index}>` with `<div className="col-span-1 md:col-span-2" key={index}>`
    # That works perfectly because it's inside a 12-col grid!
    
    content = re.sub(r'<div className="col-lg-2([^"]*)"([^>]*)>', r'<div className="col-span-1 md:col-span-2\1"\2>', content)
    content = re.sub(r'<div className="col-lg-3([^"]*)"([^>]*)>', r'<div className="col-span-1 md:col-span-3\1"\2>', content)
    
    return content

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    content = replace_headers(content)
    content = replace_checkbox_grid(content)
    
    with open(path, 'w') as f:
        f.write(content)
