package com.example.trade_journal.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
@Table(name = "TRADES_INFO")
@AllArgsConstructor
@NoArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    @NotNull(message = "Trade date is required")
    @PastOrPresent(message = "Trade date cannot be in the future")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tradeDate;

    @NotBlank(message = "Instrument is required")
    @Size(max = 100, message = "Instrument name must not exceed 100 characters")
    private String instrument;

    private String otherInstrument;

    @NotBlank(message = "Trade type is required")
    @Pattern(regexp = "BUY|SELL", message = "Trade type must be BUY or SELL")
    private String tradeType;

    @NotBlank(message = "Quantity is required")
    @Size(max = 50, message = "Quantity must not exceed 50 characters")
    private String quantity;

    private String otherQuantity;

    @NotBlank(message = "Risk is required")
    @Size(max = 50, message = "Risk must not exceed 50 characters")
    private String risk;

    private String otherRisk;

    @Size(max = 50, message = "Reward must not exceed 50 characters")
    private String reward;

    private String otherReward;

    @Size(max = 100, message = "Strategy must not exceed 100 characters")
    private String strategy;

    private String otherStrategy;

    @Size(max = 1000, message = "Entry reason must not exceed 1000 characters")
    private String entryReason;

    @Size(max = 1000, message = "Exit reason must not exceed 1000 characters")
    private String exitReason;

    @NotNull(message = "P/L is required")
    private Double pnl;

    @NotBlank(message = "Emotional status is required")
    @Size(max = 50, message = "Emotional status must not exceed 50 characters")
    private String emotion;

    @Size(max = 1000, message = "Mistakes must not exceed 1000 characters")
    private String mistakes;

    @NotNull(message = "Entry setup score is required")
    @Min(value = -1, message = "Entry setup score must be -1 or 1")
    @Max(value = 1, message = "Entry setup score must be -1 or 1")
    private Integer entrySetup;

    @NotNull(message = "Exit discipline score is required")
    @Min(value = -1, message = "Exit discipline score must be -1 or 1")
    @Max(value = 1, message = "Exit discipline score must be -1 or 1")
    private Integer exitDiscipline;

    @NotNull(message = "Correct quantity score is required")
    @Min(value = -1, message = "Correct quantity score must be -1 or 1")
    @Max(value = 1, message = "Correct quantity score must be -1 or 1")
    private Integer correctQuantity;

    @NotNull(message = "Calculated risk score is required")
    @Min(value = -1, message = "Calculated risk score must be -1 or 1")
    @Max(value = 1, message = "Calculated risk score must be -1 or 1")
    private Integer calculatedRisk;

    @NotNull(message = "Emotion discipline score is required")
    @Min(value = -1, message = "Emotion discipline score must be -1 or 1")
    @Max(value = 1, message = "Emotion discipline score must be -1 or 1")
    private Integer emotionDiscipline;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    private String status;

    private String entryChartUrl;
    private String exitChartUrl;

    private String entryVideoUrl;
    private String exitVideoUrl;

}
