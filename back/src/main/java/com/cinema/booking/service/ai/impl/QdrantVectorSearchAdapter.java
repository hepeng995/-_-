package com.cinema.booking.service.ai.impl;

import com.cinema.booking.config.AiVectorProperties;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.ContentMetadata;
import io.qdrant.client.ConditionFactory;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.WithPayloadSelectorFactory;
import io.qdrant.client.WithVectorsSelectorFactory;
import io.qdrant.client.grpc.Common;
import io.qdrant.client.grpc.JsonWithInt;
import io.qdrant.client.grpc.Points;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
@RequiredArgsConstructor
public class QdrantVectorSearchAdapter {

    static final String PAYLOAD_TEXT_KEY = "text_segment";
    private static final long DEFAULT_TIMEOUT_SECONDS = 15L;

    private final QdrantClient qdrantClient;
    private final EmbeddingModel embeddingModel;
    private final AiVectorProperties aiVectorProperties;

    private final AtomicBoolean vectorSearchEnabled = new AtomicBoolean(true);
    private final AtomicReference<String> disabledReason = new AtomicReference<>();

    public void enableVectorSearch() {
        vectorSearchEnabled.set(true);
        disabledReason.set(null);
    }

    public void disableVectorSearch(String reason) {
        vectorSearchEnabled.set(false);
        disabledReason.set(reason);
        log.warn("【向量检索】已禁用。原因：{}", reason);
    }

    public boolean isVectorSearchEnabled() {
        return vectorSearchEnabled.get();
    }

    public String getDisabledReason() {
        return disabledReason.get();
    }

    public int getQueryVectorDimension(String query) {
        return embedQuery(query).vector().length;
    }

    public List<Content> search(String userQuestion, String type, int topK) throws Exception {
        if (!vectorSearchEnabled.get()) {
            log.info("【向量检索】当前已禁用，跳过向量召回。原因：{}", disabledReason.get());
            return List.of();
        }

        Embedding queryEmbedding = embedQuery(userQuestion);
        Points.SearchPoints request = Points.SearchPoints.newBuilder()
                .setCollectionName(aiVectorProperties.getKnowledgeCollection())
                .addAllVector(queryEmbedding.vectorAsList())
                .setWithPayload(WithPayloadSelectorFactory.enable(true))
                .setWithVectors(WithVectorsSelectorFactory.enable(true))
                .setFilter(Common.Filter.newBuilder()
                        .addMust(ConditionFactory.matchKeyword("type", type))
                        .build())
                .setLimit(topK)
                .setScoreThreshold(aiVectorProperties.getVectorMinScore())
                .build();

        List<Points.ScoredPoint> points = qdrantClient.searchAsync(request)
                .get(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);

        List<Content> results = new ArrayList<>();
        for (Points.ScoredPoint point : points) {
            try {
                Content content = toContent(point);
                if (content != null) {
                    results.add(content);
                }
            } catch (Exception e) {
                log.warn("【向量检索】跳过异常结果点，pointId={}", safePointId(point), e);
            }
        }
        return results;
    }

    private Embedding embedQuery(String query) {
        var response = embeddingModel.embed(query);
        if (response == null || response.content() == null || response.content().vector() == null) {
            throw new IllegalStateException("嵌入模型未返回有效向量");
        }

        Embedding embedding = response.content();
        int actualDimension = embedding.vector().length;
        if (actualDimension != aiVectorProperties.getKnowledgeVectorSize()) {
            throw new IllegalStateException(String.format(
                    "查询向量维度异常，期望=%d，实际=%d",
                    aiVectorProperties.getKnowledgeVectorSize(),
                    actualDimension
            ));
        }
        return embedding;
    }

    Content toContent(Points.ScoredPoint point) {
        extractStoredEmbedding(point);

        String text = extractText(point.getPayloadMap());
        if (text == null || text.isBlank()) {
            log.warn("【向量检索】结果点缺少文本内容，pointId={}", safePointId(point));
            return null;
        }

        Metadata metadata = Metadata.from(toMetadataMap(point.getPayloadMap()));
        TextSegment segment = TextSegment.from(text, metadata);
        Map<ContentMetadata, Object> contentMetadata = new EnumMap<>(ContentMetadata.class);
        contentMetadata.put(ContentMetadata.SCORE, (double) point.getScore());
        return Content.from(segment, contentMetadata);
    }

    static Embedding extractStoredEmbedding(Points.ScoredPoint point) {
        List<Float> vectorData = extractVectorValues(point.getVectors().getVector());
        return Embedding.from(vectorData);
    }

    static List<Float> extractVectorValues(Points.VectorOutput vectorOutput) {
        List<Float> denseValues = vectorOutput.getDense().getDataList();
        if (!denseValues.isEmpty()) {
            return denseValues;
        }

        List<Float> legacyValues = vectorOutput.getDataList();
        if (!legacyValues.isEmpty()) {
            return legacyValues;
        }

        throw new IllegalStateException("Qdrant 返回了空向量，无法参与检索");
    }

    private static String extractText(Map<String, JsonWithInt.Value> payloadMap) {
        Object value = unwrapValue(payloadMap.get(PAYLOAD_TEXT_KEY));
        return value == null ? null : String.valueOf(value);
    }

    private static Map<String, Object> toMetadataMap(Map<String, JsonWithInt.Value> payloadMap) {
        Map<String, Object> metadataMap = new LinkedHashMap<>();
        payloadMap.forEach((key, value) -> {
            if (PAYLOAD_TEXT_KEY.equals(key)) {
                return;
            }
            Object unwrapped = unwrapValue(value);
            if (unwrapped != null) {
                metadataMap.put(key, unwrapped);
            }
        });
        return metadataMap;
    }

    private static Object unwrapValue(JsonWithInt.Value value) {
        if (value == null) {
            return null;
        }

        return switch (value.getKindCase()) {
            case STRING_VALUE -> value.getStringValue();
            case INTEGER_VALUE -> value.getIntegerValue();
            case DOUBLE_VALUE -> value.getDoubleValue();
            case BOOL_VALUE -> value.getBoolValue();
            case LIST_VALUE -> value.getListValue().getValuesList().stream()
                    .map(QdrantVectorSearchAdapter::unwrapValue)
                    .filter(Objects::nonNull)
                    .toList();
            case STRUCT_VALUE -> {
                Map<String, Object> map = new LinkedHashMap<>();
                value.getStructValue().getFieldsMap().forEach((key, nestedValue) -> {
                    Object nested = unwrapValue(nestedValue);
                    if (nested != null) {
                        map.put(key, nested);
                    }
                });
                yield map;
            }
            case NULL_VALUE, KIND_NOT_SET -> null;
        };
    }

    private static String safePointId(Points.ScoredPoint point) {
        if (point == null || !point.hasId()) {
            return "UNKNOWN";
        }
        if (point.getId().hasUuid()) {
            return point.getId().getUuid();
        }
        if (point.getId().hasNum()) {
            return String.valueOf(point.getId().getNum());
        }
        return "UNKNOWN";
    }
}
