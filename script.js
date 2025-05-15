document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tasksLeft = document.getElementById('tasksLeft');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    
    // Load tasks from localStorage with validation
    let tasks = [];
    try {
        const storedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (Array.isArray(storedTasks)) {
            tasks = storedTasks.filter(task => 
                task && 
                typeof task.id === 'number' && 
                typeof task.text === 'string' && 
                typeof task.completed === 'boolean'
            );
        }
    } catch (e) {
        console.error('Error loading tasks from localStorage:', e);
        tasks = [];
    }
    
    // Render tasks
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        
        const filteredTasks = filter === 'all' 
            ? tasks 
            : filter === 'active' 
                ? tasks.filter(task => !task.completed) 
                : tasks.filter(task => task.completed);
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found</p>';
        } else {
            filteredTasks.forEach((task) => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.dataset.id = task.id;
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                `;
                
                taskList.appendChild(taskItem);
            });
        }
        
        updateTasksLeft();
    }
    
    // [Rest of the functions remain the same...]
    // Add new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;
        
        const newTask = {
            id: Date.now(),
            text,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }
    
    // Toggle task completion
    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }
    
    // Delete task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }
    
    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
    }
    
    // Update tasks left counter
    function updateTasksLeft() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    taskList.addEventListener('click', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            toggleTaskCompletion(taskId);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            deleteTask(taskId);
        }
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Initial render
    renderTasks();
});