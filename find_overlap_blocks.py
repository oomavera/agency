import difflib

with open('pages/house-cleaning-lake-mary-fl.html', encoding='utf-8') as f:
    s1 = f.read()
with open('pages/house-cleaning-longwood-fl.html', encoding='utf-8') as f:
    s2 = f.read()

seq = difflib.SequenceMatcher(None, s1, s2)
blocks = [b for b in seq.get_matching_blocks() if b.size > 100]

for i, block in enumerate(blocks, 1):
    print(f'Block {i}: Lake Mary [{block.a}:{block.a+block.size}] <-> Longwood [{block.b}:{block.b+block.size}] (size {block.size})')
    snippet = s1[block.a:block.a+min(block.size, 400)]
    print(snippet.replace('\n', ' ')[:400])
    print('-'*80) 