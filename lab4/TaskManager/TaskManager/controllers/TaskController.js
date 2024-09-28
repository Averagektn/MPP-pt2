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
const TaskRepository_1 = require("../repositroies/TaskRepository");
const number_verifier_1 = require("../utils/number_verifier");
const WsResponse_1 = require("../model/WsResponse");
class TaskController {
    createTask(task, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultStatus = "Pending";
            task.status = defaultStatus;
            try {
                task = TaskRepository_1.default.createTask(task, uid);
                return new WsResponse_1.default(201, task, 'Task created');
            }
            catch (err) {
                console.error('Error: ', err);
                return new WsResponse_1.default(400, null, `${err}`);
            }
        });
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const photo = yield TaskRepository_1.default.uploadFile(file);
                return new WsResponse_1.default(201, photo);
            }
            catch (err) {
                console.error('Error uploading file:', err);
                return new WsResponse_1.default(404, null, `${err}`);
            }
        });
    }
    updateTask(taskId, task, uid) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                task = yield TaskRepository_1.default.updateTask(taskId, (_a = task.date) !== null && _a !== void 0 ? _a : null, (_b = task.status) !== null && _b !== void 0 ? _b : null, uid);
                return new WsResponse_1.default(200, task);
            }
            catch (err) {
                console.error('Error:', err);
                return new WsResponse_1.default(400, null, `${err}`);
            }
        });
    }
    deleteTask(taskId, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = (yield TaskRepository_1.default.getTaskById(taskId, uid)).photo;
            try {
                yield TaskRepository_1.default.deleteTask(taskId, path, uid);
                return new WsResponse_1.default(204, null);
            }
            catch (err) {
                return new WsResponse_1.default(404, null, `${err}`);
            }
        });
    }
    getTotalPages(limit, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, number_verifier_1.default)(limit)) {
                return new WsResponse_1.default(404, null);
            }
            try {
                const tasks = yield TaskRepository_1.default.getTasks(uid);
                const pages = Math.ceil(tasks.length / limit);
                return new WsResponse_1.default(200, pages);
            }
            catch (err) {
                return new WsResponse_1.default(404, null, `${err}`);
            }
        });
    }
    filterTasks(uid, status, limit, startWith) {
        return __awaiter(this, void 0, void 0, function* () {
            let tasks = [];
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                return new WsResponse_1.default(404, null);
            }
            try {
                tasks = yield TaskRepository_1.default.getTasks(uid);
            }
            catch (err) {
                return new WsResponse_1.default(404, null);
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
            if (tasks.length < (startWith + 1) * limit) {
                tasks = tasks.slice(startWith * limit);
            }
            else {
                tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
            }
            return new WsResponse_1.default(200, tasks);
        });
    }
    getTasks(uid, limit, startWith) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                return new WsResponse_1.default(404, null);
            }
            try {
                let tasks = yield TaskRepository_1.default.getTasks(uid);
                if (tasks.length < (startWith + 1) * limit) {
                    tasks = tasks.slice(startWith * limit);
                }
                else {
                    tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
                }
                return new WsResponse_1.default(200, tasks);
            }
            catch (error) {
                return new WsResponse_1.default(404, null);
            }
        });
    }
    getTaskById(uid, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const task = yield TaskRepository_1.default.getTaskById(taskId, uid);
                return new WsResponse_1.default(200, task);
            }
            catch (error) {
                return new WsResponse_1.default(404, null);
            }
        });
    }
}
exports.default = new TaskController();
//# sourceMappingURL=TaskController.js.map