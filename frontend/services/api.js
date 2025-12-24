import { BASE_URL } from './config';

const apiRequest = async (method, url, body = null) => {
    try {
        const token = localStorage.getItem('stationary');
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${BASE_URL}${url}`, options);
        
        // Handle no-content responses (like 204)
        if (response.status === 204) return { status: 204, data: {} };

        const contentType = response.headers.get("content-type");
        const data = contentType && contentType.includes("application/json") 
            ? await response.json() 
            : { message: await response.text() };

        return { status: response.status, data };
    } catch (error) {
        return { status: 500, data: { message: "Server Connection Failed" } };
    }
};

export const getReq = (url) => apiRequest('GET', url);
export const postReq = (url, body) => apiRequest('POST', url, body);
export const patchReq = (url, body) => apiRequest('PATCH', url, body);
export const deleteReq = (url) => apiRequest('DELETE', url);