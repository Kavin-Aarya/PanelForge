package com.panelforge.panel_forge.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ComicDetails")
public class ComicCreation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many comics can belong to one user — each comic gets its own
    // auto-generated id; user_id is a plain foreign key column.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private AppUser appUser;

    private int NumberOfPanels;
    private int PanelWidth;
    private int PanelHeight;
    private int QualitySteps;
    private int GuidanceScale;
    private boolean GenerateComic;
    private boolean SkipComic;
    private String ComicPrompt;
    private String ArtStyle;
    private String storyTitle;

    @Column(columnDefinition = "TEXT")
    private String storyline;

    private String characters;
    private String moral;

    @Column(columnDefinition = "TEXT")
    private String layoutImage;

    @ElementCollection
    @CollectionTable(name = "comic_panel_images", joinColumns = @JoinColumn(name = "comic_id"))
    @Column(name = "panel_image", columnDefinition = "TEXT")
    private java.util.List<String> panelImages;

    public AppUser getAppUser() {
        return appUser;
    }
    public void setAppUser(AppUser appUser) {
        this.appUser = appUser;
    }

    public Long getId() {
        return this.id;
    }
    public void setId(Long id) {
        this.id=id;
    }

    public int getNumberOfPanels() {
        return NumberOfPanels;
    }
    public void setNumberOfPanels(int NumberOfPanels) {
        this.NumberOfPanels=NumberOfPanels;
    }

    public int getPanelWidth() {
        return PanelWidth;
    }
    public void setPanelWidth(int PanelWidth) {
        this.PanelWidth=PanelWidth;
    }

    public int getPanelHeight() {
        return PanelHeight;
    }
    public void setPanelHeight(int PanelHeight) {
        this.PanelHeight=PanelHeight;
    }

    public int getQualitySteps() {
        return QualitySteps;
    }
    public void setQualitySteps(int QualitySteps) {
        this.QualitySteps=QualitySteps;
    }

    public int getGuidanceScale() {
        return GuidanceScale;
    }
    public void setGuidanceScale(int GuidanceScale) {
        this.GuidanceScale=GuidanceScale;
    }

    public boolean getGenerateComic() {
        return GenerateComic;
    }
    public void setGenerateComic(boolean GenerateComic) {
        this.GenerateComic=GenerateComic;
    }

    public boolean getSkipComic() {
        return SkipComic;
    }
    public void setSkipComic(boolean SkipComic) {
        this.SkipComic=SkipComic;
    }

    public String getComicPrompt() {
        return ComicPrompt;
    }
    public void setComicPrompt(String ComicPrompt) {
        this.ComicPrompt=ComicPrompt;
    }

    public String getArtStyle() {
        return ArtStyle;
    }
    public void setArtStyle(String ArtStyle) {
        this.ArtStyle=ArtStyle;
    }
    public String getStoryTitle() { 
        return storyTitle; 
    }
    public void setStoryTitle(String storyTitle) { 
        this.storyTitle = storyTitle; 
    }

    public String getStoryline() { 
        return storyline; 
    }
    public void setStoryline(String storyline) { 
        this.storyline = storyline; 
    }

    public String getCharacters() { 
        return characters; 
    }
    public void setCharacters(String characters) { 
        this.characters = characters; 
    }

    public String getMoral() { 
        return moral; 
    }
    public void setMoral(String moral) { 
        this.moral = moral; 
    }

    public String getLayoutImage() { 
        return layoutImage; 
    }
    public void setLayoutImage(String layoutImage) { 
        this.layoutImage = layoutImage; 
    }

    public java.util.List<String> getPanelImages() { 
        return panelImages; 
    }
    public void setPanelImages(java.util.List<String> panelImages) { 
        this.panelImages = panelImages; 
    }


        
    }