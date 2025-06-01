package com.example.trade_journal.services;

import java.util.List;

public interface ScannerService {
    List<String> scanStocks(String interval, double threshold, int ema);
}
