import { BASE_URL } from './config';

const patchRequest = async (url, body) => {
    try {
      const token = localStorage.getItem('stationary');

      const response = await fetch(`${BASE_URL}${url}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      // 1. Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // This captures the HTML error from the server instead of crashing
        const textError = await response.text();
        console.error("Server returned non-JSON response:", textError);
        return {
          status: response.status,
          data: { message: "Server error or route not found (404)" },
        };
      }
  
      return {
        status: response.status,
        data: data,
      };

    } catch (error) {
      console.error("PATCH Request Failed:", error);
      return {
        status: 500,
        data: { message: "Connection to desktop server failed" },
      };
    }
  };
  
  export default patchRequest;