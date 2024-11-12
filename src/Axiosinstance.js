import axios from 'axios';
import {REACT_NATIVE_APP_BACKEND_LIVE_API} from './Constant';

const instance = axios.create({
  baseURL: REACT_NATIVE_APP_BACKEND_LIVE_API,
  headers: {
    // Authorization: `Bearer ${AsyncStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
});
instance.defaults.timeout = 500000;

export default instance;
