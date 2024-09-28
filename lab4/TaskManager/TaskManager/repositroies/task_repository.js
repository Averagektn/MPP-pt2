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
const tasksDbRef = '/tasks-v1';
const db = admin.database();
const dbRef = db.ref(tasksDbRef);
const storageBucket = admin.storage().bucket();
class TaskRepository {
    constructor() {
        this.getTasksWithId = () => __awaiter(this, void 0, void 0, function* () {
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
    getPaginatedTasksWithId(n, lastKey) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = dbRef.orderByKey().limitToFirst(n);
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
//# sourceMappingURL=task_repository.js.map