import axios from "axios";

// Create an Axios instance with the base URL
const axiosInstance = axios.create({
  baseURL: "https://api.meetowner.in/",
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json", 
  },
});

export default axiosInstance;