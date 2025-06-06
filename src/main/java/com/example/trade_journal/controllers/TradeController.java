package com.example.trade_journal.controllers;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.services.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/getAllTrades")
    public List<Trade> getAllTrades() {
        return tradeService.getAllTrades();
    }

}
