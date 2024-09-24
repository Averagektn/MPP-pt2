import express = require('express');
import multer = require('multer');
import * as admin from 'firebase-admin';
import Task from '../model/task';

const router = express.Router();
const upload = multer(); 

const tasksDbRef = '/tasks-v1';
const db = admin.database();
const dbRef = db.ref(tasksDbRef);
const storageBucket = admin.storage().bucket();

router.post('/add-task', upload.single('file'), (req: express.Request, res: express.Response) => {
    const { name, description } = req.body;
    const file = req.file;
    const defaultStatus = "Pending";

    if (!file) {
        const task = new Task(name, description, defaultStatus);

        dbRef.push(task);

        res.redirect('/');
        return;
    }

    try {
        const blob = storageBucket.file(generateUniqueFileName(file.originalname));
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
            const publicUrl = `https://storage.googleapis.com/${storageBucket.name}/${blob.name}`;
            const task = new Task(name, description, defaultStatus, null, null, publicUrl);

            dbRef.push(task);

            res.redirect('/');
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});

router.post('/update-task', async (req: express.Request, res: express.Response) => {
    const id = req.body.taskId;
    const { date, status } = req.body;

    await db.ref(`${tasksDbRef}/${id}`).update({ date, status })

    res.redirect('/');
});

router.post('/delete-task', async (req: express.Request, res: express.Response) => {
    const id = req.body.taskId;
    const path = req.body.path;

    await db.ref(`${tasksDbRef}/${id}`).remove();
    if (path) {
        const fileName = path.split('/').pop();
        await storageBucket.file(fileName).delete();
    }

    res.redirect('/');
});

router.get('/filter', async (req: express.Request, res: express.Response) => {
    const tasks = await getTasks();
    const status = req.query.status;

    if (status === 'None') {
        res.redirect('/');
    } else {
        tasks.sort((a, b) => {
            if (a.status === status && b.status !== status) {
                return -1; 
            }
            if (a.status !== status && b.status === status) {
                return 1; 
            }
            return 0; 
        });
        res.render('index', { tasks, filterStatus: status });
    }
});

router.get('/', async (req: express.Request, res: express.Response) => {
    const tasks = await getTasks();

    res.render('index', { tasks });
});

async function getTasks(): Promise<Task[]> {
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

function generateUniqueFileName(originalName: string): string {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000); 

    return `${timestamp}-${randomNum}.${fileExtension}`;
}

export default router;
