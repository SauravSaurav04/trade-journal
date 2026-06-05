package com.example.trade_journal.controllers;

import com.example.trade_journal.models.AuthResponse;
import com.example.trade_journal.models.LoginRequest;
import com.example.trade_journal.models.UserDto;
import com.example.trade_journal.services.CustomUserDetailsService;
import com.example.trade_journal.services.UserService;
import com.example.trade_journal.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(loginRequest.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto) {
        boolean created = userService.register(userDto);
        if (created) {
            return ResponseEntity.ok("User registered successfully");
        } else {
            return ResponseEntity.status(409).body("User already exists");
        }
    }

    @GetMapping("/getUserDetails")
    public ResponseEntity<UserDto> getUserDetails() {
        UserDto userDetails = userService.getCurrentUserDetails();
        if (userDetails != null) {
            return ResponseEntity.ok(userDetails);
        } else {
            return ResponseEntity.status(404).build();
        }
    }
}
