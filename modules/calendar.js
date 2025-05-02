function initCalendarTab() {
  const calendarTab = document.createElement('div');
  calendarTab.className = 'tab-content calories-tab';
  calendarTab.innerHTML = `
    <div class="profile-container">
      <div class="calories-header">
        <div class="date-picker">
          <div class="month-year-selector">
            <select id="monthSelect" class="month-select">
              <option value="0">Январь</option>
              <option value="1">Февраль</option>
              <option value="2">Март</option>
              <option value="3">Апрель</option>
              <option value="4">Май</option>
              <option value="5">Июнь</option>
              <option value="6">Июль</option>
              <option value="7">Август</option>
              <option value="8">Сентябрь</option>
              <option value="9">Октябрь</option>
              <option value="10">Ноябрь</option>
              <option value="11">Декабрь</option>
            </select>
            <select id="yearSelect" class="year-select"></select>
          </div>
        </div>
        <div class="days-slider">
          <button class="slider-arrow prev-day">&lt;</button>
          <div class="days-container" id="daysContainer"></div>
          <button class="slider-arrow next-day">&gt;</button>
        </div>
      </div>

      <div class="calories-progress">
        <div class="calories-progress-circle"></div>
        <div class="calories-progress-text">0<small>из 0</small></div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <h3>Завтрак</h3>
          <button class="add-meal-btn" data-meal="breakfast">+</button>
        </div>
        <div class="meal-items" data-meal="breakfast"></div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <h3>Обед</h3>
          <button class="add-meal-btn" data-meal="lunch">+</button>
        </div>
        <div class="meal-items" data-meal="lunch"></div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <h3>Ужин</h3>
          <button class="add-meal-btn" data-meal="dinner">+</button>
        </div>
        <div class="meal-items" data-meal="dinner"></div>
      </div>

      <div class="meal-section">
        <div class="meal-header">
          <h3>Перекус</h3>
          <button class="add-meal-btn" data-meal="snack">+</button>
        </div>
        <div class="meal-items" data-meal="snack"></div>
      </div>

      <button class="submit-button" id="saveDayBtn">Сохранить день</button>
    </div>
  `;

  document.getElementById('profileContainer').appendChild(calendarTab);

  // Устанавливаем текущую дату при инициализации
  const currentDate = new Date();
  selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // Инициализация календаря
  initYearSelect();
  updateDaysDisplay();
  loadMealsData();
  loadDayData(selectedDate);

  // Обработчики событий
  document.getElementById('monthSelect').addEventListener('change', () => {
    selectedDate = new Date(
      parseInt(document.getElementById('yearSelect').value),
      parseInt(document.getElementById('monthSelect').value),
      Math.min(
        selectedDate.getDate(),
        new Date(
          parseInt(document.getElementById('yearSelect').value),
          parseInt(document.getElementById('monthSelect').value) + 1,
          0,
        ).getDate(),
      ),
    );
    updateDaysDisplay();
    updateCaloriesProgress();
  });

  document.getElementById('yearSelect').addEventListener('change', () => {
    selectedDate = new Date(
      parseInt(document.getElementById('yearSelect').value),
      parseInt(document.getElementById('monthSelect').value),
      Math.min(
        selectedDate.getDate(),
        new Date(
          parseInt(document.getElementById('yearSelect').value),
          parseInt(document.getElementById('monthSelect').value) + 1,
          0,
        ).getDate(),
      ),
    );
    updateDaysDisplay();
    updateCaloriesProgress();
  });

  document.querySelector('.prev-day').addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    loadDayData(selectedDate);
    updateDaysDisplay();
    updateCaloriesProgress();
  });

  document.querySelector('.next-day').addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    loadDayData(selectedDate);
    updateDaysDisplay();
    updateCaloriesProgress();
  });

  document.querySelectorAll('.add-meal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const mealType = e.target.getAttribute('data-meal');
      createFoodModal(mealType);
    });
  });

  document.getElementById('saveDayBtn').addEventListener('click', () => {
    saveMealsData();
    const dateKey = formatDateKey(selectedDate);
    let dayCalories = 0;

    if (mealsData[dateKey]) {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
        if (mealsData[dateKey][mealType]) {
          mealsData[dateKey][mealType].forEach((meal) => {
            dayCalories += parseFloat(meal.calories) || 0;
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

    if (dayCalories >= maxCalories) {
      currentStreak++;
      const today = new Date();
      const dayOfMonth = today.getDate();
      const pointsToAdd = Math.min(currentStreak, dayOfMonth);

      totalPoints += pointsToAdd;
      if (totalPoints > 465) totalPoints = 465;

      saveTasksData();
      updatePointsDisplay();

      alert(`Данные за день сохранены! Вы получили ${pointsToAdd} баллов.`);
    } else {
      currentStreak = 0;
      saveTasksData();
      alert('Данные за день сохранены! Норма калорий не выполнена.');
    }
  });
}

function initYearSelect() {
  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');
  const currentDate = new Date();

  // Устанавливаем текущий месяц
  monthSelect.value = currentDate.getMonth();

  // Заполняем года
  yearSelect.innerHTML = '';
  for (let year = currentDate.getFullYear() - 10; year <= currentDate.getFullYear() + 10; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentDate.getFullYear()) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  }
}

function updateDaysDisplay() {
  const daysContainer = document.getElementById('daysContainer');
  daysContainer.innerHTML = '';

  const year = parseInt(document.getElementById('yearSelect').value);
  const month = parseInt(document.getElementById('monthSelect').value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = selectedDate.getDate();

  // Определяем диапазон дней для отображения (5 дней с текущим днем в центре)
  let startDay = currentDay - 2;
  let endDay = currentDay + 2;

  // Корректируем диапазон, если он выходит за пределы месяца
  if (startDay < 1) {
    endDay += 1 - startDay;
    startDay = 1;
  }
  if (endDay > daysInMonth) {
    startDay -= endDay - daysInMonth;
    endDay = daysInMonth;
    if (startDay < 1) startDay = 1;
  }

  for (let day = startDay; day <= endDay; day++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day-item');
    dayElement.textContent = day;

    if (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    ) {
      dayElement.classList.add('active');
    }

    dayElement.addEventListener('click', () => {
      selectedDate = new Date(year, month, day);
      loadDayData(selectedDate);
      updateDaysDisplay();
      updateCaloriesProgress();
    });

    daysContainer.appendChild(dayElement);
  }
}

function loadDayData(date) {
  const dateKey = formatDateKey(date);

  ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
    const mealItemsContainer = document.querySelector(`.meal-items[data-meal="${mealType}"]`);
    mealItemsContainer.innerHTML = '';

    if (mealsData[dateKey] && mealsData[dateKey][mealType]) {
      mealsData[dateKey][mealType].forEach((meal, index) => {
        const mealItem = createMealItemElement(meal, mealType, index);
        mealItemsContainer.appendChild(mealItem);
      });
    }
  });

  updateCaloriesProgress();
}

function createMealItemElement(meal, mealType, index) {
  const mealItem = document.createElement('div');
  mealItem.classList.add('meal-item');

  const mealInfo = document.createElement('div');
  mealInfo.classList.add('meal-item-info');

  const nameElement = document.createElement('div');
  nameElement.classList.add('meal-item-name');
  nameElement.textContent = meal.name;

  const detailsElement = document.createElement('div');
  detailsElement.classList.add('meal-item-details');

  const caloriesElement = document.createElement('span');
  caloriesElement.classList.add('meal-item-calories');
  caloriesElement.textContent = `${meal.calories} ккал`;

  const macrosElement = document.createElement('span');
  macrosElement.classList.add('meal-item-macros');
  macrosElement.textContent = `Б: ${meal.protein || 0}г, Ж: ${meal.fat || 0}г, У: ${
    meal.carbs || 0
  }г`;

  detailsElement.appendChild(caloriesElement);
  detailsElement.appendChild(document.createTextNode(' '));
  detailsElement.appendChild(macrosElement);

  mealInfo.appendChild(nameElement);
  mealInfo.appendChild(detailsElement);

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-meal-btn');
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener('click', () => {
    deleteMeal(mealType, index);
  });

  mealItem.appendChild(mealInfo);
  mealItem.appendChild(deleteBtn);

  return mealItem;
}

function deleteMeal(mealType, index) {
  const dateKey = formatDateKey(selectedDate);

  if (mealsData[dateKey] && mealsData[dateKey][mealType]) {
    mealsData[dateKey][mealType].splice(index, 1);
    handleMealChange();
    updateCaloriesProgress();
    loadDayData(selectedDate);
  }
}

function addMeal(mealType, name, calories, protein, fat, carbs) {
  const dateKey = formatDateKey(selectedDate);

  if (!mealsData[dateKey]) {
    mealsData[dateKey] = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
  }

  mealsData[dateKey][mealType].push({
    name,
    calories: parseFloat(calories) || 0,
    protein: parseFloat(protein) || 0,
    fat: parseFloat(fat) || 0,
    carbs: parseFloat(carbs) || 0,
  });

  handleMealChange();
  updateCaloriesProgress();
  loadDayData(selectedDate);
}

function saveMealsData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const userIndex = usersDB.findIndex((user) => user.login === currentUser);
    if (userIndex !== -1) {
      usersDB[userIndex].mealsData = mealsData;
      localStorage.setItem('fitnessUsers', JSON.stringify(usersDB));
    }
  }
}

function loadMealsData() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.mealsData) {
      mealsData = user.mealsData;
    }
  }
}

function handleMealChange() {
  updateCaloriesProgress();
  saveMealsData();
}

function updateCaloriesProgress() {
  const dateKey = formatDateKey(selectedDate);
  let totalCalories = 0;

  if (mealsData[dateKey]) {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mealType) => {
      if (mealsData[dateKey][mealType]) {
        mealsData[dateKey][mealType].forEach((meal) => {
          totalCalories += parseFloat(meal.calories) || 0;
        });
      }
    });
  }

  const currentUser = localStorage.getItem('currentUser');
  let maxCalories = 2000; // Значение по умолчанию

  if (currentUser) {
    const user = usersDB.find((user) => user.login === currentUser);
    if (user && user.calories) {
      maxCalories = parseInt(user.calories) || 2000;
    }
  }

  const progress = Math.min((totalCalories / maxCalories) * 100, 100);
  const progressCircle = document.querySelector('.calories-progress-circle');
  const progressText = document.querySelector('.calories-progress-text');

  if (progressCircle && progressText) {
    let progressColor;
    if (progress < 50) {
      progressColor = '#ff3b30'; // красный
    } else if (progress < 99) {
      progressColor = '#ff9500'; // оранжевый
    } else {
      progressColor = '#34c759'; // зеленый
    }

    progressCircle.style.background = `
      conic-gradient(
        ${progressColor} 0% ${progress}%,
        #f0f0f0 ${progress}% 100%
      )
    `;

    progressText.innerHTML = `${Math.round(totalCalories)}<small>из ${maxCalories}</small>`;
  }
}

function createFoodModal(mealType) {
  const modal = document.createElement('div');
  modal.className = 'food-modal';
  modal.innerHTML = `
    <div class="food-modal-content">
      <div class="food-modal-header">
        <h3 class="food-modal-title">Выберите продукт для ${getMealTypeName(mealType)}</h3>
        <button class="close-food-modal">&times;</button>
      </div>
      <div class="food-search-container">
        <input type="text" class="food-search-input" placeholder="Начните вводить название">
        <button class="food-search-button">Поиск</button>
      </div>
      <div class="food-search-results"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const searchInput = modal.querySelector('.food-search-input');
  const searchButton = modal.querySelector('.food-search-button');
  const resultsContainer = modal.querySelector('.food-search-results');
  const closeButton = modal.querySelector('.close-food-modal');

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  const performSearch = () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const results = window.foodDB.searchFoodItems(query);
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>Ничего не найдено</p>';
      return;
    }

    results.forEach((item) => {
      const foodItem = document.createElement('div');
      foodItem.className = 'food-item';
      foodItem.dataset.id = item.id;

      foodItem.innerHTML = `
        <div class="food-item-info">
          <div class="food-item-name">${item.name}</div>
        </div>
        <button class="select-food-button">Выбрать</button>
      `;

      foodItem.querySelector('.select-food-button').addEventListener('click', () => {
        modal.remove();
        createProductPage(mealType, item.id);
      });

      resultsContainer.appendChild(foodItem);
    });
  };

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  searchInput.focus();
}

function createProductPage(mealType, productId) {
  const product = window.foodDB.getFoodById(productId);
  if (!product) return;

  const [proteinPer100, fatPer100, carbsPer100] = product.bgu.split(',').map(Number);
  const kcalPer100 = Number(product.kcal);

  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.innerHTML = `
    <div class="product-modal-content">
      <div class="product-modal-header">
        <h3>${product.name}</h3>
        <button class="close-product-modal">&times;</button>
      </div>
      
      <div class="product-info">
        <div class="product-macros">
          <div>Калории: <span id="productKcal">${kcalPer100}</span> ккал</div>
          <div>Белки: <span id="productProtein">${proteinPer100}</span> г</div>
          <div>Жиры: <span id="productFat">${fatPer100}</span> г</div>
          <div>Углеводы: <span id="productCarbs">${carbsPer100}</span> г</div>
          <small>На 100 грамм продукта</small>
        </div>
        
        <div class="product-calculator">
          <label>Введите количество (грамм):</label>
          <input type="number" id="productWeight" value="100" min="1" class="weight-input">
        </div>
        
        <button id="addProductToMeal" data-meal="${mealType}">Добавить в ${getMealTypeName(
    mealType,
  )}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const weightInput = modal.querySelector('#productWeight');
  const addBtn = modal.querySelector('#addProductToMeal');

  const updateValues = () => {
    const weight = parseInt(weightInput.value) || 100;
    const factor = weight / 100;

    document.getElementById('productKcal').textContent = (kcalPer100 * factor).toFixed(1);
    document.getElementById('productProtein').textContent = (proteinPer100 * factor).toFixed(1);
    document.getElementById('productFat').textContent = (fatPer100 * factor).toFixed(1);
    document.getElementById('productCarbs').textContent = (carbsPer100 * factor).toFixed(1);
  };

  weightInput.addEventListener('input', updateValues);

  addBtn.addEventListener('click', () => {
    const weight = parseInt(weightInput.value) || 100;
    const factor = weight / 100;

    addMeal(
      mealType,
      `${product.name} (${weight}г)`,
      (kcalPer100 * factor).toFixed(1),
      (proteinPer100 * factor).toFixed(1),
      (fatPer100 * factor).toFixed(1),
      (carbsPer100 * factor).toFixed(1),
    );

    modal.remove();
    loadDayData(selectedDate);
  });

  updateValues();
}

function getMealTypeName(mealType) {
  switch (mealType) {
    case 'breakfast':
      return 'Завтрак';
    case 'lunch':
      return 'Обед';
    case 'dinner':
      return 'Ужин';
    case 'snack':
      return 'Перекус';
    default:
      return '';
  }
}
