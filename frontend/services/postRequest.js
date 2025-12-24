import { BASE_URL } from './config';

export default async function postRequest(url, data) {
    try {
        const token = localStorage.getItem('stationary');
        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Safety check: only parse if the response is JSON
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const response = await res.json();
            return { status: res.status, data: response };
        } else {
            // Handle HTML error pages (like 404 Not Found)
            const errorText = await res.text();
            console.error("Server Error Response:", errorText);
            return { status: res.status, data: { message: "Server route not found or error" } };
        }
    } catch (error) {
        console.error("POST Connection Error:", error);
        return { status: 500, data: { message: "Could not connect to desktop server" } };
    }
}