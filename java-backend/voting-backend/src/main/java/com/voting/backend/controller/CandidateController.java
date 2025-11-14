package com.voting.backend.controller;

import com.voting.backend.entity.Candidate;
import com.voting.backend.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping
    public ResponseEntity<List<Candidate>> list() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        Candidate c = new Candidate();
        c.setName(body.get("name"));
        c.setParty(body.get("party"));
        c.setDescription(body.get("description"));
        candidateRepository.save(c);
        return ResponseEntity.ok(Map.of("message", "Candidate created", "id", c.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        candidateRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
