document.addEventListener("DOMContentLoaded", () => {
    const registrationForm = document.getElementById("registrationForm");
    const errorMessage = document.getElementById("errorMessage");

    registrationForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const age = parseInt(document.getElementById("age").value);
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!firstName || !lastName || !age || !email || !password) {
            errorMessage.textContent = "All fields must be filled out.";
            errorMessage.style.display = "block";
            return;
        }

        const roles = ["ROLE_USER"]; // 👈 фиксированная роль по умолчанию

        fetch("/api/auth/registration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName,
                lastName,
                age,
                email,
                password,
                roles
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(user => {
            window.location.href = "/user"; // после регистрации → user
        })
        .catch(error => {
            errorMessage.textContent = error.message || "Registration failed.";
            errorMessage.style.display = "block";
        });
    });
});
