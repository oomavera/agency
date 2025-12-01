Batch 1 — Data Intake & Prep (Per City)
1.1 [3] Create YAML Template
Purpose: Single source of truth for city variables.

Inputs: Appendix A from PRD.

Output: /content/specs/city-template.yaml

Steps:

Copy template from PRD.

Add inline comments for every field.

Validate YAML syntax (lint).

DoD: Template lints clean; all required fields commented.

Prompt stub (if using AI):

pgsql
Copy
Edit
Create a YAML template for city landing pages with all fields from the PRD. 
Include inline comments explaining each field. Validate syntax.

1.2 [4] Fill YAML for Each City (x5)
Purpose: Provide factual, localized data.

Inputs: Template, ZIPs, landmarks, offers, testimonials.

Output: oviedo.yaml, winter-park.yaml, lake-mary.yaml, orlando.yaml, longwood.yaml.

Steps:

Research/confirm ZIPs & landmarks (city sites/Google Maps).

Insert unique testimonial & offer per city.

Add pricing model (or “custom”).

Run YAML lint.

Send to Elias for review.

DoD: All five files complete, no blank required fields, approved by Elias.

Micro-prompt (per city):

pgsql
Copy
Edit
Fill this YAML for CITY = "Oviedo" using only provided facts or verified sources. 
If unknown, mark TODO_. Return valid YAML only.
[TEMPLATE HERE]

1.3 [2] Store YAML in Repo/DB
Purpose: Version control and accessibility.

Inputs: 5 YAML files.

Output: Files in /content/cities/ with commit.

Steps:

Create folder /content/cities/.

Commit files with message “Add city YAMLs”.

Push to remote.

DoD: Files are in repo; link shared with team/agent.

Batch 2 — SERP Recon & Keyword Map (Per City)
2.1 [5] SERP Scrape
Purpose: Understand competitor content & structure.

Inputs: Primary queries (“house cleaning {city} fl”, “maid service {city}”).

Output: serp-{city}.json/md with URL, H1, word_count, notable_sections, FAQs.

Steps:

Open a clean/incognito browser profile.

Record top 5 organic URLs + 3 local pack sites.

Extract H1, approximate word count (rough via copy/paste or script).

Note sections (services, pricing), FAQs.

Save as JSON/Markdown.

DoD: File contains all required fields; no duplicates; stored in repo.

AI prompt stub:

pgsql
Copy
Edit
Visit these URLs (list) and return JSON with: url, h1, word_count_estimate, sections[], faqs[]. 
Do not summarize—capture raw headings/faq questions.

2.2 [4] Keyword & Entity Extraction
Purpose: Feed secondary keywords/entities into copy.

Inputs: SERP result, Google Autocomplete, PAA.

Output: keywords-{city}.json with ≥5 secondary keywords + entities (ZIPs, neighborhoods).

Steps:

Use tools (AlsoAsked, AnswerThePublic or manual) to collect PAAs.

Export Autocomplete/related searches terms.

Deduplicate and tag intent (pricing, process, timing).

DoD: JSON has at least 5 secondaries + entity list; no duplicates.

Batch 3 — Prompt Assembly (“Prompt Sandwich”) (Per City)
3.1 [4] Build Prompt Template
Purpose: Reusable, strict-format prompt.

Inputs: PRD “Prompt Framework”.

Output: /prompts/city-page-template.txt with placeholders.

Steps:

Copy the system/constraints/output sections verbatim.

Replace city-specific content with placeholders like {PRIMARY_KEYWORD}.

Add a QA checklist section at bottom.

DoD: Template passes placeholder scan (no hard-coded city data).

3.2 [5] Inject Data & SERP Recon
Purpose: Generate city-specific prompts.

Inputs: YAML file + serp & keywords JSON.

Output: prompt-{city}.txt

Steps:

Load YAML + JSON.

Replace placeholders programmatically or carefully manually.

Ensure constraints block unchanged.

Save final prompt.

DoD: All placeholders filled; prompt length under model limits.

Script pseudo-code:

python
Copy
Edit
import yaml, json
tmpl = open('city-page-template.txt').read()
data = yaml.safe_load(open('cities/oviedo.yaml'))
serp = json.load(open('serp-oviedo.json'))
kw   = json.load(open('keywords-oviedo.json'))
prompt = tmpl.format(DATA_BLOCK=yaml.dump(data), SERP=json.dumps(serp), KWS=json.dumps(kw),
                    PRIMARY_KEYWORD=data['PRIMARY_KEYWORD'])
open('prompt-oviedo.txt','w').write(prompt)

Batch 4 — Draft Generation & Self-QA (Per City)
4.1 [2] Run LLM Call
Purpose: Produce the actual page draft.

Inputs: prompt-{city}.txt

Output: draft-{city}.md (or .html) with schema, QA section.

Steps:

Paste or POST prompt into LLM.

Save raw output unedited.

Convert to .md if needed.

DoD: All sections 1–11 present; word count 900–1,200.

4.2 [4] Auto-QA (Self-Check)
Purpose: Ensure model answered its own checklist.

Inputs: Draft file.

Output: Checklist block with Y/N statuses.

Steps:

Confirm checklist exists.

If “N” anywhere, re-prompt focusing only on failed items (include original output).

Merge fixes into final draft.

DoD: All checklist items “Y” or justified exceptions.

Mini re-prompt template:

pgsql
Copy
Edit
You failed these checks: [list]. Provide ONLY the corrected sections, no other text.

Batch 5 — Validation & Editing
5.1 [6] Scripted QA (Regex/Checks)
Purpose: Remove human error on basics.

Inputs: Draft files.

Output: qa-report-{city}.txt with pass/fail for: title length, meta length, keyword counts, word count, JSON-LD present.

Steps:

Write small script to parse markdown/html.

Count characters/words, regex primary keyword.

Log pass/fail.

DoD: Report saved; all fails addressed.

5.2 [5] Duplicate Content Check
Purpose: Avoid >30% overlap across cities.

Inputs: Drafts for all cities.

Output: Similarity report with % overlap and offending sentences.

Steps:

Use tool/library (difflib, simhash, Copyscape).

Flag >30% overlaps.

Rewrite flagged sections.

DoD: All pages <30% overlap.

5.3 [3] Human Review
Purpose: Kill hallucinations, validate offers/testimonials.

Inputs: Draft, QA reports.

Output: “Approved” final copy.

Steps:

Fact-check local data (ZIPs, landmarks).

Confirm pricing/offers.

Approve or request edits.

DoD: “Human reviewed” comment on task; final copy locked.

Batch 6 — Implementation & Publishing
6.1 [5] Convert Draft to Final HTML/Markdown
Purpose: Clean structural HTML/MD for CMS/static site.

Inputs: Final copy.

Output: /pages/house-cleaning-{city}-fl/index.html|md

Steps:

Ensure H1/H2/H3 tags correct.

Add Quick Answer box HTML/shortcode.

Insert alt text list as attributes.

DoD: Builds locally; no broken tags.

6.2 [4] Add JSON-LD
Purpose: Structured data for rich results.

Inputs: JSON-LD block from draft.

Output: <script type="application/ld+json">…</script> in page head/body.

Steps:

Paste schema.

Validate in Google Rich Results Test.

Fix errors.

DoD: Validator passes; no errors.

6.3 [3] Internal Linking
Purpose: Pass relevance & crawl equity.

Inputs: Link list from draft.

Output: Updated pages with links in context.

Steps:

Add 2+ incoming links to each city page.

Add 1–2 outbound links from page to core services.

Rebuild sitemap.

DoD: Links live; anchors descriptive; no 404s.

6.4 [4] Images
Purpose: Visual trust & CWV optimization.

Inputs: Image list (names + alt), raw photos.

Output: Optimized images (<200KB), WebP if possible, alt tags.

Steps:

Create/select images (stock or real).

Compress (ImageOptim/Squoosh).

Add loading="lazy".

DoD: All images optimized and referenced; no broken links.

6.5 [3] Deploy & Submit
Purpose: Go live + index fast.

Inputs: Final pages, sitemap.

Output: Live URLs, submitted in GSC.

Steps:

Deploy code/contents.

Update sitemap.xml & ping GSC.

Use “URL Inspection → Request Indexing”.

DoD: URLs return 200; appear in Coverage report as “Submitted and Indexed”. 