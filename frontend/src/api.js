import axios from 'axios';
// const API_URL = process.env.REACT_APP_API_URL;
const API_URL = 'https://quiz-app-gudj.onrender.com';
const x_admin_key = 'd26fac6ad44bb75241044efdbd4fdfd4';

export const createQuiz = async (quizData) => {
    const response = await axios.post(`${API_URL}/quiz`, quizData, {
        headers: {
            'Content-Type': 'application/json',
            // 'x-admin-key': process.env.REACT_APP_ADMIN_KEY,
            'x-admin-key': x_admin_key
        },
    });
    return response.data;
};


export const getQuiz = async (id) => {
    const response = await axios.get(`${API_URL}/quiz/${id}`);
    return response.data;
};

// submitQuiz
export const submitQuiz = async (quizId, answers) => {
    const response = await axios.post(`${API_URL}/quiz/${quizId}/submit/`, { answers });
    return response.data;
};