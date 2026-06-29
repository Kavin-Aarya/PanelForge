package com.panelforge.panel_forge.Model;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.panelforge.panel_forge.Exception.ResourceNotFoundException;
import com.panelforge.panel_forge.Security.CustomUserPrincipal;
import com.panelforge.panel_forge.Security.JwtService;
import com.panelforge.panel_forge.dto.AuthResponse;
import com.panelforge.panel_forge.dto.ChangePasswordRequest;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ChangePasswordService {

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public ChangePasswordService(AppUserRepository appUserRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.appUserRepository=appUserRepository;
        this.jwtService=jwtService;
        this.passwordEncoder=passwordEncoder;

    }

    @Transactional
    public AuthResponse changePassword(ChangePasswordRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UUID userId = principal.getId();

        AppUser user = appUserRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())){
            throw new RuntimeException("Current Password is incorrect.");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new RuntimeException("New Password and Confirm Password do not match.");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken);

    }
    
}
