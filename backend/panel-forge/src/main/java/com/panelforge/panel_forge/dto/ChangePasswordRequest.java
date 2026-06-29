package com.panelforge.panel_forge.dto;

import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
    @NotBlank(message = "Current Password must not be empty")
    String currentPassword,
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
        message = "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one digit, and one special character."
    )
    String newPassword,
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
        message = "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one digit, and one special character."
    )
    String confirmPassword
) {}
