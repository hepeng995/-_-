package com.cinema.booking.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.cn.smart.SmartChineseAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.apache.lucene.store.Directory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class LuceneBM25Manager {

    // 内存索引目录（重启不保留，但速度快，适合大赛）
    private final Directory directory = new ByteBuffersDirectory();
    // 中文分词器
    private final SmartChineseAnalyzer analyzer = new SmartChineseAnalyzer();

    /**
     * 构建 BM25 索引
     * @param documents 文档列表，每个文档包含 id, type, content
     */
    public void buildIndex(List<LuceneDocument> documents) {
        try {
            IndexWriterConfig config = new IndexWriterConfig(analyzer);
            IndexWriter writer = new IndexWriter(directory, config);

            for (LuceneDocument doc : documents) {
                Document luceneDoc = new Document();
                luceneDoc.add(new StringField("id", doc.id, Field.Store.YES));
                luceneDoc.add(new StringField("type", doc.type(), Field.Store.YES));
                luceneDoc.add(new TextField("content", doc.content(), Field.Store.YES));
                writer.addDocument(luceneDoc);
            }

            writer.commit();
            writer.close();
            log.info("【Lucene BM25】索引构建完成，共索引 {} 条文档", documents.size());
        } catch (Exception e) {
            log.error("【Lucene BM25】索引构建失败", e);
        }
    }

    /**
     * BM25 关键词检索
     * @param query 用户查询
     * @param type 数据类型（PRODUCT/SCENIC/NEWS）
     * @param topK 返回数量
     * @return 检索结果
     */
    public List<LuceneDocument> search(String query, String type, int topK) {
        List<LuceneDocument> results = new ArrayList<>();
        try {
            DirectoryReader reader = DirectoryReader.open(directory);
            IndexSearcher searcher = new IndexSearcher(reader);

            // 构建查询：内容匹配 + 类型过滤
            String queryStr = String.format("content:(%s) AND type:%s", query, type);
            QueryParser parser = new QueryParser("content", analyzer);
            org.apache.lucene.search.Query luceneQuery = parser.parse(queryStr);

            // 执行 BM25 检索
            TopDocs topDocs = searcher.search(luceneQuery, topK);

            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                Document doc = searcher.doc(scoreDoc.doc);
                results.add(new LuceneDocument(
                        doc.get("id"),
                        doc.get("type"),
                        doc.get("content"),
                        (double) scoreDoc.score
                ));
            }

            reader.close();
            log.info("【Lucene BM25】检索完成，查询：{}，类型：{}，结果数：{}", query, type, results.size());
        } catch (Exception e) {
            log.error("【Lucene BM25】检索失败", e);
        }
        return results;
    }

    // 辅助类：Lucene 文档
    public record LuceneDocument(String id, String type, String content, Double score) {
        public LuceneDocument(String id, String type, String content) {
            this(id, type, content, null);
        }
    }
}
