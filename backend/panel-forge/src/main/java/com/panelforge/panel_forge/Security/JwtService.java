package com.panelforge.panel_forge.Security;

import org.springframework.stereotype.Service;

import com.panelforge.panel_forge.Exception.InvalidJwtTokenException;
import com.panelforge.panel_forge.Exception.JwtTokenExpiredException;
import com.panelforge.panel_forge.Model.AppUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;

@Service
public class JwtService {
    
    @Value("${jwt.secret.access}")
    private String accessSecret;

    @Value("${jwt.secret.refresh}")
    private String refreshSecret;

    // 15 minutes for access tokens
    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 15;

    // 7 days for refresh tokens
    private static final long REFRESH_TOKEN_EXPIRATION = 1000 * 60 * 60 * 24 * 7;

    public String generateAccessToken(AppUser savedUser) {
        return buildToken(new HashMap<>(), savedUser, ACCESS_TOKEN_EXPIRATION, getSignInKey(accessSecret));
    }

    public String generateRefreshToken(AppUser savedUser) {
        return buildToken(new HashMap<>(), savedUser, REFRESH_TOKEN_EXPIRATION, getSignInKey(refreshSecret));
    }

    private String buildToken(Map<String,Object> extraClaims, AppUser savedUser, long expiration, SecretKey key) {
        return Jwts.builder()
        .claims(extraClaims)
        .subject(String.valueOf(savedUser.getId()))
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(key)
        .compact();
    }

    public UUID extractUserId(String token) {
        String subject = extractClaim(token, Claims::getSubject, getSignInKey(accessSecret));
        return UUID.fromString(subject);
    }

    public UUID extractRefreshUserId(String token) {
        String subject = extractClaim(token, Claims::getSubject, getSignInKey(refreshSecret));
        return UUID.fromString(subject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, SecretKey key) {
        final Claims claims = extractAllClaims(token, key);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, SecretKey key) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            throw new JwtTokenExpiredException("Your session has expired. Please log in again.");
        } catch (Exception ex) {
            throw new InvalidJwtTokenException("The authentication token is malformed or invalid.");
        }
    }

    private SecretKey getSignInKey(String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
