package com.panelforge.panel_forge.Exception;

public class JwtTokenExpiredException extends RuntimeException{
    public JwtTokenExpiredException(String message) {
        super(message);
    } 
}
