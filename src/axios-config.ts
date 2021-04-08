import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:5000/"; // Currently set to the dev server
axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
