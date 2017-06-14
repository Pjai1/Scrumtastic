import { SIGNED_IN } from '../constants';
import {bake_cookie, read_cookie} from 'sfcookies';

const logUser = (action) => {
    return {
        action
    }
}

export default logUser;