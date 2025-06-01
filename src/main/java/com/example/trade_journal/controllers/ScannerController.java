package com.example.trade_journal.controllers;

import com.example.trade_journal.services.ScannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ScannerController {

    @Autowired
    ScannerService scannerService;

    @GetMapping("/scanner")
    public ResponseEntity<List<String>> scan(
            @RequestParam String interval,
            @RequestParam double threshold,
            @RequestParam int ema) {
        List<String> result = scannerService.scanStocks(interval, threshold, ema);
        return ResponseEntity.ok(result);
    }

}
