"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const TaskController_1 = require("../controllers/TaskController");
const router = express.Router();
const upload = multer();
router.post('/tasks', TaskController_1.default.createTask);
router.post('/tasks/photo', upload.single('file'), TaskController_1.default.uploadFile);
router.patch('/tasks/:id', TaskController_1.default.updateTask);
router.delete('/tasks/:id', TaskController_1.default.deleteTask);
router.get('/tasks/filter', TaskController_1.default.filterTasks);
router.get('/tasks', TaskController_1.default.getTasks);
router.get('/tasks/:id', TaskController_1.default.getTaskById);
exports.default = router;
//# sourceMappingURL=index.js.map