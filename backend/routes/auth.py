from flask import Blueprint, request, jsonify
import sqlite3

auth_bp = Blueprint('auth', __name__)
DB = 'database.db'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        with sqlite3.connect(DB) as conn:
            conn.execute('''
                INSERT INTO users (first_name, last_name, birthday, gender, email, phone_number, subject)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['firstName'], data['lastName'], data['birthday'],
                data['gender'], data['email'], data['phoneNumber'], data['subject']
            ))
        return jsonify({'message': 'User registered'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    with sqlite3.connect(DB) as conn:
        user = conn.execute(
            'SELECT * FROM users WHERE email = ? AND phone_number = ?',
            (data['email'], data['password'])  # Replace phone_number with password field if needed
        ).fetchone()
        if user:
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
