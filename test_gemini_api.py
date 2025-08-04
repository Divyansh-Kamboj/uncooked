#!/usr/bin/env python3
"""
Test script for Gemini API key
"""
import os
import requests
import json

def test_gemini_api():
    # Set the API key as an environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not found")
        return False
    
    print(f"🔑 Testing API key: {api_key[:10]}...")
    
    # Gemini API endpoint for text generation (using latest stable model)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    # Test payload
    payload = {
        "contents": [{
            "parts": [{
                "text": "Say hello and confirm you're working!"
            }]
        }]
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("🚀 Making test request to Gemini API...")
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                generated_text = result['candidates'][0]['content']['parts'][0]['text']
                print("✅ API key is working!")
                print(f"📝 Response: {generated_text}")
                return True
            else:
                print("❌ Unexpected response format")
                print(f"Response: {result}")
                return False
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Gemini API Key Test")
    print("=" * 30)
    
    success = test_gemini_api()
    
    if success:
        print("\n🎉 Your Gemini API key is working correctly!")
    else:
        print("\n💡 Please check:")
        print("   - Your API key is correct")
        print("   - You have an active internet connection")
        print("   - The API key has the necessary permissions")
