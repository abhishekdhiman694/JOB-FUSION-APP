const axios = require('axios');
const fs = require('fs');

async function testUpdates() {
    console.log("=== Testing Profile Update ===");
    try {
        // 1. Login to get a token
        console.log("Logging in...");
        const loginRes = await axios.post('http://127.0.0.1:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'password'
        });
        const token = loginRes.data.token;
        console.log("Token obtained!");

        // 2. Update Profile Preferences
        console.log("Updating Preferences...");
        const updateRes = await axios.put('http://127.0.0.1:3000/api/users/profile', {
            name: 'Test Setup User ' + Math.random().toString(36).substring(7),
            experienceLevel: 'Senior',
            preferences: {
                locations: ['San Francisco'],
                roles: ['Principal Engineer']
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Update Success! Returned User:");
        console.log(JSON.stringify(updateRes.data, null, 2));

    } catch (e) {
        if (e.response) {
            console.error("Test Failed with Status:", e.response.status);
            console.error("Data:", e.response.data);
        } else {
            console.error("Test Failed:", e.message);
        }
    }
}

testUpdates();
