package com.panelforge.panel_forge.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import com.panelforge.panel_forge.Exception.UserNameNotFoundException;
import com.panelforge.panel_forge.Model.AppUser;
import com.panelforge.panel_forge.Model.AppUserRepository;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    @Lazy
    private AppUserRepository appUserRepository;

    @Autowired
    @Qualifier("handlerExceptionResolver")
    private HandlerExceptionResolver resolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final Long userId;

        // Skip filter if there's no Bearer token in headers
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7);
            userId= jwtService.extractUserId(jwt);

            // If userId is extracted but user isn't authenticated yet in security state context
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                AppUser appUser = appUserRepository.findById(userId)
                        .orElseThrow(() -> new UserNameNotFoundException("No user found for id: " + userId));
                CustomUserPrincipal principal = new CustomUserPrincipal(appUser);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Formally authorize request in Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception ex) {
            // Forward exception directly into our GlobalExceptionHandler advice
            resolver.resolveException(request, response, null, ex);
        }
    }
}