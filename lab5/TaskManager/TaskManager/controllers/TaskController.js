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
        const defaultStatus = "Pending";
        task.status = defaultStatus;
        return TaskRepository_1.default.createTask(task, uid);
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskRepository_1.default.uploadFile(file);
        });
    }
    updateTask(task, uid) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskRepository_1.default.updateTask(task.id, (_a = task.date) !== null && _a !== void 0 ? _a : null, (_b = task.status) !== null && _b !== void 0 ? _b : null, uid);
        });
    }
    deleteTask(taskId, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = (yield TaskRepository_1.default.getTaskById(taskId, uid)).photo;
            yield TaskRepository_1.default.deleteTask(taskId, path, uid);
        });
    }
    getTotalPages(limit, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, number_verifier_1.default)(limit)) {
                throw new Error('404');
            }
            const tasks = yield TaskRepository_1.default.getTasks(uid);
            const pages = Math.ceil(tasks.length / limit);
            return pages;
        });
    }
    filterTasks(uid, status, limit, startWith) {
        return __awaiter(this, void 0, void 0, function* () {
            let tasks = [];
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                throw new Error('404');
            }
            try {
                tasks = yield TaskRepository_1.default.getTasks(uid);
            }
            catch (err) {
                throw new Error('404');
            }
            if (status !== 'None') {
                tasks = tasks.filter(task => task.status === status);
            }
            if (tasks.length < (startWith + 1) * limit) {
                tasks = tasks.slice(startWith * limit);
                if (tasks.length === 0) {
                    throw new Error('404');
                }
            }
            else {
                tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
            }
            return { tasks, page: startWith };
        });
    }
    getTasks(uid, limit, startWith) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                return new WsResponse_1.default(404, startWith - 1);
            }
            try {
                let tasks = yield TaskRepository_1.default.getTasks(uid);
                if (tasks.length < (startWith + 2) * limit) {
                    return new WsResponse_1.default(404, startWith - 1);
                }
                if (tasks.length < (startWith + 1) * limit) {
                    tasks = tasks.slice(startWith * limit);
                }
                else {
                    tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
                }
                return new WsResponse_1.default(200, { tasks, page: startWith });
            }
            catch (error) {
                return new WsResponse_1.default(404, startWith - 1);
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