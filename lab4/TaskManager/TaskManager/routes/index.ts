import express = require('express');
import multer = require('multer');
import taskController from '../controllers/TaskController';
import authController from '../controllers/AuthController';

const router = express.Router();
const upload = multer(); 

router.post('/tasks', taskController.createTask);
router.post('/tasks/photo', upload.single('file'), taskController.uploadFile);
router.patch('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.get('/tasks/filter', taskController.filterTasks);
router.get('/tasks', taskController.getTasks);
router.get('/tasks/pages', taskController.getTotalPages);
router.get('/tasks/:id', taskController.getTaskById);

router.post('/auth/users', authController.createUser);
router.post('/auth/access', authController.getAccessToken);
router.post('/auth/refresh', authController.getRefreshToken);

export default router;
