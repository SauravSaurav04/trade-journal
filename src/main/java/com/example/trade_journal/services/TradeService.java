package com.example.trade_journal.services;

import com.example.trade_journal.entities.Trade;

import java.time.LocalDate;
import java.util.List;

public interface TradeService {

    boolean saveTrade(Trade trade);

    List<Trade> getAllTrades();

    List<Trade> getAllTrades(LocalDate startDate, LocalDate endDate);
}
