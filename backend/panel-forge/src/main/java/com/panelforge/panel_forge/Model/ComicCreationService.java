package com.panelforge.panel_forge.Model;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.panelforge.panel_forge.Security.CustomUserPrincipal;
import com.panelforge.panel_forge.dto.ComicCreationRequest;

import jakarta.transaction.Transactional;

@Service
public class ComicCreationService {

    private final ComicCreationRepository comicCreationRepository;
    private final AppUserRepository appUserRepository;

    public ComicCreationService (ComicCreationRepository comicCreationRepository, AppUserRepository appUserRepository) {
        this.comicCreationRepository=comicCreationRepository;
        this.appUserRepository=appUserRepository;
    }

    @Transactional
    public Long AddNewComic(ComicCreationRequest comicCreationRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Long userId = principal.getId();

        AppUser currentUser = appUserRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
        ComicCreation newComic = new ComicCreation();

        newComic.setAppUser(currentUser);

        newComic.setNumberOfPanels(comicCreationRequest.NumberOfPanels());
        newComic.setPanelWidth(comicCreationRequest.PanelWidth());
        newComic.setPanelHeight(comicCreationRequest.PanelHeight());
        newComic.setQualitySteps(comicCreationRequest.QualitySteps());
        newComic.setGuidanceScale(comicCreationRequest.GuidanceScale());
        newComic.setGenerateComic(comicCreationRequest.GenerateComic());
        newComic.setSkipComic(comicCreationRequest.SkipComic());
        newComic.setComicPrompt(comicCreationRequest.ComicPrompt());
        newComic.setArtStyle(comicCreationRequest.ArtStyle());

        ComicCreation savedComic = comicCreationRepository.save(newComic);
        return savedComic.getId();
    }

}
