document.addEventListener('DOMContentLoaded', function () {
  var taskInput = document.getElementById('taskInput');
  var addBtn = document.getElementById('addBtn');
  var taskList = document.getElementById('taskList');
  var taskCount = document.getElementById('taskCount');
  var clearCompletedBtn = document.getElementById('clearCompleted');
  var filterBtns = document.querySelectorAll('.filter-btn');

  var tasks = (function () {
    try {
      return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
      return [];
    }
  })();
  var currentFilter = 'all';

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function addTask(text) {
    if (!text.trim()) return;
    tasks.push({
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    });
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
    saveTasks();
    renderTasks();
  }

  function toggleTask(id) {
    tasks = tasks.map(function (task) {
      if (task.id === id) {
        return Object.assign({}, task, { completed: !task.completed });
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  function editTask(id, newText) {
    if (!newText.trim()) return;
    tasks = tasks.map(function (task) {
      if (task.id === id) {
        return Object.assign({}, task, { text: newText.trim() });
      }
      return task;
    });
    saveTasks();
    renderTasks();
  }

  function clearCompleted() {
    tasks = tasks.filter(function (task) {
      return !task.completed;
    });
    saveTasks();
    renderTasks();
  }

  function getFilteredTasks() {
    if (currentFilter === 'pending') {
      return tasks.filter(function (task) { return !task.completed; });
    }
    if (currentFilter === 'completed') {
      return tasks.filter(function (task) { return task.completed; });
    }
    return tasks;
  }

  function updateTaskCount() {
    var pendingCount = tasks.filter(function (task) { return !task.completed; }).length;
    var totalCount = tasks.length;
    if (totalCount === 0) {
      taskCount.textContent = '0 tasks';
    } else {
      taskCount.textContent = pendingCount + ' of ' + totalCount + ' remaining';
    }
  }

  function createTaskElement(task) {
    var li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function () {
      toggleTask(task.id);
    });

    var taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    var editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '\u270E';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', function () {
      startEditing(li, task);
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u2716';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  function startEditing(li, task) {
    li.innerHTML = '';

    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = task.text;

    var saveBtn = document.createElement('button');
    saveBtn.className = 'edit-btn';
    saveBtn.textContent = '\u2714';
    saveBtn.title = 'Save';
    saveBtn.addEventListener('click', function () {
      editTask(task.id, editInput.value);
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'delete-btn';
    cancelBtn.textContent = '\u2716';
    cancelBtn.title = 'Cancel';
    cancelBtn.addEventListener('click', function () {
      renderTasks();
    });

    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        editTask(task.id, editInput.value);
      } else if (e.key === 'Escape') {
        renderTasks();
      }
    });

    li.appendChild(editInput);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);

    editInput.focus();
    editInput.select();
  }

  function renderTasks() {
    taskList.innerHTML = '';
    var filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
      var emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      var iconDiv = document.createElement('div');
      iconDiv.className = 'icon';
      iconDiv.textContent = '\uD83D\uDCCB';
      var msgP = document.createElement('p');
      if (currentFilter === 'all') {
        msgP.textContent = 'No tasks yet. Add one above!';
      } else if (currentFilter === 'pending') {
        msgP.textContent = 'No pending tasks. Great job!';
      } else {
        msgP.textContent = 'No completed tasks yet.';
      }
      emptyDiv.appendChild(iconDiv);
      emptyDiv.appendChild(msgP);
      taskList.appendChild(emptyDiv);
    } else {
      filteredTasks.forEach(function (task) {
        taskList.appendChild(createTaskElement(task));
      });
    }

    updateTaskCount();
  }

  // Event listeners
  addBtn.addEventListener('click', function () {
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTask(taskInput.value);
      taskInput.value = '';
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTasks();
    });
  });

  // Initial render
  renderTasks();
});
