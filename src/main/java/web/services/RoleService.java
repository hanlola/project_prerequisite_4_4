package web.services;

import web.models.Role;

import java.util.List;
import java.util.Set;

public interface RoleService {
    List<Role> findAll();
    Role findByName(String name);
    Set<Role> getRolesByNames(Set<String> roleNames);
}
