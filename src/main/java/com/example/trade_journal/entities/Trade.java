package com.example.trade_journal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@Entity
@Builder
@Table(name = "TEMP_TRADE_INFO")
@AllArgsConstructor
@NoArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tradeDate;
    private String instrument;
    private String otherInstrument;
    private String tradeType;

    private String quantity;
    private String otherQuantity;

    private String risk;
    private String otherRisk;

    private String reward;
    private String otherReward;

    private String strategy;
    private String otherStrategy;

    private String entryReason;
    private String exitReason;

    private Double pnl;
    private String emotion;
    private String mistakes;

    private Integer entrySetup;
    private Integer exitDiscipline;
    private Integer correctQuantity;
    private Integer calculatedRisk;
    private Integer emotionDiscipline;

    private String notes;

    private String status;

    private String entryChartUrl;
    private String exitChartUrl;

    private String entryVideoUrl;
    private String exitVideoUrl;

}
