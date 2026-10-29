# Analyzer code artifact

Static Jinja2 templates, one stylesheet, and one script for a programming-skill Analyzer. The active learner flow is two pages: a code-artifact form with a live completion ring, then a separate sample review. No backend, no upload, and no model call. The review copy is written into the template.

## Active flow

1. `templates/index.html` — Start. One action opens the code form. Quiet link: Mentor preview.
2. `templates/code.html` — Code artifact. Language, pasted code, optional file, and “What does this code demonstrate?” A readiness panel shows the ring, the percentage, the checklist, and Analyze.
3. `templates/review.html` — Sample review. Submitted artifact, observed skill signals, strengths, areas to explore, and suggested mentor questions. Edit submission returns to `code.html`.

The form opens `review.html` only at 100%. The review page does not read the query string. It always shows the same sample, and it is labeled as a static prototype rather than model output.

`templates/done.html` and `templates/mentor.html` are extra static pages with code-only copy. The mentor page repeats the review structure with mentor-facing notes. They are not steps on the form. Confirmation and mentor links sit on the sample pages.

These files remain in `templates/` and are not linked from the active pages: `choose.html`, `errors.html`, `recording.html`.

## Completion

Three requirements. The ring uses only `0%`, `33%`, `67%`, and `100%`. Pasted code and a selected file are one requirement, not two slices.

| Requirement | Counts as complete |
| --- | --- |
| Language | Trimmed text is at least 1 character |
| Code artifact | Pasted code is at least 40 characters after trimming, or any file is selected |
| Explanation | At least 20 characters after trimming |

Whitespace-only text is incomplete. Hints next to the fields state the same thresholds. Below 100%, Analyze is disabled and the status reads “Complete N more fields.” (one remaining field uses the singular). At 100% the status reads “Ready for analysis.” and Analyze can open `review.html`. The script also blocks submit while something is still incomplete.

The percentage is visible in the ring. The status is an `aria-live` region. The ring is a meter with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext`. The checklist spells Needed or Done in text. Color is not the only status signal.

`static/js/analyzer.js` listens for `input` and `change` on the code form. Other pages load the script and do nothing. With scripts disabled, Analyze stays disabled.

## File input

The file control is prototype-only. Choosing a file marks the code-artifact requirement complete and shows the file name. Remove file clears that selection. The form uses `method="get"`, which does not send a file body. Nothing is uploaded.

When you wire a real upload, switch `code-form` to `method="post"` and `enctype="multipart/form-data"`, and point `action` at the upload route.

## Copy into Flask

1. Copy `templates/` into the Flask app’s `templates/` directory (the folder that contains `base.html`).
2. Copy `static/css/analyzer.css` to the Flask app’s `static/css/analyzer.css`.
3. Copy `static/js/analyzer.js` to the Flask app’s `static/js/analyzer.js`.

`base.html` loads both static files with `url_for`:

```html
{{ url_for('static', filename='css/analyzer.css') }}
{{ url_for('static', filename='js/analyzer.js') }}
```

Child templates use `{% extends "base.html" %}` and fill `{% block content %}`. Flask resolves `url_for`. Opening a template file directly, before rendering, will not load the CSS or the script.

The header, main content, and footer actions stay in `base.html`. `{% block progress %}` is empty, so the active pages do not show a step rail. The mentor page overrides that block with nothing.

Useful blocks in `base.html`:

| Block | Role |
| --- | --- |
| `title` | Document title |
| `body_class` | Layout width (`layout-code`, `layout-review`, `layout-start`) |
| `step_label` | Text on the right of the top bar |
| `progress` | Empty on the active pages |
| `content` | Page body |
| `actions` | Footer actions |

## Form actions to replace

Forms use `method="get"` and an `action` of the next HTML file so a static server still opens that page. Point these at real routes when you save a submission:

| Page | Form id | Current action | Replace with |
| --- | --- | --- | --- |
| `index.html` | `start-form` | `code.html` | the code-artifact route |
| `code.html` | `code-form` | `review.html` | the route that stores the artifact, then review |

`review.html` has no form. Its edit links are `code.html`. Replace those `href` values with `url_for(...)` when the routes exist. Leave relative filenames until then, so the templates still navigate when the HTML files sit together.

The review page should be rendered with the stored language, file name (when present), explanation, and code. The skill signals, strengths, areas to explore, and mentor questions are placeholders until a real analysis exists. Keep a visible prototype label until that result is actually generated.

Field names on `code-form`:

| Field | Name | Required for 100% |
| --- | --- | --- |
| Language | `language` | Yes |
| Pasted code | `source` | Yes, unless a file is selected |
| File | `code_file` | Optional; satisfies the artifact requirement in this prototype |
| Explanation | `explanation` | Yes |

Primary buttons on the start page and the code page use the HTML `form` attribute so they can sit outside the form element and still submit it. On the code page, Analyze lives in the readiness panel.
