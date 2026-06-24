package com.panelforge.panel_forge.Exception;

public class InvalidCredentialsException extends RuntimeException{
    public InvalidCredentialsException() {
        super("Invalid email/username or password.");
    }
}
