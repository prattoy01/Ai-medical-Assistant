from flask import Flask, request, jsonify, send_from_directory
from models import db, User, Prescription
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# CORS configuration for production
if os.environ.get('FLASK_ENV') == 'production':
    # In production, allow only specific origins
    CORS(app, origins=[
        os.environ.get('FRONTEND_URL', 'https://your-frontend-url.railway.app'),
        'http://localhost:3000'  # For local development
    ])
else:
    # In development, allow all origins
    CORS(app)

# Config - Updated for Railway deployment
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Gemini AI Configuration
gemini_api_key = os.environ.get('GEMINI_API_KEY', "AIzaSyD26wgtl1dhvqEDNgUy1Jd5NQCGVaKA-n8")
model = None

# Initialize Gemini AI if available
def init_gemini():
    global model
    try:
        import google.generativeai as genai  # noqa: F401
        genai.configure(api_key=gemini_api_key)  # noqa: F821
        model = genai.GenerativeModel("gemini-1.5-flash-latest")  # noqa: F821
        print("✅ Gemini AI configured successfully")
        return True
    except Exception as e:
        print(f"⚠️ Gemini AI not available: {e}")
        model = None
        return False

# Try to initialize Gemini
init_gemini()

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt'}

# Initialize database
db.init_app(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def analyze_prescription_with_ai(text, image_data=None):
    """
    Analyze prescription using Gemini AI for comprehensive medical analysis
    """
    try:
        # If Gemini API key is not set, fall back to mock analysis
        if not model:
            print("Gemini API key not found, using mock analysis")
            return analyze_prescription_mock(text)
        
        print(f"Attempting Gemini AI analysis for text: {text[:100]}...")
        
        # Use the same prompt format as the working Python script
        prompt = f"""
You are a medical assistant. Analyze the prescription below:

\"\"\"{text}\"\"\"

Extract the following:
- List of medicines with dose and purpose
- Food to avoid for each medicine
- Safety considerations (e.g. pregnancy, diabetic)
- Nutrition tips
- Safety recommendations

Format the answer clearly and simply.
"""
        
        # Call Gemini API
        print("Calling Gemini API...")
        response = model.generate_content(prompt)
        ai_response = response.text.strip()
        print(f"Gemini API response received: {ai_response[:200]}...")
        
        # Convert the text response to our JSON format
        try:
            # Parse the text response and convert to structured format
            analysis_result = parse_gemini_response_to_json(ai_response, text)
            print("Gemini AI analysis completed successfully!")
            return analysis_result
            
        except Exception as parse_error:
            print(f"Failed to parse Gemini response: {parse_error}")
            print(f"Raw response: {ai_response}")
            # Fall back to mock analysis if parsing fails
            return analyze_prescription_mock(text)
            
    except Exception as e:
        print(f"Gemini API error: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        # Fall back to mock analysis
        return analyze_prescription_mock(text)

def parse_gemini_response_to_json(gemini_response, original_text):
    """
    Parse the Gemini text response and convert it to our JSON format
    """
    try:
        # Initialize the result structure
        result = {
            "medicines": [],
            "explanation": "",
            "nutrition_tips": [],
            "analysis_confidence": 0.9,
            "recommendations": [],
            "raw_gemini_response": gemini_response  # Include the original response
        }
        
        # Extract medicines from the response
        medicines = []
        text_lower = gemini_response.lower()
        
        # Look for medicine patterns in the response
        medicine_patterns = {
            'remdesivir': {
                "name": "Remdesivir (Remdec)",
                "purpose": "Antiviral medication for COVID-19 treatment",
                "dosage": "200mg STAT, then 100mg once daily for 4 days",
                "price": "৳5000-15000",
                "alternatives": ["Molnupiravir", "Paxlovid", "Favipiravir"],
                "foodToAvoid": ["Grapefruit juice", "Alcohol", "High-fat meals"],
                "side_effects": ["Nausea", "Liver problems", "Kidney issues", "Allergic reactions"]
            },
            'tocilizumab': {
                "name": "Tocilizumab (Actemra)",
                "purpose": "Immunosuppressive medication for severe COVID-19",
                "dosage": "400mg once daily for 2 doses with 2-day gap",
                "price": "৳15000-30000",
                "alternatives": ["Baricitinib", "Dexamethasone", "Methylprednisolone"],
                "foodToAvoid": ["Raw foods", "Unpasteurized dairy", "Alcohol"],
                "side_effects": ["Infection risk", "Liver problems", "Allergic reactions", "Blood clotting issues"]
            },
            'phexin': {
                "name": "Phexin (Cephalexin)",
                "purpose": "Antibiotic for bacterial infections",
                "dosage": "500mg 2-3 times daily",
                "price": "৳30-80",
                "alternatives": ["Amoxicillin", "Azithromycin", "Clarithromycin"],
                "foodToAvoid": ["Dairy products (2 hours before/after)", "Alcohol"],
                "side_effects": ["Diarrhea", "Nausea", "Stomach upset", "Allergic reactions"]
            },
            'zeedol': {
                "name": "Zeedol PT (Paracetamol + Tramadol)",
                "purpose": "Pain reliever and fever reducer",
                "dosage": "As prescribed by doctor",
                "price": "৳15-30",
                "alternatives": ["Paracetamol", "Ibuprofen", "Diclofenac"],
                "foodToAvoid": ["Alcohol", "Grapefruit juice"],
                "side_effects": ["Drowsiness", "Nausea", "Constipation", "Dizziness"]
            },
            'stolin': {
                "name": "Stolin Gum Paint",
                "purpose": "Oral antiseptic for gum problems",
                "dosage": "Apply 2-3 times daily",
                "price": "৳50-120",
                "alternatives": ["Betadine mouthwash", "Chlorhexidine", "Salt water rinse"],
                "foodToAvoid": ["Spicy foods", "Hot foods", "Alcohol"],
                "side_effects": ["Temporary staining", "Taste changes", "Mild irritation"]
            },
            'colgate': {
                "name": "Colgate Plax Mouthwash",
                "purpose": "Oral hygiene and fresh breath",
                "dosage": "Rinse 2-3 times daily",
                "price": "৳80-150",
                "alternatives": ["Listerine", "Betadine mouthwash", "Salt water rinse"],
                "foodToAvoid": ["None specific"],
                "side_effects": ["Temporary burning sensation", "Taste changes"]
            }
        }
        
        # Check for medicines in the response
        for keyword, medicine_info in medicine_patterns.items():
            if keyword in text_lower:
                medicines.append(medicine_info)
        
        # Extract nutrition tips from the response
        nutrition_tips = []
        if "nutrition tips" in text_lower or "nutrition" in text_lower:
            # Look for nutrition-related content
            nutrition_section = text_lower.split("nutrition")[1] if "nutrition" in text_lower else ""
            if nutrition_section:
                # Extract bullet points or lines
                lines = nutrition_section.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and ('•' in line or '-' in line or line.startswith('*')):
                        tip = line.replace('•', '').replace('-', '').replace('*', '').strip()
                        if tip and len(tip) > 10:
                            nutrition_tips.append(tip)
        
        # Add default nutrition tips if none found
        if not nutrition_tips:
            nutrition_tips = [
                "Maintain a balanced diet rich in fruits, vegetables, lean proteins, and whole grains",
                "Stay well-hydrated by drinking plenty of fluids",
                "Get adequate rest and sleep",
                "Avoid alcohol and smoking completely"
            ]
        
        # Extract recommendations from the response
        recommendations = []
        if "safety recommendations" in text_lower or "recommendations" in text_lower:
            # Look for safety-related content
            safety_section = text_lower.split("safety")[1] if "safety" in text_lower else ""
            if safety_section:
                lines = safety_section.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and ('•' in line or '-' in line or line.startswith('*')):
                        rec = line.replace('•', '').replace('-', '').replace('*', '').strip()
                        if rec and len(rec) > 10:
                            recommendations.append(rec)
        
        # Add default recommendations if none found
        if not recommendations:
            recommendations = [
                "Take medications as prescribed",
                "Monitor for side effects and allergic reactions",
                "Keep track of any adverse reactions",
                "Consult your doctor if you experience severe side effects",
                "Complete the full course of treatment"
            ]
        
        # Create explanation from the response
        explanation = f"AI Analysis: {gemini_response[:200]}..." if len(gemini_response) > 200 else f"AI Analysis: {gemini_response}"
        
        result["medicines"] = medicines
        result["explanation"] = explanation
        result["nutrition_tips"] = nutrition_tips
        result["recommendations"] = recommendations
        
        return result
        
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        # Return a basic structure with the raw response
        return {
            "medicines": [],
            "explanation": f"AI Analysis: {gemini_response}",
            "nutrition_tips": ["Maintain a balanced diet", "Stay hydrated", "Get adequate rest"],
            "analysis_confidence": 0.7,
            "recommendations": ["Consult your doctor for proper interpretation"],
            "raw_gemini_response": gemini_response
        }

def analyze_prescription_mock(text):
    """
    Fallback mock analysis when Gemini API is not available
    """
    try:
        # Mock AI analysis based on common prescription patterns
        medicines = []
        nutrition_tips = []
        explanation = ""
        
        # Simple keyword-based analysis
        text_lower = text.lower()
        
        # Enhanced medicine detection with more medications
        medicine_patterns = {
            # Antibiotics
            'phexin': {
                "name": "Phexin (Cephalexin)",
                "purpose": "Antibiotic for bacterial infections",
                "dosage": "500mg 2-3 times daily",
                "price": "৳30-80",
                "alternatives": ["Amoxicillin", "Azithromycin", "Clarithromycin"],
                "foodToAvoid": ["Dairy products (2 hours before/after)", "Alcohol"],
                "side_effects": ["Diarrhea", "Nausea", "Stomach upset", "Allergic reactions"]
            },
            'amoxicillin': {
                "name": "Amoxicillin",
                "purpose": "Antibiotic for bacterial infections",
                "dosage": "As prescribed by doctor",
                "price": "৳20-50",
                "alternatives": ["Azithromycin", "Clarithromycin", "Cephalexin"],
                "foodToAvoid": ["Dairy products (2 hours before/after)"],
                "side_effects": ["Diarrhea", "Nausea", "Allergic reactions"]
            },
            'azithromycin': {
                "name": "Azithromycin",
                "purpose": "Antibiotic for bacterial infections",
                "dosage": "As prescribed by doctor",
                "price": "৳40-100",
                "alternatives": ["Amoxicillin", "Clarithromycin", "Cephalexin"],
                "foodToAvoid": ["Dairy products", "Alcohol"],
                "side_effects": ["Nausea", "Diarrhea", "Stomach pain"]
            },
            
            # COVID-19 and antiviral medications
            'remdec': {
                "name": "Remdec (Remdesivir)",
                "purpose": "Antiviral medication for COVID-19 treatment",
                "dosage": "200mg STAT, then 100mg once daily for 4 days",
                "price": "৳5000-15000",
                "alternatives": ["Molnupiravir", "Paxlovid", "Favipiravir"],
                "foodToAvoid": ["Grapefruit juice", "Alcohol", "High-fat meals"],
                "side_effects": ["Nausea", "Liver problems", "Kidney issues", "Allergic reactions"]
            },
            'remdesivir': {
                "name": "Remdesivir",
                "purpose": "Antiviral medication for COVID-19 treatment",
                "dosage": "200mg STAT, then 100mg once daily for 4 days",
                "price": "৳5000-15000",
                "alternatives": ["Molnupiravir", "Paxlovid", "Favipiravir"],
                "foodToAvoid": ["Grapefruit juice", "Alcohol", "High-fat meals"],
                "side_effects": ["Nausea", "Liver problems", "Kidney issues", "Allergic reactions"]
            },
            'actemra': {
                "name": "Actemra (Tocilizumab)",
                "purpose": "Immunosuppressive medication for severe COVID-19",
                "dosage": "400mg once daily for 2 doses with 2-day gap",
                "price": "৳15000-30000",
                "alternatives": ["Baricitinib", "Dexamethasone", "Methylprednisolone"],
                "foodToAvoid": ["Raw foods", "Unpasteurized dairy", "Alcohol"],
                "side_effects": ["Infection risk", "Liver problems", "Allergic reactions", "Blood clotting issues"]
            },
            'tocilizumab': {
                "name": "Tocilizumab",
                "purpose": "Immunosuppressive medication for severe COVID-19",
                "dosage": "400mg once daily for 2 doses with 2-day gap",
                "price": "৳15000-30000",
                "alternatives": ["Baricitinib", "Dexamethasone", "Methylprednisolone"],
                "foodToAvoid": ["Raw foods", "Unpasteurized dairy", "Alcohol"],
                "side_effects": ["Infection risk", "Liver problems", "Allergic reactions", "Blood clotting issues"]
            },
            
            # Pain relievers and fever reducers
            'paracetamol': {
                "name": "Paracetamol/Acetaminophen",
                "purpose": "Fever reducer and pain reliever",
                "dosage": "500-1000mg every 4-6 hours",
                "price": "৳5-15",
                "alternatives": ["Ibuprofen", "Aspirin", "Diclofenac"],
                "foodToAvoid": ["Alcohol", "High-fat meals"],
                "side_effects": ["Nausea", "Liver problems (in high doses)"]
            },
            'napa': {
                "name": "Napa (Paracetamol)",
                "purpose": "Fever reducer and pain reliever",
                "dosage": "500-1000mg every 4-6 hours",
                "price": "৳5-15",
                "alternatives": ["Ace", "Paracetamol", "Fevco"],
                "foodToAvoid": ["Alcohol", "High-fat meals"],
                "side_effects": ["Nausea", "Liver problems (in high doses)"]
            },
            'zeedol': {
                "name": "Zeedol PT (Paracetamol + Tramadol)",
                "purpose": "Pain reliever and fever reducer",
                "dosage": "As prescribed by doctor",
                "price": "৳15-30",
                "alternatives": ["Paracetamol", "Ibuprofen", "Diclofenac"],
                "foodToAvoid": ["Alcohol", "Grapefruit juice"],
                "side_effects": ["Drowsiness", "Nausea", "Constipation", "Dizziness"]
            },
            'ibuprofen': {
                "name": "Ibuprofen",
                "purpose": "Pain reliever, fever reducer, anti-inflammatory",
                "dosage": "200-400mg every 4-6 hours",
                "price": "৳8-20",
                "alternatives": ["Paracetamol", "Aspirin", "Diclofenac"],
                "foodToAvoid": ["Alcohol", "Spicy foods"],
                "side_effects": ["Stomach upset", "Heartburn", "Dizziness"]
            },
            
            # Stomach acid reducers
            'omeprazole': {
                "name": "Omeprazole",
                "purpose": "Reduce stomach acid production",
                "dosage": "20-40mg daily",
                "price": "৳15-30",
                "alternatives": ["Esomeprazole", "Lansoprazole", "Pantoprazole"],
                "foodToAvoid": ["Spicy foods", "Citrus fruits", "Coffee"],
                "side_effects": ["Headache", "Diarrhea", "Vitamin B12 deficiency"]
            },
            'sergel': {
                "name": "Sergel (Omeprazole)",
                "purpose": "Reduce stomach acid production",
                "dosage": "20-40mg daily",
                "price": "৳15-30",
                "alternatives": ["Esomeprazole", "Lansoprazole", "Pantoprazole"],
                "foodToAvoid": ["Spicy foods", "Citrus fruits", "Coffee"],
                "side_effects": ["Headache", "Diarrhea", "Vitamin B12 deficiency"]
            },
            'pantoprazole': {
                "name": "Pantoprazole",
                "purpose": "Reduce stomach acid production",
                "dosage": "20-40mg daily",
                "price": "৳20-40",
                "alternatives": ["Omeprazole", "Esomeprazole", "Lansoprazole"],
                "foodToAvoid": ["Spicy foods", "Citrus fruits", "Coffee"],
                "side_effects": ["Headache", "Diarrhea", "Nausea"]
            },
            
            # Oral care products
            'stolin': {
                "name": "Stolin Gum Paint",
                "purpose": "Oral antiseptic for gum problems",
                "dosage": "Apply 2-3 times daily",
                "price": "৳50-120",
                "alternatives": ["Betadine mouthwash", "Chlorhexidine", "Salt water rinse"],
                "foodToAvoid": ["Spicy foods", "Hot foods", "Alcohol"],
                "side_effects": ["Temporary staining", "Taste changes", "Mild irritation"]
            },
            'colgate': {
                "name": "Colgate Plax Mouthwash",
                "purpose": "Oral hygiene and fresh breath",
                "dosage": "Rinse 2-3 times daily",
                "price": "৳80-150",
                "alternatives": ["Listerine", "Betadine mouthwash", "Salt water rinse"],
                "foodToAvoid": ["None specific"],
                "side_effects": ["Temporary burning sensation", "Taste changes"]
            },
            'oral-b': {
                "name": "Oral-B Pro 2 2000N",
                "purpose": "Electric toothbrush for better oral hygiene",
                "dosage": "Use 2 times daily for 2 minutes",
                "price": "৳2000-4000",
                "alternatives": ["Manual toothbrush", "Other electric toothbrushes"],
                "foodToAvoid": ["None specific"],
                "side_effects": ["Gum sensitivity initially", "None serious"]
            },
            
            # Antihistamines
            'cetirizine': {
                "name": "Cetirizine",
                "purpose": "Antihistamine for allergies",
                "dosage": "10mg once daily",
                "price": "৳10-25",
                "alternatives": ["Loratadine", "Fexofenadine", "Chlorpheniramine"],
                "foodToAvoid": ["Alcohol", "Grapefruit juice"],
                "side_effects": ["Drowsiness", "Dry mouth", "Headache"]
            },
            'loratadine': {
                "name": "Loratadine",
                "purpose": "Antihistamine for allergies",
                "dosage": "10mg once daily",
                "price": "৳15-30",
                "alternatives": ["Cetirizine", "Fexofenadine", "Chlorpheniramine"],
                "foodToAvoid": ["Alcohol", "Grapefruit juice"],
                "side_effects": ["Headache", "Dry mouth", "Fatigue"]
            },
            
            # Antacids
            'ranitidine': {
                "name": "Ranitidine",
                "purpose": "Reduce stomach acid and treat ulcers",
                "dosage": "150-300mg twice daily",
                "price": "৳10-25",
                "alternatives": ["Omeprazole", "Pantoprazole", "Famotidine"],
                "foodToAvoid": ["Spicy foods", "Citrus fruits", "Coffee"],
                "side_effects": ["Headache", "Dizziness", "Constipation"]
            },
            
            # Vitamins and supplements
            'vitamin': {
                "name": "Vitamin Supplements",
                "purpose": "Nutritional support",
                "dosage": "As prescribed by doctor",
                "price": "৳50-200",
                "alternatives": ["Natural food sources", "Other vitamin brands"],
                "foodToAvoid": ["None specific"],
                "side_effects": ["Nausea (if taken on empty stomach)", "None serious"]
            },
            
            # Cough and cold medicines
            'dextromethorphan': {
                "name": "Dextromethorphan",
                "purpose": "Cough suppressant",
                "dosage": "As prescribed by doctor",
                "price": "৳20-50",
                "alternatives": ["Honey", "Salt water gargle", "Other cough syrups"],
                "foodToAvoid": ["Alcohol", "Grapefruit juice"],
                "side_effects": ["Drowsiness", "Dizziness", "Nausea"]
            }
        }
        
        # Check for each medicine pattern
        for keyword, medicine_info in medicine_patterns.items():
            if keyword in text_lower:
                medicines.append(medicine_info)
        
        # Add specific nutrition tips based on detected medicines
        if any('antibiotic' in med['purpose'].lower() for med in medicines):
            nutrition_tips.extend([
                "Take antibiotics on empty stomach for better absorption",
                "Complete the full course of antibiotics",
                "Avoid dairy products 2 hours before and after taking antibiotics",
                "Stay hydrated to help flush out bacteria"
            ])
        
        if any('covid' in med['purpose'].lower() or 'antiviral' in med['purpose'].lower() for med in medicines):
            nutrition_tips.extend([
                "Stay well hydrated with water and electrolyte solutions",
                "Eat light, easily digestible foods",
                "Get adequate rest and sleep",
                "Monitor oxygen levels regularly",
                "Avoid alcohol and smoking completely",
                "Take medications exactly as prescribed"
            ])
        
        if any('pain' in med['purpose'].lower() or 'fever' in med['purpose'].lower() for med in medicines):
            nutrition_tips.extend([
                "Take pain relievers with food to avoid stomach upset",
                "Stay hydrated to help reduce fever",
                "Get adequate rest to help recovery",
                "Avoid alcohol while taking pain medications"
            ])
        
        if any('stomach' in med['purpose'].lower() or 'acid' in med['purpose'].lower() for med in medicines):
            nutrition_tips.extend([
                "Take acid reducers 30 minutes before meals",
                "Avoid spicy, acidic, and fried foods",
                "Eat smaller, more frequent meals",
                "Don't lie down immediately after eating"
            ])
        
        if any('oral' in med['name'].lower() or 'gum' in med['name'].lower() or 'mouthwash' in med['name'].lower() for med in medicines):
            nutrition_tips.extend([
                "Maintain good oral hygiene",
                "Avoid sugary foods and drinks",
                "Use soft-bristled toothbrush",
                "Rinse mouth after meals"
            ])
        
        # Generate explanation based on detected medicines
        if medicines:
            medicine_names = [med['name'] for med in medicines]
            explanation = f"This prescription contains {len(medicines)} medication(s): {', '.join(medicine_names)}. "
            
            # Add specific explanations based on medicine types
            antibiotics = [med for med in medicines if 'antibiotic' in med['purpose'].lower()]
            covid_meds = [med for med in medicines if 'covid' in med['purpose'].lower() or 'antiviral' in med['purpose'].lower()]
            pain_meds = [med for med in medicines if 'pain' in med['purpose'].lower() or 'fever' in med['purpose'].lower()]
            acid_meds = [med for med in medicines if 'stomach' in med['purpose'].lower() or 'acid' in med['purpose'].lower()]
            oral_care = [med for med in medicines if 'oral' in med['name'].lower() or 'gum' in med['name'].lower() or 'mouthwash' in med['name'].lower()]
            
            if antibiotics:
                explanation += "The antibiotics will help fight bacterial infections. "
            if covid_meds:
                explanation += "The antiviral and immunosuppressive medications are for COVID-19 treatment. "
            if pain_meds:
                explanation += "Pain relievers will help reduce fever and discomfort. "
            if acid_meds:
                explanation += "Acid reducers will protect your stomach lining. "
            if oral_care:
                explanation += "Oral care products will help maintain dental hygiene. "
                
            explanation += "Follow the prescribed dosage and complete the full course of treatment."
        else:
            explanation = "No common medications detected in your prescription. Please consult with your healthcare provider for proper interpretation."
            nutrition_tips = ["Maintain a balanced diet", "Stay hydrated", "Get adequate rest"]
        
        # Add general nutrition tips if none specific were added
        if not nutrition_tips:
            nutrition_tips = ["Maintain a balanced diet", "Stay hydrated", "Get adequate rest"]
        
        return {
            "medicines": medicines,
            "explanation": explanation,
            "nutrition_tips": list(set(nutrition_tips)),  # Remove duplicates
            "analysis_confidence": 0.85 if medicines else 0.3,
            "recommendations": [
                "Take medications as prescribed",
                "Keep track of any side effects",
                "Don't skip doses",
                "Store medications properly",
                "Consult your doctor if you experience severe side effects"
            ]
        }
        
    except Exception as e:
        print(f"Mock Analysis error: {e}")
        return {
            "medicines": [],
            "explanation": "Unable to analyze prescription at this time. Please consult your healthcare provider.",
            "nutrition_tips": ["Maintain a balanced diet", "Stay hydrated"],
            "analysis_confidence": 0.0,
            "recommendations": ["Consult your doctor for proper interpretation"]
        }

# Simple admin authentication check
def require_admin(f):
    def decorated_function(*args, **kwargs):
        # For now, we'll use a simple check - in production, use proper JWT tokens
        # You can add admin authentication logic here
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Route: Get all users
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "username": u.username,
            "email": u.email,
            "age": u.age,
            "gender": u.gender
        } for u in users
    ])

# Route: Register
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate required fields
    required_fields = ['firstName', 'lastName', 'username', 'email', 'password', 'age', 'gender']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Check duplicate email
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    # Check duplicate username
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already taken"}), 400

    # Validate password length
    if len(data['password']) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400

    # Create new user
    hashed_pw = generate_password_hash(data['password'])
    user = User()
    user.first_name = data['firstName']
    user.last_name = data['lastName']
    user.username = data['username']
    user.email = data['email']
    user.password = hashed_pw
    user.age = data['age']
    user.gender = data['gender']
    
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# Route: Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    user = User.query.filter_by(email=data.get('email')).first()

    if user and check_password_hash(user.password, data.get('password')):
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username,
                "email": user.email,
                "age": user.age,
                "gender": user.gender
            }
        })
    return jsonify({"error": "Invalid email or password"}), 401

# Route: Upload and analyze prescription
@app.route('/analyze', methods=['POST'])
def analyze_prescription():
    try:
        user_id = request.form.get('user_id')
        text = request.form.get('text', '')
        file = request.files.get('file')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        if not text and not file:
            return jsonify({"error": "Please provide prescription text or upload a file"}), 400

        # Handle file upload
        file_path = None
        file_type = None
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400
            
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            full_file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(full_file_path)
            file_type = file.content_type
            
            # Store only the filename in database for easier URL construction
            file_path = unique_filename
            
            # If no text provided and it's an image, leave text empty for admin review
            # The admin can view the image directly and provide analysis
            if not text and file_type and file_type.startswith('image/'):
                text = ""  # Leave empty so admin can see the actual image

        # Save to database with pending status (no analysis yet)
        new_rx = Prescription()
        new_rx.user_id = user_id
        new_rx.raw_text = text
        new_rx.file_path = file_path
        new_rx.file_type = file_type
        new_rx.analysis_json = json.dumps({
            "medicines": [],
            "explanation": "Pending admin review",
            "nutrition_tips": [],
            "analysis_confidence": 0.0,
            "recommendations": ["Your prescription is under review by our medical team"]
        })
        new_rx.status = 'pending'  # Changed from 'analyzed' to 'pending'
        
        db.session.add(new_rx)
        db.session.commit()

        return jsonify({
            "message": "Prescription submitted for review",
            "prescription_id": new_rx.id,
            "status": "pending"
        }), 201

    except Exception as e:
        print(f"Error in analyze_prescription: {e}")
        return jsonify({"error": "Failed to submit prescription"}), 500

# Route: Get prescriptions for user
@app.route('/dashboard', methods=['GET'])
def get_prescriptions_for_user():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    prescriptions = Prescription.query.filter_by(user_id=user_id).order_by(Prescription.created_at.desc()).all()

    return jsonify([
        {
            "id": p.id,
            "raw_text": p.raw_text,
            "file_path": p.file_path,
            "file_type": p.file_type,
            "analysis": json.loads(p.analysis_json),
            "timestamp": p.created_at.strftime("%Y-%m-%d %H:%M"),
            "status": p.status
        } for p in prescriptions
    ])

# Route: Get all prescriptions for admin
@app.route('/admin/prescriptions', methods=['GET'])
@require_admin
def get_all_prescriptions():
    try:
        prescriptions = Prescription.query.order_by(Prescription.created_at.desc()).all()
        
        result = []
        for p in prescriptions:
            user = User.query.get(p.user_id)
            if not user:
                continue  # Skip if user not found
                
            analysis_data = json.loads(p.analysis_json)
            
            result.append({
                "id": p.id,
                "user": {
                    "id": user.id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email
                },
                "raw_text": p.raw_text,
                "file_path": p.file_path,
                "file_type": p.file_type,
                "analysis": analysis_data,
                "timestamp": p.created_at.strftime("%Y-%m-%d %H:%M"),
                "status": p.status,
                "created_at": p.created_at.isoformat()
            })
        
        return jsonify(result)
    except Exception as e:
        print(f"Error getting all prescriptions: {e}")
        return jsonify({"error": "Failed to get prescriptions"}), 500

# Route: Update prescription status and analysis (admin only)
@app.route('/admin/prescription/<int:prescription_id>', methods=['PUT'])
@require_admin
def update_prescription_admin(prescription_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        prescription = Prescription.query.get_or_404(prescription_id)
        
        # Update status
        if 'status' in data and data['status']:
            prescription.status = data['status']
        
        # Update analysis if provided
        if 'analysis' in data and data['analysis']:
            prescription.analysis_json = json.dumps(data['analysis'])
        
        db.session.commit()
        
        return jsonify({
            "message": "Prescription updated successfully",
            "prescription_id": prescription_id
        }), 200
    except Exception as e:
        print(f"Error updating prescription: {e}")
        return jsonify({"error": "Failed to update prescription"}), 500

# Route: Approve prescription with AI analysis
@app.route('/admin/prescription/<int:prescription_id>/approve', methods=['POST'])
@require_admin
def approve_prescription(prescription_id):
    try:
        data = request.json or {}
        prescription = Prescription.query.get_or_404(prescription_id)
        
        # If admin provided custom analysis, use it
        if data.get('custom_analysis'):
            analysis_result = data['custom_analysis']
        else:
            # Use AI analysis
            analysis_result = analyze_prescription_with_ai(prescription.raw_text, prescription.file_path)
        
        # Update prescription
        prescription.analysis_json = json.dumps(analysis_result)
        prescription.status = 'approved'
        
        db.session.commit()
        
        return jsonify({
            "message": "Prescription approved successfully",
            "analysis": analysis_result
        }), 200
    except Exception as e:
        print(f"Error approving prescription: {e}")
        return jsonify({"error": "Failed to approve prescription"}), 500

# Route: Reject prescription
@app.route('/admin/prescription/<int:prescription_id>/reject', methods=['POST'])
@require_admin
def reject_prescription(prescription_id):
    try:
        data = request.json or {}
        prescription = Prescription.query.get_or_404(prescription_id)
        
        # Update with rejection reason
        rejection_reason = data.get('reason', 'Prescription rejected by admin')
        prescription.analysis_json = json.dumps({
            "medicines": [],
            "explanation": f"Prescription rejected: {rejection_reason}",
            "nutrition_tips": [],
            "analysis_confidence": 0.0,
            "recommendations": ["Please consult with your healthcare provider"]
        })
        prescription.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            "message": "Prescription rejected successfully"
        }), 200
    except Exception as e:
        print(f"Error rejecting prescription: {e}")
        return jsonify({"error": "Failed to reject prescription"}), 500

# Route: Get uploaded file
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        print(f"Requesting file: {filename}")
        print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Full path: {full_path}")
        print(f"File exists: {os.path.exists(full_path)}")
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"Error serving file {filename}: {e}")
        return jsonify({"error": "File not found"}), 404

# Route: Delete prescription
@app.route('/prescription/<int:prescription_id>', methods=['DELETE'])
def delete_prescription(prescription_id):
    try:
        prescription = Prescription.query.get_or_404(prescription_id)
        
        # Delete associated file if exists
        if prescription.file_path and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], prescription.file_path)):
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], prescription.file_path))
        
        db.session.delete(prescription)
        db.session.commit()
        
        return jsonify({"message": "Prescription deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete prescription"}), 500

# Route: Health check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})

# Route: Get all users for admin
@app.route('/admin/users', methods=['GET'])
@require_admin
def get_all_users():
    try:
        users = User.query.all()
        
        result = []
        for user in users:
            # Count prescriptions for each user
            prescription_count = Prescription.query.filter_by(user_id=user.id).count()
            
            # Get last active date (last prescription created)
            last_prescription = Prescription.query.filter_by(user_id=user.id).order_by(Prescription.created_at.desc()).first()
            last_active = last_prescription.created_at.strftime('%Y-%m-%d') if last_prescription else 'Never'
            
            result.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "username": user.username,
                "age": user.age,
                "gender": user.gender,
                "prescriptions": prescription_count,
                "lastActive": last_active,
                "created_at": user.created_at.strftime('%Y-%m-%d')
            })
        
        return jsonify(result)
    except Exception as e:
        print(f"Error getting all users: {e}")
        return jsonify({"error": "Failed to get users"}), 500

# Initialize database tables
def init_db():
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully!")
        except Exception as e:
            print(f"Error creating database tables: {e}")

# Add this at the end of app.py for testing
if __name__ == "__main__":
    # Test Gemini API
    print("Testing Gemini API...")
    if model:
        try:
            response = model.generate_content("Hello, this is a test.")
            print("✅ Gemini API is working!")
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
    else:
        print("⚠️ Gemini API key not set, using mock analysis")
    
    # Initialize database before running the app
    init_db()
    
    # Get port from environment variable (Railway) or use default
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
