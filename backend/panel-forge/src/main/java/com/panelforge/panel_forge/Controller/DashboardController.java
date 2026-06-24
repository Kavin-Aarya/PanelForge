package com.panelforge.panel_forge.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/welcome")
    public ResponseEntity<String> getDashboardWelcomeMessage() {
        return ResponseEntity.ok("Success! You reached a protected company-grade endpoint.");
    }
}