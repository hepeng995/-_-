package com.cinema.booking.service.ai.impl;

import com.cinema.booking.utils.LuceneBM25Manager;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.Content;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HybridRetrievalServiceTest {

    @Test
    void vectorRetrieveReturnsAdapterResults() throws Exception {
        EmbeddingModel embeddingModel = mock(EmbeddingModel.class);
        LuceneBM25Manager luceneBM25Manager = mock(LuceneBM25Manager.class);
        QdrantVectorSearchAdapter adapter = mock(QdrantVectorSearchAdapter.class);
        HybridRetrievalService service = new HybridRetrievalService(embeddingModel, luceneBM25Manager, adapter);

        List<Content> expected = List.of(Content.from(TextSegment.from("测试内容", Metadata.from("id", "1"))));
        when(adapter.search("query", "PRODUCT", 5)).thenReturn(expected);

        List<Content> actual = service.vectorRetrieve("query", "PRODUCT", 5);

        assertEquals(expected, actual);
    }

    @Test
    void vectorRetrieveFallsBackWhenAdapterThrows() throws Exception {
        EmbeddingModel embeddingModel = mock(EmbeddingModel.class);
        LuceneBM25Manager luceneBM25Manager = mock(LuceneBM25Manager.class);
        QdrantVectorSearchAdapter adapter = mock(QdrantVectorSearchAdapter.class);
        HybridRetrievalService service = new HybridRetrievalService(embeddingModel, luceneBM25Manager, adapter);

        when(adapter.search("query", "PRODUCT", 5)).thenThrow(new RuntimeException("boom"));

        List<Content> actual = service.vectorRetrieve("query", "PRODUCT", 5);

        assertTrue(actual.isEmpty());
    }
}
