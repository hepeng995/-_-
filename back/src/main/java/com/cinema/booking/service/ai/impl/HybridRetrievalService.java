package com.cinema.booking.service.ai.impl;

import com.cinema.booking.utils.LuceneBM25Manager;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.ContentMetadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class HybridRetrievalService {

    private final EmbeddingModel embeddingModel;
    private final LuceneBM25Manager luceneBM25Manager;
    private final QdrantVectorSearchAdapter qdrantVectorSearchAdapter;

    public List<Content> threeStageHybridRetrieval(String userQuestion, String type) {
        log.info("【三级混合检索】开始，用户问题：{}，类型：{}", userQuestion, type);

        // ==================== 第一阶段：双路粗召回 ====================
        List<Content> vectorResults = vectorRetrieve(userQuestion, type, 50);
        List<Content> bm25Results = bm25Retrieve(userQuestion, type, 50);

        Map<String, Content> mergedMap = new HashMap<>();
        vectorResults.forEach(c -> mergedMap.put(c.textSegment().metadata().getString("id"), c));
        bm25Results.forEach(c -> mergedMap.put(c.textSegment().metadata().getString("id"), c));

        List<Content> allCandidates = new ArrayList<>(mergedMap.values());
        log.info("【三级混合检索】双路粗召回完成，向量{}条 + BM25{}条，合并去重后{}条",
                vectorResults.size(), bm25Results.size(), allCandidates.size());

        if (allCandidates.isEmpty()) {
            log.warn("【三级混合检索】未召回到任何候选内容，类型：{}，问题：{}", type, userQuestion);
            return List.of();
        }

        // ============== 第二阶段：BGE 强语义精排 ==============
        List<Content> top10Contents = allCandidates.stream()
                .map(content -> {
                    // 1. 计算重排序分数
                    double rerankScore = calculateBgeSimilarity(userQuestion, content.textSegment().text());

                    // 2. 获取官方元数据 Map<ContentMetadata, Object>
                    Map<ContentMetadata, Object> originalMeta = new HashMap<>(content.metadata());
                    // 3. 存入重排序分数（用官方枚举 SCORE 存储分数，最标准）
                    originalMeta.put(ContentMetadata.SCORE, rerankScore);

                    // 4. 官方API创建Content
                    return Content.from(content.textSegment(), originalMeta);
                })
                // 5. 按分数降序排序（官方规范写法）
                .sorted((c1, c2) -> Double.compare(
                        (Double) c2.metadata().get(ContentMetadata.SCORE),
                        (Double) c1.metadata().get(ContentMetadata.SCORE)
                ))
                .limit(10)
                .toList();

        log.info("【三级混合检索】BGE 精排完成，Top10：{}",
                top10Contents.stream()
                        .map(c -> {
                            // 1. 从官方枚举获取分数，强转Double，空值默认0.0
                            double score = (Double) c.metadata().getOrDefault(ContentMetadata.SCORE, 0.0);
                            // 2. 截取文本（保持原有逻辑）
                            String text = c.textSegment().text();
                            String shortText = text.substring(0, Math.min(30, text.length()));
                            // 3. 格式化输出
                            return String.format("[BGE分:%.2f] %s", score, shortText);
                        })
                        .toList());

        return top10Contents;
    }

    List<Content> vectorRetrieve(String userQuestion, String type, int topK) {
        try {
            return qdrantVectorSearchAdapter.search(userQuestion, type, topK);
        } catch (Exception e) {
            log.warn("【向量检索】执行失败，已自动降级为 BM25 检索。常见原因：集合不存在、集合维度与当前嵌入模型不一致", e);
            return List.of();
        }
    }

    private List<Content> bm25Retrieve(String userQuestion, String type, int topK) {
        List<LuceneBM25Manager.LuceneDocument> luceneDocs = luceneBM25Manager.search(userQuestion, type, topK);
        // ✅ 核心：使用正确的Metadata，完美适配混合检索的id去重逻辑
        return luceneDocs.stream()
                .map(doc -> {
                    // ✅ 核心修复：用Map.of()传入多组key-value，再给Metadata.from()
                    Metadata metadata = Metadata.from(Map.of(
                            "type", doc.type(),
                            "id", doc.id()
                    ));
                    return Content.from(TextSegment.from(doc.content(), metadata));
                })
                .toList();
    }

    private double calculateBgeSimilarity(String query, String text) {
        try {
            var queryEmbedding = embeddingModel.embed(query).content();
            var textEmbedding = embeddingModel.embed(text).content();

            if (queryEmbedding == null || textEmbedding == null) {
                return 0.0;
            }

            float[] queryVector = queryEmbedding.vector();
            float[] textVector = textEmbedding.vector();
            if (queryVector == null || textVector == null || queryVector.length == 0 || textVector.length == 0) {
                return 0.0;
            }
            if (queryVector.length != textVector.length) {
                log.warn("【语义精排】向量维度不一致，query={}，text={}", queryVector.length, textVector.length);
                return 0.0;
            }

            double dotProduct = 0.0;
            double norm1 = 0.0;
            double norm2 = 0.0;

            for (int i = 0; i < queryVector.length; i++) {
                dotProduct += queryVector[i] * textVector[i];
                norm1 += Math.pow(queryVector[i], 2);
                norm2 += Math.pow(textVector[i], 2);
            }

            if (norm1 == 0.0 || norm2 == 0.0) {
                return 0.0;
            }

            return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
        } catch (Exception e) {
            log.warn("【语义精排】嵌入计算失败，当前候选将按 0 分处理", e);
            return 0.0;
        }
    }
}
