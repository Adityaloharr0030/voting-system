package com.voting.backend.controller;

import com.voting.backend.entity.Candidate;
import com.voting.backend.entity.User;
import com.voting.backend.repository.CandidateRepository;
import com.voting.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @PostMapping
    public ResponseEntity<?> castVote(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        Long candidateId = body.get("candidateId");

        User user = userRepository.findById(userId).orElse(null);
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);

        if (user == null || candidate == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid user or candidate"));
        }

        if (user.isHasVoted()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User already voted"));
        }

        candidate.setVotes(candidate.getVotes() + 1);
        candidateRepository.save(candidate);

        user.setHasVoted(true);
        user.setVotedForCandidateId(candidateId);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Vote cast"));
    }
}
