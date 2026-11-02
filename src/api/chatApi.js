import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendChatMessage = async (question, workTitle, history) => {
  const response = await api.post('/chat', {
    question,
    workTitle,
    history,
  });

  return response.data;
};
