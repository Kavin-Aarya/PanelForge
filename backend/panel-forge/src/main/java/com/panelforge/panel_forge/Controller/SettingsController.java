package com.panelforge.panel_forge.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.panelforge.panel_forge.Model.AppUser;
import com.panelforge.panel_forge.Security.CustomUserPrincipal;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @GetMapping("/user")
    public ResponseEntity<?> getLoggedInUserProfile(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        AppUser user = principal.getAppUser();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
    
    

    
}
