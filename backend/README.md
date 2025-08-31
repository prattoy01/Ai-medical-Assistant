# AI Medical Assistant Backend

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. OpenAI API Setup
To enable AI-powered prescription analysis, you need to set up your OpenAI API key:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set the environment variable:
   ```bash
   # Windows
   set OPENAI_API_KEY=your_api_key_here
   
   # Linux/Mac
   export OPENAI_API_KEY=your_api_key_here
   ```

### 3. Run the Application
```bash
python app.py
```

## Features

### AI-Powered Prescription Analysis
- **OpenAI Integration**: Uses GPT-3.5-turbo for comprehensive prescription analysis
- **Fallback Mode**: If OpenAI API is not available, uses mock analysis
- **Detailed Analysis**: Provides:
  - Medicine identification and details
  - Purpose and dosage information
  - Alternative medications
  - Foods to avoid
  - Side effects
  - AI explanations
  - Nutrition tips
  - Safety recommendations

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

## API Endpoints

- `POST /analyze` - Analyze prescription with AI
- `GET /dashboard` - Get user's prescription history
- `DELETE /prescription/<id>` - Delete prescription
- `POST /register` - User registration
- `POST /login` - User login

## Notes

- The system will automatically fall back to mock analysis if OpenAI API is not configured
- All analysis results are stored in the database for future reference
- File uploads are supported for prescription images and documents 