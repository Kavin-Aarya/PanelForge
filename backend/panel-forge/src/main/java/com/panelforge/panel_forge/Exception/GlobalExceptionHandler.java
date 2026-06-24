package com.panelforge.panel_forge.Exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle Registration Conflicts (409 Conflict)
    // Instantiates ErrorResponse instead of an untyped Map
    @ExceptionHandler({EmailAlreadyExistsException.class, UserNameAlreadyExistsException.class})
    public ResponseEntity<ErrorResponse> handleRegistrationConflicts(RuntimeException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.CONFLICT.value(),
            "Registration Conflict",
            ex.getMessage(),
            request.getRequestURI(),
            null // No field validation map needed here
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // 2. Handle Bad Credentials (401 Unauthorized)
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "Authentication Failed",
            ex.getMessage(),
            request.getRequestURI(),
            null
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // 3. Handle Token Lifespan Expiry (401 Unauthorized)
    @ExceptionHandler(JwtTokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleExpiredToken(JwtTokenExpiredException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "Token Expired",
            ex.getMessage(),
            request.getRequestURI(),
            null
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // 4. Handle Corrupt/Malformed Tokens (401 Unauthorized)
    @ExceptionHandler(InvalidJwtTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidJwtTokenException ex, HttpServletRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "Invalid Token",
            ex.getMessage(),
            request.getRequestURI(),
            null
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
}
