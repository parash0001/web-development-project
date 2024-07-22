package com.example.backendproj.response;



import lombok.*;

@Data
@NoArgsConstructor

@Getter
@Setter
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;

    // Constructor with success, data, and message
    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }
}
