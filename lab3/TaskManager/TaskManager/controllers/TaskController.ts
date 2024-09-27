import express = require('express');
import Task from '../model/Task';
import taskRepository from '../repositroies/TaskRepository';
import isValidNumber from '../utils/number_verifier';
import jwt = require('jsonwebtoken');

class TaskController {
    async createTask(req: express.Request, res: express.Response): Promise<void> {
        const { name, description, photo } = req.body;
        const defaultStatus = "Pending";
        let task = new Task(name, description, defaultStatus, null, null, photo);

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        task = taskRepository.createTask(task, uid);
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

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        task = await taskRepository.updateTask(id, task.date ?? null, task.status ?? null, uid);

        res.status(200).json(task);
    }

    async deleteTask(req: express.Request, res: express.Response): Promise<void> {
        const id = req.params.id;

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        const path = (await taskRepository.getTaskById(id, uid)).photo;

        try {
            await taskRepository.deleteTask(id, path, uid);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ error: 'Failed to delete task' });
        }
    }

    async getTotalPages(req: express.Request, res: express.Response): Promise<void> {
        const limit = parseInt(req.query.limit as string, null);

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        if (!isValidNumber(limit)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            const tasks = await taskRepository.getTasks(uid);
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

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            tasks = await taskRepository.getTasks(uid);
        } catch (err) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
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

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            res.status(404).json({ error: 'Failed to retrieve tasks' });
            return;
        }

        try {
            let tasks = await taskRepository.getTasks(uid);;
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

        const token = req.headers['authorization'].split(' ')[1];
        const { uid } = jwt.decode(token) as jwt.JwtPayload;

        try {
            const task = await taskRepository.getTaskById(id, uid);
            res.status(200).json(task);
        } catch (error) {
            res.status(404).json({ error: 'Failed to retrieve task' });
        }
    }
}

export default new TaskController();
