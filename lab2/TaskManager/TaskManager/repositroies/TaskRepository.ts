import * as admin from 'firebase-admin';
import Task from '../model/Task';
import generateUniqueFileName from '../utils/file_name_generator';
import { Reference } from '@firebase/database-types';
import { Bucket } from '@google-cloud/storage';

class TaskRepository {
    tasksDbRef = '/tasks-v1';
    db: admin.database.Database;
    dbRef: Reference;
    storageBucket: Bucket;

    constructor() {
        this.db = admin.database();
        this.dbRef = this.db.ref(this.tasksDbRef);
        this.storageBucket = admin.storage().bucket();
    }

    createTask(task: Task): Task {
        const ref = this.dbRef.push(task);
        task.id = ref.key;

        return task
    }

    async uploadFile(file: any): Promise<string> {
        const blob = this.storageBucket.file(generateUniqueFileName(file.originalname));

        await new Promise((resolve, reject) => {
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            blobStream.on('error', reject);
            blobStream.on('finish', resolve);
            blobStream.end(file.buffer);
        });

        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${this.storageBucket.name}/${blob.name}`;

        return publicUrl;
    }

    async deleteTask(id: string, path: string | null): Promise<void> {
        await this.db.ref(`${this.tasksDbRef}/${id}`).remove();
        if (path) {
            const fileName = path.split('/').pop();
            await this.storageBucket.file(fileName).delete();
        }
    }

    async getTaskById(id: string): Promise<Task> {
        const res = (await this.db.ref(`${this.tasksDbRef}/${id}`).get()).val();

        return { ...res, id };
    }

    async updateTask(id: string, date: string | null, status: string | null): Promise<Task> {
        if (date) {
            await this.db.ref(`${this.tasksDbRef}/${id}`).update({ date })
        }
        if (status) {
            await this.db.ref(`${this.tasksDbRef}/${id}`).update({ status })
        }

        const task = (await this.db.ref(`${this.tasksDbRef}/${id}`).get()).val();
        return { ...task, id };
    }

    async getTasks(): Promise<Task[]> {
        const tasks: Task[] = [];
        const snapshot = await this.dbRef.get();

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const id = childSnapshot.key;
                tasks.push({ ...data, id });
            });
        }

        return tasks;
    }

    async getPageTasks(n: number, lastKey: string | null): Promise<Task[]> {
        let query = this.dbRef.orderByKey().limitToFirst(n);
        const tasks: Task[] = [];

        if (lastKey) {
            query = query.startAt(lastKey);
        }

        const snapshot = await query.once('value');

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const id = childSnapshot.key;
                tasks.push({ ...data, id });
            });
        }

        return tasks;
    }
}

export default new TaskRepository();
