package com.panelforge.panel_forge.Model;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.panelforge.panel_forge.Security.CustomUserPrincipal;
import com.panelforge.panel_forge.dto.ComicCreationRequest;
import com.panelforge.panel_forge.dto.ComicDetailResponse;
import com.panelforge.panel_forge.dto.ComicSummaryResponse;

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
    public UUID AddNewComic(ComicCreationRequest comicCreationRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UUID userId = principal.getId();

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

        newComic.setStoryTitle(comicCreationRequest.StoryTitle());
        newComic.setStoryline(comicCreationRequest.Storyline());
        newComic.setCharacters(comicCreationRequest.Characters());
        newComic.setMoral(comicCreationRequest.Moral());
        newComic.setLayoutImage(comicCreationRequest.LayoutImage());
        newComic.setPanelImages(comicCreationRequest.PanelImages());

        ComicCreation savedComic = comicCreationRepository.save(newComic);
        return savedComic.getId();
    }

    @Transactional
    public List<ComicSummaryResponse> getUserComics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UUID userId = principal.getId();

        return comicCreationRepository.findByAppUser_IdOrderByIdDesc(userId).stream()
            .map(c -> new ComicSummaryResponse(
                c.getId(),
                c.getStoryTitle(),
                c.getArtStyle(),
                c.getNumberOfPanels(),
                (c.getPanelImages() != null && !c.getPanelImages().isEmpty())
                    ? c.getPanelImages().get(0)
                    : c.getLayoutImage(),
                c.getGenerateComic()
            ))
            .toList();
    }

    @Transactional
    public ComicDetailResponse getComicDetail(UUID comicId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UUID userId = principal.getId();

        ComicCreation c = comicCreationRepository.findById(comicId)
            .orElseThrow(() -> new RuntimeException("Comic not found."));

        if (!c.getAppUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to view this comic.");
        }

        return new ComicDetailResponse(
            c.getId(), c.getStoryTitle(), c.getStoryline(), c.getCharacters(), c.getMoral(),
            c.getArtStyle(), c.getNumberOfPanels(), c.getPanelWidth(), c.getPanelHeight(),
            c.getLayoutImage(), c.getPanelImages()
        );
    }

}
