export class Member {
    id: number;
    user: {
        id: number,
        first_name: string,
        last_name: string,
        username: string,
        email: string,
        token: string
    }
    phone_number: string;
    color: string;

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : null;

        this.user = {
            id: obj && obj.user && obj.user.id ? obj.user.id : null,
            first_name: obj && obj.user && obj.user.first_name ? obj.user.first_name : '',
            last_name: obj && obj.user && obj.user.last_name ? obj.user.last_name : '',
            username: obj && obj.user && obj.user.username ? obj.user.username : '',
            email: obj && obj.user && obj.user.email ? obj.user.email : '',
            token: obj && obj.user && obj.user.token ? obj.user.token : ''
        };

        this.phone_number = obj && obj.phone_number ? obj.phone_number : '';
        this.color = obj && obj.color ? obj.color : '';
    }
}
