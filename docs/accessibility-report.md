# Accessibility Report

Date: 2026-07-07
Scope: `hb-technologies/`

## Standard
- Target: WCAG 2.2 AA
- Validation method: source review, build validation, and live DOM inspection on key routes

## Implemented Improvements
- Added a visible skip link and preserved main landmark structure.
- Kept a single top-level `h1` on public pages and a clear heading hierarchy under it.
- Repaired the consultation form so labels, help text, submit state, and success/error messages are announced correctly.
- Added `aria-describedby`, `aria-invalid`, `role="status"`, and `role="alert"` where appropriate in the form flow.
- Improved keyboard access for the mobile navigation with explicit button semantics, escape-to-close, and focus return.
- Added keyboard activation and pressed-state semantics to the team card toggle.
- Ensured all major interactive buttons in the hero and admin editor have explicit `type="button"` where needed.
- Kept the admin login heading visible and labeled the password field for screen readers.
- Removed a redundant `aria-hidden` attribute from the floating WhatsApp wrapper.
- Replaced Google Fonts `@import` with `next/font` to improve loading and avoid render-blocking font fetches.

## Verified Pages
- `/`
- `/contact`
- `/admin`

## Notes
- The browser accessibility tree shows the homepage and contact page with clear landmarks and labeled controls.
- The contact form exposes all labels and a live status region.
- The admin login screen exposes the heading, password label, and submit control in the accessibility tree.

## Residual Risks
- The app still contains a number of admin/editor controls and legacy content surfaces that should be reviewed interactively in a full keyboard pass.
- Some visually rich cards rely on custom CSS interactions; they should be spot-checked with screen readers and high zoom in a real device matrix.
