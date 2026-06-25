package com.panelforge.panel_forge.dto;

public record ComicCreationRequest(

    @NotBlank(message = "Number of panels is required")
    int NumberOfPanels,

    @NotBlank(message = "Panel Width is required")
    int PanelWidth,

    @NotBlank(message = "Panel Height is required")
    int PanelHeight,

    @NotBlank(message = "Quality Steps is required")
    int QualitySteps,

    @NotBlank(message = "Guidance Scale is required")
    int GuidanceScale,

    @NotBlank(message = "")
    boolean GenerateComic,

    @NotBlank(message = "")
    boolean SkipComic,

    @NotBlank(message = "Comic Generation Prompt is required")
    String ComicPrompt,

    @NotBlank(message = "Comic Generation Art Style is required")
    String ArtStyle

) {}
