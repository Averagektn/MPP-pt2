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
const file_name_generator_1 = require("../utils/file_name_generator");
class TaskRepository {
    constructor() {
        this.tasksDbRef = '/tasks-v1';
        this.db = admin.database();
        this.dbRef = this.db.ref(this.tasksDbRef);
        this.storageBucket = admin.storage().bucket();
    }
    createTask(task) {
        this.dbRef.push(task);
    }
    loadFile(file, task, onFinish, onError) {
        return __awaiter(this, void 0, void 0, function* () {
            const blob = this.storageBucket.file((0, file_name_generator_1.default)(file.originalname));
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });
            blobStream.on('error', (err) => {
                onError(err);
            });
            blobStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                yield blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${this.storageBucket.name}/${blob.name}`;
                task.photo = publicUrl;
                this.createTask(task);
                onFinish(task);
            }));
            blobStream.end(file.buffer);
        });
    }
    deleteTask(id, path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.ref(`${this.tasksDbRef}/${id}`).remove();
            if (path) {
                const fileName = path.split('/').pop();
                yield this.storageBucket.file(fileName).delete();
            }
        });
    }
    getTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db.ref(`${this.tasksDbRef}/${id}`).get();
            return res.val();
        });
    }
    updateTask(id, date, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.ref(`${this.tasksDbRef}/${id}`).update({ date, status });
        });
    }
    getTasksWithId() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            const snapshot = yield this.dbRef.get();
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
    getPaginatedTasksWithId(n, lastKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.dbRef.orderByKey().limitToFirst(n);
            const tasks = [];
            if (lastKey) {
                query = query.startAt(lastKey);
            }
            const snapshot = yield query.once('value');
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
}
exports.default = new TaskRepository();
//# sourceMappingURL=TaskRepository.js.map