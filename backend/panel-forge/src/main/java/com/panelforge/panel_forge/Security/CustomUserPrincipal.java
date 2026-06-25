package com.panelforge.panel_forge.Security;

import com.panelforge.panel_forge.Model.AppUser;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Wraps the AppUser entity as the Spring Security principal.
 * This lets every authenticated request carry the full AppUser object
 * (id, email, username, workspace, etc.) without a second DB lookup,
 * while still satisfying the UserDetails contract Spring expects.
 */
public class CustomUserPrincipal implements UserDetails {

    private final AppUser appUser;

    public CustomUserPrincipal(AppUser appUser) {
        this.appUser = appUser;
    }

    // ── Direct, typed access — this is the "faster access" part ──
    public AppUser getAppUser() {
        return appUser;
    }

    public Long getId() {
        return appUser.getId();
    }

    public String getEmail() {
        return appUser.getEmail();
    }

    // ── UserDetails contract ──
    @Override
    public String getUsername() {
        return appUser.getUsername();
    }

    @Override
    public String getPassword() {
        return appUser.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // AppUser has no roles field today; wire this up to a real authorities
        // list if/when roles are added (e.g. appUser.getRoles().stream()...).
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