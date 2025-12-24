import { BASE_URL } from './config';

const deleteRequest = async (url) => {
    try {
      // Get the token from localStorage for authentication
      const token = localStorage.getItem('stationary');

      // Prepend the BASE_URL so Electron knows to hit the local Node server
      const response = await fetch(`${BASE_URL}${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Added for security
        },
      });
  
      const data = await response.json();
      
      if (response.ok) {
        return {
          status: response.status,
          data: data,
        };
      } else {
        // Handle specific server errors (401, 403, 404, etc.)
        return {
          status: response.status,
          data: data,
        };
      }
    } catch (error) {
      // Handles network failures or server being offline
      console.error("Delete Request Failed:", error);
      return {
        status: 500,
        data: { message: error.message || "Server connection failed" },
      };
    }
  };
  
  export default deleteRequest;