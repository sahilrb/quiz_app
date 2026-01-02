import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

export const createQuiz = async (quizData) => {
    const response = await axios.post(`${API_URL}/admin/quiz/`, quizData, {
        headers: {
            'Content-Type': 'application/json',
            'x-admin-key': process.env.REACT_APP_ADMIN_KEY,
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