function initProfileTab(username) {
  const profileTab = document.createElement('div');
  profileTab.className = 'tab-content profile-tab active';
  profileTab.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">Ваш профиль</div>
      <div class="user-profile">
        <div class="avatar-container">
          <div class="avatar" id="avatarWrapper">
            <img id="userAvatar" class="default-avatar" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>" alt="Аватар" />
          </div>
          <label class="avatar-upload">
            <input type="file" id="avatarInput" accept="image/*" />
            <span>+</span>
          </label>
        </div>
        <div class="user-info">
          <div class="username" id="profileUsername">${username}</div>
          <div class="points">Баллы: <span id="userPoints">0</span></div>
        </div>
      </div>
      <div class="stats-container">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">
              <span id="userAge">–</span>
              <button class="edit-btn" data-field="age"><i class="edit-icon">✏️</i></button>
            </div>
            <div class="stat-label">Возраст</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="userCalories">0</div>
            <div class="stat-label">Калории (ккал)</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">
              <span id="userHeight">0</span>
              <button class="edit-btn" data-field="height"><i class="edit-icon">✏️</i></button>
            </div>
            <div class="stat-label">Рост (см)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              <span id="userWeight">0</span>
              <button class="edit-btn" data-field="weight"><i class="edit-icon">✏️</i></button>
            </div>
            <div class="stat-label">Вес (кг)</div>
          </div>
        </div>
      </div>
      
      <!-- Блок прогресса (упрощенный) -->
      <div class="progress-section">
        <div class="progress-header">
          <h3>Прогресс</h3>
          <div class="progress-time" id="progressTime">~ 0 недель до цели</div>
        </div>
        <div class="progress-info">
          <span id="currentWeightDisplay">0 кг</span>
          <span id="targetWeightDisplay">Цель: 0 кг</span>
        </div>
        <div class="progress-bar-simple">
          <div class="progress-fill-simple" id="progressFill"></div>
        </div>
        <div class="progress-difference" id="progressDifference">Осталось: 0 кг</div>
      </div>
      
      <!-- Блок истории веса -->
      <div class="history-container">
        <div class="history-header">
          <h3>История веса</h3>
        </div>
        <div class="history-chart" id="weightHistoryChart">
          <canvas id="weightChart"></canvas>
        </div>
        <div class="history-actions">
          <button class="add-weight-btn" id="addWeightBtn">Добавить текущий вес</button>
        </div>
      </div>
      
      <button class="logout-btn" id="logoutBtn">Выйти</button>
      
      <!-- Модальное окно редактирования -->
      <div class="modal" id="editModal">
        <div class="modal-content">
          <span class="close-btn">&times;</span>
          <h3 id="modalTitle">Редактировать</h3>
          <input type="number" id="modalInput" class="modal-input">
          <button class="modal-save-btn" id="modalSaveBtn">Сохранить</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('profileContainer').appendChild(profileTab);

  // Инициализация Chart.js
  const weightChartCtx = document.getElementById('weightChart').getContext('2d');
  let weightChart = new Chart(weightChartCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Вес (кг)',
          data: [],
          borderColor: '#007aff',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });

  const user = usersDB.find((user) => user.login === username);
  if (user) {
    // Инициализация начального веса, если его нет
    if (!user.initialWeight) {
      user.initialWeight = user.weight || 0;
    }

    // Инициализация истории веса
    if (!user.weightHistory || user.weightHistory.length === 0) {
      user.weightHistory = [
        {
          date: new Date().toISOString().split('T')[0],
          weight: user.weight || 0,
        },
      ];
    }

    updateUserData(user);
    updateWeightChart(user.weightHistory);
  }

  // Функция обновления данных пользователя
  function updateUserData(user) {
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('userPoints').textContent = user.points || 0;
    document.getElementById('userHeight').textContent = user.height || 0;
    document.getElementById('userWeight').textContent = user.weight || 0;
    document.getElementById('userAge').textContent = user.age || '–';

    // Пересчет калорий
    const calories = calculateCalories(user);
    document.getElementById('userCalories').textContent = calories;
    user.calories = calories;

    // Обновляем прогресс с учетом начального веса
    updateProgress(user.initialWeight, user.weight, user.targetWeight || user.weight);

    // Сохраняем изменения
    localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
  }

  // Функция пересчета калорий
  function calculateCalories(user) {
    if (!user.age || !user.height || !user.weight) return 0;

    // Формула Миффлина-Сан Жеора
    let bmr;
    if (user.gender === 'male') {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }

    // Учет уровня активности
    const activityMultipliers = [1.2, 1.375, 1.55, 1.725, 1.9];
    const activityLevel = user.activity || 2; // средняя активность по умолчанию
    const tdee = bmr * activityMultipliers[activityLevel - 1];

    return Math.round(tdee);
  }

  // Функция обновления прогресса (теперь учитывает начальный вес)
  function updateProgress(initialWeight, currentWeight, targetWeight) {
    const difference = Math.abs(targetWeight - currentWeight);
    const totalDifference = Math.abs(targetWeight - initialWeight);
    const progressElement = document.getElementById('progressFill');
    const currentDisplay = document.getElementById('currentWeightDisplay');
    const targetDisplay = document.getElementById('targetWeightDisplay');
    const differenceDisplay = document.getElementById('progressDifference');
    const timeDisplay = document.getElementById('progressTime');

    currentDisplay.textContent = `${currentWeight} кг`;
    targetDisplay.textContent = `Цель: ${targetWeight} кг`;

    // Рассчитываем прогресс от начального веса до цели
    let progressPercent = 0;

    if (totalDifference > 0) {
      if (targetWeight > initialWeight) {
        // Прогресс набора веса
        progressPercent = Math.min(
          100,
          ((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100,
        );
      } else {
        // Прогресс похудения
        progressPercent = Math.min(
          100,
          ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100,
        );
      }
    }

    progressElement.style.width = `${progressPercent}%`;

    if (targetWeight > currentWeight) {
      differenceDisplay.textContent = `Нужно набрать: ${difference.toFixed(1)} кг`;
      progressElement.style.backgroundColor = '#4CAF50';
    } else if (targetWeight < currentWeight) {
      differenceDisplay.textContent = `Нужно сбросить: ${difference.toFixed(1)} кг`;
      progressElement.style.backgroundColor = '#FF5722';
    } else {
      differenceDisplay.textContent = `Цель достигнута!`;
      progressElement.style.backgroundColor = '#2196F3';
    }

    if (difference > 0) {
      const weeks = Math.ceil(difference / 0.5);
      timeDisplay.textContent = `~ ${weeks} ${getWeekWord(weeks)} до цели`;
    } else {
      timeDisplay.textContent = `Цель достигнута!`;
    }
  }

  // Функция обновления графика веса
  function updateWeightChart(weightHistory) {
    const sortedHistory = [...weightHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedHistory.map((item) => formatDate(item.date));
    const data = sortedHistory.map((item) => item.weight);

    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = data;
    weightChart.update();
  }

  // Форматирование даты
  function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }

  // Вспомогательная функция для склонения слова "неделя"
  function getWeekWord(weeks) {
    const lastDigit = weeks % 10;
    if (weeks >= 11 && weeks <= 14) return 'недель';
    if (lastDigit === 1) return 'неделя';
    if (lastDigit >= 2 && lastDigit <= 4) return 'недели';
    return 'недель';
  }

  // Обработчики для кнопок редактирования
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const field = this.getAttribute('data-field');
      const currentValue = document.getElementById(
        `user${field.charAt(0).toUpperCase() + field.slice(1)}`,
      ).textContent;

      const modal = document.getElementById('editModal');
      const modalInput = document.getElementById('modalInput');
      const modalTitle = document.getElementById('modalTitle');

      modalTitle.textContent = `Редактировать ${getFieldName(field)}`;
      modalInput.value = currentValue === '–' ? '' : currentValue;
      modalInput.setAttribute('data-field', field);

      modal.style.display = 'block';
    });
  });

  // Функция получения названия поля
  function getFieldName(field) {
    const names = {
      age: 'возраст',
      height: 'рост',
      weight: 'вес',
    };
    return names[field] || field;
  }

  // Сохранение изменений из модального окна
  document.getElementById('modalSaveBtn').addEventListener('click', function () {
    const modal = document.getElementById('editModal');
    const modalInput = document.getElementById('modalInput');
    const field = modalInput.getAttribute('data-field');
    const value = modalInput.value;

    if (value && !isNaN(value)) {
      const userIndex = usersDB.findIndex((user) => user.login === username);
      if (userIndex !== -1) {
        usersDB[userIndex][field] = field === 'age' ? parseInt(value) : parseFloat(value);

        // Если изменяем вес, добавляем запись в историю
        if (field === 'weight') {
          usersDB[userIndex].weightHistory.push({
            date: new Date().toISOString().split('T')[0],
            weight: parseFloat(value),
          });
          updateWeightChart(usersDB[userIndex].weightHistory);
        }

        updateUserData(usersDB[userIndex]);
      }
    }

    modal.style.display = 'none';
  });

  // Добавление текущего веса в историю
  document.getElementById('addWeightBtn').addEventListener('click', function () {
    const userIndex = usersDB.findIndex((user) => user.login === username);
    if (userIndex !== -1) {
      const currentWeight = usersDB[userIndex].weight;
      if (currentWeight) {
        usersDB[userIndex].weightHistory.push({
          date: new Date().toISOString().split('T')[0],
          weight: currentWeight,
        });
        updateWeightChart(usersDB[userIndex].weightHistory);
        localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
      }
    }
  });

  // Закрытие модального окна
  document.querySelector('.close-btn').addEventListener('click', function () {
    document.getElementById('editModal').style.display = 'none';
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener('click', function (event) {
    if (event.target === document.getElementById('editModal')) {
      document.getElementById('editModal').style.display = 'none';
    }
  });

  // Обработчик аватара
  document.getElementById('avatarInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const newAvatar = document.createElement('img');
        newAvatar.src = event.target.result;
        newAvatar.style.width = '100%';
        newAvatar.style.height = '100%';
        newAvatar.style.objectFit = 'cover';
        newAvatar.style.borderRadius = '50%';

        avatarWrapper.innerHTML = '';
        avatarWrapper.appendChild(newAvatar);

        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userIndex = usersDB.findIndex((user) => user.login === currentUser);
          if (userIndex !== -1) {
            usersDB[userIndex].avatar = event.target.result;
            localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Обработчик выхода
  document.getElementById('logoutBtn')?.addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('profileContainer').classList.add('hidden');
    document.getElementById('bottomMenu').classList.add('hidden');
    document.getElementById('profileContainer').innerHTML = '';
  });
}
