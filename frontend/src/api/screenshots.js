import axios from './axios';

export default {
    getAll() {
        return axios.get('/screenshots');
    },
    save(imageData) {
        return axios.post('/screenshots', { image: imageData });
    },
    delete(id) {
        return axios.delete(`/screenshots/${id}`);
    }
};
