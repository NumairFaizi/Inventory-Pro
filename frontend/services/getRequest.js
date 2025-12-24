// frontend/src/services/getRequest.js
import { BASE_URL } from './config';

export default async function getRequest(url) {
    try {
        const token = localStorage.getItem('stationary');
        const response = await fetch(`${BASE_URL}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Add this check
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return { status: response.status, data: json };
        } else {
            // It's HTML error text
            const errorText = await response.text();
            console.error("Route Error:", errorText);
            return { status: response.status, data: { message: "Route not found" } };
        }
    } catch (error) {
        return { status: 500, data: { message: "Server offline" } };
    }
}