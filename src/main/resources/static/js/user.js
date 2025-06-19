document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwtToken");
    console.log("📦 JWT из localStorage:", token);

    if (!token) {
        console.warn("⛔ Токен отсутствует — редирект");
        window.location.href = "/auth/login";
        return;
    }

    document.body.style.display = "";

    try {
        const res = await fetch("/api/users/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("📥 Ответ на /api/users/me:", res.status);

        if (res.status === 401) {
            console.warn("❌ 401 Unauthorized — токен сброшен");
            localStorage.removeItem("jwtToken");
            window.location.href = "/auth/login";
            return;
        }

        if (res.status === 403) {
            console.warn("⚠️ 403 Forbidden — доступ запрещён");
            window.location.href = "/auth/login";
            return;
        }

        if (!res.ok) {
            console.error("❌ Ошибка ответа:", res.status);
            localStorage.removeItem("jwtToken");
            window.location.href = "/auth/login";
            return;
        }

        const user = await res.json();
        console.log("✅ Получен пользователь:", user);

        // Заполнение навбара
        document.getElementById("navbar-email").textContent = user.email;
        document.getElementById("navbar-roles").textContent = formatRoles(user.roles);

        // Заполнение таблицы пользователя
        document.getElementById("user-id").textContent = user.id;
        document.getElementById("user-firstname").textContent = user.firstName;
        document.getElementById("user-lastname").textContent = user.lastName;
        document.getElementById("user-age").textContent = user.age;
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("user-roles").textContent = formatRoles(user.roles);

        // Показываем вкладку Admin, если у пользователя есть эта роль
        if (user.roles.includes("ROLE_ADMIN")) {
            document.getElementById("admin-tab").classList.remove("d-none");
        }

    } catch (error) {
        console.error("❌ Ошибка при загрузке пользователя:", error);
        localStorage.removeItem("jwtToken");
        window.location.href = "/auth/login";
    }

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

function formatRoles(roles) {
    return roles.map(role => role.replace("ROLE_", "")).join(", ");
}


function formatRoles(roles) {
    return "[" + roles.map(role => role.replace("ROLE_", "")).join(", ") + "]";
}

