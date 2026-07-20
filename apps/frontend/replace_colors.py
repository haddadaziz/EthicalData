import os
import re

directories = [
    r'c:\DevAziz\apps\frontend\src\components'
]

replacements = [
    (r'\bbg-red-600\b', 'bg-blue-600'),
    (r'\bhover:bg-red-700\b', 'hover:bg-blue-700'),
    (r'\bbg-red-950', 'bg-blue-950'),
    (r'\bbg-red-500\b', 'bg-blue-500'),
    (r'\bgroup-hover:bg-red-600\b', 'group-hover:bg-blue-600'),
    (r'\bborder-red-950', 'border-blue-950'),
    (r'\bborder-red-900', 'border-blue-900'),
    (r'\bborder-t-red-600\b', 'border-t-cyan-500'),
    (r'\bborder-red-600\b', 'border-blue-600'),
    (r'\bborder-red-500\b', 'border-cyan-500'),
    (r'\bgroup-hover:border-red-500\b', 'group-hover:border-cyan-500'),
    (r'\btext-red-600\b', 'text-cyan-500'),
    (r'\btext-red-500\b', 'text-cyan-400'),
    (r'\btext-red-400\b', 'text-cyan-300'),
    (r'\bgroup-hover:text-red-500\b', 'group-hover:text-cyan-400'),
    (r'\bhover:text-red-500\b', 'hover:text-cyan-400'),
    (r'\bhover:text-red-400\b', 'hover:text-cyan-300'),
    (r'\bhover:text-red-300\b', 'hover:text-cyan-200'),
    (r'\bshadow-red-600', 'shadow-blue-600'),
    (r'\bshadow-red-900', 'shadow-blue-900'),
    (r'\bshadow-red-500', 'shadow-cyan-500'),
    (r'rgba\(220,38,38,', 'rgba(37,99,235,'),
    (r'\bfrom-red-600\b', 'from-blue-600'),
    (r'\bto-rose-500\b', 'to-teal-500'),
    (r'\bvia-red-500\b', 'via-cyan-500'),
    (r'\bto-orange-500\b', 'to-teal-400'),
    (r'\bring-red-600', 'ring-blue-600'),
    (r'\bring-red-500', 'ring-cyan-500'),
    (r'\bborder-red-200\b', 'border-cyan-200'),
    (r'\bbg-red-600', 'bg-blue-600'),
]

for d in directories:
    if not os.path.exists(d):
        continue
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pattern, repl in replacements:
                    content = re.sub(pattern, repl, content)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")

print("Done.")
