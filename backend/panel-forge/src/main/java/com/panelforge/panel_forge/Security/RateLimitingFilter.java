package com.panelforge.panel_forge.Security;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    @Autowired
    private RateLimitingService rateLimitingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        log.debug("RateLimitingFilter evaluating path -> {}", path);

        Bucket bucket = resolveBucketForPath(path, request);

        if (bucket != null && !bucket.tryConsume(1)) {
            log.warn("Rate limit triggered for IP [{}] on path [{}]", getClientIp(request), path);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again in a minute.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket resolveBucketForPath(String path, HttpServletRequest request) {
        if (!path.startsWith("/api/auth")) {
            return null;
        }

        String clientIp = getClientIp(request);

        if (path.equals("/api/auth/register")) {
            return rateLimitingService.resolveRegisterBucket(clientIp);
        }

        return rateLimitingService.resolveLoginBucket(clientIp);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}