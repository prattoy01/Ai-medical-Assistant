#!/usr/bin/env python3
"""
Database initialization script for AI Medical Assistant
"""

from app import app, db
from models import User, Prescription

def init_database():
    """Initialize the database and create tables"""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
            return False

def create_sample_data():
    """Create sample data for testing"""
    with app.app_context():
        try:
            # Check if sample user already exists
            existing_user = User.query.filter_by(email='test@example.com').first()
            if existing_user:
                print("ℹ️ Sample user already exists, skipping...")
                return
            
            # Create sample user
            from werkzeug.security import generate_password_hash
            
            sample_user = User()
            sample_user.first_name = "John"
            sample_user.last_name = "Doe"
            sample_user.username = "johndoe"
            sample_user.email = "test@example.com"
            sample_user.password = generate_password_hash("password123")
            sample_user.age = 30
            sample_user.gender = "male"
            
            db.session.add(sample_user)
            db.session.commit()
            
            print("✅ Sample user created successfully!")
            print("   Email: test@example.com")
            print("   Password: password123")
            
        except Exception as e:
            print(f"❌ Error creating sample data: {e}")

if __name__ == "__main__":
    print("🚀 Initializing AI Medical Assistant Database...")
    print("=" * 50)
    
    # Initialize database
    if init_database():
        print("\n📝 Creating sample data...")
        create_sample_data()
        print("\n✅ Database initialization completed!")
        print("\n🎉 You can now run the application with: python app.py")
    else:
        print("\n❌ Database initialization failed!")
        print("Please check your configuration and try again.") 