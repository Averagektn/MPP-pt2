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
        this.tasksDbRef = '/tasks-v2';
        this.db = admin.database();
        this.storageBucket = admin.storage().bucket();
    }
    createTask(task, uid) {
        const ref = this.db.ref(`${this.tasksDbRef}/${uid}`).push(task);
        task.id = ref.key;
        return task;
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const blob = this.storageBucket.file((0, file_name_generator_1.default)(file.originalname));
            yield new Promise((resolve, reject) => {
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });
                blobStream.on('error', reject);
                blobStream.on('finish', resolve);
                blobStream.end(file.buffer);
            });
            yield blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${this.storageBucket.name}/${blob.name}`;
            return publicUrl;
        });
    }
    deleteTask(id, path, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.ref(`${this.tasksDbRef}/${uid}/${id}`).remove();
            if (path) {
                const fileName = path.split('/').pop();
                yield this.storageBucket.file(fileName).delete();
            }
        });
    }
    getTaskById(id, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = (yield this.db.ref(`${this.tasksDbRef}/${uid}/${id}`).get()).val();
            return Object.assign(Object.assign({}, res), { id });
        });
    }
    updateTask(id, date, status, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (date) {
                yield this.db.ref(`${this.tasksDbRef}/${uid}/${id}`).update({ date });
            }
            if (status) {
                yield this.db.ref(`${this.tasksDbRef}/${uid}/${id}`).update({ status });
            }
            const task = (yield this.db.ref(`${this.tasksDbRef}/${uid}/${id}`).get()).val();
            return Object.assign(Object.assign({}, task), { id });
        });
    }
    getTasks(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            const snapshot = yield this.db.ref(`${this.tasksDbRef}/${uid}`).get();
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
    getPageTasks(n, lastKey, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.db.ref(`${this.tasksDbRef}/${uid}`).orderByKey().limitToFirst(n);
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