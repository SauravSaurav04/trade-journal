package com.example.trade_journal.controllers;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.services.CloudinaryService;
import com.example.trade_journal.services.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
public class TradeController {

    @Autowired
    TradeService tradeService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping(value = "/trades", consumes = {"multipart/form-data"})
    @ResponseBody
    public ResponseEntity<?> saveTrade(@RequestPart("data") Trade trade,
                                       @RequestPart(value = "entryChartScreenshot", required = false) MultipartFile entryChartScreenshot,
                                       @RequestPart(value = "exitChartScreenshot", required = false) MultipartFile exitChartScreenshot,
                                       @RequestPart(value = "video", required = false) MultipartFile video) {

        if (entryChartScreenshot != null && !entryChartScreenshot.isEmpty()) {
            String entryUrl = cloudinaryService.uploadFile(entryChartScreenshot);
            trade.setEntryChartUrl(entryUrl);
        }

        if (exitChartScreenshot != null && !exitChartScreenshot.isEmpty()) {
            String exitUrl = cloudinaryService.uploadFile(exitChartScreenshot);
            trade.setExitChartUrl(exitUrl);
        }

        if (video != null && !video.isEmpty()) {
            String videoUrl = cloudinaryService.uploadFile(video);
            trade.setVideoUrl(videoUrl);
        }

        boolean savedTrade = tradeService.saveTrade(trade);
        if (savedTrade) {
            return ResponseEntity.ok("Trade saved");
        } else {
            return ResponseEntity.status(500).body("Failed to save trade");
        }
    }

    @GetMapping("/getAllTrades")
    public List<Trade> getAllTrades(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "sort", defaultValue = "desc") String sort) {
        if (startDate != null && endDate != null) {
            return tradeService.getAllTrades(startDate, endDate, sort);
        } else {
            return tradeService.getAllTrades(sort);
        }
    }

    @GetMapping("/getDrafts")
    public List<Trade> getDraftTrades() {
        return tradeService.getDraftTrades();
    }
}
