package web.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import web.dto.UserDto;
import web.models.Role;
import web.repositories.RoleRepository;
import web.services.UserService;

import java.util.Optional;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserService userService;

    public DataInitializer(RoleRepository roleRepository, UserService userService) {
        this.roleRepository = roleRepository;
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        createRoleIfNotExists("ROLE_ADMIN");
        createRoleIfNotExists("ROLE_USER");

        Optional<UserDto> existingAdmin = userService.findByEmail("admin@example.com");
        if (existingAdmin.isEmpty()) {
            UserDto admin = new UserDto();
            admin.setEmail("admin@example.com");
            admin.setPassword("admin"); // пароль захешируется внутри UserService
            admin.setFirstName("Admin");
            admin.setLastName("Root");
            admin.setAge(30);
            admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));

            userService.save(admin);
            System.out.println("✅ Admin user created: admin@example.com / admin");
        }
    }

    private void createRoleIfNotExists(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("✅ Role created: " + roleName);
        }
    }
}
