package web.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/admin")
public class AdminPageController {

    @GetMapping
    public String adminPage(HttpServletRequest request) {
        return "admin/admin"; // templates/admin/admin.html
    }
}
