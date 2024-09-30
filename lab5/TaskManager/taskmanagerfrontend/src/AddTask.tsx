import React, { ChangeEvent, useRef, useState } from 'react';
import Task from '../model/Task';
import { createClient } from 'graphql-ws';

interface CreateTaskProps {
    accessToken: string;
    onTaskCreated: (newTask: Task) => void; 
}

const CreateTask: React.FC<CreateTaskProps> = ({ accessToken, onTaskCreated }) => {
    const [taskName, setTaskName] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

/*    const socket = io('http://localhost:1337');
    socket.on('tasks/create', (res) => {
        const data: WsResponse = JSON.parse(res);

        if (data.status >= 200 && data.status < 300) {
            onTaskCreated(data.data);
        } 
    });*/

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const client = createClient({
                url: 'ws://localhost:1337/graphql',
            });

            const task = new Task(taskName, taskDescription, null, null, null, null);

            const query = client.iterate({
                query: `mutation CreateTask($file: FileInput!, $task: TaskInput!, $accessToken: String!) {
                          createTask(file: $file, task: $task, accessToken: $accessToken) {
                            id
                            name
                            description
                            status
                            photo
                          }
                        }`,
                variables: {
                    file: { name: file.name, type: file.type, data: reader.result },
                    task,
                    accessToken
                },
            });

            const { value } = await query.next();
            console.log(value);

            if (!value.errors) {
                onTaskCreated(value.data.createTask);
            } else {
                alert('FAIL');
            }

            setTaskName('');
            setTaskDescription('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            client.dispose();
        };
        reader.readAsDataURL(file); 
    };

    return (
        <div className="row">
            <form onSubmit={handleCreateTask}>
                <input
                    type="text"
                    name="name"
                    placeholder="Task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Task description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    required
                />
                <input
                    type="file"
                    name="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    required
                />
                <button type="submit" className="btn">Add Task</button>
            </form>
        </div>
    );
};

export default CreateTask;