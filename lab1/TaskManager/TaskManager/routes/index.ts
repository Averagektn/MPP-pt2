import express = require('express');
import multer = require('multer');
import * as admin from 'firebase-admin';

const router = express.Router();
const upload = multer(); 

let tasks = [];

router.post('/add-task', upload.single('file'), (req: express.Request, res: express.Response) => {
    const { name, description } = req.body;
    const file = req.file;

    if (file) {
        const fileData = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer
        };

        tasks.push({ name, description, photo: fileData });
    } else {
        tasks.push({ name, description });
    }

    res.redirect('/');
});

router.post('/update-task', (req: express.Request, res: express.Response) => {
    res.redirect('/');
});

router.get('filter', (req: express.Request, res: express.Response) => {
    res.render('index', { tasks });
});

router.get('/', (req: express.Request, res: express.Response) => {
    // WORKS!!!
    //admin.database().ref('/').push("another test");
    
    res.render('index', { tasks });
});

export default router;
