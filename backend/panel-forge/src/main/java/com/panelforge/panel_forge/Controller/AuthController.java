package com.panelforge.panel_forge.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.panelforge.panel_forge.Model.AppUser;
import com.panelforge.panel_forge.Model.AppUserRepository;
import com.panelforge.panel_forge.Model.AppUserService;
import com.panelforge.panel_forge.Model.ChangePasswordService;
import com.panelforge.panel_forge.Security.JwtService;
import com.panelforge.panel_forge.dto.AuthResponse;
import com.panelforge.panel_forge.dto.ChangePasswordRequest;
import com.panelforge.panel_forge.dto.LoginRequest;
import com.panelforge.panel_forge.dto.RegisterRequest;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;





@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AppUserService appUserService;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final ChangePasswordService changePasswordService;

    public AuthController(AppUserService appUserService, JwtService jwtService, AppUserRepository appUserRepository, ChangePasswordService changePasswordService) {
        this.appUserService=appUserService;
        this.jwtService=jwtService;
        this.appUserRepository=appUserRepository;
        this.changePasswordService=changePasswordService;

    }
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest){
        try {
            // Pass the Record straight to the service layer
            AuthResponse resultMessage = appUserService.RegisterNewUser(registerRequest);
            return ResponseEntity.ok(resultMessage);
        } catch (IllegalArgumentException e) {
            // If passwords don't match, send back a clean 400 error message
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest){
        try{
            AuthResponse resultMessage = appUserService.LoginUser(loginRequest);
            return ResponseEntity.ok(resultMessage);

        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        
    }
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("Refresh token missing from request body.");
        }
        UUID userId = jwtService.extractRefreshUserId(refreshToken);
        
        if (userId != null) {
            AppUser appUser = appUserRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("No user found for id: " + userId));
            
            // Generate a fresh access token
            String newAccessToken = jwtService.generateAccessToken(appUser);
            
            return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken));
        }
        
        return ResponseEntity.status(401).body("Invalid or expired refresh token configuration.");

    }
    @PutMapping("/changePassword")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        try{
            AuthResponse response = changePasswordService.changePassword(changePasswordRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
        
    
    
    
}
