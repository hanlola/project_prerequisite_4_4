package web.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import web.models.User;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
