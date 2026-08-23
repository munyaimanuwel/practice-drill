# Taste
- Prefers agents to read AGENTS.md fully and then all docs in the order listed there before starting implementation (documentation-first workflow). Confidence: 0.9
- Wants strict scope discipline: implement only what is specified in the docs, no features beyond the documented spec. Confidence: 0.9
- Wants work to stop once the acceptance checklist would pass — minimal, acceptance-driven completion rather than continued gold-plating. Confidence: 0.8
- Wants changes verified against an explicit checklist (e.g. `npm run build`, migrations/seed, and security invariants like "non-admin cannot set status graded") rather than trusting that code is correct. Confidence: 0.8
- Likes to visually preview the rendered UI ("just run the Ui only, i want to see how it looks") — wants a quick way to see the result, and is fine skipping backend/DB setup for a visual check. Confidence: 0.8
- Communicates in terse, informal, low-ceremony messages ("okay cool.. thanks.. run this on port 3000", "what are the credentials?", "so everything is done?") and expects concise, direct answers without over-explaining. Confidence: 0.5
