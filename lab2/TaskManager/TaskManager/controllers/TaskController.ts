import express = require('express');
import Task from '../model/Task';
import taskRepository from '../repositroies/TaskRepository';
import isValidNumber from '../utils/number_verifier';

class TaskController {
    async createTask(req: express.Request, res: express.Response): Promise<void> {
        const { name, description, photo } = req.body;
        const defaultStatus = "Pending";
        let task = new Task(name, description, defaultStatus, null, null, photo);

        task = taskRepository.createTask(task);
        res.status(201).json(task);
    }

    async uploadFile(req: express.Request, res: express.Response): Promise<void> {
        const file = req.file;

        try {
            const filePath = await taskRepository.uploadFile(file);
            res.status(201).json({ photo: filePath });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(404).send('Error uploading file.');
        }
    }

    async updateTask(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;
        let task: Task = { ...req.body };

        task = await taskRepository.updateTask(id, task.date ?? null, task.status ?? null);

        res.status(200).json(task);
    }

    async deleteTask(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;
        const path = (await taskRepository.getTaskById(id)).photo;

        try {
            await taskRepository.deleteTask(id, path);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ error: 'Failed to delete task' });
        }
    }

    async getTotalPages(req: express.Request, res: express.Response): Promise<void> {
        const limit = parseInt(req.query.limit as string, null);

        if (!isValidNumber(limit)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            const tasks = await taskRepository.getTasks();
            const pages = Math.ceil(tasks.length / limit);

            res.status(200).send({ pages });
        } catch (err) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
        }
    }

    async filterTasks(req: express.Request, res: express.Response): Promise<void> {
        const status = req.query.status;
        const limit = parseInt(req.query.limit as string, null);
        const startWith = parseInt(req.query.startWith as string, null);
        let tasks: Task[] = [];

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            tasks = await taskRepository.getTasks();
        } catch (err) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        if (status !== 'None') {
            tasks = tasks.filter(task => task.status === status);
        }

        if (tasks.length < (startWith + 1) * limit) {
            tasks = tasks.slice(startWith * limit);
        } else {
            tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
        }

        res.status(200).json(tasks)
    }

    async getTasks(req: express.Request, res: express.Response): Promise<void> {
        const limit = parseInt(req.query.limit as string, null);
        const startWith = parseInt(req.query.startWith as string, null);

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            let tasks = await taskRepository.getTasks();;
            if (tasks.length < (startWith + 1) * limit) {
                tasks = tasks.slice(startWith * limit);
            } else {
                tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
            }
            res.status(200).json(tasks);
        } catch (error) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
        }
    }

    async getTaskById(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;

        try {
            const task = await taskRepository.getTaskById(id);
            res.status(200).json(task);
        } catch (error) {
            res.status(404).json({ error: 'Failed to retrieve task' });
        }
    }
}

export default new TaskController();
