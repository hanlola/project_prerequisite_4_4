package web.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthPageController {

    @GetMapping("/auth/login")
    public String loginPage() {
        return "auth/login"; // лежит в src/main/resources/templates/auth/login.html
    }

    @GetMapping("/auth/registration")
    public String registrationPage() {
        return "auth/registration"; // лежит в src/main/resources/templates/auth/registration.html
    }
}
