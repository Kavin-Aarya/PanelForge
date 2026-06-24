package com.panelforge.panel_forge.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.*;
import jakarta.persistence.Table;

@Entity
@Table(name="workspace")
public class Workspace {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name="id")
    @JsonBackReference
    private AppUser appUser;

    private int comicsCreated = 0;
    private int panelsGenerated = 0;
    private double avgQuality = 0.00;
    private String creatorPlan = "Free Plan";
    private int remainingCredits = 0;

    public Workspace(AppUser appUser) {
        this.appUser=appUser;
    }

    public Long getId() {
        return this.id;
    }
    public void setId(Long id) {
        this.id=id;
    }
    public int getComicsCreated() {
        return comicsCreated;
    }
    public void setComicsCreated(int comicsCreated) {
        this.comicsCreated=comicsCreated;

    }
    public int getPanelsGenerated() {
        return this.panelsGenerated;
    }
    public void setPanelsGenerated(int panelsGenerated) {
        this.panelsGenerated=panelsGenerated;

    }
    public double getAvgQuality() {
        return this.avgQuality;
    }
    public void setAvgQuality(double avgQuality) {
        this.avgQuality=avgQuality;
    }
    public String getCreatorPlan() {
        return this.creatorPlan;
    }
    public void setCreatorPlan(String creatorPlan) {
        this.creatorPlan=creatorPlan;

    }
    public int getRemainingCredits() {
        return this.remainingCredits;
    }
    public void setRemainingCredits(int remainingCredits) {
        this.remainingCredits=remainingCredits;
    }




    
}
