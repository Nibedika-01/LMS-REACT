//fetch with baseURL

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5078/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;