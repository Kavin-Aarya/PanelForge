package com.panelforge.panel_forge.dto;

public record WorkspaceResponse (
    int comicsCreated,
    int panelsGenerated,
    double avgQuality,
    String creatorPlan,
    int remainingCredits
) {}
