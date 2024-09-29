import Task from '../model/Task';
import taskRepository from '../repositroies/TaskRepository';
import isValidNumber from '../utils/number_verifier';
import WsResponse from '../model/WsResponse';

class TaskController {
    async createTask(task: Task, uid: string): Promise<WsResponse> {
        const defaultStatus = "Pending";
        task.status = defaultStatus;

        try {
            task = taskRepository.createTask(task, uid);
            return new WsResponse(201, task, 'Task created');
        } catch (err) {
            console.error('Error: ', err);
            return new WsResponse(400, null, `${err}`);
        }
    }

    async uploadFile(file: any): Promise<WsResponse> {
        try {
            const photo = await taskRepository.uploadFile(file);
            return new WsResponse(201, photo);
        } catch (err) {
            console.error('Error uploading file:', err);
            return new WsResponse(404, null, `${err}`);
        }
    }

    async updateTask(task: Task, uid: string): Promise<WsResponse> {
        try {
            task = await taskRepository.updateTask(task.id, task.date ?? null, task.status ?? null, uid);
            return new WsResponse(200, task);
        } catch (err) {
            console.error('Error:', err);
            return new WsResponse(400, null, `${err}`);
        }
    }

    async deleteTask(taskId: string, uid: string): Promise<WsResponse> {
        const path = (await taskRepository.getTaskById(taskId, uid)).photo;

        try {
            await taskRepository.deleteTask(taskId, path, uid);
            return new WsResponse(204, null);
        } catch (err) {
            return new WsResponse(404, null, `${err}`);
        }
    }

    async getTotalPages(limit: number, uid: string): Promise<WsResponse> {
        if (!isValidNumber(limit)) {
            return new WsResponse(404, null);
        }

        try {
            const tasks = await taskRepository.getTasks(uid);
            const pages = Math.ceil(tasks.length / limit);

            return new WsResponse(200, pages);
        } catch (err) {
            return new WsResponse(404, null, `${err}`);
        }
    }

    async filterTasks(uid: string, status: string, limit: number, startWith: number): Promise<WsResponse> {
        let tasks: Task[] = [];

        if (!isValidNumber(limit) || !isValidNumber(startWith)) {
            return new WsResponse(404, startWith - 1);
        }

        try {
            tasks = await taskRepository.getTasks(uid);
        } catch (err) {
            return new WsResponse(404, startWith - 1);
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
            if (tasks.length === 0) {
                return new WsResponse(404, startWith - 1);
            }
        } else {
            tasks = tasks.slice(startWith * limit, (startWith + 1) * limit);
        }

        return new WsResponse(200, { tasks, page: startWith });
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
