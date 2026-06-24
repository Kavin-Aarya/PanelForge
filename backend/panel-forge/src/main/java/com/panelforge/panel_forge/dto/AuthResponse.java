package com.panelforge.panel_forge.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken
)
{}
