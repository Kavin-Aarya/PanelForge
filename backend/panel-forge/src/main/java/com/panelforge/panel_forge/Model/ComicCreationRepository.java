package com.panelforge.panel_forge.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicCreationRepository extends JpaRepository <ComicCreation,Long>{
    
}
