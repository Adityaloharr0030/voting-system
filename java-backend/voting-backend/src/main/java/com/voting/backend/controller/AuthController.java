package com.voting.backend.controller;

import com.voting.backend.entity.User;
import com.voting.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("fullName");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "User registered");
        resp.put("id", user.getId());

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Login successful");
        resp.put("id", user.getId());
        resp.put("username", user.getUsername());
        resp.put("isAdmin", user.isAdmin());

        return ResponseEntity.ok(resp);
    }
}
