function initSettingsTab() {
  const settingsTab = document.createElement('div');
  settingsTab.className = 'tab-content settings-tab';
  settingsTab.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">Мои параметры</div>
      <div class="gender-button-group">
        <button class="gender-button" id="maleBtn">Мужчина</button>
        <button class="gender-button" id="femaleBtn">Женщина</button>
      </div>
      <div class="input-group">
        <label for="ageInput">Возраст</label>
        <input type="number" id="ageInput" placeholder="Введите ваш возраст" />
      </div>
      <div class="input-group">
        <label for="heightInput">Рост (см)</label>
        <input type="number" id="heightInput" placeholder="Введите ваш рост" />
      </div>
      <div class="input-group">
        <label for="weightInput">Вес (кг)</label>
        <input type="number" id="weightInput" placeholder="Введите ваш вес" />
      </div>
      <button class="submit-button" id="calculateBtn">Рассчитать калории</button>
      <div id="resultContainer" class="hidden">
        <p>Ваша дневная норма калорий: <span id="calculatedCalories">0</span> ккал</p>
      </div>
    </div>
  `;

  document.getElementById('profileContainer').appendChild(settingsTab);

  const maleBtn = document.getElementById('maleBtn');
  const femaleBtn = document.getElementById('femaleBtn');
  const ageInput = document.getElementById('ageInput');
  const heightInput = document.getElementById('heightInput');
  const weightInput = document.getElementById('weightInput');
  const calculateBtn = document.getElementById('calculateBtn');
  const calculatedCalories = document.getElementById('calculatedCalories');
  const resultContainer = document.getElementById('resultContainer');
  const genderButtonGroup = document.querySelector('.gender-button-group');

  // Заполняем данные пользователя
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user) {
      if (user.gender) {
        selectedGender = user.gender;
        if (user.gender === 'male') {
          maleBtn.classList.add('active');
          genderButtonGroup.classList.add('male-active');
        } else {
          femaleBtn.classList.add('active');
          genderButtonGroup.classList.add('female-active');
        }
      }
      if (user.age) ageInput.value = user.age;
      if (user.height) heightInput.value = user.height;
      if (user.weight) weightInput.value = user.weight;
      if (user.calories) calculatedCalories.textContent = user.calories;
    }
  }

  // Обработчики для кнопок выбора пола
  maleBtn.addEventListener('click', function () {
    selectedGender = 'male';
    maleBtn.classList.add('active');
    femaleBtn.classList.remove('active');
    genderButtonGroup.classList.remove('female-active');
    genderButtonGroup.classList.add('male-active');
  });

  femaleBtn.addEventListener('click', function () {
    selectedGender = 'female';
    femaleBtn.classList.add('active');
    maleBtn.classList.remove('active');
    genderButtonGroup.classList.remove('male-active');
    genderButtonGroup.classList.add('female-active');
  });

  // Обработчик кнопки расчета калорий
  calculateBtn.addEventListener('click', function () {
    const age = parseInt(ageInput.value);
    const height = parseInt(heightInput.value);
    const weight = parseInt(weightInput.value);

    if (!selectedGender || !age || !height || !weight) {
      alert('Пожалуйста, заполните все поля и выберите пол');
      return;
    }

    let calories;
    if (selectedGender === 'male') {
      calories = Math.round(66.47 + 13.75 * weight + 5.003 * height - 6.755 * age);
    } else {
      calories = Math.round(655.1 + 9.563 * weight + 1.85 * height - 4.676 * age);
    }

    calculatedCalories.textContent = calories;
    resultContainer.classList.remove('hidden');

    // Обновляем данные пользователя
    if (currentUser) {
      const userIndex = usersDB.findIndex((user) => user.login === currentUser);
      if (userIndex !== -1) {
        usersDB[userIndex].height = height;
        usersDB[userIndex].weight = weight;
        usersDB[userIndex].calories = calories;
        usersDB[userIndex].gender = selectedGender;
        usersDB[userIndex].age = age;
        localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));

        // Обновляем данные во всех вкладках
        updateProfileData();
        updateCalendarData();
      }
    }
  });

  // Функция для обновления данных в профиле
  function updateProfileData() {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user) {
      const profileTab = document.querySelector('.profile-tab');
      if (profileTab) {
        const userHeight = profileTab.querySelector('#userHeight');
        const userWeight = profileTab.querySelector('#userWeight');
        const userCalories = profileTab.querySelector('#userCalories');

        if (userHeight) userHeight.textContent = user.height || 0;
        if (userWeight) userWeight.textContent = user.weight || 0;
        if (userCalories) userCalories.textContent = user.calories || 0;
      }
    }
  }

  // Функция для обновления данных в календаре
  function updateCalendarData() {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.calories) {
      updateCaloriesProgress();
    }
  }
}
