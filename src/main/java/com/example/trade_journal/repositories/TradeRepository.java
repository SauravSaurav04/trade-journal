package com.example.trade_journal.repositories;

import com.example.trade_journal.entities.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByUserEmailAndStatusOrderByIdDesc(String userEmail, String status);

    List<Trade> findByUserEmailAndStatusAndTradeDateBetweenOrderByIdDesc(String userEmail, String status,
                                                                         LocalDate startDate,
                                                                         LocalDate endDate);

    List<Trade> findByUserEmailAndStatusOrderByIdAsc(String userEmail, String status);

    List<Trade> findByUserEmailAndStatusAndTradeDateBetweenOrderByIdAsc(String userEmail, String status,
                                                                        LocalDate startDate,
                                                                        LocalDate endDate);
}
