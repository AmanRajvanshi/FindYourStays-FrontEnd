import re
import sys

def refactor(path):
    with open(path, 'r') as f:
        content = f.read()

    # Replace wrapper
    content = content.replace('<div className="my_dashboard_review">', '<div className="bg-white p-6 md:p-8 rounded-xl shadow-sm mb-6">')
    content = content.replace('<div className="flex flex-wrap">', '<div className="grid grid-cols-1 md:grid-cols-12 gap-6">')
    
    # Replace col-lg-X
    def replace_col(match):
        num = match.group(1)
        classes = match.group(2)
        classes = classes.replace('mb-3', '').replace('mb-2', '').strip()
        new_classes = f"col-span-1 md:col-span-{num} {classes}".strip()
        return f'<div className="{new_classes}">'
    content = re.sub(r'<div className="col-lg-(\d+)\s*([^"]*)">', replace_col, content)
    
    # Replace hr
    content = content.replace('<hr />', '')
    
    # Replace <h5><u>...</u></h5>
    def replace_h5(match):
        text = match.group(1)
        return f'<h5 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-2">{text}</h5>'
    content = re.sub(r'<h5>\s*<u>(.*?)</u>\s*</h5>', replace_h5, content)
    
    with open(path, 'w') as f:
        f.write(content)

refactor('src/pages/admin/propertyPages/editProperty.jsx')
refactor('src/pages/admin/propertyPages/addProperty.jsx')
