package com.panelforge.panel_forge.dto;

import java.util.List;
import java.util.UUID;

public record ComicDetailResponse (

    UUID id,
    String storyTitle,
    String storyline,
    String characters,
    String moral,
    String artStyle,
    int numberOfPanels,
    int panelWidth,
    int panelHeight,
    String layoutImage,
    List<String> panelImages

){}
