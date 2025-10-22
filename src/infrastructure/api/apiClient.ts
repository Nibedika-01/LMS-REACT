//fetch with baseURL

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5059',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;