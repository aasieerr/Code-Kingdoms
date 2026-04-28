import axios from './axios';

export default {
    getAll() {
        return axios.get('/screenshots');
    },
    save(imageData, characterName = null) {
        return axios.post('/screenshots', { 
            image: imageData,
            character_name: characterName
        });
    },
    delete(id) {
        return axios.delete(`/screenshots/${id}`);
    }
};
