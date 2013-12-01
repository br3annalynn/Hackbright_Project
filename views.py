from flask import Flask, render_template, redirect, request, g, session, url_for, flash
from model import User
from flask.ext.login import LoginManager, login_required, login_user, current_user
from flaskext.markdown import Markdown
import config
import forms
import model
import my_rdio_search
import json

app = Flask(__name__)
app.config.from_object(config)

# Stuff to make login easier
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

# End login stuff

# Adding markdown capability to the app
Markdown(app)

@app.route("/")
def index():
    return render_template("planets.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def authenticate():
    form = forms.LoginForm(request.form)
    if not form.validate():
        flash("Incorrect username or password") 
        return render_template("login.html")

    email = form.email.data
    password = form.password.data

    user = User.query.filter_by(email=email).first()

    if not user or not user.authenticate(password):
        flash("Incorrect username or password") 
        return render_template("login.html")

    login_user(user)
    return redirect(request.args.get("next", url_for("index")))

    # submitted_email = request.form.get('email')
    # submitted_password = request.form.get('password')
    
    # user_id = model.login(submitted_email, submitted_password)
    # if user_id:
    #     session['session_user_id'] = user_id 
    #     return redirect(url_for("index"))
    # else:
    #     flash("Username or password incorect.")
    #     return redirect(url_for("process_login"))

@app.route("/register")
def get_registration_info():
    return render_template("register.html")

@app.route("/register", methods=["POST"])
def register_user():
    submitted_email = request.form.get('email')
    submitted_password = request.form.get('password')
    submitted_password_verify = request.form.get('password_verify')

    if model.check_for_user(submitted_email):
        flash("This user already exists.")
        return redirect(url_for("get_registration_info"))

    elif submitted_password != submitted_password_verify:
        flash("Passwords do not match")
        return redirect(url_for("get_registration_info"))
    else:
        model.register_user(submitted_email, submitted_password, submitted_age, submitted_gender, submitted_zipcode)
        flash("You've been added. Please sign-in below.")
        return redirect(url_for("login"))

# @app.route("/planets")
# def show_planets():
#     return render_template("planets.html")


@app.route("/get_music_collection")
def get_music_collection():
    # session_music_collection = session.get('session_music_collection')
    # if session_music_collection:
    #     return session_music_collection
    # else:
    user_info = model.get_Rdio_info('fake user')
    #call my_rdio_search on current user to return music collection and playlists
    music_collection = my_rdio_search.get_user_collection(user_info)
    # session['session_music_collection'] = session_music_collection
    return music_collection

@app.route("/get_playlists")
def get_playlists():
    # session_playlists = session.get('session_playlists')
    # if session_playlists:
    #     return session_playlists
    # else:
    user_info = model.get_Rdio_info('fake user')
    #call my_rdio_search on current user to return music collection and playlists
    playlists = my_rdio_search.get_user_playlists(user_info)
    # session['playlists'] = session_playlists
    return playlists

@app.route("/get_token")
def get_token():
    # domain = "space-james.herokuapp.com"
    domain = "localhost"
    user_info = model.get_Rdio_info('fake user')
    token = my_rdio_search.get_user_playback_token(user_info, domain)
    return token


@app.route("/clear")
def clear():
    session.clear()
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)