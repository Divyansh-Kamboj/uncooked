#!/usr/bin/env python3
"""
Test individual components of ai.py script
"""
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_environment_variables():
    """Test if environment variables are loaded correctly"""
    print("🔧 Testing environment variables...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    print(f"  SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
    print(f"  SUPABASE_KEY: {'✅ Set' if supabase_key else '❌ Missing'}")
    print(f"  GEMINI_API_KEY: {'✅ Set' if gemini_key else '❌ Missing'}")
    
    return all([supabase_url, supabase_key, gemini_key])

def test_database_connection():
    """Test connection to Supabase database"""
    print("\n🗄️ Testing database connection...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
    }
    
    try:
        # Try to get the first few questions to test connection
        url = f"{supabase_url}/rest/v1/alevel_math_questions?limit=3"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            questions = response.json()
            print(f"  ✅ Successfully connected to database")
            print(f"  📊 Found {len(questions)} questions (showing first 3)")
            
            for i, q in enumerate(questions[:3]):
                print(f"    {i+1}. Q{q.get('question_number', 'N/A')} - Component: {q.get('component', 'N/A')}")
            
            return True, questions
        else:
            print(f"  ❌ Database connection failed: {response.status_code}")
            print(f"     Error: {response.text}")
            return False, []
            
    except Exception as e:
        print(f"  ❌ Database connection error: {e}")
        return False, []

def test_gemini_api():
    """Test Gemini API connection"""
    print("\n🤖 Testing Gemini API...")
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Use the faster model for testing
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Simple test without images
        response = model.generate_content("Say 'Hello, I am working!' in exactly those words.")
        
        print(f"  ✅ Gemini API is working!")
        print(f"  🤖 Response: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Gemini API error: {e}")
        return False

def main():
    print("🧪 Testing ai.py Components")
    print("=" * 40)
    
    # Test environment variables
    env_ok = test_environment_variables()
    
    if not env_ok:
        print("\n❌ Environment variables not set correctly. Check your .env file.")
        return
    
    # Test database connection
    db_ok, sample_questions = test_database_connection()
    
    # Test Gemini API
    gemini_ok = test_gemini_api()
    
    print("\n" + "=" * 40)
    print("📋 SUMMARY:")
    print(f"  Environment Variables: {'✅ Pass' if env_ok else '❌ Fail'}")
    print(f"  Database Connection: {'✅ Pass' if db_ok else '❌ Fail'}")
    print(f"  Gemini API: {'✅ Pass' if gemini_ok else '❌ Fail'}")
    
    if all([env_ok, db_ok, gemini_ok]):
        print(f"\n🎉 All systems are working! Your ai.py script should function correctly.")
        print(f"⚠️  Note: You may have hit API rate limits if running the full script frequently.")
    else:
        print(f"\n⚠️  Some components are not working. Check the errors above.")

if __name__ == "__main__":
    main()
