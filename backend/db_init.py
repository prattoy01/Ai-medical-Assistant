import sqlite3

with sqlite3.connect('database.db') as conn:
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            birthday TEXT,
            gender TEXT,
            email TEXT UNIQUE,
            phone_number TEXT,
            subject TEXT
        )
    ''')
print("Database created.")
