package com.cinema.booking.service.ai.impl;

import com.cinema.booking.config.AiVectorProperties;
import com.google.common.util.concurrent.Futures;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.ContentMetadata;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.ValueFactory;
import io.qdrant.client.grpc.Common;
import io.qdrant.client.grpc.Points;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class QdrantVectorSearchAdapterTest {

    @Test
    void extractVectorValuesSupportsDenseVectorOutput() {
        Points.VectorOutput vectorOutput = Points.VectorOutput.newBuilder()
                .setDense(Points.DenseVector.newBuilder()
                        .addData(0.1F)
                        .addData(0.2F)
                        .addData(0.3F)
                        .build())
                .build();

        List<Float> vectorValues = QdrantVectorSearchAdapter.extractVectorValues(vectorOutput);

        assertEquals(List.of(0.1F, 0.2F, 0.3F), vectorValues);
        assertEquals(3, vectorValues.size());
    }

    @Test
    void extractVectorValuesSupportsLegacyVectorOutput() {
        Points.VectorOutput vectorOutput = Points.VectorOutput.newBuilder()
                .addData(0.4F)
                .addData(0.5F)
                .build();

        List<Float> vectorValues = QdrantVectorSearchAdapter.extractVectorValues(vectorOutput);

        assertEquals(List.of(0.4F, 0.5F), vectorValues);
        assertEquals(2, vectorValues.size());
    }

    @Test
    void searchConvertsScoredPointIntoContent() throws Exception {
        QdrantClient qdrantClient = mock(QdrantClient.class);
        EmbeddingModel embeddingModel = mock(EmbeddingModel.class);
        AiVectorProperties properties = new AiVectorProperties();
        properties.setKnowledgeVectorSize(3);
        properties.setVectorMinScore(0.5F);

        when(embeddingModel.embed("有什么特色特产推荐？"))
                .thenReturn(Response.from(Embedding.from(new float[]{0.1F, 0.2F, 0.3F})));
        when(qdrantClient.searchAsync(any(Points.SearchPoints.class)))
                .thenReturn(Futures.immediateFuture(List.of(buildDensePoint())));

        QdrantVectorSearchAdapter adapter = new QdrantVectorSearchAdapter(qdrantClient, embeddingModel, properties);

        List<Content> results = adapter.search("有什么特色特产推荐？", "PRODUCT", 3);

        assertEquals(1, results.size());
        Content content = results.get(0);
        TextSegment segment = content.textSegment();
        assertEquals("【特产商城】商品名称：高山云雾茶。", segment.text());
        assertEquals("2", segment.metadata().getString("id"));
        assertEquals("PRODUCT", segment.metadata().getString("type"));
        assertNotNull(content.metadata().get(ContentMetadata.SCORE));
    }

    private static Points.ScoredPoint buildDensePoint() {
        return Points.ScoredPoint.newBuilder()
                .setId(Common.PointId.newBuilder().setUuid("point-1").build())
                .setScore(0.92F)
                .setVectors(Points.VectorsOutput.newBuilder()
                        .setVector(Points.VectorOutput.newBuilder()
                                .setDense(Points.DenseVector.newBuilder()
                                        .addData(0.8F)
                                        .addData(0.1F)
                                        .addData(0.2F)
                                        .build())
                                .build())
                        .build())
                .putAllPayload(Map.of(
                        "text_segment", ValueFactory.value("【特产商城】商品名称：高山云雾茶。"),
                        "type", ValueFactory.value("PRODUCT"),
                        "id", ValueFactory.value("2"),
                        "name", ValueFactory.value("高山云雾茶")
                ))
                .build();
    }
}
