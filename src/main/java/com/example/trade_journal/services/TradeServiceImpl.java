package com.example.trade_journal.services;

import com.example.trade_journal.entities.Trade;
import com.example.trade_journal.repositories.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.time.LocalDate;
import java.util.List;

@Service
public class TradeServiceImpl implements TradeService {

    @Autowired
    TradeRepository tradeRepository;

    @Override
    @Caching(evict = {
            @CacheEvict(value = "trades", allEntries = true),
            @CacheEvict(value = "trade", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName() + '_' + #trade.id", condition = "#trade.id != null")
    })
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

        if (trade.getId() != null) {
            Trade existingTrade = tradeRepository.findById(trade.getId())
                    .orElseThrow(() -> new com.example.trade_journal.exception.ResourceNotFoundException("Trade", trade.getId()));

            if (!existingTrade.getUserEmail().equals(userEmail)) {
                throw new com.example.trade_journal.exception.ValidationException("You do not have permission to modify this trade");
            }

            // Merge media URLs if they are not provided in the update request
            if (trade.getEntryChartUrl() == null) {
                trade.setEntryChartUrl(existingTrade.getEntryChartUrl());
            }
            if (trade.getExitChartUrl() == null) {
                trade.setExitChartUrl(existingTrade.getExitChartUrl());
            }
            if (trade.getEntryVideoUrl() == null) {
                trade.setEntryVideoUrl(existingTrade.getEntryVideoUrl());
            }
            if (trade.getExitVideoUrl() == null) {
                trade.setExitVideoUrl(existingTrade.getExitVideoUrl());
            }
        }

        trade.setUserEmail(userEmail);
        tradeRepository.save(trade);
        return true;
    }

    @Override
    @Cacheable(value = "trades", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName() + '_' + #sort")
    public List<Trade> getAllTrades(String sort) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("asc".equalsIgnoreCase(sort)) {
            return tradeRepository.findByUserEmailAndStatusOrderByIdAsc(userEmail, "PUBLISHED");
        } else {
            return tradeRepository.findByUserEmailAndStatusOrderByIdDesc(userEmail, "PUBLISHED");
        }
    }

    @Override
    @Cacheable(value = "trades", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName() + '_' + #startDate + '_' + #endDate + '_' + #sort")
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
    @Cacheable(value = "trades", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName() + '_drafts'")
    public List<Trade> getDraftTrades() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return tradeRepository.findByUserEmailAndStatusOrderByIdDesc(userEmail, "DRAFT");
    }

    @Override
    @Cacheable(value = "trade", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName() + '_' + #id")
    public Trade getTradeById(Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new com.example.trade_journal.exception.ResourceNotFoundException("Trade", id));

        if (!trade.getUserEmail().equals(userEmail)) {
            throw new com.example.trade_journal.exception.ValidationException("You do not have permission to view this trade");
        }
        return trade;
    }
}
