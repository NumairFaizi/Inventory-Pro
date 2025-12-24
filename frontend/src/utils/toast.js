import { toast } from "react-toastify";

export default function notify(status, message) {
    const config = {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark", // Desktop apps look great with dark themes
    };

    // 200: OK, 201: Created
    if (status === 200 || status === 201) {
        toast.success(message || "Success!", config);
    } 
    // 401: Unauthorized
    else if (status === 401) {
        toast.warn("Session expired. Please login again.", config);
    } 
    // Everything else (400, 404, 500)
    else {
        toast.error(message || "Something went wrong", config);
    }
};