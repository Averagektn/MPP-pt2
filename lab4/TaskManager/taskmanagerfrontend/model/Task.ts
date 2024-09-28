export default class Task {
    id: string | null;
    date: string | null;
    name: string;
    description: string;
    status: string | null;
    photo: string | null;

    constructor(
        name: string,
        description: string,
        status: string | null = null,
        id: string | null = null,
        date: string | null = null,
        photo: string | null = null
    ) {
        this.id = id;
        this.date = date;
        this.name = name;
        this.description = description;
        this.status = status;
        this.photo = photo;
    }
}