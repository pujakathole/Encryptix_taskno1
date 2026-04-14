document.addEventListener('DOMContentLoaded', function () {
  var taskInput = document.getElementById('taskInput');
  var addBtn = document.getElementById('addBtn');
  var taskList = document.getElementById('taskList');
  var taskCount = document.getElementById('taskCount');
  var clearCompletedBtn = document.getElementById('clearCompleted');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var progressFill = document.getElementById('progressFill');
  var progressText = document.getElementById('progressText');
  var prioritySelect = document.getElementById('prioritySelect');
  var toastEl = document.getElementById('toast');

  var tasks = (function () {
    try {
      return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
      return [];
    }
  })();
  var currentFilter = 'all';
  var toastTimeout = null;

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  function showToast(message, type, icon) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastEl.className = 'toast ' + type;
    toastEl.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    requestAnimationFrame(function () {
      toastEl.classList.add('show');
    });
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2500);
  }

  function formatTimeAgo(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function addTask(text) {
    if (!text.trim()) {
      showToast('Please enter a task', 'info', 'fa-info-circle');
      return;
    }
    tasks.push({
      id: generateId(),
      text: text.trim(),
      completed: false,
      priority: prioritySelect.value,
      createdAt: new Date().toISOString()
    });
    saveTasks();
    renderTasks();
    showToast('Task added successfully!', 'success', 'fa-check-circle');
  }

  function deleteTask(id) {
    var taskItem = document.querySelector('[data-id="' + id + '"]');
    if (taskItem) {
      taskItem.classList.add('removing');
      setTimeout(function () {
        tasks = tasks.filter(function (task) {
          return task.id !== id;
        });
        saveTasks();
        renderTasks();
        showToast('Task deleted', 'delete', 'fa-trash-alt');
      }, 300);
    }
  }

  function toggleTask(id) {
    var wasCompleted = false;
    tasks = tasks.map(function (task) {
      if (task.id === id) {
        wasCompleted = task.completed;
        return Object.assign({}, task, { completed: !task.completed });
      }
      return task;
    });
    saveTasks();
    renderTasks();
    if (!wasCompleted) {
      showToast('Task completed! Great job!', 'success', 'fa-star');
    } else {
      showToast('Task marked as pending', 'info', 'fa-undo');
    }
  }

  function editTask(id, newText) {
    if (!newText.trim()) {
      showToast('Task cannot be empty', 'info', 'fa-info-circle');
      return;
    }
    tasks = tasks.map(function (task) {
      if (task.id === id) {
        return Object.assign({}, task, { text: newText.trim() });
      }
      return task;
    });
    saveTasks();
    renderTasks();
    showToast('Task updated!', 'edit', 'fa-edit');
  }

  function clearCompleted() {
    var completedCount = tasks.filter(function (t) { return t.completed; }).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info', 'fa-info-circle');
      return;
    }
    tasks = tasks.filter(function (task) {
      return !task.completed;
    });
    saveTasks();
    renderTasks();
    showToast(completedCount + ' task(s) cleared', 'delete', 'fa-broom');
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

  function updateProgress() {
    var total = tasks.length;
    var completed = tasks.filter(function (t) { return t.completed; }).length;
    var pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = pct + '% complete' + (total > 0 ? ' (' + completed + '/' + total + ')' : '');
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

  function createTaskElement(task, index) {
    var li = document.createElement('li');
    li.className = 'task-item priority-' + (task.priority || 'medium') + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);
    li.style.animationDelay = (index * 0.05) + 's';

    var checkboxWrap = document.createElement('label');
    checkboxWrap.className = 'custom-checkbox';
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function () { toggleTask(task.id); });
    var checkmark = document.createElement('span');
    checkmark.className = 'checkmark';
    var checkIcon = document.createElement('i');
    checkIcon.className = 'fas fa-check';
    checkmark.appendChild(checkIcon);
    checkboxWrap.appendChild(checkbox);
    checkboxWrap.appendChild(checkmark);

    var content = document.createElement('div');
    content.className = 'task-content';
    var taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    var meta = document.createElement('div');
    meta.className = 'task-meta';
    var badge = document.createElement('span');
    badge.className = 'priority-badge ' + (task.priority || 'medium');
    badge.textContent = task.priority || 'medium';
    var timeSpan = document.createElement('span');
    timeSpan.className = 'task-time';
    timeSpan.textContent = formatTimeAgo(task.createdAt);
    meta.appendChild(badge);
    meta.appendChild(timeSpan);
    content.appendChild(taskText);
    content.appendChild(meta);

    var actions = document.createElement('div');
    actions.className = 'task-actions';
    var editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', function () { startEditing(li, task); });
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', function () { deleteTask(task.id); });
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkboxWrap);
    li.appendChild(content);
    li.appendChild(actions);
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
    saveBtn.innerHTML = '<i class="fas fa-check"></i>';
    saveBtn.title = 'Save';
    saveBtn.addEventListener('click', function () { editTask(task.id, editInput.value); });
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'delete-btn';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.title = 'Cancel';
    cancelBtn.addEventListener('click', function () { renderTasks(); });
    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') editTask(task.id, editInput.value);
      else if (e.key === 'Escape') renderTasks();
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
      var msgP = document.createElement('p');
      if (currentFilter === 'all') {
        iconDiv.innerHTML = '<i class="fas fa-clipboard-list"></i>';
        msgP.textContent = 'No tasks yet. Add one above!';
      } else if (currentFilter === 'pending') {
        iconDiv.textContent = '\uD83C\uDF89';
        msgP.textContent = 'All caught up! No pending tasks.';
      } else {
        iconDiv.innerHTML = '<i class="fas fa-hourglass-start"></i>';
        msgP.textContent = 'No completed tasks yet. Keep going!';
      }
      emptyDiv.appendChild(iconDiv);
      emptyDiv.appendChild(msgP);
      taskList.appendChild(emptyDiv);
    } else {
      filteredTasks.forEach(function (task, index) {
        taskList.appendChild(createTaskElement(task, index));
      });
    }
    updateTaskCount();
    updateProgress();
  }

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

  renderTasks();
});
