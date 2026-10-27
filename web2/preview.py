from flask import Flask, render_template

app = Flask(__name__)

@app.get("/")
@app.get("/index.html")
def chat():
    return render_template("index.html")

@app.get("/mentor.html")
def mentor():
    return render_template("mentor.html")
