# Analyzer evidence collection

Static Jinja2 templates and one stylesheet for a programming-skill Analyzer. A learner adds three kinds of evidence. A mentor page shows a read-only sample. No backend and no JavaScript. Navigation is ordinary links and GET forms.

## Page order

Start sits outside the progress rail. The rail is four steps: 1 Choose, 2 Add evidence, 3 Review, 4 Done. The mentor page hides the rail.

1. `templates/index.html` — Start. About 10 minutes, the three evidence kinds, and Begin. Quiet link: Mentor preview.
2. `templates/choose.html` — Step 1. Three equal cards: code artifacts, error logs, screen recordings.
3. `templates/code.html` — Step 2. Code file (visual only), language, what it shows, and a paste area.
4. `templates/errors.html` — Step 2. Stack trace paste area and a screenshot field (visual only).
5. `templates/recording.html` — Step 2. Share link, duration in minutes, and a note. No video player.
6. `templates/review.html` — Step 3. Sample code, traceback, and recording, each with an Edit link.
7. `templates/done.html` — Step 4. Confirmation of what a mentor will look at.
8. `templates/mentor.html` — Read-only sample for Amina Yusuf, collected 27 Oct 2026. No form submit.

Evidence pages link to each other with “Also add …” under the form. Continue always goes to review. Back on those forms returns to choose.

## Copy into Flask

1. Copy `templates/` into the Flask app’s `templates/` directory (the folder that contains `base.html`).
2. Copy `static/css/analyzer.css` to the Flask app’s `static/css/analyzer.css`.

`base.html` already loads the stylesheet with:

```html
{{ url_for('static', filename='css/analyzer.css') }}
```

Child templates use `{% extends "base.html" %}` and fill `{% block content %}`. Flask resolves `url_for`. Opening a template file directly, before rendering, will not load the CSS.

Useful blocks in `base.html`:

| Block | Role |
| --- | --- |
| `title` | Document title |
| `body_class` | Layout width (`layout-wide`, `layout-review`, `layout-start`) |
| `step_label` | Text on the right of the top bar |
| `current_choose`, `current_evidence`, `current_review`, `current_done` | Put `aria-current="step"` on that rail item |
| `evidence_href` | Step 2 link target (`code.html`, `errors.html`, or `recording.html`) |
| `progress` | Override empty on the mentor page to hide the rail |
| `content` | Page body |
| `actions` | Back and the one primary button |

## Form actions to replace

Forms use `method="get"` and an `action` of the next HTML file so a static server still opens that page. The review page shows fixed sample copy. It does not read the query string. Point these actions at real routes when you save a submission:

| Page | Form id | Current action | Replace with |
| --- | --- | --- | --- |
| `index.html` | `start-form` | `choose.html` | the choose route |
| `code.html` | `code-form` | `review.html` | the route that stores the code artifact, then review |
| `errors.html` | `errors-form` | `review.html` | the route that stores the log, then review |
| `recording.html` | `recording-form` | `review.html` | the route that stores the link, then review |
| `review.html` | `review-form` | `done.html` | the route that submits the collection |

Field names, until you map them onto a model:

- Code: `code_file`, `language`, `shows`, `source`
- Errors: `log`, `screenshot`
- Recording: `recording_url`, `duration_min`, `narration`

Also change the plain `href` values (`choose.html`, `code.html`, and the rest) to `url_for(...)` when those routes exist. Leave them as relative filenames until then, so the templates still navigate when the HTML files sit together.

Primary buttons use the HTML `form` attribute so they can live in the shared actions footer and still submit the form in the page.

## File inputs

The code-file field and the screenshot field are visual only. Nothing is uploaded. The forms are GET, which does not send a file body. When you wire uploads, switch that form to `method="post"` and `enctype="multipart/form-data"`, and point `action` at the upload route. The screenshot input uses `accept="image/*"`.
