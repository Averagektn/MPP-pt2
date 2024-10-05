import React, { ChangeEvent, useRef, useState } from 'react';
import Task from '../model/Task';
import { Socket } from 'socket.io-client';

interface CreateTaskProps {
    accessToken: string;
    socket: Socket;
}

const CreateTask: React.FC<CreateTaskProps> = ({ accessToken, socket }) => {
    const [taskName, setTaskName] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (!file) {
            return;
        }

        const task = new Task(taskName, taskDescription, null, null, null, null);
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            socket.emit('tasks/create', { file: { name: file.name, type: file.type, buffer: arrayBuffer }, task, accessToken });

            setTaskName('');
            setTaskDescription('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsArrayBuffer(file); 
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