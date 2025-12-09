"""
Test script for User Account Management API
Run this after starting the Django server to verify all endpoints work correctly.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/users/"

def test_create_user():
    """Test creating a new user"""
    print("\n=== Testing Create User ===")
    data = {
        "username": "test_user_" + str(hash("test"))[-6:],
        "password": "testpass123",
        "position": "Marketing"
    }
    
    response = requests.post(BASE_URL, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json()["user"]["id"]
    return None

def test_list_users():
    """Test listing all users"""
    print("\n=== Testing List Users ===")
    response = requests.get(BASE_URL)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Total users: {len(data.get('accounts', []))}")
    print(f"Response: {json.dumps(data, indent=2)}")

def test_get_user(user_id):
    """Test getting a specific user"""
    print(f"\n=== Testing Get User {user_id} ===")
    response = requests.get(f"{BASE_URL}{user_id}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_update_user(user_id):
    """Test updating a user"""
    print(f"\n=== Testing Update User {user_id} ===")
    data = {
        "position": "Sales"
    }
    response = requests.put(f"{BASE_URL}{user_id}/", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_delete_user(user_id):
    """Test deleting a user"""
    print(f"\n=== Testing Delete User {user_id} ===")
    response = requests.delete(f"{BASE_URL}{user_id}/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def main():
    print("Starting User Account Management API Tests")
    print("=" * 50)
    
    try:
        # Test 1: List users
        test_list_users()
        
        # Test 2: Create user
        user_id = test_create_user()
        
        if user_id:
            # Test 3: Get specific user
            test_get_user(user_id)
            
            # Test 4: Update user
            test_update_user(user_id)
            
            # Test 5: Get updated user
            test_get_user(user_id)
            
            # Test 6: Delete user
            test_delete_user(user_id)
            
            # Test 7: List users again
            test_list_users()
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the server.")
        print("Make sure the Django server is running:")
        print("  cd server")
        print("  python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
