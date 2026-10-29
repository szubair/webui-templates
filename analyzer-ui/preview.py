from flask import Flask, render_template, abort

app = Flask(__name__, template_folder="templates", static_folder="static")

PAGES = {
    "index", "code", "review", "done", "mentor",
    "choose", "errors", "recording",
}

@app.route("/", methods=["GET", "POST"])
def home():
    return render_template("index.html")

@app.route("/<page>", methods=["GET", "POST"])
def page(page):
    name = page.removesuffix(".html")
    if name not in PAGES:
        abort(404)
    return render_template(f"{name}.html")
