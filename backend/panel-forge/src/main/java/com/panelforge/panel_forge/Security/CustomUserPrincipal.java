package com.panelforge.panel_forge.Security;


import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.panelforge.panel_forge.Model.AppUser;

import java.util.Collection;
import java.util.Collections;

public class CustomUserPrincipal implements UserDetails {
    
    private final Long id;
    private final String email;
    private final String password;

    public CustomUserPrincipal(AppUser appUser) {
        this.id = appUser.getId();
        this.email = appUser.getEmail();
        this.password = appUser.getPassword();
    }
    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email; // Maps email as the standard security username
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return user roles/permissions here if you implement them later
        return Collections.emptyList(); 
    }
    @Override
    public boolean isAccountNonExpired() { 
        return true; 
    }
    @Override
    public boolean isAccountNonLocked() { 
        return true; 
    }
    @Override
    public boolean isCredentialsNonExpired() { 
        return true; 
    }
    @Override
    public boolean isEnabled() { 
        return true; 
    }
}
