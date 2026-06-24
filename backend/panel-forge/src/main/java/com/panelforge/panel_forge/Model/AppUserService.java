package com.panelforge.panel_forge.Model;

import com.panelforge.panel_forge.Exception.EmailAlreadyExistsException;
import com.panelforge.panel_forge.Exception.InvalidCredentialsException;
import com.panelforge.panel_forge.Exception.UserNameAlreadyExistsException;
import com.panelforge.panel_forge.Security.JwtService;
import com.panelforge.panel_forge.dto.AuthResponse;
import com.panelforge.panel_forge.dto.LoginRequest;
import com.panelforge.panel_forge.dto.RegisterRequest;

import jakarta.transaction.Transactional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AppUserService {
    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository appUserRepository, JwtService jwtService) {
        this.appUserRepository=appUserRepository;
        this.jwtService=jwtService;
    }
    
    @Transactional
    public AuthResponse RegisterNewUser(RegisterRequest registerRequest){
        if (!registerRequest.password().equals(registerRequest.confirmpassword())){
            throw new IllegalArgumentException("Passwords do not match!");
        }

        String secureHashedPassword = passwordEncoder.encode(registerRequest.password());

        
        if (appUserRepository.existsByEmail(registerRequest.email())) {
            throw new EmailAlreadyExistsException(registerRequest.email());
        }
        if (appUserRepository.existsByUsername(registerRequest.username())) {
            throw new UserNameAlreadyExistsException(registerRequest.username());
        }
        AppUser entityUser = new AppUser();
        entityUser.setUsername(registerRequest.username());
        entityUser.setEmail(registerRequest.email());
        entityUser.setPassword(secureHashedPassword);
        entityUser.setName(registerRequest.username());
        
        Workspace userWorkspace = new Workspace(entityUser);
        entityUser.setWorkspace(userWorkspace);

        AppUser savedUser = appUserRepository.save(entityUser);

        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);


        return new AuthResponse(accessToken, refreshToken);

    }

    public AuthResponse LoginUser(LoginRequest loginRequest){
        if (!appUserRepository.existsByEmail(loginRequest.email())){
            throw new InvalidCredentialsException();
        }
        AppUser user = appUserRepository.findByEmail(loginRequest.email());
        boolean isMatch = passwordEncoder.matches(loginRequest.password(), user.getPassword());
        if (!isMatch) {
            throw new InvalidCredentialsException();
        }
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken);

    }
    

    
    
}
