package com.panelforge.panel_forge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ComicCreationRequest(

    @Min(value = 1, message = "Number of panels must be at least 1")
    int NumberOfPanels,

    @Min(value = 1, message = "Panel width must be greater than zero")
    int PanelWidth,

    @Min(value = 1, message = "Panel height must be greater than zero")
    int PanelHeight,

    @Min(value = 1, message = "Quality steps must be greater than zero")
    int QualitySteps,

    @Min(value = 1, message = "Guidance scale must be greater than zero")
    int GuidanceScale,

    boolean GenerateComic,

    boolean SkipComic,

    @NotBlank(message = "Comic Generation Prompt is required")
    String ComicPrompt,

    @NotBlank(message = "Comic Generation Art Style is required")
    String ArtStyle,

    String StoryTitle,

    String Storyline,

    String Characters,

    String Moral,

    String LayoutImage,
    
    List<String> PanelImages

) {}