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
class TaskController {
    createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description } = req.body;
            const file = req.file;
            const defaultStatus = "Pending";
            if (!file) {
                const task = new Task_1.default(name, description, defaultStatus);
                TaskRepository_1.default.createTask(task);
                res.json(task);
            }
            else {
                const onError = (err) => {
                    console.error(err);
                    res.status(500).send('Failed to upload to Firebase Storage.');
                };
                const onFinish = (task) => {
                    res.json(task);
                };
                try {
                    yield TaskRepository_1.default.loadFile(file, null, onFinish, onError);
                }
                catch (error) {
                    console.error('Error uploading file:', error);
                    res.status(400).send('Error uploading file.');
                }
            }
        });
    }
    updateTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const task = Object.assign({}, req.body);
            yield TaskRepository_1.default.updateTask(id, task.date, task.status);
            res.json(task);
        });
    }
    deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const path = req.body.path;
            try {
                yield TaskRepository_1.default.deleteTask(id, path);
                res.status(204);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to delete task' });
            }
        });
    }
    filterTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = req.query.status;
            let tasks = [];
            try {
                tasks = yield TaskRepository_1.default.getTasksWithId();
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
    }
    ;
    getTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = parseInt(req.query.limit, null);
            const startWithId = req.query.startWithId;
            try {
                let tasks = [];
                if (limit) {
                    tasks = yield TaskRepository_1.default.getPaginatedTasksWithId(limit, startWithId);
                    res.json(tasks);
                    return;
                }
                tasks = yield TaskRepository_1.default.getTasksWithId();
                res.json(tasks);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to retrieve tasks' });
            }
        });
    }
    getTaskById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const task = yield TaskRepository_1.default.getTaskById(id);
                res.json(task);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to retrieve task' });
            }
        });
    }
    ;
}
exports.default = new TaskController();
//# sourceMappingURL=TaskController.js.map