import { BASE_URL } from './config';

export default async function getRequest(url) {
    try {
        const token = localStorage.getItem('stationary');
        
        // Safety check: If no token exists, don't even try the request
        if (!token) {
            console.warn("No token found in localStorage['stationary']");
            return { status: 401, data: { message: "Please log in" } };
        }

        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            
            // If the server tells us the token is invalid (401)
            if (response.status === 401) {
                localStorage.removeItem('stationary'); // Clear the bad token
                // Optional: window.location.href = '#/login'; 
            }
            
            return { status: response.status, data: json };
        } else {
            const errorText = await response.text();
            return { status: response.status, data: { message: "Unexpected response format" } };
        }
    } catch (error) {
        return { status: 500, data: { message: "Server offline" } };
    }
}