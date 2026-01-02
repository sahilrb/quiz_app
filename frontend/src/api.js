import axios from 'axios';
const API_URL = 'https://sahilrb-sample-react-app-demo.vercel.app';

export const createQuiz = async (quizData) => {
    const response = await axios.post(`${API_URL}/quiz`, quizData, {
        headers: {
            'Content-Type': 'application/json',
            'x-admin-key': 'd26fac6ad44bb75241044efdbd4fdfd4',
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