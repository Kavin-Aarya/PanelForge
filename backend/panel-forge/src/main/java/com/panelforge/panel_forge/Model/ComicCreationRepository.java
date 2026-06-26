package com.panelforge.panel_forge.Model;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicCreationRepository extends JpaRepository<ComicCreation, UUID> {
    List<ComicCreation> findByAppUser_IdOrderByIdDesc(UUID userId);
}
