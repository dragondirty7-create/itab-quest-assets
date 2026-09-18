# Note for Michael and Soul — 2026-09-18

From Claude. Where the iTab Quest art stands, what's decided, and what's waiting on whom.

## What's in the repo

| Asset | File | Status |
|---|---|---|
| Main menu background | `backgrounds/bg_main_menu.png` | **PASS**: 1920x1080 |
| Gameplay background | `backgrounds/bg_gameplay.png` | **PASS**: 1920x1080 |
| Level map background | `backgrounds/bg_level_map.png` | **PASS**: 1920x1080 |
| Tavi | `characters/character_tavi_main.png` | **PASS**: real alpha (cleaned before the filing rule below) |
| Feedback: correct | `ui/ui_feedback_correct.png` | **NEEDS_ALPHA_CLEANUP** |
| Feedback: try again | `ui/ui_feedback_try_again.png` | **NEEDS_ALPHA_CLEANUP** |
| Feedback: hint | `ui/ui_feedback_hint.png` | **NEEDS_ALPHA_CLEANUP** |
| Rewards: 3 stars, treasure chest, 5 badges, 8 stickers | `rewards/reward_*.png` (17 files) | **NEEDS_ALPHA_CLEANUP**; small (stickers ~300 px, badges ~430 px) |
| Nim | `characters/character_nim_main.png` | **missing**: file not on disk yet |
| Full logo | `branding/itabquest_logo_main.png` | **missing**: file not on disk yet, and see decision 2 |
| App icon | `branding/itabquest_logo_app_icon.png` | **missing**: file not on disk yet |
| Horizontal logo | `branding/itabquest_logo_horizontal.png` | **missing**: file not on disk yet |
| Button styles | `ui/ui_button_style_prototype.html` | tidied; the original is the first commit on that file |

All paths are inside `itab_quest_approved_assets_v1/`, except the button prototype, which is at
the repo root under `ui/`. Every file's dimensions, format, alpha status and SHA-256 are in
`itab_quest_approved_assets_v1/ASSET_VERIFICATION.txt`. The package is **not ready** yet.

## Decisions made

1. **Filing rule (Michael):** keep originals untouched, name them, file them, and mark transparent
   assets `NEEDS_ALPHA_CLEANUP`. Michael fixes transparency himself. Claude doesn't retouch art.
2. **Full logo = the purple-framed version.** But the full logo Gemini re-exported afterwards is
   the **blue**-framed one. The purple frame only appears in the app icon. This needs an answer:
   file the blue one, or get a purple export?
3. The original Gemini downloads stay in the repo root, unchanged, as the record of what was
   approved.

## Things to know about Gemini's exports

- **Every download so far has been a JPEG,** including two named `.png`. JPEG can't hold
  transparency, so the gray checkerboard is painted into the picture. Gemini even paints it
  inside Nim's see-through wings. Ask for "PNG with a real transparent background (alpha
  channel), no checkerboard."
- **Pasting images into Claude's chat isn't enough.** A paste is a flattened preview, so it
  can't be filed or checked for transparency. Save the file from Gemini (it lands in Downloads)
  and Claude can pick it up from there.
- **Sheets with several items and printed captions** get split into exact crops that leave out
  the captions. UI text is drawn in code, never baked into art.

## Waiting on

| What | Who |
|---|---|
| Save the re-exported Tavi, Nim, full logo, app icon and horizontal logo as files | Michael |
| Blue or purple full logo (decision 2) | Michael / Soul |
| Alpha cleanup of the three feedback poses, the 17 reward items, and any other exports that come without real transparency | Michael |
| Badge names are provisional (Michael: "I'd label them for now as..."). Confirm or rename. | Michael / Soul |
| Teal buttons: white text on teal is about 2.3:1 contrast, under the 3:1 minimum for bold text. Try dark text (about 8:1) or a dark outline on the white text? | Michael / Soul |

## Elsewhere, for Soul

- **REAPER pre-format backup** (`Documents\GitHub\reaper-format-backup`, not on GitHub): built,
  and 59 automated checks pass. A real scan found 76 projects on C:, none missing media, and
  85 GB to copy. It's waiting for Michael to free space on E:, the backup drive, before the real
  build. Drive roles: C: gets formatted, E: is the backup drive, F: is ignored.
- **Crypto wallet recovery scanner:** Soul's reply went into the Drive note, but Claude's Drive
  access only returns document text. If the reply is a comment, Claude couldn't read it. Please
  paste it to Claude, or add it to the document body.

— Claude
