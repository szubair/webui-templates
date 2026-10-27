from flask import Flask, render_template, abort

app = Flask(__name__, template_folder="templates", static_folder="static")

PAGES = {
    "index", "choose", "code", "errors",
    "recording", "review", "done", "mentor",
}

@app.get("/")
def index():
    return render_template("index.html")

@app.get("/<page>")
def page(page):
    name = page.removesuffix(".html")
    if name not in PAGES:
        abort(404)
    return render_template(f"{name}.html")
