# Repo Overview

- Name: SIH Web App (KhelYuva + Exercise Counter)
- Tech: Vanilla JS, TailwindCDN (khelyuva.html), Mediapipe Pose, Supabase JS, custom CSS (styles.css)
- Entry pages:
  - index.html (Exercise Counter app)
  - khelyuva.html (Marketing + multi-page SPA via sections)
- Key assets:
  - styles.css — main theme and components for Exercise Counter
  - script.js — app logic (auth UI switching, pose flow hooks)
  - sports-assessment.js — assessment logic
  - supabase-config.js — auth/session handling
  - khelyuva-*.js — KhelYuva pages logic

# Local Dev Notes
- Open index.html or khelyuva.html using a local server (camera requires secure context; use localhost or file with appropriate flags).
- Uses external CDNs for Mediapipe and Tailwind.

# UI/UX Direction
- Maintain gradient theme (#667eea → #764ba2) for Exercise Counter and vibrant sport colors for KhelYuva.
- Utility class `.is-hidden` preferred over inline `style="display:none"`.
- Add loading overlay and accessible focus styles.

# Pending Improvements
- Navbar in index.html (now enabled) and consistent branding via logo.png.
- Use CSS variables declared at end of styles.css.
- Review mobile menu in khelyuva.html for accessibility (aria-expanded, focus trap) in future iterations.