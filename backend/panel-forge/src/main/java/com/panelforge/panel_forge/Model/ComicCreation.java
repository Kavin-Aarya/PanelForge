package com.panelforge.panel_forge.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ComicDetails")
public class ComicCreation {
    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name="id")
    @JsonBackReference
    private AppUser appUser;

    int NumberOfPanels;
    int PanelWidth;
    int PanelHeight;
    int QualitySteps;
    int GuidanceScale;
    boolean GenerateComic;
    boolean SkipComic;
    String ComicPrompt;
    String ArtStyle;

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


    
}
