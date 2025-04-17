package web.services;

import web.dto.UserDto;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<UserDto> findAll();
    UserDto getUserDtoById(Long id);
    UserDto getUserDtoByEmail(String email);
    UserDto save(UserDto userDto);
    UserDto update(Long id, UserDto userDto);
    void deleteById(Long id);
    Optional<UserDto> findByEmail(String email);

}
