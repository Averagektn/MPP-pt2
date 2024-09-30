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
const Task_1 = require("../model/Task");
const TaskRepository_1 = require("../repositroies/TaskRepository");
const number_verifier_1 = require("../utils/number_verifier");
class TaskController {
    createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, photo } = req.body;
            const defaultStatus = "Pending";
            let task = new Task_1.default(name, description, defaultStatus, null, null, photo);
            task = TaskRepository_1.default.createTask(task);
            res.status(201).json(task);
        });
    }
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = req.file;
            try {
                const filePath = yield TaskRepository_1.default.uploadFile(file);
                res.status(201).json({ photo: filePath });
            }
            catch (error) {
                console.error('Error uploading file:', error);
                res.status(404).send('Error uploading file.');
            }
        });
    }
    updateTask(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            let task = Object.assign({}, req.body);
            task = yield TaskRepository_1.default.updateTask(id, (_a = task.date) !== null && _a !== void 0 ? _a : null, (_b = task.status) !== null && _b !== void 0 ? _b : null);
            res.status(200).json(task);
        });
    }
    deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const path = (yield TaskRepository_1.default.getTaskById(id)).photo;
            try {
                yield TaskRepository_1.default.deleteTask(id, path);
                res.status(204).send();
            }
            catch (error) {
                res.status(404).json({ error: 'Failed to delete task' });
            }
        });
    }
    getTotalPages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = parseInt(req.query.limit, null);
            if (!(0, number_verifier_1.default)(limit)) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
                return;
            }
            try {
                const tasks = yield TaskRepository_1.default.getTasks();
                const pages = Math.ceil(tasks.length / limit);
                res.status(200).send({ pages });
            }
            catch (err) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
            }
        });
    }
    filterTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = req.query.status;
            const limit = parseInt(req.query.limit, null);
            const startWith = parseInt(req.query.startWith, null);
            let tasks = [];
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
                return;
            }
            try {
                tasks = yield TaskRepository_1.default.getTasks();
            }
            catch (err) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
                return;
            }
            if (status !== 'None') {
                tasks = tasks.filter(task => task.status === status);
            }
            if (tasks.length < (startWith + 1) * limit) {
                tasks = tasks.slice(startWith * limit);
            }
            else {
                tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
            }
            res.status(200).json(tasks);
        });
    }
    getTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = parseInt(req.query.limit, null);
            const startWith = parseInt(req.query.startWith, null);
            if (!(0, number_verifier_1.default)(limit) || !(0, number_verifier_1.default)(startWith)) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
                return;
            }
            try {
                let tasks = yield TaskRepository_1.default.getTasks();
                ;
                if (tasks.length < (startWith + 1) * limit) {
                    tasks = tasks.slice(startWith * limit);
                }
                else {
                    tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
                }
                res.status(200).json(tasks);
            }
            catch (error) {
                res.status(404).json({ error: 'Failed to retrieve tasks' });
            }
        });
    }
    getTaskById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const task = yield TaskRepository_1.default.getTaskById(id);
                res.status(200).json(task);
            }
            catch (error) {
                res.status(404).json({ error: 'Failed to retrieve task' });
            }
        });
    }
}
exports.default = new TaskController();
//# sourceMappingURL=TaskController.js.map