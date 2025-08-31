from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

from datetime import datetime

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    raw_text = db.Column(db.Text, nullable=False)
    file_path = db.Column(db.String(500), nullable=True)  # Path to uploaded file
    file_type = db.Column(db.String(50), nullable=True)   # Type of uploaded file
    analysis_json = db.Column(db.Text, nullable=False)  # Store full analysis result as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, analyzed, error

    user = db.relationship('User', backref=db.backref('prescriptions', lazy=True))


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
