package com.panelforge.panel_forge.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.panelforge.panel_forge.Model.ComicCreationRepository;
import com.panelforge.panel_forge.Model.ComicCreationService;
import com.panelforge.panel_forge.dto.ApiResponse;
import com.panelforge.panel_forge.dto.ComicCreationRequest;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/comics")
public class ComicCreationController {

    private final ComicCreationRepository comicCreationRepository;
    private final ComicCreationService comicCreationService;

    public ComicCreationController (ComicCreationRepository comicCreationRepository, ComicCreationService comicCreationService) {
        this.comicCreationRepository=comicCreationRepository;
        this.comicCreationService=comicCreationService;
    }


    @PostMapping("/save")
    public ResponseEntity<?> createComic(@Valid @RequestBody ComicCreationRequest comicCreationRequest) {
        try {
            Long newComicId = comicCreationService.AddNewComic(comicCreationRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comic initialization completed successfully", newComicId));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        
    }
    
    
}
