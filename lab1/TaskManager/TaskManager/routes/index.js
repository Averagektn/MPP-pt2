"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const router = express.Router();
const upload = multer();
const tasksDbRef = '/tasks-v1';
const db = admin.database();
const dbRef = db.ref(tasksDbRef);
const stoageBucket = admin.storage().bucket();
router.post('/add-task', upload.single('file'), (req, res) => {
    const { name, description } = req.body;
    const file = req.file;
    if (!file) {
        const task = {
            name,
            description,
            status: "pending",
            photo: null
        };
        dbRef.push(task);
        res.redirect('/');
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
        blobStream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            yield blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${stoageBucket.name}/${blob.name}`;
            const task = {
                name,
                description,
                status: "pending",
                photo: publicUrl
            };
            dbRef.push(task);
            res.redirect('/');
        }));
        blobStream.end(file.buffer);
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});
router.post('/update-task', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.taskId;
    const { date, status } = req.body.date;
    yield db.ref(`${tasksDbRef}/${id}`).update({ date, status });
    res.redirect('/');
}));
router.post('/delete-task', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.taskId;
    yield db.ref(`${tasksDbRef}/${id}`).remove();
    res.redirect('/');
}));
router.get('/filter', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield getTasks();
    const status = req.query.status;
    if (status === 'none') {
        res.redirect('/');
    }
    else {
        tasks.sort((a, b) => {
            if (a.status === status && b.status !== status) {
                return -1;
            }
            if (a.status !== status && b.status === status) {
                return 1;
            }
            return 0;
        });
        res.render('index', { tasks });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield getTasks();
    res.render('index', { tasks });
}));
function getTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = [];
        const snapshot = yield dbRef.get();
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const id = childSnapshot.key;
                tasks.push(Object.assign(Object.assign({}, data), { id }));
            });
        }
        return tasks;
    });
}
function generateUniqueFileName(originalName) {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${timestamp}-${randomNum}.${fileExtension}`;
}
exports.default = router;
//# sourceMappingURL=index.js.map