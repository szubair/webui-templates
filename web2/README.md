# Analyzer chat

A conversational UI for mentoring programmers. The learner talks with Analyzer and sends code. The thread is a static sample. Nothing calls a model.

On a wide screen the chat is two columns, and on a narrow screen it stacks.

## What the chat collects

One evidence type: code artifacts. That is a small script, a function, or a feature file the learner wrote. There is no error-log screen, no recording screen, and no chooser among evidence types.

## Pages

| File | What it is |
| --- | --- |
| `templates/base.html` | Shared chrome. Skip link, the Analyzer name, and the line that this chat collects code only. Child pages use `{% extends "base.html" %}`. |
| `templates/index.html` | The chat. Three sample messages are already in the thread, with a composer under them. |
| `templates/mentor.html` | The same thread, read-only, plus a short note for the mentor and a link back to the chat. |
| `static/css/web2.css` | The only stylesheet. |

`index.html` and `mentor.html` link to each other with those relative names.

## Flask

Copy `templates/` into the Flask app’s templates directory, and copy `static/css/web2.css` into the app’s `static/css/` directory. `base.html` loads the sheet with `url_for('static', filename='css/web2.css')`.

Serve the pages at paths that match the relative links:

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.get("/")
@app.get("/index.html")
def chat():
    return render_template("index.html")

@app.get("/mentor.html")
def mentor():
    return render_template("mentor.html")
```

Send stays in the browser. A few lines of script append the textarea text to the thread. The file input has no `name`, so it is not a successful form control. Choosing a file does not upload it; the script may only read the local file name to label the message.
