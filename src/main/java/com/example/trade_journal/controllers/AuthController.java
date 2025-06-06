package com.example.trade_journal.controllers;

import com.example.trade_journal.models.UserDto;
import com.example.trade_journal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto userDto) {
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
