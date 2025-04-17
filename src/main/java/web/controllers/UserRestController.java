package web.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import web.dto.UserDto;
import web.services.UserService;
import web.security.JwtUtil;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserRestController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // Получить всех пользователей
    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.findAll();
    }

    // Получить пользователя по ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserDtoById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Получить текущего авторизованного пользователя
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserDtoByEmail(userDetails.getUsername()));
    }

    // Создание нового пользователя
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto savedUser = userService.save(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // Обновление пользователя
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto userDto,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        if (currentUser == null) {
            System.out.println("⚠️ currentUser is null — returning 401");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 🔍 Логируем, чтобы отследить совпадение
        System.out.println("🛠️ currentUser.getUsername() = " + currentUser.getUsername());
        System.out.println("🛠️ userDto.getEmail() = " + userDto.getEmail());

        // Запрещаем редактировать самого себя
        if (userDto.getEmail() != null &&
                userDto.getEmail().equalsIgnoreCase(currentUser.getUsername())) {
            System.out.println("⛔ Попытка изменить самого себя — возвращаем 403");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDto updatedUserDto = userService.update(id, userDto);

        return ResponseEntity.ok(updatedUserDto);
    }

    // Удаление пользователя
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
