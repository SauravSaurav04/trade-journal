package com.example.trade_journal.controllers;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.services.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class TradeController {

    @Autowired
    TradeService tradeService;

    @PostMapping("/trades")
    @ResponseBody
    public ResponseEntity<?> saveTrade(@RequestBody Trade trade) {
        boolean savedTrade = tradeService.saveTrade(trade);
        if (savedTrade) {
            return ResponseEntity.ok("Trade saved");
        } else {
            return ResponseEntity.status(500).body("Failed to save trade");
        }
    }

    @GetMapping("/getDrafts")
    public List<Trade> getDraftTrades() {
        return tradeService.getDraftTrades();
    }

    @GetMapping("/getAllTrades")
    public List<Trade> getAllTrades(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return tradeService.getAllTrades(startDate, endDate);
        } else {
            return tradeService.getAllTrades();
        }
    }

}
