document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            errorMessage.textContent = "Please enter email and password.";
            errorMessage.style.display = "block";
            return;
        }

        fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Invalid credentials");
            }
            return response.json();
        })
        .then(data => {
            const token = data.token;
            const user = data.user;

            // Сохраняем токен в localStorage
            localStorage.setItem("jwtToken", token);

            // Перенаправление по роли
            const roles = user.roles || [];
            if (roles.includes("ROLE_ADMIN")) {
                fetch("/admin", {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                })
                .then(res => res.text())
                .then(html => {
                  document.open();
                  document.write(html);
                  document.close();
                });
            } else {
                window.location.href = "/user";
            }
        })
        .catch(error => {
            errorMessage.textContent = "Wrong email or password.";
            errorMessage.style.display = "block";
        });
    });
});
