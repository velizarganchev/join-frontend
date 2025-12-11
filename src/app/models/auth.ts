export interface RegisterRequest {
    username: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password: string | null;
    phone_number?: string;
    color?: string;
}

export interface RegisterResponse {
    status: 'success' | 'error';
    message: string;
    user_id?: number;
    username?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_id: number;
    username: string;
}

export interface LogoutResponse {
    status: 'success' | 'error';
    message: string;
}

export interface AuthUser {
    id: number;
    username: string;
}

export interface SignupFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    privacyPolicy: boolean;
}
