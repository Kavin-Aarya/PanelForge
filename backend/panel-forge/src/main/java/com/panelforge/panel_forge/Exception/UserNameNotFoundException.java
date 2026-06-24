package com.panelforge.panel_forge.Exception;

public class UserNameNotFoundException extends RuntimeException{
    public UserNameNotFoundException(String username) {
        super("User handle not found: " + username);
    }
    
}
