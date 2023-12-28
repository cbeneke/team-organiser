import { User, Token } from '../types';

export interface MockHttpResponse<T> {
    status: number;
    data: T;
}
