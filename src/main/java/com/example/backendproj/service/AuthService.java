package com.example.backendproj.service;

import com.example.backend.pojo.LoginRequest;
import com.example.backend.pojo.RegisterRequest;
import com.example.backend.pojo.RegisterResponse;

public interface AuthService {
    RegisterResponse login(LoginRequest loginRequest);
    RegisterResponse register(RegisterRequest registerRequest); // Update this line
}
