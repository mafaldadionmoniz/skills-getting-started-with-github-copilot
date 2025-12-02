import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)
#Use Agent mode to get test coverage 
def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Signup
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200 or response.status_code == 400
    # Unregister
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200 or response.status_code == 404

def test_signup_duplicate():
    activity = "Programming Class"
    email = "emma@mergington.edu"  # Already registered
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_unregister_not_found():
    activity = "Gym Class"
    email = "notfound@mergington.edu"
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]
