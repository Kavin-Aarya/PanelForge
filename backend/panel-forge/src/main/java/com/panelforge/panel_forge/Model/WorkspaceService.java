package com.panelforge.panel_forge.Model;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.panelforge.panel_forge.Security.CustomUserPrincipal;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository appUserRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, AppUserRepository appUserRepository) {
        this.workspaceRepository=workspaceRepository;
        this.appUserRepository=appUserRepository;
    }

    @Transactional
    public void deductCredits() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        UUID userId = principal.getId();

    }


    
}
