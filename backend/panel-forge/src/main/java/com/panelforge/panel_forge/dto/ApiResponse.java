package com.panelforge.panel_forge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL) // Hides fields if they are null
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,                                // Can be a List, an Object, or null
    LocalDateTime timestamp
) {
    // Convenience constructor for simple success messages without data
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null, LocalDateTime.now());
    }

    // Convenience constructor for returning actual rich payload data
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }
}
