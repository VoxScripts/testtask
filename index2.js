document.addEventListener('DOMContentLoaded', () => {
  const activePage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.navclass li a');
  const homeNavLink = document.querySelector('.navclass li a[href="index2.html"]');
  const panelLinks = document.querySelectorAll('#panel-list li a');

  const homePages = ['index2.html', 'priority.html', 'unfinished.html'];
  if (homePages.includes(activePage)) {
    homeNavLink?.classList.add('active');
  }

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === activePage && !homePages.includes(linkHref)) {
      link.classList.add('active');
    }
  });

  panelLinks.forEach(link => {
    if (link.getAttribute('href') === activePage) {
      link.classList.add('active');
    }
  });

  panelLinks.forEach(link => {
    link.addEventListener('click', () => {
      panelLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // --- Task Manager Logic ---
  const addTaskButton = document.getElementById('addTaskButton');
  const taskPopup = document.getElementById('taskPopup');
  const closePopup = document.getElementById('closePopup');
  const taskForm = document.getElementById('taskForm');
  const taskContainer = document.getElementById('taskContainer');

  addTaskButton.addEventListener('click', () => {
    taskPopup.style.display = 'flex';
  });

  closePopup.addEventListener('click', () => {
    taskPopup.style.display = 'none';
    taskForm.reset();
  });

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskName = document.getElementById('taskName').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const priority = document.getElementById('priorityToggle').checked;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('End time must be after start time!');
      return;
    }

    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    if (priority) {
      taskCard.classList.add('priority');
    }

    taskCard.innerHTML = `
      <h3>${taskName}</h3>
      <div class="time-range">${start.toLocaleString()} - ${end.toLocaleString()}</div>
      <label><input type="checkbox"> Done</label>
    `;

    taskContainer.appendChild(taskCard);
    taskPopup.style.display = 'none';
    taskForm.reset();

    sortTasks();
  });

  function sortTasks() {
    const tasks = Array.from(taskContainer.children);
    tasks.sort((a, b) => {
      const timeA = new Date(a.querySelector('.time-range').innerText.split(' - ')[0]);
      const timeB = new Date(b.querySelector('.time-range').innerText.split(' - ')[0]);
      return timeA - timeB;
    });
    tasks.forEach(task => taskContainer.appendChild(task));
  }
});
