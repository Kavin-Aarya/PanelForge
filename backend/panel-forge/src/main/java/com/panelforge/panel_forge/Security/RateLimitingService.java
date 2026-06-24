package com.panelforge.panel_forge.Security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimitingService {
    private final Map<String,Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // Limit: 5 requests maximum, refilling at a rate of 5 tokens every 1 minute
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
    public Bucket resolveBucket(String ipAddress) {
        // If the IP doesn't exist in the cache, map it to a brand new bucket configuration
        return cache.computeIfAbsent(ipAddress, k -> createNewBucket());
    }
    
    
}
