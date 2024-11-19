import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const SubTask = ({ subTask, taskId, subTaskIndex }) => {
    const { updateTask } = useTasks();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleStatusChange = async (newStatus) => {
        const updatedSubTask = { ...subTask, status: newStatus };
        updateTask(taskId, {
            subTasks: {
                [subTaskIndex]: updatedSubTask
            }
        });
    };

    const hasSubTasks = subTask.subTasks && subTask.subTasks.length > 0;

    return (
        <div className="border-l pl-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleStatusChange(subTask.status === 'DONE' ? 'TODO' : 'DONE')}
                    className={`p-1 rounded-full ${subTask.status === 'DONE' ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                >
                    <Check className={`w-4 h-4 ${subTask.status === 'DONE' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                </button>
                <span className={subTask.status === 'DONE' ? 'line-through text-gray-500' : ''}>
                    {subTask.title}
                </span>
                {hasSubTasks && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {isExpanded && hasSubTasks && (
                <div className="mt-2 space-y-2">
                    {subTask.subTasks.map((nestedSubTask, index) => (
                        <SubTask
                            key={index}
                            subTask={nestedSubTask}
                            taskId={taskId}
                            subTaskIndex={`${subTaskIndex}.subTasks.${index}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubTask;