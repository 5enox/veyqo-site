# Veyqo landing page review

## Deliverable
- `index.html`: self-contained HTML/CSS. No framework, JavaScript, fonts, analytics, or remote asset dependencies.
- Local-only artifact. Not deployed or published.

## Design review
- Surface: Decide / Learn.
- Off-white/ink/lime editorial layout; asymmetric desktop hero, serif accents, compact mono labels, responsive single-column mobile layout.
- Slop diagnostic: 0/10 after review. No gradients, glass, feature-tile grid, accent rails, decorative metrics, icon toppers, centered stack, default Inter/system-ui typography, or wrong-surface composition. Arial was chosen as the locally available neutral body/display face paired with Georgia and Courier New.

## Copy review
- Skills consulted: claude-design, copywriting, copywriting/references/ai-tells.md.
- Diagnosis B: preserve the scoped service argument; improve generic slogans and repetitive fragments.
- Selected headline: “Public data. In your spreadsheet.” Chosen for the concrete output. The hero subhead carries the source limit, 250-record cap, $150 price, and review requirement.
- Considered alternatives: “One public source. A working Google Sheet.” (specific but too long for this composition); “Your source, collected into Google Sheets.” (clear but repeats the subhead).
- CTA labels preserved exactly as requested. Upwork is explicitly a job-data project; broader requests use Reddit.
- Self-check: removed the less/more contrast headline, em dash from hero copy, decorative bullet arrows, repeated punchy section headings, and generic footer closer. Reviewed long sentences and retained only factual enumerations/scope details. Safety and availability exclusions remain explicit rather than being polished away.
- The sample is labeled illustrative, fictional, and not live customer data. Its change-summary field is explicitly associated with ongoing collection.
- The page promises a custom scoped service, not existing instant SaaS. Scope and feasibility are agreed before payment/start. No fabricated experience, buyers, metrics, guarantees, or testimonial evidence.
- No competitive uniqueness or conversion-performance claim: a real differentiator would require buyer research and comparison against named alternatives. This is an offer page, not evidence of market validation.
- Cinematic scroll effects were not used because they add no value to source review or the external CTA.

## Executed checks
Run with the project's existing Playwright installation:

`/home/senox/code/code/veyqo/.venv/bin/python /home/senox/veyqo-marketing/site/check_site.py`

Passed at viewport widths 320, 375, 390, 640, 768, 1024, and 1440:
- No page-level horizontal overflow.
- No runtime/console errors.
- No remote assets.
- Existing in-page link targets.
- Visible CTA/nav targets at least 44px high.
- Exact approved external destination URLs and CTA wording.
- “The pilot” anchor successfully navigated to pricing.

Full-page desktop (1440px) and mobile (390px) screenshots visually reviewed. Mobile sample table scrolls within its own region. Browser-harness mobile screenshot capture hit an attachment error; existing local Playwright independently completed all responsive checks and screenshots.

Files: `qa-report.json`, `qa-1440.png`, `qa-390.png`, `check_site.py`.

External checkout and chat were not submitted. Link destinations were verified without asserting external-site availability or a completed purchase. No deployment performed.
