# Prescription Analysis System

A comprehensive web application for analyzing prescriptions using AI, with an admin review workflow for quality control.

## Features

### User Features
- **Prescription Submission**: Upload prescription images or enter text
- **Real-time Status Tracking**: See the status of your prescription (Pending, Approved, Rejected)
- **Waiting Progress**: Visual indicators for prescriptions under review
- **Detailed Analysis**: View comprehensive medication information, side effects, and recommendations
- **File Management**: Upload and view prescription files
- **Export Functionality**: Download analysis reports as PDF

### Admin Features
- **Prescription Review**: Review all submitted prescriptions
- **AI-Powered Analysis**: Approve prescriptions with automatic AI analysis
- **Manual Editing**: Edit analysis details before approval
- **User Management**: View all users and their prescription history
- **Status Management**: Approve, reject, or edit prescriptions
- **Real-time Updates**: See prescription status changes immediately

## Workflow

### 1. User Prescription Submission
1. User logs in to their dashboard
2. Submits prescription text or uploads an image/PDF
3. System shows "Pending" status with waiting progress
4. User receives confirmation that prescription is under review

### 2. Admin Review Process
1. Admin accesses admin dashboard at `/admin`
2. Views all pending prescriptions
3. Can either:
   - **Auto-approve**: Use AI analysis automatically
   - **Manual review**: Edit analysis details before approval
   - **Reject**: Provide rejection reason
4. Updates prescription status to "Approved" or "Rejected"

### 3. User Receives Results
1. User sees updated status in their dashboard
2. If approved: Full analysis with medications, tips, and recommendations
3. If rejected: Rejection reason and next steps

## Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### User Endpoints
- `POST /analyze` - Submit prescription for review
- `GET /dashboard?user_id=<id>` - Get user's prescriptions
- `DELETE /prescription/<id>` - Delete prescription

### Admin Endpoints
- `GET /admin/prescriptions` - Get all prescriptions
- `PUT /admin/prescription/<id>` - Update prescription
- `POST /admin/prescription/<id>/approve` - Approve prescription
- `POST /admin/prescription/<id>/reject` - Reject prescription
- `GET /admin/users` - Get all users

## Status Types

- **Pending**: Prescription submitted, awaiting admin review
- **Approved**: Prescription analyzed and approved
- **Rejected**: Prescription rejected with reason

## Access

- **User Dashboard**: `http://localhost:3000/dashboard`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Backend API**: `http://localhost:5000`

## Technology Stack

- **Backend**: Flask, SQLAlchemy, OpenAI/Gemini API
- **Frontend**: React, Tailwind CSS, Lucide React Icons
- **Database**: SQLite (development)
- **File Storage**: Local file system

## Security Notes

- Admin routes are protected with authentication decorators
- File uploads are validated for security
- User sessions are managed with localStorage (consider JWT for production)

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (can be easily switched to PostgreSQL/MySQL)
- **Flask-CORS** - Cross-origin resource sharing
- **Pillow** - Image processing
- **OpenAI** - AI integration (configurable)

### Frontend
- **React** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install --upgrade pip setuptools wheel
   pip install --only-binary :all: Pillow
   pip install -r requirements.txt
   ```

5. **Set up OpenAI API (Optional but Recommended):**
   ```bash
   # Get your API key from: https://platform.openai.com/api-keys
   
   # Windows
   set OPENAI_API_KEY=your_openai_api_key_here
   
   # macOS/Linux
   export OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Note**: If OpenAI API key is not set, the system will use mock analysis with predefined medical data.

6. **Initialize database:**
   ```bash
   python init_db.py
   ```
   This will create the SQLite database, tables, and a sample user for testing.

7. **Start the backend server:**
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Quick Start

### Option 1: Automated Scripts

**Windows:**
```bash
# Double-click or run
start.bat
```

**Unix/Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Start Backend:**
   ```bash
   cd backend
   python init_db.py
   python app.py
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm install  # First time only
   npm start
   ```

## Usage

### 1. Registration & Login
- Visit `http://localhost:3000`
- Create a new account with your details
- Or use the sample account:
  - Email: `test@example.com`
  - Password: `password123`

### 2. Upload Prescriptions
- **Text Input**: Type or paste prescription details
- **File Upload**: Upload prescription images or PDFs
- Click "Analyze with AI" to process

### 3. View Analysis
- AI will analyze your prescription
- View detailed medication information
- Check side effects and interactions
- Get nutrition and lifestyle tips

### 4. Manage Prescriptions
- Search through your prescription history
- Filter by date ranges
- Export or delete prescriptions
- View uploaded files

## AI Analysis Features

The AI system provides comprehensive analysis including:

### OpenAI-Powered Analysis (Recommended)
When OpenAI API is configured, the system provides:
- **Intelligent Medicine Recognition**: Advanced AI identifies medications from prescription text
- **Comprehensive Drug Information**: Detailed purpose, dosage, and pricing information
- **Smart Alternatives**: AI-suggested alternative medications based on effectiveness and availability
- **Food Interaction Analysis**: Detailed list of foods to avoid with each medication
- **Side Effect Prediction**: Comprehensive side effect analysis
- **Nutritional Guidance**: Personalized nutrition tips based on medications
- **Medical Explanations**: AI-generated explanations of how medications work together
- **Safety Recommendations**: Proactive safety and usage recommendations

### Mock Analysis (Fallback)
When OpenAI API is not available, the system provides:
- **Basic Medicine Recognition**: Keyword-based medication identification
- **Standard Information**: Common drug information for popular medications
- **General Guidelines**: Basic nutrition and safety tips

### Analysis Structure
Each prescription analysis includes:
```json
{
  "medicines": [
    {
      "name": "Medicine Name",
      "purpose": "What this medicine is used for",
      "dosage": "Recommended dosage information", 
      "price": "Estimated price range",
      "alternatives": ["Alternative medicine 1", "Alternative medicine 2"],
      "foodToAvoid": ["Food item 1", "Food item 2"],
      "side_effects": ["Side effect 1", "Side effect 2"]
    }
  ],
  "explanation": "AI explanation of how medications work together",
  "nutrition_tips": ["Nutrition tip 1", "Nutrition tip 2"],
  "analysis_confidence": 0.85,
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

### Example Analysis
For a prescription containing "Napa 500mg", the AI provides:
- **Medicine**: Napa 500mg (Fever reducer)
- **Alternatives**: Ace, Paracetamol, Fevco
- **Food to Avoid**: Alcohol, High-fat meals
- **AI Explanation**: "These medications work together to reduce fever and protect your stomach lining. Napa contains paracetamol which blocks pain signals, while Sergel reduces stomach acid production."
- **Nutrition Tips**: Take with light meals, Stay hydrated, Avoid alcohol completely, Consider probiotics for stomach health

## Configuration

### Environment Variables
Create a `.env`
