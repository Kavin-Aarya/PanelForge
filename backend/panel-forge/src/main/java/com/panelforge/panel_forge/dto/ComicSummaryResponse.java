package com.panelforge.panel_forge.dto;

import java.util.UUID;

public record ComicSummaryResponse (
    UUID id,
    String storyTitle,
    String artStyle,
    int numberOfPanels,
    String thumbnail,
    boolean generateComic
) {}
