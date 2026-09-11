# Taste
- Prefers agents to read AGENTS.md fully and then all docs in the order listed there before starting implementation (documentation-first workflow). Confidence: 0.9
- Wants strict scope discipline: implement only what is specified in the docs, no features beyond the documented spec. Confidence: 0.9
- Wants work to stop once the acceptance checklist would pass — minimal, acceptance-driven completion rather than continued gold-plating. Confidence: 0.8
- Wants changes verified against an explicit checklist (e.g. `npm run build`, migrations/seed, and security invariants like "non-admin cannot set status graded") rather than trusting that code is correct. Confidence: 0.8
- Likes to visually preview the rendered UI ("just run the Ui only, i want to see how it looks") — wants a quick way to see the result, and is fine skipping backend/DB setup for a visual check. Confidence: 0.8
- Dislikes over-verification: for visual/UI changes, passing typecheck/lint/build is enough, and their own glance ("the login looks good") is the accepted confirmation for anything markup inspection can't prove. Drop browser/screenshot detour loops and clean up spawned processes when told. Confidence: 0.7
- Cares about anti-"AI-slop" design and brand compliance: expects UI to be audited against the repo's brand guidelines / token system (type roles per element, no duplicated hex tokens, no decorative filler watermarks, no hype or motivational copy) and the drift fixed, not just functional bugs. Confidence: 0.6
- For polish/consistency passes (as opposed to spec'd feature work), prefers broad scope — chose to audit and fix the whole app UI rather than just the one offending screen. Confidence: 0.6
- Communicates in terse, informal, low-ceremony messages ("okay cool.. thanks.. run this on port 3000", "what are the credentials?", "so everything is done?") and expects concise, direct answers without over-explaining. Confidence: 0.5
