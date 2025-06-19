const token = localStorage.getItem("jwtToken");
const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

document.addEventListener("DOMContentLoaded", () => {
    console.log("🌐 DOMContentLoaded, токен:", token);

    if (!token) {
        console.warn("⛔ Токен отсутствует");
        window.location.href = "/auth/login";
        return;
    }

    document.body.style.display = "";

    loadCurrentUser();
    loadUsers();
    loadRolesToSelect();


    document.getElementById("newUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        await createUser();
    });


    document.getElementById("editUserForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        await updateUser(); // вызываем вручную
    });

    document.getElementById("user-tab").addEventListener("click", (e) => {
        e.preventDefault();
        showTab("user");
    });

    const logoutForm = document.getElementById("logoutForm");
        if (logoutForm) {
            logoutForm.addEventListener("submit", (e) => {
                e.preventDefault();
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("currentUserEmail");
                window.location.href = "/auth/login";
            });
        }
});

async function fetchWithAuth(url, options = {}) {
    const currentToken = localStorage.getItem("jwtToken");

    console.log("📤 fetchWithAuth →", url, options);
    console.log("📤 Текущий токен:", currentToken);

    const res = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${currentToken}`,
            ...options.headers,
        },
    });

    console.log("📥 Ответ fetchWithAuth:", res.status, res.url);

    if (res.status === 401) {
        console.error("🚨 401 UNAUTHORIZED. Запрос:", {
            url,
            status: res.status,
            token: currentToken,
            options
        });

        localStorage.removeItem("jwtToken");
        window.location.href = "/auth/login";
        return null;
    }

    if (res.status === 403) {
        console.warn("⚠️ 403: Доступ запрещён");
        window.location.href = "/auth/login";
        return res;
    }

    return res;
}

async function loadCurrentUser() {
    const res = await fetchWithAuth("/api/users/me");
    if (!res) return;

    const user = await res.json();

    // ✅ Навбар
    document.getElementById("navbar-email").textContent = user.email;
    document.getElementById("navbar-roles").textContent = formatRole(user.roles);

    // ✅ Обновляем таблицу во вкладке "User"
    document.getElementById("user-id").textContent = user.id;
    document.getElementById("user-firstname").textContent = user.firstName;
    document.getElementById("user-lastname").textContent = user.lastName;
    document.getElementById("user-age").textContent = user.age;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("user-roles").textContent = formatRole(user.roles);


    if (user.roles.includes("ROLE_USER")) {
        document.getElementById("user-tab").classList.remove("d-none");
    }
}

async function loadUsers() {
    const res = await fetchWithAuth("/api/users");
    if (!res) return;

    const users = await res.json();
    console.log("👥 Полученные пользователи:", users);

    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    for (let user of users) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.email}</td>
            <td>${formatRole(user.roles)}</td>
            <td><button class="btn btn-sm btn-info" onclick="openEditModal(${user.id})">Edit</button></td>
            <td><button class="btn btn-sm btn-danger" onclick="openDeleteModal(${user.id})">Delete</button></td>
        `;
        tbody.appendChild(row);
    }
}

async function createUser() {
    const form = document.getElementById("newUserForm");
    const roles = Array.from(form.roles.selectedOptions).map(opt => opt.value);

    const user = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        age: form.age.value,
        email: form.email.value,
        password: form.password.value,
        roles: roles
    };

    fetchWithAuth("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    })
    .then(async res => {
        if (res.ok) {
            form.reset();
            await loadUsers();
            showSubTab("all");
        } else {
            const text = await res.text();
            alert("❌ Ошибка: " + text);
        }
    })
    .catch(error => {
        alert("❌ Ошибка сети или сервера: " + error.message);
    });
}

async function openEditModal(id) {
    const res = await fetchWithAuth(`/api/users/${id}`);
    if (!res) return;

    const user = await res.json();
    const form = document.getElementById("editUserForm"); // ✅ вот правильная строка
    const currentEmail = localStorage.getItem("currentUserEmail");
    form.userId.value = user.id;
    form.firstName.value = user.firstName;
    form.lastName.value = user.lastName;
    form.age.value = user.age;
    form.email.value = user.email;
    form.email.disabled = user.email === currentEmail;
    form.password.value = "";

    const roleSelect = form.roles;
    for (let option of roleSelect.options) {
        option.selected = user.roles.includes(option.value);
    }

    new bootstrap.Modal(document.getElementById("editUserModal")).show();
}


async function updateUser() {
    console.log("🛠️ updateUser started");

    const form = document.getElementById("editUserForm");
    const id = form.userId.value;
    const roles = Array.from(form.roles.selectedOptions).map(opt => opt.value);

    const updatedUser = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        age: form.age.value,
        email: form.email.value,
        password: form.password.value,
        roles: roles
    };

    console.log("📤 Sending update for user ID:", id, updatedUser);
    console.log("🔐 Перед fetch token =", localStorage.getItem("jwtToken"));

    const res = await fetchWithAuth(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
    });

    if (!res) {
        console.error("🚫 fetchWithAuth вернул null — вероятно редирект из-за 401");
        return;
    }

    console.log("📥 Response from update:", res.status);

    if (res.ok) {
        const user = await res.json();
        console.log("✅ User updated:", user);

        bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
        showSubTab("all");
        await loadUsers();
    } else if (res.status === 403) {
        console.warn("⚠️ 403: нельзя редактировать самого себя");
        alert("❌ Нельзя редактировать самого себя (админ защищён)");
    } else {
        console.error("❌ Не удалось обновить пользователя", res.status);
        alert("❌ Failed to update user");
    }
}

async function openDeleteModal(id) {
    const res = await fetchWithAuth(`/api/users/${id}`);
    if (!res || !res.ok) {
        alert("❌ Не удалось получить пользователя для удаления");
        return;
    }

    const user = await res.json();

    document.getElementById("deleteUserId").value = user.id;
    document.getElementById("deleteUserFirstName").value = user.firstName;
    document.getElementById("deleteUserLastName").value = user.lastName;
    document.getElementById("deleteUserAge").value = user.age;
    document.getElementById("deleteUserEmail").value = user.email;
    document.getElementById("deleteUserRoles").value = user.roles
        .map(role => role.replace("ROLE_", ""))
        .join(", ");

    new bootstrap.Modal(document.getElementById("deleteUserModal")).show();
}

async function deleteUser() {
    const id = document.getElementById("deleteUserId").value;
    const res = await fetchWithAuth(`/api/users/${id}`, {
        method: "DELETE"
    });

    if (res && res.ok) {
        bootstrap.Modal.getInstance(document.getElementById("deleteUserModal")).hide();
        await loadUsers();
    } else {
        alert("❌ Failed to delete user");
    }
}

function showSubTab(tab) {
    document.getElementById("tab-content-all").classList.toggle("d-none", tab !== "all");
    document.getElementById("tab-content-new").classList.toggle("d-none", tab !== "new");

    const tabs = document.querySelectorAll(".nav-tabs .nav-link");
    tabs.forEach(t => t.classList.remove("active"));
    const activeTab = Array.from(tabs).find(t => t.textContent.trim().toLowerCase().includes(tab));
    if (activeTab) activeTab.classList.add("active");
}

async function loadRolesToSelect() {
    const res = await fetchWithAuth("/api/roles");
    if (!res || !res.ok) {
        alert("❌ Failed to load roles");
        return;
    }

    const roles = await res.json();

    const newUserRolesSelect = document.getElementById("newUserRoles");
    if (newUserRolesSelect) {
        newUserRolesSelect.innerHTML = "";
        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.name;
            option.textContent = role.name.replace("ROLE_", "");
            newUserRolesSelect.appendChild(option);
        });
    }

    const editRolesSelect = document.querySelector("#editUserForm select[name='roles']");
    if (editRolesSelect) {
        editRolesSelect.innerHTML = "";
        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.name;
            option.textContent = role.name.replace("ROLE_", "");
            editRolesSelect.appendChild(option);
        });
    }
}

function showTab(tab) {
    const adminTab = document.getElementById("tab-admin");
    const userTab = document.getElementById("user-tab");
    const adminContent = document.getElementById("admin-section"); // ты можешь назвать div как хочешь
    const userContent = document.getElementById("user-section");   // аналогично

    if (tab === "admin") {
        adminTab.classList.add("active");
        userTab.classList.remove("active");
        adminContent.classList.remove("d-none");
        userContent.classList.add("d-none");
    } else if (tab === "user") {
        adminTab.classList.remove("active");
        userTab.classList.add("active");
        adminContent.classList.add("d-none");
        userContent.classList.remove("d-none");
        loadCurrentUser(); // ⬅️ Загружаем текущего пользователя
    }
}

function formatRole(roles) {
    if (roles.includes("ROLE_ADMIN")) return "[ADMIN]";
    if (roles.includes("ROLE_USER")) return "[USER]";
    return "[" + roles.map(r => r.replace("ROLE_", "")).join(", ") + "]";
}
