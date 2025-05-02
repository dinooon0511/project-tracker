function initTasksTab() {
  const tasksTab = document.createElement('div');
  tasksTab.className = 'tab-content tasks-tab';
  tasksTab.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">Задания</div>
      <div class="tasks-content">
        <div class="task-description">
          <p>Выполняйте норму калорий каждый день, чтобы получать баллы!</p>
          <p>Каждый день увеличивает количество баллов за выполнение нормы.</p>
          <p>Если пропустите день - счётчик начнётся заново.</p>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: 0%">0</div>
          </div>
          <div class="progress-text">Максимально можно получить 465 баллов в этом месяце</div>
        </div>
        <div class="current-streak">
          <h3>Текущая серия: <span id="currentStreak">${currentStreak}</span> дней</h3>
          <p>Следующий день принесёт вам ${currentStreak + 1} баллов</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('profileContainer').appendChild(tasksTab);

  // Загрузка данных заданий
  loadTasksData();
  updateProgressBar();
}

function loadTasksData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.tasksData) {
      currentStreak = user.tasksData.currentStreak || 0;
      totalPoints = user.tasksData.totalPoints || 0;
    }
  }
}

function saveTasksData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userIndex = usersDB.findIndex((user) => user.login === currentUser);
    if (userIndex !== -1) {
      usersDB[userIndex].tasksData = {
        currentStreak,
        totalPoints,
      };
      usersDB[userIndex].points = totalPoints;
      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
    }
  }
}

function updatePointsDisplay() {
  document.getElementById('userPoints').textContent = totalPoints;
  updateProgressBar();
}

function updateProgressBar() {
  const progressBar = document.querySelector('.progress-bar-fill');
  if (progressBar) {
    const progress = (totalPoints / 465) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressBar.textContent = `${totalPoints}/465`;
  }
}

// Проверка смены дня
function checkDayChange() {
  const lastCheck = localStorage.getItem('lastDayCheck');
  const now = new Date();
  const today = now.toDateString();

  if (!lastCheck || lastCheck !== today) {
    localStorage.setItem('lastDayCheck', today);
    const hours = now.getHours();

    if (hours >= 0 && hours < 6) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = formatDateKey(yesterday);

      let yesterdayCalories = 0;
      if (mealsData[yesterdayKey]) {
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
          if (mealsData[yesterdayKey][mealType]) {
            mealsData[yesterdayKey][mealType].forEach((meal) => {
              yesterdayCalories += parseFloat(meal.calories) || 0;
            });
          }
        });
      }

      const currentUser = localStorage.getItem('currentUser');
      let maxCalories = 2000;

      if (currentUser) {
        const user = usersDB.find((user) => user.login === currentUser);
        if (user && user.calories) {
          maxCalories = parseInt(user.calories) || 2000;
        }
      }

      if (yesterdayCalories < maxCalories) {
        currentStreak = 0;
        saveTasksData();
      }
    }
  }
}

// Установка интервала для проверки смены дня
setInterval(checkDayChange, 600000);
