package com.panelforge.panel_forge.Exception;

public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String email) {
        super(String.format("The email address '%s' is already registered.", email));
    }
}
