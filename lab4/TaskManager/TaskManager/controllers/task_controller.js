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
const admin = require("firebase-admin");
const task_1 = require("../model/task");
const file_name_generator_1 = require("../utils/file_name_generator");
const taskRepository = require('../repositroies/task_repository');
const tasksDbRef = '/tasks-v1';
const db = admin.database();
const dbRef = db.ref(tasksDbRef);
const storageBucket = admin.storage().bucket();
exports.createTask = (req, res) => {
    const { name, description } = req.body;
    const file = req.file;
    const defaultStatus = "Pending";
    if (!file) {
        const task = new task_1.default(name, description, defaultStatus);
        dbRef.push(task);
        res.json(task);
        return;
    }
    try {
        const blob = storageBucket.file((0, file_name_generator_1.default)(file.originalname));
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
            const publicUrl = `https://storage.googleapis.com/${storageBucket.name}/${blob.name}`;
            const task = new task_1.default(name, description, defaultStatus, null, null, publicUrl);
            dbRef.push(task);
            res.json(task);
        }));
        blobStream.end(file.buffer);
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
};
exports.updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { date, status } = req.body;
    yield db.ref(`${tasksDbRef}/${id}`).update({ date, status });
    res.redirect('/');
});
exports.deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const path = req.body.path;
    try {
        yield db.ref(`${tasksDbRef}/${id}`).remove();
        if (path) {
            const fileName = path.split('/').pop();
            yield storageBucket.file(fileName).delete();
        }
        res.status(204);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete task' });
    }
});
exports.filterTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.query.status;
    let tasks = [];
    try {
        tasks = yield taskRepository.getTasksWithId();
    }
    catch (err) {
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
    res.json(tasks);
});
exports.getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit, null);
    const startWithId = req.query.startWithId;
    try {
        let tasks = [];
        if (limit) {
            tasks = yield taskRepository.getPaginatedTasksWithId(limit, startWithId);
            res.json(tasks);
            return;
        }
        tasks = yield taskRepository.getTasksWithIds();
        res.json(tasks);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to retrieve tasks' });
    }
});
exports.getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const task = yield db.ref(`${tasksDbRef}/${id}`).get();
        res.json(task);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to retrieve task' });
    }
});
//# sourceMappingURL=task_controller.js.map