import React, { ChangeEvent, useRef, useState } from 'react';
import Task from '../model/Task';

interface CreateTaskProps {
    accessToken: string;
    onTaskCreated: (newTask: Task) => void; 
}

const CreateTask: React.FC<CreateTaskProps> = ({ accessToken, onTaskCreated }) => {
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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:1337/tasks/photo', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': accessToken
                }
            });
            const { photo } = await response.json();
            const taskData = { name: taskName, description: taskDescription, photo };

            const taskResponse = await fetch('http://localhost:1337/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
                body: JSON.stringify(taskData)
            });
            const res = await taskResponse.json();

            setTaskName('');
            setTaskDescription('');
            setFile(null);

            if (taskResponse.ok) {
                onTaskCreated(res);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                console.error('Task add error:', taskResponse.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
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