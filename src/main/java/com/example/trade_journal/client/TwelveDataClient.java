package com.example.trade_journal.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
public class TwelveDataClient {

    @Autowired
    @Qualifier("twelveDataWebClient")
    private WebClient twelveDataWebClient;

    @Value("${api.key}")
    private String API_KEY;

    public JsonNode getExchangePrice(String from, String to) {
        return twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/price")
                        .queryParam("symbol", from + "/" + to)
                        .queryParam("apikey", API_KEY)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .doOnSuccess(response -> log.info("Successfully retrieved exchange price: {}", response))
                .doOnError(error -> log.error("Failed to retrieve exchange price. Error: {}", error.getMessage()))
                .block();
    }

    public JsonNode getEMAValue(String symbol, int timePeriod, String interval) {
        return twelveDataWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/ema")
                        .queryParam("symbol", symbol)
                        .queryParam("interval", interval)
                        .queryParam("time_period", timePeriod)
                        .queryParam("apikey", API_KEY)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .doOnSuccess(response -> log.info("Successfully retrieved EMA value: {}", response))
                .doOnError(error -> log.error("Failed to retrieve EMA value. Error: {}", error.getMessage()))
                .block();
    }
}