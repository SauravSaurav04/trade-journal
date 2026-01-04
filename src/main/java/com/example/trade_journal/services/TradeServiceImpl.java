package com.example.trade_journal.services;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.repositories.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TradeServiceImpl implements TradeService {

    @Autowired
    TradeRepository tradeRepository;

    @Override
    public boolean saveTrade(Trade trade) {

        if (trade.getInstrument().equals("Other")) {
            trade.setInstrument(trade.getOtherInstrument());
        }
        if (trade.getQuantity().equals("Other")) {
            trade.setQuantity(trade.getOtherQuantity());
        }
        if (trade.getRisk().equals("Other")) {
            trade.setRisk(trade.getOtherRisk());
        }
        if (trade.getReward() != null && trade.getReward().equals("Other")) {
            trade.setReward(trade.getOtherReward());
        }
        if (trade.getStrategy() != null && trade.getStrategy().equals("Other")) {
            trade.setStrategy(trade.getOtherStrategy());
        }

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        trade.setUserEmail(userEmail);
        tradeRepository.save(trade);
        return true;
    }

    @Override
    public List<Trade> getAllTrades(String sort) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("asc".equalsIgnoreCase(sort)) {
            return tradeRepository.findByUserEmailAndStatusOrderByIdAsc(userEmail, "PUBLISHED");
        } else {
            return tradeRepository.findByUserEmailAndStatusOrderByIdDesc(userEmail, "PUBLISHED");
        }
    }

    @Override
    public List<Trade> getAllTrades(LocalDate startDate, LocalDate endDate, String sort) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (startDate != null && endDate != null) {
            if ("asc".equalsIgnoreCase(sort)) {
                return tradeRepository.findByUserEmailAndStatusAndTradeDateBetweenOrderByIdAsc(userEmail, "PUBLISHED",
                        startDate, endDate);
            } else {
                return tradeRepository.findByUserEmailAndStatusAndTradeDateBetweenOrderByIdDesc(userEmail, "PUBLISHED",
                        startDate, endDate);
            }
        } else {
            return getAllTrades(sort);
        }
    }

    @Override
    public List<Trade> getDraftTrades() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return tradeRepository.findByUserEmailAndStatusOrderByIdDesc(userEmail, "DRAFT");
    }
}
