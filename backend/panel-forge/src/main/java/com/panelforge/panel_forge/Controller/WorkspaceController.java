package com.panelforge.panel_forge.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.panelforge.panel_forge.Model.Workspace;
import com.panelforge.panel_forge.Model.WorkspaceRepository;
import com.panelforge.panel_forge.Model.WorkspaceService;
import com.panelforge.panel_forge.Security.CustomUserPrincipal;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceRepository workspaceRepository, WorkspaceService workspaceService) {
        this.workspaceRepository=workspaceRepository;
        this.workspaceService=workspaceService;
    }

    @GetMapping("/user")
    public ResponseEntity<?> getMyWorkspace() {
        try {
            return ResponseEntity.ok(workspaceService.getMyWorkspace());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        
    }
    
    
}
