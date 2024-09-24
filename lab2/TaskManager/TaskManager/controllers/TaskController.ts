import express = require('express');
import Task from '../model/Task';
import taskRepository from '../repositroies/TaskRepository';

class TaskController {
    async createTask(req: express.Request, res: express.Response): Promise<void> {
        const { name, description } = req.body;
        const file = req.file;
        const defaultStatus = "Pending";

        if (!file) {
            const task = new Task(name, description, defaultStatus);
            taskRepository.createTask(task);

            res.json(task);
        } else {
            const onError = (err: Error) => {
                console.error(err);
                res.status(500).send('Failed to upload to Firebase Storage.');
            }
            const onFinish = (task: Task) => {
                res.json(task);
            }
            try {
                await taskRepository.loadFile(file, null, onFinish, onError);
            } catch (error) {
                console.error('Error uploading file:', error);
                res.status(400).send('Error uploading file.');
            }
        }
    }

    async updateTask(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;
        const task: Task = { ...req.body };

        await taskRepository.updateTask(id, task.date, task.status);

        res.json(task);
    }

    async deleteTask(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;
        const path = req.body.path;

        try {
            await taskRepository.deleteTask(id, path);
            res.status(204);
        } catch (error) {
            res.status(400).json({ error: 'Failed to delete task' });
        }
    }

    async filterTasks(req: express.Request, res: express.Response): Promise<void> {
        const status = req.query.status;
        let tasks: Task[] = [];

        try {
            tasks = await taskRepository.getTasksWithId();
        } catch (err) {
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

        res.json(tasks)
    };

    async getTasks(req: express.Request, res: express.Response): Promise<void> {
        const limit = parseInt(req.query.limit as string, null);
        const startWithId = req.query.startWithId as string;

        try {
            let tasks: Task[] = [];
            if (limit) {
                tasks = await taskRepository.getPaginatedTasksWithId(limit, startWithId);
                res.json(tasks);
                return;
            }
            tasks = await taskRepository.getTasksWithId();
            res.json(tasks);
        } catch (error) {
            res.status(400).json({ error: 'Failed to retrieve tasks' });
        }
    }

    async getTaskById(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;

        try {
            const task = await taskRepository.getTaskById(id);
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: 'Failed to retrieve task' });
        }
    };
}

export default new TaskController();
