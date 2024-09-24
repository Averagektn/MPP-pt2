import express = require('express');
import multer = require('multer');
import taskController from '../controllers/TaskController';

const router = express.Router();
const upload = multer(); 

router.post('/tasks', upload.single('file'), taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.get('/tasks/filter', taskController.filterTasks);
router.get('/tasks', taskController.getTasks);
router.get('/tasks/:id', taskController.getTaskById);

export default router;
