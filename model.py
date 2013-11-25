import config
import bcrypt
import os
from datetime import datetime

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Integer, String, DateTime, Text

from sqlalchemy.orm import sessionmaker, scoped_session, relationship, backref

from flask.ext.login import UserMixin

engine = create_engine(config.DB_URI, echo=False) 
session = scoped_session(sessionmaker(bind=engine,
                         autocommit = False,
                         autoflush = False))

Base = declarative_base()
Base.query = session.query_property()

class User(Base, UserMixin):
    __tablename__ = "users" 
    id = Column(Integer, primary_key=True)
    email = Column(String(64), nullable=False)
    password = Column(String(64), nullable=False)
    access_token_key = Column(String(64), nullable=True)
    access_token_secret = Column(String(64), nullable=True)
    salt = Column(String(64), nullable=False)

    def set_password(self, password):
        self.salt = bcrypt.gensalt()
        password = password.encode("utf-8")
        self.password = bcrypt.hashpw(password, self.salt)

    def authenticate(self, password):
        password = password.encode("utf-8")
        return bcrypt.hashpw(password, self.salt.encode("utf-8")) == self.password


def create_tables():
    Base.metadata.create_all(engine)
    u = User(email="test@test.com")
    u.set_password("unicorn")
    session.add(u)
    session.commit()

def check_for_user(email):
    user = session.query(User).filter_by(email=email).first()
    if user:
        return user.id
    else:
        return False

def register_user(email, password):
    user = User(email=email, password=password)    
    session.add(user)
    session.commit()

def login(email, password):
    user = session.query(User).filter_by(email=email).one()
    #if user.password == password:
    if user.authenticate:
        return user.id

def get_Rdio_info(user):
    #take in current user and return API info from db
    #general keys for website
    CONSUMER_KEY = os.getenv('RDIO_CONSUMER_KEY')
    CONSUMER_SECRET = os.getenv('RDIO_CONSUMER_SECRET')
    #keys specific to the user
    ACCESS_TOKEN_KEY = os.getenv('MY_RDIO_ACCESS_TOKEN_KEY')
    ACCESS_TOKEN_SECRET = os.getenv('MY_RDIO_ACCESS_TOKEN_SECRET')
    return [CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN_KEY, ACCESS_TOKEN_SECRET]

if __name__ == "__main__":
    create_tables()