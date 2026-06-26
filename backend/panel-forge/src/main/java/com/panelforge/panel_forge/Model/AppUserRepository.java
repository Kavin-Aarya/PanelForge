package com.panelforge.panel_forge.Model;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser,UUID> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<UserDetails> findByUsername(String username);
    AppUser findByEmail(String email);
}
