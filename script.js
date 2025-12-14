// ===== ЕЖЕДНЕВНИК - ОСНОВНОЙ JAVASCRIPT =====

// DOM элементы
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const tasksContainer = document.getElementById('tasksContainer');
const taskCounter = document.getElementById('taskCounter');
const clearAllBtn = document.getElementById('clearAllBtn');
const emptyState = document.getElementById('emptyState');

// Массив для хранения задач
let tasks = [];

// Ключ для localStorage
const STORAGE_KEY = 'dailyPlannerTasks';

// Инициализация приложения
function initApp() {
    loadTasksFromStorage();
    renderTasks();
    updateTaskCounter();
    
    // Назначение обработчиков событий
    taskForm.addEventListener('submit', handleAddTask);
    clearAllBtn.addEventListener('click', handleClearAllTasks);
    
    // Фокус на поле ввода при загрузке
    taskTitleInput.focus();
    
    console.log('Ежедневник инициализирован!');
}

// Загрузка задач из localStorage
function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            console.log(`Загружено ${tasks.length} задач из хранилища`);
        }
    } catch (error) {
        console.error('Ошибка при загрузке задач из localStorage:', error);
        tasks = [];
    }
}

// Сохранение задач в localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        console.log(`Сохранено ${tasks.length} задач в хранилище`);
    } catch (error) {
        console.error('Ошибка при сохранении задач в localStorage:', error);
        showNotification('Ошибка при сохранении задач', 'error');
    }
}

// Обработчик добавления новой задачи
function handleAddTask(event) {
    event.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    
    // Валидация
    if (!title) {
        showNotification('Пожалуйста, введите название задачи', 'warning');
        taskTitleInput.focus();
        return;
    }
    
    // Создание новой задачи
    const newTask = {
        id: Date.now(), // Уникальный ID на основе времени
        title: title,
        description: description,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    // Добавление задачи в массив
    tasks.push(newTask);
    
    // Очистка формы
    taskForm.reset();
    
    // Обновление интерфейса
    renderTasks();
    updateTaskCounter();
    saveTasksToStorage();
    
    // Показать уведомление
    showNotification('Задача успешно добавлена!', 'success');
    
    // Возврат фокуса на поле ввода
    taskTitleInput.focus();
}

// Обработчик удаления задачи
function handleDeleteTask(taskId) {
    // Подтверждение удаления
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    // Найти задачу для показа в уведомлении
    const taskToDelete = tasks.find(task => task.id === taskId);
    const taskTitle = taskToDelete ? taskToDelete.title : 'Задача';
    
    // Удаление задачи из массива
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Обновление интерфейса
    renderTasks();
    updateTaskCounter();
    saveTasksToStorage();
    
    // Показать уведомление
    showNotification(`"${taskTitle}" удалена`, 'info');
}

// Обработчик очистки всех задач
function handleClearAllTasks() {
    if (tasks.length === 0) {
        showNotification('Нет задач для удаления', 'info');
        return;
    }
    
    // Подтверждение удаления всех задач
    if (!confirm(`Вы уверены, что хотите удалить все задачи (${tasks.length})?`)) {
        return;
    }
    
    // Очистка массива задач
    tasks = [];
    
    // Обновление интерфейса
    renderTasks();
    updateTaskCounter();
    saveTasksToStorage();
    
    // Показать уведомление
    showNotification('Все задачи удалены', 'info');
}

// Отрисовка списка задач
function renderTasks() {
    // Очистка контейнера
    tasksContainer.innerHTML = '';
    
    // Показать состояние "нет задач", если массив пуст
    if (tasks.length === 0) {
        tasksContainer.appendChild(emptyState);
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Скрыть состояние "нет задач"
    emptyState.classList.add('hidden');
    
    // Создание карточек задач
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksContainer.appendChild(taskCard);
    });
    
    console.log(`Отрисовано ${tasks.length} задач`);
}

// Создание карточки задачи
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    
    // Форматирование даты
    const date = new Date(task.createdAt);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Создание HTML структуры карточки
    card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${escapeHtml(task.title)}</h3>
            <span class="task-date">${formattedDate}</span>
        </div>
        ${task.description ? `
            <div class="task-description">
                ${escapeHtml(task.description)}
            </div>
        ` : ''}
        <div class="task-actions">
            <button class="delete-btn" data-task-id="${task.id}">
                <i class="fas fa-trash-alt"></i> Удалить
            </button>
        </div>
    `;
    
    // Добавление обработчика события для кнопки удаления
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));
    
    return card;
}

// Обновление счетчика задач
function updateTaskCounter() {
    const count = tasks.length;
    
    // Правильное склонение слова "задача"
    let wordForm;
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        wordForm = 'задач';
    } else if (lastDigit === 1) {
        wordForm = 'задача';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        wordForm = 'задачи';
    } else {
        wordForm = 'задач';
    }
    
    taskCounter.textContent = `${count} ${wordForm}`;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Цвета для разных типов уведомлений
    const colors = {
        'success': '#4cc9f0',
        'error': '#f72585',
        'warning': '#f8961e',
        'info': '#4361ee'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Добавление уведомления на страницу
    document.body.appendChild(notification);
    
    // Автоматическое удаление уведомления через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Проверка поддержки localStorage
function checkLocalStorageSupport() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.warn('localStorage не поддерживается или отключен');
        showNotification('Функция сохранения задач недоступна в этом браузере', 'warning');
        return false;
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки localStorage
    if (!checkLocalStorageSupport()) {
        // Если localStorage не поддерживается, показываем предупреждение
        setTimeout(() => {
            showNotification('Задачи не будут сохраняться после закрытия страницы', 'warning');
        }, 1000);
    }
    
    initApp();
});

// Обработка ошибок
window.addEventListener('error', function(event) {
    console.error('Произошла ошибка:', event.error);
    showNotification('Произошла ошибка при выполнении операции', 'error');
});

// Сохранение задач при закрытии страницы
window.addEventListener('beforeunload', function() {
    saveTasksToStorage();
});

// Экспорт функций для отладки (опционально)
window.dailyPlanner = {
    getTasks: () => tasks,
    clearAllTasks: handleClearAllTasks,
    addTestTask: () => {
        const testTask = {
            id: Date.now(),
            title: 'Тестовая задача',
            description: 'Это пример задачи для демонстрации',
            createdAt: new Date().toISOString(),
            completed: false
        };
        tasks.push(testTask);
        renderTasks();
        updateTaskCounter();
        saveTasksToStorage();
        showNotification('Тестовая задача добавлена', 'success');
    }
};
