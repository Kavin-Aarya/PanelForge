package com.panelforge.panel_forge.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.panelforge.panel_forge.Model.AppUser;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @GetMapping("/user")
    public ResponseEntity<?> getLoggedInUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        AppUser user = (AppUser) authentication.getPrincipal();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    

    
}
