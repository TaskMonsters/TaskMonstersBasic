// Recurring Tasks Manager for Task Monsters
// ===================================

class RecurringTasksManager {
    constructor() {
        this.recurringTasks = this.loadRecurringTasks();
        this.init();
    }

    // Load recurring tasks from localStorage
    loadRecurringTasks() {
        try {
            const stored = localStorage.getItem('recurringTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recurring tasks:', error);
            return [];
        }
    }

    // Save recurring tasks to localStorage
    saveRecurringTasks() {
        try {
            localStorage.setItem('recurringTasks', JSON.stringify(this.recurringTasks));
        } catch (error) {
            console.error('Error saving recurring tasks:', error);
        }
    }

    // Initialize - check for tasks that need to be created
    init() {
        this.checkAndCreateDueTasks();
        // Check every hour for new tasks
        setInterval(() => this.checkAndCreateDueTasks(), 60 * 60 * 1000);
    }

    // Add a new recurring task template
    addRecurringTask(taskTemplate) {
        const recurringTask = {
            id: `recurring_${Date.now()}`,
            ...taskTemplate,
            isRecurring: true,
            recurrence: taskTemplate.recurrence || {
                type: 'daily', // daily, weekly, monthly, custom
                interval: 1, // every X days/weeks/months
                daysOfWeek: [], // for weekly: [0-6] where 0=Sunday
                dayOfMonth: null, // for monthly: 1-31
                time: '09:00', // default time to create task
            },
            nextDueDate: this.calculateNextDueDate(taskTemplate.recurrence),
            lastCreated: null,
            createdCount: 0,
            completions: [], // Track completion timestamps
            active: true
        };

        this.recurringTasks.push(recurringTask);
        this.saveRecurringTasks();
        this.updateDisplay();
        return recurringTask;
    }

    // Calculate next due date based on recurrence pattern
    calculateNextDueDate(recurrence, fromDate = new Date()) {
        const next = new Date(fromDate);
        
        switch (recurrence.type) {
            case 'daily':
                next.setDate(next.getDate() + (recurrence.interval || 1));
                break;
                
            case 'weekly':
                // Find next occurrence of specified days
                const targetDays = recurrence.daysOfWeek || [];
                if (targetDays.length === 0) {
                    next.setDate(next.getDate() + 7 * (recurrence.interval || 1));
                } else {
                    let found = false;
                    for (let i = 1; i <= 14; i++) {
                        next.setDate(next.getDate() + 1);
                        if (targetDays.includes(next.getDay())) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        next.setDate(next.getDate() + 7);
                    }
                }
                break;
                
            case 'monthly':
                const targetDay = recurrence.dayOfMonth || 1;
                next.setMonth(next.getMonth() + (recurrence.interval || 1));
                next.setDate(Math.min(targetDay, this.getDaysInMonth(next)));
                break;
                
            case 'custom':
                // Custom interval in days
                next.setDate(next.getDate() + (recurrence.customDays || 1));
                break;
        }

        // Set time
        if (recurrence.time) {
            const [hours, minutes] = recurrence.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return next.toISOString();
    }

    // Get days in month
    getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    // Check if any recurring tasks are due and create them
    checkAndCreateDueTasks() {
        const now = new Date();
        let tasksCreated = 0;

        this.recurringTasks.forEach(recurringTask => {
            if (!recurringTask.active) return;

            const nextDue = new Date(recurringTask.nextDueDate);
            
            // If next due date has passed, create the task
            if (now >= nextDue) {
                this.createTaskInstance(recurringTask);
                
                // Update next due date
                recurringTask.lastCreated = now.toISOString();
                recurringTask.createdCount++;
                recurringTask.nextDueDate = this.calculateNextDueDate(
                    recurringTask.recurrence,
                    nextDue
                );
                
                tasksCreated++;
            }
        });

        if (tasksCreated > 0) {
            this.saveRecurringTasks();
            if (typeof updateTasksDisplay === 'function') {
                updateTasksDisplay();
            }

        }
    }

    // Create an actual task instance from recurring template
    createTaskInstance(recurringTask) {
        if (!window.gameState) return;

        const task = {
            title: recurringTask.title,
            description: recurringTask.description || '',
            category: recurringTask.category,
            difficulty: recurringTask.difficulty,
            priority: recurringTask.priority,
            points: recurringTask.points,
            dueDate: this.calculateTaskDueDate(recurringTask),
            createdAt: new Date().toISOString(),
            completed: false,
            isFromRecurring: true,
            recurringTaskId: recurringTask.id
        };

        window.gameState.tasks.push(task);
        window.gameState.totalTasksCreated = (window.gameState.totalTasksCreated || 0) + 1;

        // Schedule notifications
        if (window.notificationManager && task.dueDate) {
            const taskIndex = window.gameState.tasks.length - 1;
            window.notificationManager.scheduleTaskNotifications(task, taskIndex);
        }

        if (typeof saveGameState === 'function') {
            saveGameState();
        }

    }

    // Calculate when this task instance is due
    calculateTaskDueDate(recurringTask) {
        const recurrence = recurringTask.recurrence;
        const dueDate = new Date();

        // Set time
        if (recurrence.time) {
            const [hours, minutes] = recurrence.time.split(':');
            dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        // Add buffer time based on recurrence type
        switch (recurrence.type) {
            case 'daily':
                // Due by end of day
                dueDate.setHours(23, 59, 59, 999);
                break;
            case 'weekly':
                // Due in 7 days
                dueDate.setDate(dueDate.getDate() + 7);
                break;
            case 'monthly':
                // Due in 30 days
                dueDate.setDate(dueDate.getDate() + 30);
                break;
        }

        return dueDate.toISOString();
    }

    // Toggle recurring task active status
    toggleRecurringTask(taskId) {
        const task = this.recurringTasks.find(t => t.id === taskId);
        if (task) {
            task.active = !task.active;
            this.saveRecurringTasks();
            this.updateDisplay();
        }
    }

    // Edit recurring task
    editRecurringTask(taskId, updates) {
        const task = this.recurringTasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            // Recalculate next due date if recurrence changed
            if (updates.recurrence) {
                task.nextDueDate = this.calculateNextDueDate(updates.recurrence);
            }
            this.saveRecurringTasks();
            this.updateDisplay();
        }
    }

    // Delete recurring task
    deleteRecurringTask(taskId) {
        this.recurringTasks = this.recurringTasks.filter(t => t.id !== taskId);
        this.saveRecurringTasks();
        this.updateDisplay();
    }

    // Get human-readable recurrence description
    getRecurrenceDescription(recurrence) {
        const { type, interval, daysOfWeek, dayOfMonth, time } = recurrence;
        
        let desc = '';
        
        switch (type) {
            case 'daily':
                desc = interval === 1 ? 'Every day' : `Every ${interval} days`;
                break;
                
            case 'weekly':
                if (daysOfWeek && daysOfWeek.length > 0) {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const days = daysOfWeek.map(d => dayNames[d]).join(', ');
                    desc = `Every ${days}`;
                } else {
                    desc = interval === 1 ? 'Every week' : `Every ${interval} weeks`;
                }
                break;
                
            case 'monthly':
                desc = `Monthly on day ${dayOfMonth || 1}`;
                break;
                
            case 'custom':
                desc = `Every ${recurrence.customDays} days`;
                break;
        }

        if (time) {
            desc += ` at ${time}`;
        }

        return desc;
    }

    // Update display of recurring tasks
    updateDisplay() {
        const container = document.getElementById('recurringTasksList');
        const card = document.getElementById('recurringTasksCard');
        
        if (!container) return;
        
        // Show/hide card based on whether there are recurring tasks
        if (card) {
            card.style.display = this.recurringTasks.length > 0 ? 'block' : 'none';
        }

        if (this.recurringTasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Recurring Tasks</div>
                    <div style="font-size: 14px;">Create recurring tasks to automate your routine!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recurringTasks.map(task => this.renderRecurringTask(task)).join('');
    }

    // Render a single recurring task
    renderRecurringTask(task) {
        const nextDue = new Date(task.nextDueDate);
        const timeUntil = this.getTimeUntil(nextDue);
        const recurrenceDesc = this.getRecurrenceDescription(task.recurrence);
        
        const categoryEmojis = {
            work: '💼', learning: '🎓', home: '🏠', finance: '💰',
            goals: '🎯', projects: '🛠️', errands: '🚗', digital: '📱',
            creative: '🎨', social: '🤝🏽'
        };

        // Check if task has subtasks
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        
        if (hasSubtasks) {
            return this.renderRecurringTaskWithSubtasks(task, categoryEmojis, recurrenceDesc, timeUntil);
        } else {
            return this.renderRecurringTaskSimple(task, categoryEmojis, recurrenceDesc, timeUntil);
        }
    }
    
    // Render recurring task WITHOUT subtasks
    renderRecurringTaskSimple(task, categoryEmojis, recurrenceDesc, timeUntil) {
        // Check if completed today
        const today = new Date().toDateString();
        const completedToday = task.completions && task.completions.some(c => {
            return new Date(c).toDateString() === today;
        });
        
        return `
            <div class="recurring-task-card ${task.active ? '' : 'inactive'}" data-task-id="${task.id}">
                <div class="recurring-task-header">
                    <div class="recurring-task-icon">${categoryEmojis[task.category] || '📋'}</div>
                    <div class="recurring-task-info">
                        <div class="recurring-task-title">${task.title}</div>
                        <div class="recurring-task-recurrence">${recurrenceDesc}</div>
                    </div>
                    <label class="recurring-task-toggle">
                        <input type="checkbox" ${task.active ? 'checked' : ''} 
                               onchange="window.recurringTasksManager.toggleRecurringTask('${task.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="recurring-task-details">
                    <span class="recurring-task-badge">${task.difficulty}</span>
                    <span class="recurring-task-badge">${task.category}</span>
                    <span class="recurring-task-points">+${task.points} pts</span>
                </div>
                ${task.active ? `
                    <div class="recurring-task-next">
                        Next: ${timeUntil}
                    </div>
                ` : ''}
                
                <!-- Today's Completion Section -->
                <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-top: 12px;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px;">
                        ${completedToday ? '✓' : '○'} TODAY'S COMPLETION
                    </div>
                    ${completedToday ? `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 8px; margin-bottom: 12px;">
                            <span style="font-size: 20px;">✓</span>
                            <span style="font-size: 14px; color: #4ade80; font-weight: 600;">Completed today!</span>
                        </div>
                    ` : `
                        <div style="display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--bg-primary); border: 1px dashed var(--text-tertiary); border-radius: 8px; margin-bottom: 12px;">
                            <span style="font-size: 14px; color: var(--text-secondary);">Not completed yet</span>
                        </div>
                        <button onclick="completeRecurringTaskToday('${task.id}')" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
                            <span>Complete Today</span>
                            <span style="font-size: 12px; opacity: 0.9;">+70 XP</span>
                        </button>
                    `}
                </div>
                
                ${this.renderCompletionHistory(task)}
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 8px;">
                    <button class="btn-icon" onclick="editRecurringTask('${task.id}')" title="Edit" style="background: var(--bg-tertiary); border: none; border-radius: 8px; padding: 8px 12px; font-size: 16px; cursor: pointer;">
                        ✏️
                    </button>
                    <button onclick="deleteRecurringTask('${task.id}')" title="Dismiss" style="flex: 1; background: transparent; color: var(--text-secondary); border: 1px solid var(--text-tertiary); border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.borderColor='var(--text-secondary)'; this.style.color='var(--text-primary)'" onmouseout="this.style.borderColor='var(--text-tertiary)'; this.style.color='var(--text-secondary)'">× Dismiss</button>
                </div>
            </div>
        `;
    }
    
    // Render recurring task WITH subtasks
    renderRecurringTaskWithSubtasks(task, categoryEmojis, recurrenceDesc, timeUntil) {
        // Initialize current period subtasks if not exists
        if (!task.currentPeriodSubtasks) {
            task.currentPeriodSubtasks = task.subtasks.map(st => ({
                ...st,
                completed: false
            }));
        }
        
        const completedCount = task.currentPeriodSubtasks.filter(st => st.completed).length;
        const totalCount = task.currentPeriodSubtasks.length;
        const allComplete = completedCount === totalCount;
        const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        
        return `
            <div class="recurring-task-card ${task.active ? '' : 'inactive'}" data-task-id="${task.id}">
                <div class="recurring-task-header">
                    <div class="recurring-task-icon">${categoryEmojis[task.category] || '📋'}</div>
                    <div class="recurring-task-info">
                        <div class="recurring-task-title">${task.title}</div>
                        <div class="recurring-task-recurrence">${recurrenceDesc}</div>
                    </div>
                    <label class="recurring-task-toggle">
                        <input type="checkbox" ${task.active ? 'checked' : ''} 
                               onchange="window.recurringTasksManager.toggleRecurringTask('${task.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="recurring-task-details">
                    <span class="recurring-task-badge">${task.difficulty}</span>
                    <span class="recurring-task-badge">${task.category}</span>
                    <span class="recurring-task-points">+${task.points} pts</span>
                </div>
                ${task.active ? `
                    <div class="recurring-task-next">
                        Next: ${timeUntil}
                    </div>
                ` : ''}
                
                <!-- This Period's Progress Section -->
                <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-top: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">THIS PERIOD'S PROGRESS</span>
                        <span style="font-size: 12px; font-weight: 600; color: var(--accent-primary);">${completedCount}/${totalCount}</span>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div style="height: 4px; background: var(--bg-primary); border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
                        <div style="height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                    
                    <!-- Subtasks List -->
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
                        ${task.currentPeriodSubtasks.map((subtask, index) => `
                            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-primary); border-radius: 6px; ${subtask.completed ? 'opacity: 0.6;' : ''}">
                                <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                                       onchange="toggleRecurringSubtask('${task.id}', ${index})" 
                                       style="width: 18px; height: 18px; cursor: pointer;">
                                <span style="flex: 1; font-size: 14px; color: var(--text-primary); ${subtask.completed ? 'text-decoration: line-through; color: var(--text-secondary);' : ''}">
                                    ${subtask.title}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Complete All Button -->
                    <button onclick="completeRecurringTaskWithSubtasks('${task.id}')" 
                            ${!allComplete ? 'disabled' : ''}
                            style="width: 100%; background: ${allComplete ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg-primary)'}; color: ${allComplete ? 'white' : 'var(--text-tertiary)'}; border: none; border-radius: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600; cursor: ${allComplete ? 'pointer' : 'not-allowed'}; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;" 
                            ${allComplete ? "onmouseover=\"this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'\" onmouseout=\"this.style.transform=''; this.style.boxShadow=''\"" : ''}>
                        <span>${allComplete ? 'Complete All' : 'Complete All Subtasks First'}</span>
                        ${allComplete ? '<span style="font-size: 12px; opacity: 0.9;">+70 XP</span>' : ''}
                    </button>
                </div>
                
                ${this.renderCompletionHistory(task)}
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 8px;">
                    <button class="btn-icon" onclick="editRecurringTask('${task.id}')" title="Edit" style="background: var(--bg-tertiary); border: none; border-radius: 8px; padding: 8px 12px; font-size: 16px; cursor: pointer;">
                        ✏️
                    </button>
                    <button onclick="deleteRecurringTask('${task.id}')" title="Dismiss" style="flex: 1; background: transparent; color: var(--text-secondary); border: 1px solid var(--text-tertiary); border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.borderColor='var(--text-secondary)'; this.style.color='var(--text-primary)'" onmouseout="this.style.borderColor='var(--text-tertiary)'; this.style.color='var(--text-secondary)'">× Dismiss</button>
                </div>
            </div>
        `;
    }

    // Get human-readable time until next occurrence
    getTimeUntil(date) {
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) return 'Overdue';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `in ${days}d ${hours}h`;
        if (hours > 0) return `in ${hours}h ${minutes}m`;
        return `in ${minutes}m`;
    }

    // Render completion history with visual indicators
    renderCompletionHistory(task) {
        const completions = task.completions || [];
        const completionCount = completions.length;
        
        if (completionCount === 0) {
            return `
                <div class="recurring-task-stats" style="color: var(--text-secondary); font-size: 13px; margin-top: 8px;">
                    <span style="opacity: 0.7;">No completions yet</span>
                </div>
            `;
        }
        
        // Get last 5 completions for display
        const recentCompletions = completions.slice(-5).reverse();
        const lastCompletion = new Date(completions[completions.length - 1]);
        const timeSinceLastCompletion = this.getTimeSince(lastCompletion);
        
        // Create visual dots for recent completions
        const dots = recentCompletions.map((completion, index) => {
            const date = new Date(completion);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `<span class="completion-dot" title="Completed on ${dateStr}" style="display: inline-block; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; margin: 0 2px;"></span>`;
        }).join('');
        
        const moreCount = completionCount > 5 ? completionCount - 5 : 0;
        
        return `
            <div class="recurring-task-stats" style="margin-top: 12px; padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
                        ✓ ${completionCount} completion${completionCount !== 1 ? 's' : ''}
                    </span>
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        Last: ${timeSinceLastCompletion}
                    </span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        ${dots}
                        ${moreCount > 0 ? `<span style="font-size: 11px; color: var(--text-secondary); margin-left: 4px;">+${moreCount} more</span>` : ''}
                    </div>
                    <button class="action-btn action-complete" onclick="completeRecurringTaskNow('${task.id}')" title="Complete Now" style="background: #4ade80; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 32px; height: 32px;">✓</button>
                </div>
            </div>
        `;
    }

    // Get human-readable time since a date
    getTimeSince(date) {
        const now = new Date();
        const diff = now - date;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }
}

// Initialize recurring tasks manager
window.recurringTasksManager = new RecurringTasksManager();

// Global functions for UI
window.editRecurringTask = function(taskId) {
    // Open edit modal (to be implemented in HTML)
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (task && typeof openRecurringTaskModal === 'function') {
        openRecurringTaskModal(task);
    }
};

window.deleteRecurringTask = function(taskId) {
    // Close the card without completing it
    const card = event?.target?.closest('.recurring-task-card');
    if (card) {
        card.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => card.remove(), 300);
    }
};

window.completeRecurringTaskNow = function(taskId) {
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Track completion (add green dot)
    if (!task.completions) task.completions = [];
    task.completions.push(new Date().toISOString());
    
    // Save and update display
    window.recurringTasksManager.saveRecurringTasks();
    window.recurringTasksManager.updateDisplay();
    
    // Show brief success message
    if (typeof showNotification === 'function') {
        showNotification('✓ Completion tracked!', 'success');
    }
};

window.openRecurringTaskModal = function(task) {
    if (!task) return;
    
    // Open the create task modal
    if (typeof openCreateTaskModal === 'function') {
        openCreateTaskModal();
        
        // Wait for modal to open, then populate fields
        setTimeout(() => {
            // Set editing mode
            window.editingRecurringTaskId = task.id;
            
            // Populate basic fields
            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            
            // Select category, difficulty, priority
            if (task.category && typeof selectCategory === 'function') selectCategory(task.category);
            if (task.difficulty && typeof selectDifficulty === 'function') selectDifficulty(task.difficulty);
            if (task.priority && typeof selectPriority === 'function') selectPriority(task.priority);
            
            // Enable recurring options
            const recurringCheckbox = document.getElementById('makeRecurring');
            if (recurringCheckbox) {
                recurringCheckbox.checked = true;
                if (typeof toggleRecurringOptions === 'function') {
                    toggleRecurringOptions();
                }
                
                // Populate recurrence fields
                setTimeout(() => {
                    const recurrence = task.recurrence || {};
                    
                    // Set recurrence type
                    const typeSelect = document.getElementById('recurrenceType');
                    if (typeSelect) {
                        typeSelect.value = recurrence.type || 'daily';
                        if (typeof updateRecurrenceOptions === 'function') {
                            updateRecurrenceOptions();
                        }
                    }
                    
                    // Set time
                    const timeInput = document.getElementById('recurrenceTime');
                    if (timeInput) {
                        timeInput.value = recurrence.time || '09:00';
                    }
                    
                    // Set interval
                    const intervalInput = document.getElementById('recurrenceInterval');
                    if (intervalInput) {
                        intervalInput.value = recurrence.interval || 1;
                    }
                    
                    // Set weekly days
                    if (recurrence.type === 'weekly' && recurrence.daysOfWeek) {
                        recurrence.daysOfWeek.forEach(day => {
                            const checkbox = document.querySelector(`input[name="weekday"][value="${day}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                    
                    // Set monthly day
                    if (recurrence.type === 'monthly') {
                        const dayInput = document.getElementById('monthlyDay');
                        if (dayInput) {
                            dayInput.value = recurrence.dayOfMonth || 1;
                        }
                    }
                    
                    // Set custom days
                    if (recurrence.type === 'custom') {
                        const customInput = document.getElementById('customDays');
                        if (customInput) {
                            customInput.value = recurrence.customDays || 1;
                        }
                    }
                }, 200);
            }
            
            // Update modal title
            const modalTitle = document.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Recurring Task';
            }
        }, 100);
    }
};

// Mark recurring task as complete with 70 XP reward
window.markRecurringTaskComplete = function(taskId) {
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Award 70 XP points
    if (window.gameState) {
        window.gameState.xp += 70;
        
        // Check for level up
        if (typeof checkLevelUp === 'function') {
            checkLevelUp();
        }
        
        // Save game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        // Update display
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    }
    
    // Track completion
    if (!task.completions) task.completions = [];
    task.completions.push(new Date().toISOString());
    
    // Calculate next due date
    window.recurringTasksManager.calculateNextDueDate(task);
    
    // Save and update display
    window.recurringTasksManager.saveRecurringTasks();
    window.recurringTasksManager.updateDisplay();
    
    // Show success message with XP animation
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`✓ ${task.title} completed! +70 XP`);
    }
    
    // Add floating XP animation
    const card = event?.target?.closest('.recurring-task-card');
    if (card) {
        const xpFloat = document.createElement('div');
        xpFloat.textContent = '+70 XP';
        xpFloat.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            font-size: 24px;
            font-weight: bold;
            color: #4ade80;
            pointer-events: none;
            animation: xpFloat 1s ease-out forwards;
            z-index: 1000;
        `;
        card.style.position = 'relative';
        card.appendChild(xpFloat);
        
        // Close the card after animation
        setTimeout(() => {
            xpFloat.remove();
            card.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => card.remove(), 300);
        }, 1000);
    }
};


// Complete recurring task today (without subtasks)
window.completeRecurringTaskToday = function(taskId) {
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if already completed today
    const today = new Date().toDateString();
    const completedToday = task.completions && task.completions.some(c => {
        return new Date(c).toDateString() === today;
    });
    
    if (completedToday) {
        alert('Already completed today!');
        return;
    }
    
    // Award 70 XP points
    if (window.gameState) {
        window.gameState.xp += 70;
        
        // Check for level up
        if (typeof checkLevelUp === 'function') {
            checkLevelUp();
        }
        
        // Save game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        // Update display
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    }
    
    // Track completion
    if (!task.completions) task.completions = [];
    task.completions.push(new Date().toISOString());
    
    // Save and update display
    window.recurringTasksManager.saveRecurringTasks();
    window.recurringTasksManager.updateDisplay();
    
    // Show success message with XP animation
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`✓ ${task.title} completed! +70 XP`);
    }
};

// Toggle recurring task subtask
window.toggleRecurringSubtask = function(taskId, subtaskIndex) {
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (!task || !task.currentPeriodSubtasks) return;
    
    const subtask = task.currentPeriodSubtasks[subtaskIndex];
    if (!subtask) return;
    
    // Toggle completion
    subtask.completed = !subtask.completed;
    
    // Save and update display
    window.recurringTasksManager.saveRecurringTasks();
    window.recurringTasksManager.updateDisplay();
};

// Complete recurring task with all subtasks
window.completeRecurringTaskWithSubtasks = function(taskId) {
    const task = window.recurringTasksManager.recurringTasks.find(t => t.id === taskId);
    if (!task || !task.currentPeriodSubtasks) return;
    
    // Check if all subtasks are complete
    const allComplete = task.currentPeriodSubtasks.every(st => st.completed);
    if (!allComplete) {
        alert('Please complete all subtasks first!');
        return;
    }
    
    // Award 70 XP points
    if (window.gameState) {
        window.gameState.xp += 70;
        
        // Check for level up
        if (typeof checkLevelUp === 'function') {
            checkLevelUp();
        }
        
        // Save game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        // Update display
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    }
    
    // Track completion
    if (!task.completions) task.completions = [];
    task.completions.push(new Date().toISOString());
    
    // Reset subtasks for next period
    task.currentPeriodSubtasks = task.subtasks.map(st => ({
        ...st,
        completed: false
    }));
    
    // Save and update display
    window.recurringTasksManager.saveRecurringTasks();
    window.recurringTasksManager.updateDisplay();
    
    // Show success message with XP animation
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`✓ ${task.title} completed! +70 XP`);
    }
};
