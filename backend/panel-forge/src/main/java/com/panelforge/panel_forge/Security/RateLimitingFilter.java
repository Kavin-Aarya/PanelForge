package com.panelforge.panel_forge.Security;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitingService rateLimitingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // ◄ getServletPath() guarantees an exact match regardless of server configuration
        String path = request.getServletPath(); 
        
        // PRINT LOG: See exactly what path your backend is receiving
        System.out.println("DEBUG: RateLimitingFilter evaluating path -> " + path);

        if (path.startsWith("/api/auth")) {
            String clientIp = getClientIp(request);
            Bucket bucket = rateLimitingService.resolveBucket(clientIp);

            System.out.println("DEBUG: [IP: " + clientIp + "] Tokens remaining: " + bucket.getAvailableTokens());

            // Try to consume 1 token from the bucket
            if (!bucket.tryConsume(1)) {
                System.out.println("⚠️ [RATE LIMIT TRIGGERED] Blocking request from IP: " + clientIp);
                
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // HTTP 429
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Too many requests. Please try again in a minute.\"}");
                return; // ◄ STOP the execution chain immediately
            }
        }

        // Continue to the next filter/controller if everything is fine
        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}