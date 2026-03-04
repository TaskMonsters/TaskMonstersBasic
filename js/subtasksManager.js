/**
 * Subtasks Manager - ID-Based System
 * Manages subtasks for tasks using task IDs instead of array indices
 */

class SubtasksManager {
    constructor() {

    }

    // Helper: Find task by ID
    findTaskById(taskId) {
        if (!window.gameState || !window.gameState.tasks) return null;
        return window.gameState.tasks.find(t => t.id === taskId);
    }

    // Helper: Find task index by ID
    findTaskIndexById(taskId) {
        if (!window.gameState || !window.gameState.tasks) return -1;
        return window.gameState.tasks.findIndex(t => t.id === taskId);
    }

    // Toggle subtask completion
    toggleSubtask(taskId, subtaskId, isChecked) {
        const task = this.findTaskById(taskId);
        if (!task || !task.subtasks) {
            console.error('[SubtasksManager] Task or subtasks not found:', taskId);
            return;
        }

        const subtask = task.subtasks.find(st => st.id === subtaskId);
        if (!subtask) {
            console.error('[SubtasksManager] Subtask not found:', subtaskId);
            return;
        }

        subtask.completed = isChecked;
        
        // Play sound
        if (isChecked && window.audioManager) {
            window.audioManager.playSound('subtask_complete');
        }

        // Award XP for completing subtask (20% of parent task points)
        if (isChecked) {
            const taskPoints = window.calculateTaskPoints ? window.calculateTaskPoints(task) : 100;
            const subtaskXP = Math.floor(taskPoints * 0.2);
            if (window.gameState && subtaskXP > 0) {
                window.gameState.xp = (window.gameState.xp || 0) + subtaskXP;

            }
        }

        // Save state first
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        // Update the UI for this specific task card immediately
        this.updateCompletionButtons(taskId);

    }

    // Add a new subtask
    addSubtask(taskId, subtaskTitle) {
        const task = this.findTaskById(taskId);
        if (!task) {
            console.error('[SubtasksManager] Task not found:', taskId);
            return;
        }

        if (!task.subtasks) {
            task.subtasks = [];
        }

        const newSubtask = {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: subtaskTitle,
            completed: false
        };

        task.subtasks.push(newSubtask);

        // Save and update display
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        this.updateTaskDisplay(taskId);

        return newSubtask;
    }

    // Edit subtask title
    editSubtask(taskId, subtaskId, newTitle) {
        const task = this.findTaskById(taskId);
        if (!task || !task.subtasks) {
            console.error('[SubtasksManager] Task or subtasks not found:', taskId);
            return;
        }

        const subtask = task.subtasks.find(st => st.id === subtaskId);
        if (!subtask) {
            console.error('[SubtasksManager] Subtask not found:', subtaskId);
            return;
        }

        subtask.title = newTitle;

        // Save and update display
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        this.updateTaskDisplay(taskId);

    }

    // Delete a subtask
    deleteSubtask(taskId, subtaskId) {
        const task = this.findTaskById(taskId);
        if (!task || !task.subtasks) {
            console.error('[SubtasksManager] Task or subtasks not found:', taskId);
            return;
        }

        const index = task.subtasks.findIndex(st => st.id === subtaskId);
        if (index === -1) {
            console.error('[SubtasksManager] Subtask not found:', subtaskId);
            return;
        }

        task.subtasks.splice(index, 1);

        // Save and update display
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        this.updateTaskDisplay(taskId);

    }

    // Get subtask progress
    getProgress(taskId) {
        const task = this.findTaskById(taskId);
        if (!task || !task.subtasks) return { completed: 0, total: 0, percentage: 0 };

        const total = task.subtasks.length;
        const completed = task.subtasks.filter(st => st.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
    }

    // Render subtasks for a task
    renderSubtasks(taskId) {
        const task = this.findTaskById(taskId);
        if (!task || !task.subtasks || task.subtasks.length === 0) {
            return '';
        }

        const progress = this.getProgress(taskId);

        return `
            <div class="subtasks-container">
                <div class="subtasks-header">
                    <span class="subtasks-label">Subtasks</span>
                    <span class="subtasks-progress">${progress.completed}/${progress.total}</span>
                </div>
                <div class="subtasks-progress-bar">
                    <div class="subtasks-progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <div class="subtasks-list">
                    ${task.subtasks.map(subtask => this.renderSubtask(taskId, subtask)).join('')}
                </div>
                <button class="subtask-add-btn" onclick="promptAddSubtask('${taskId}')">
                    + Add Subtask
                </button>
            </div>
        `;
    }

    // Render a single subtask
    renderSubtask(taskId, subtask) {
        return `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                <label class="subtask-checkbox">
                    <input type="checkbox" 
                           ${subtask.completed ? 'checked' : ''}
                           onchange="window.subtasksManager.toggleSubtask('${taskId}', '${subtask.id}', this.checked)">
                    <span class="subtask-checkmark"></span>
                </label>
                <span class="subtask-title ${subtask.completed ? 'completed' : ''}">${subtask.title}</span>
                <div class="subtask-actions">
                    <button class="subtask-action-btn" onclick="promptEditSubtask('${taskId}', '${subtask.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="subtask-action-btn" onclick="window.subtasksManager.deleteSubtask('${taskId}', '${subtask.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Update the display of a specific task
    updateTaskDisplay(taskId) {
        // Trigger a full task display update
        if (typeof updateTasksDisplay === 'function') {
            updateTasksDisplay();
        }
        
        // Ensure buttons are updated after display refresh
        setTimeout(() => {
            this.updateCompletionButtons(taskId);
        }, 100);
    }
    
    // Explicitly update completion button states for a task
    updateCompletionButtons(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) return;

        const hasIncomplete = task.subtasks && task.subtasks.some(st => !st.completed);

        // Find the specific task card in the DOM using the data-task-id attribute
        const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
        if (!taskCard) {
            console.warn(`[SubtasksManager] Could not find task card in DOM for ID: ${taskId}`);
            return;
        }

        // Update progress bar and text manually to ensure immediate feedback
        const progress = this.getProgress(taskId);
        const progressFill = taskCard.querySelector('.subtasks-progress-fill');
        const progressText = taskCard.querySelector('.subtasks-progress');
        
        if (progressFill) progressFill.style.width = `${progress.percentage}%`;
        if (progressText) progressText.textContent = `${progress.completed}/${progress.total}`;

        // Target all possible completion buttons
        const buttons = taskCard.querySelectorAll(".action-complete, .finish-whole-task-btn, .green-check-btn, .finish-recurring-btn");
        buttons.forEach(button => {
            if (hasIncomplete) {
                button.disabled = true;
                button.style.opacity = "0.5";
                button.style.cursor = "not-allowed";
                button.style.filter = "grayscale(50%)";
                button.classList.add("disabled");
            } else {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.cursor = "pointer";
                button.style.filter = "none";
                button.classList.remove("disabled");
            }
        });

    }
}

// Initialize the subtasks manager
window.subtasksManager = new SubtasksManager();

// Global helper functions for UI interactions
window.promptAddSubtask = function(taskId) {
    const title = prompt('Enter subtask title:');
    if (title && title.trim()) {
        window.subtasksManager.addSubtask(taskId, title.trim());
    }
};

window.promptEditSubtask = function(taskId, subtaskId) {
    const task = window.subtasksManager.findTaskById(taskId);
    if (!task || !task.subtasks) return;
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;
    
    const newTitle = prompt('Edit subtask title:', subtask.title);
    if (newTitle && newTitle.trim()) {
        window.subtasksManager.editSubtask(taskId, subtaskId, newTitle.trim());
    }
};
