package com.example.trade_journal.services;

import com.example.trade_journal.client.TwelveDataClient;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScannerServiceImpl implements ScannerService {

    @Autowired
    TwelveDataClient twelveDataClient;

    @Override
    public List<String> scanStocks(String interval, double threshold, int ema) {
        List<String> nearEmaStocks = new ArrayList<>();
        List<String> symbols = List.of("XAU/USD", "BTC/USD", "USD/CAD", "USD/JPY");

        for (String symbol : symbols) {
            try {
                String from = symbol.split("/")[0];
                String to = symbol.split("/")[1];
                JsonNode exchangePrice = twelveDataClient.getExchangePrice(from, to);
                double price = 0.0;
                if (exchangePrice != null && exchangePrice.has("price")) {
                    price = Double.parseDouble(exchangePrice.get("price").asText());
                }

                JsonNode emaValue = twelveDataClient.getEMAValue(symbol, ema, interval);
                double emaV = 0.0;
                if (emaValue.get("values").get(0).has("ema")) {
                    emaV = Double.parseDouble(emaValue.get("values").get(0).get("ema").asText());
                }

                if (isNearEMA(price, emaV, threshold)) {
                    nearEmaStocks.add(symbol);
                }
            } catch (Exception e) {
                System.err.println("Error processing symbol: " + symbol + " - " + e.getMessage());
            }
        }

        return nearEmaStocks;
    }

    private boolean isNearEMA(double price, double ema, double threshold) {
        double lowerBound = ema * (1 - threshold / 100);
        double upperBound = ema * (1 + threshold / 100);
        return price >= lowerBound && price <= upperBound;
    }
}
