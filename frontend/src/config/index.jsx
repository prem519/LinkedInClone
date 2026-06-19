import axios from "axios";

export const BASE_URL = "https://linkedinclone-mqa3.onrender.com"
export const clientServer = axios.create({
   baseURL: BASE_URL,
})
