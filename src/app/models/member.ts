export interface Member {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        email: string;
    };
    phone_number: string;
    color: string;
}
