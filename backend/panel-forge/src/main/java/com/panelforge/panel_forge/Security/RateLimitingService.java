package com.panelforge.panel_forge.Security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;

/**
 * Rate limits are split by operation type rather than one shared bucket
 * for all of /api/auth/**. Login and token refresh are routine,
 * frequent, legitimate operations — many real users behind the same IP
 * (offices, NAT, shared wifi) should be able to log in concurrently
 * without locking each other out. Registration is the endpoint most
 * worth protecting against abuse (fake account creation), so it keeps
 * a stricter limit.
 *
 * Buckets are stored in plain ConcurrentHashMaps (no extra dependency).
 * Each entry tracks its own last-access time; a scheduled sweep evicts
 * anything untouched for a while, so a long-running deployment doesn't
 * accumulate one permanent entry per distinct IP forever.
 */
@Service
public class RateLimitingService {

    private static final Duration IDLE_EVICTION_THRESHOLD = Duration.ofMinutes(10);

    /**
     * Plain holder class instead of a record — record components are
     * implicitly final with no modifiers allowed, but we need the
     * last-access timestamp to be mutable (and thread-safe) so it can
     * be "touched" on every request without replacing the whole entry.
     */
    private static final class TrackedBucket {
        private final Bucket bucket;
        private final AtomicReference<Instant> lastAccess;

        TrackedBucket(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccess = new AtomicReference<>(Instant.now());
        }

        Bucket bucket() {
            return bucket;
        }

        Instant lastAccess() {
            return lastAccess.get();
        }

        void touch() {
            lastAccess.set(Instant.now());
        }
    }

    // Login + refresh: generous — these are routine, frequent,
    // legitimate operations. 30 requests/min/IP comfortably covers
    // many concurrent users (or token refreshes) behind a shared IP
    // without being a meaningful abuse vector.
    private final Map<String, TrackedBucket> loginBuckets = new ConcurrentHashMap<>();

    // Registration: stricter — the main thing actually worth throttling
    // to prevent fake-account spam. Raised from 5/min to 10/min, which
    // still meaningfully limits abuse while giving real concurrent
    // sign-ups room to succeed.
    private final Map<String, TrackedBucket> registerBuckets = new ConcurrentHashMap<>();

    private Bucket newLoginBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(30)
                .refillIntervally(30, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket newRegisterBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    public Bucket resolveLoginBucket(String ipAddress) {
        return resolve(loginBuckets, ipAddress, this::newLoginBucket);
    }

    public Bucket resolveRegisterBucket(String ipAddress) {
        return resolve(registerBuckets, ipAddress, this::newRegisterBucket);
    }

    private Bucket resolve(Map<String, TrackedBucket> map, String key, Supplier<Bucket> factory) {
        TrackedBucket tracked = map.computeIfAbsent(key, k -> new TrackedBucket(factory.get()));
        tracked.touch();
        return tracked.bucket();
    }

    /**
     * Runs every 10 minutes, removing any IP bucket that hasn't been
     * touched in over IDLE_EVICTION_THRESHOLD. Keeps both maps bounded
     * for a long-running deployment instead of growing forever.
     */
    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void evictStaleBuckets() {
        Instant cutoff = Instant.now().minus(IDLE_EVICTION_THRESHOLD);
        loginBuckets.entrySet().removeIf(e -> e.getValue().lastAccess().isBefore(cutoff));
        registerBuckets.entrySet().removeIf(e -> e.getValue().lastAccess().isBefore(cutoff));
    }
}