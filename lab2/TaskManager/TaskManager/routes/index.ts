import express = require('express');
import multer = require('multer');
import * as admin from 'firebase-admin';
import Task from '../model/task';

const router = express.Router();
const upload = multer(); 

const tasksDbRef = '/tasks-v1';
const db = admin.database();
const dbRef = db.ref(tasksDbRef);
const stoageBucket = admin.storage().bucket();

router.post('/tasks', upload.single('file'), (req: express.Request, res: express.Response) => {
    const { name, description } = req.body;
    const file = req.file;
    const defaultStatus = "Pending";

    if (!file) {
        const task = new Task(name, description, defaultStatus);

        dbRef.push(task);

        res.json(task);
        return;
    }

    try {
        const blob = stoageBucket.file(generateUniqueFileName(file.originalname));
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error(err);
            res.status(500).send('Failed to upload to Firebase Storage.');
        });

        blobStream.on('finish', async () => {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${stoageBucket.name}/${blob.name}`;
            const task = new Task(name, description, defaultStatus, null, null, publicUrl);

            dbRef.push(task);

            res.json(task);
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});

router.put('/tasks/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const { date, status } = req.body;

    await db.ref(`${tasksDbRef}/${id}`).update({ date, status })

    res.redirect('/');
});

router.delete('/tasks/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id; 

    try {
        await db.ref(`${tasksDbRef}/${id}`).remove();
        res.status(204);
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete task' });
    }
});

router.get('/tasks/filter', async (req: express.Request, res: express.Response) => {
    const status = req.query.status;
    let tasks: Task[] = [];

    try {
        tasks = await getTasksWithId();
    } catch (err) {
        res.status(400).json({ error: 'Failed to retrieve tasks' });
        return;
    }

    if (status !== 'None') {
        tasks.sort((a, b) => {
            if (a.status === status && b.status !== status) {
                return -1; 
            }
            if (a.status !== status && b.status === status) {
                return 1; 
            }
            return 0; 
        });
    }

    res.json(tasks)
});

router.get('/tasks', async (req: express.Request, res: express.Response) => {
    try {
        const tasks = await getTasksWithId();
        res.json(tasks);
    } catch (error) {
        res.status(400).json({ error: 'Failed to retrieve tasks' });
    }
});

router.get('/tasks/:id', async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const limit = parseInt(req.query.limit as string, 10);

    try {
        if (limit) {
            const tasks = await getPaginatedTasks(limit, id);
            res.json(tasks);
        } else {
            const task = await db.ref(`${tasksDbRef}/${id}`).get();
            res.json(task);
        }
    } catch (error) {
        res.status(400).json({ error: 'Failed to retrieve task' });
    }
});

async function getTasksWithId(): Promise<Task[]> {
    const tasks: Task[] = [];
    const snapshot = await dbRef.get();

    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const id = childSnapshot.key;
            tasks.push({ ...data, id });
        });
    } 

    return tasks;
}

async function getPaginatedTasks(n: number, lastKey?: string) {
    let query = dbRef.orderByKey().limitToFirst(n);

    if (lastKey) {
        query = query.startAt(lastKey);
    }

    const snapshot = await query.once('value');
    const records = snapshot.val();

    const result = Object.entries(records).map(([key, value]) => {
        if (value && typeof value === 'object') {
            return { id: key, ...value };
        }
        return null;
    }).filter((item): item is { id: string;[key: string]: any } => item !== null);

    return result;
}

function generateUniqueFileName(originalName: string): string {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000); 

    return `${timestamp}-${randomNum}.${fileExtension}`;
}

export default router;
