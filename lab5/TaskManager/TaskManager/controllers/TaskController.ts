import Task from '../model/Task';
import taskRepository from '../repositroies/TaskRepository';
import isValidNumber from '../utils/number_verifier';
import WsResponse from '../model/WsResponse';

class TaskController {
    createTask(task: Task, uid: string): Task {
        const defaultStatus = "Pending";
        task.status = defaultStatus;

        return taskRepository.createTask(task, uid);
    }

    async uploadFile(file: any): Promise<string> {
        return await taskRepository.uploadFile(file);
    }

    async updateTask(task: Task, uid: string): Promise<Task> {
        return await taskRepository.updateTask(task.id, task.date ?? null, task.status ?? null, uid);
    }

    async deleteTask(taskId: string, uid: string): Promise<void> {
        const path = (await taskRepository.getTaskById(taskId, uid)).photo;

        await taskRepository.deleteTask(taskId, path, uid);
    }

    async getTotalPages(limit: number, uid: string): Promise<number> {
        if (!isValidNumber(limit)) {
            throw new Error('404');
        }

        const tasks = await taskRepository.getTasks(uid);
        const pages = Math.ceil(tasks.length / limit);

        return pages;
    }

    async filterTasks(uid: string, status: string, limit: number, startWith: number): Promise<any> {
        let tasks: Task[] = [];

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            throw new Error('404');
        }

        try {
            tasks = await taskRepository.getTasks(uid);
        } catch (err) {
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
        } else {
            tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
        }

        return { tasks, page: startWith };
    }

    async getTasks(uid: string, limit: number, startWith: number): Promise<WsResponse> {
        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            return new WsResponse(404, startWith - 1);
        }

        try {
            let tasks = await taskRepository.getTasks(uid);
            if (tasks.length < (startWith + 2) * limit) {
                return new WsResponse(404, startWith - 1);
            }

            if (tasks.length < (startWith + 1) * limit) {
                tasks = tasks.slice(startWith * limit);
            } else {
                tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
            }
            return new WsResponse(200, { tasks, page: startWith });
        } catch (error) {
            return new WsResponse(404, startWith - 1);
        }
    }

    async getTaskById(uid: string, taskId: string): Promise<WsResponse> {
        try {
            const task = await taskRepository.getTaskById(taskId, uid);
            return new WsResponse(200, task);
        } catch (error) {
            return new WsResponse(404, null);
        }
    }
}

export default new TaskController();
