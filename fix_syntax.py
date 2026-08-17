import sys
import re

files = [
    'src/pages/admin/nearbyLocations.jsx',
    'src/pages/admin/amenities.jsx',
    'src/pages/admin/propertyTypes.jsx'
]

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # We want it to be:
    # return (
    #   <>
    #     <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">
    
    content = content.replace(
        'return (\n    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">',
        'return (\n    <>\n      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">'
    )
    
    with open(path, 'w') as f:
        f.write(content)
