package com.panelforge.panel_forge.Exception;

public class UserNameAlreadyExistsException extends RuntimeException{
    public UserNameAlreadyExistsException(String username) {
        super(String.format("The username '%s' is already taken.", username));
    }
    
}
