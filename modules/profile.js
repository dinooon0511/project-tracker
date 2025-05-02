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
            <div class="stat-value" id="userHeight">0</div>
            <div class="stat-label">Рост (см)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="userWeight">0</div>
            <div class="stat-label">Вес (кг)</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value" id="userCalories">0</div>
            <div class="stat-label">Калории (ккал)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="userActivity">3</div>
            <div class="stat-label">Активность</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value" id="userGoal">–</div>
            <div class="stat-label">Цель</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="userTargetWeight">0</div>
            <div class="stat-label">Желаемый вес</div>
          </div>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value" id="userBirthdate">–</div>
            <div class="stat-label">День рождения</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="userAge">–</div>
            <div class="stat-label">Возраст</div>
          </div>
        </div>
      </div>
      <button class="logout-btn" id="logoutBtn">Выйти</button>
    </div>
  `;

  document.getElementById('profileContainer').appendChild(profileTab);

  const user = usersDB.find((user) => user.login === username);
  if (user) {
    document.getElementById('profileUsername').textContent = username;
    document.getElementById('userPoints').textContent = user.points || 0;
    document.getElementById('userHeight').textContent = user.height || 0;
    document.getElementById('userWeight').textContent = user.weight || 0;
    document.getElementById('userCalories').textContent = user.calories || 0;
    document.getElementById('userActivity').textContent = user.activity || 3;

    document.getElementById('userGoal').textContent = user.goal || '–';
    document.getElementById('userTargetWeight').textContent = user.targetWeight || 0;
    document.getElementById('userBirthdate').textContent = user.birthdate || '–';
    document.getElementById('userAge').textContent = user.age || '–';

    const avatarWrapper = document.getElementById('avatarWrapper');
    if (user.avatar) {
      avatarWrapper.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
  }

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

  document.getElementById('logoutBtn')?.addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('profileContainer').classList.add('hidden');
    document.getElementById('bottomMenu').classList.add('hidden');
    document.getElementById('profileContainer').innerHTML = '';
  });
}
