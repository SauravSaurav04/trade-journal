package com.example.trade_journal.services;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.repositories.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
    public List<Trade> getAllTrades() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return tradeRepository.findByUserEmail(userEmail);
    }
}
