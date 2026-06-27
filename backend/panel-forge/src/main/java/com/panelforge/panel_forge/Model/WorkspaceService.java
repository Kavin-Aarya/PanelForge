package com.panelforge.panel_forge.Model;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.panelforge.panel_forge.Security.CustomUserPrincipal;
import com.panelforge.panel_forge.dto.ComicCreationRequest;
import com.panelforge.panel_forge.dto.WorkspaceResponse;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository appUserRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, AppUserRepository appUserRepository) {
        this.workspaceRepository=workspaceRepository;
        this.appUserRepository=appUserRepository;
    }

    @Transactional
    public void deductCredits(UUID id, ComicCreationRequest comicCreationRequest) {
        Workspace workspace = workspaceRepository.findById(id).orElseThrow(() -> new RuntimeException("Workspace profile not found."));

        int panels = comicCreationRequest.NumberOfPanels();
        int width = comicCreationRequest.PanelWidth();
        int height = comicCreationRequest.PanelHeight();
        int steps = comicCreationRequest.QualitySteps();
        int guidance = comicCreationRequest.GuidanceScale();

        // Base cost: 5 credits per panel
        double basePanelCost = 5.0;

        // Resolution Multiplier (Normalized against standard 512x512 resolution)
        double resolutionFactor = (double) (width * height) / (512 * 512);

        // Quality Steps Multiplier (Normalized against a standard 20-step generation)
        double stepsFactor = (double) steps / 20.0;

        // Guidance Scale Modifier (Add a slight premium if guidance intensity is ultra-high)
        double guidanceFactor = guidance > 12 ? 1.2 : 1.0;

        // Calculate final cost (using Math.ceil to avoid charging partial credits)
        int creditCost = (int) Math.ceil(panels * basePanelCost * resolutionFactor * stepsFactor * guidanceFactor);

        // Safety fallback: Ensure a comic never costs less than 1 credit
        if (creditCost < 1) {
            creditCost = 1;
        }

        // Fail fast if they cannot afford it
        if (workspace.getRemainingCredits() < creditCost) {
            throw new RuntimeException("Insufficient credits! This complex request requires " + creditCost + " credits.");
        }

        // 4. Update the records securely[cite: 7]
        workspace.setRemainingCredits(workspace.getRemainingCredits() - creditCost);
        workspace.setPanelsGenerated(workspace.getPanelsGenerated() + panels);
        workspace.setComicsCreated(workspace.getComicsCreated() + 1);

        workspaceRepository.save(workspace);
    }

    private UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        return principal.getId();
    }

    @Transactional
    public WorkspaceResponse getMyWorkspace() {
        UUID userId = currentUserId();
        Workspace workspace = workspaceRepository.findById(userId) .orElseThrow(() -> new RuntimeException("Workspace not found for current user." ));
        return new WorkspaceResponse(
            workspace.getComicsCreated(),
            workspace.getPanelsGenerated(),
            workspace.getAvgQuality(),
            workspace.getCreatorPlan(),
            workspace.getRemainingCredits()
        );
    }


    
}
