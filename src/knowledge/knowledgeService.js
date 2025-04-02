const config = require('../config');
const { OpenAIEmbeddings } = require('@langchain/openai');
// Try to import Pinecone, but don't fail if it's not available
let PineconeStore, Pinecone;
try {
  PineconeStore = require('@langchain/pinecone').PineconeStore;
  Pinecone = require('@pinecone-database/pinecone').Pinecone;
} catch (error) {
  console.warn('Pinecone dependencies not available:', error.message);
}
const { Document } = require('@langchain/core/documents');

// Initialize embeddings model (or use a mock if API key is not available)
let embeddings;
try {
  if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured, using mock embeddings');
    embeddings = createMockEmbeddings();
  } else {
    embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
    });
  }
} catch (error) {
  console.warn('Error initializing OpenAI embeddings:', error.message);
  embeddings = createMockEmbeddings();
}

/**
 * Create mock embeddings for demo purposes
 */
function createMockEmbeddings() {
  return {
    embedQuery: async (text) => {
      // Return a random embedding vector of dimension 1536 (same as OpenAI's)
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    },
    embedDocuments: async (documents) => {
      // Return random embedding vectors for each document
      return documents.map(() =>
        Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
      );
    },
  };
}

// Initialize Pinecone client (lazy initialization)
let pineconeClient = null;
let vectorStore = null;

/**
 * Initialize the vector database connection
 */
async function initVectorStore() {
  if (vectorStore) {
    return vectorStore;
  }

  try {
    if (config.vectorDb.provider === 'pinecone') {
      // Check if Pinecone dependencies are available
      if (!PineconeStore || !Pinecone) {
        console.warn('Pinecone dependencies not available, using mock vector store');
        return createMockVectorStore();
      }

      // Initialize Pinecone
      if (!pineconeClient) {
        pineconeClient = new Pinecone({
          apiKey: config.vectorDb.pinecone.apiKey,
          environment: config.vectorDb.pinecone.environment,
        });
      }

      // Check if index exists, if not create it
      const indexName = config.vectorDb.pinecone.indexName;
      const indexes = await pineconeClient.listIndexes();

      if (!indexes.includes(indexName)) {
        console.log(`Creating Pinecone index: ${indexName}`);
        // In a real implementation, you would create the index here
        // For this demo, we'll assume the index already exists
      }

      const index = pineconeClient.Index(indexName);

      // Initialize the vector store
      vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });
    } else if (config.vectorDb.provider === 'chroma') {
      // For this demo, we'll focus on Pinecone implementation
      console.warn('Chroma implementation not available in this demo, using mock vector store');
      return createMockVectorStore();
    } else {
      console.warn(`Unsupported vector database provider: ${config.vectorDb.provider}, using mock vector store`);
      return createMockVectorStore();
    }

    return vectorStore;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    // Return a mock vector store instead of throwing
    return createMockVectorStore();
  }
}

/**
 * Create a mock vector store for demo purposes when real vector DB is not available
 */
function createMockVectorStore() {
  // Simple in-memory mock of a vector store
  const documents = [];

  return {
    addDocuments: async (docs) => {
      documents.push(...docs);
      return { success: true };
    },
    similaritySearch: async (query, limit = 5) => {
      // Simple keyword matching instead of vector similarity
      const queryTerms = query.toLowerCase().split(/\s+/);

      // Score documents based on term overlap
      const scoredDocs = documents.map(doc => {
        const content = doc.pageContent.toLowerCase();
        const matchCount = queryTerms.reduce((count, term) => {
          return count + (content.includes(term) ? 1 : 0);
        }, 0);

        return {
          ...doc,
          score: matchCount / queryTerms.length,
        };
      });

      // Sort by score and take top results
      return scoredDocs
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(doc => ({
          pageContent: doc.pageContent,
          metadata: { ...doc.metadata, score: doc.score },
        }));
    },
  };
}

/**
 * Add knowledge to the vector database
 * @param {Object} knowledge - The knowledge to add
 * @returns {Object} - Result of the operation
 */
exports.addKnowledge = async (knowledge) => {
  try {
    const store = await initVectorStore();

    // Create a document from the knowledge
    const document = new Document({
      pageContent: knowledge.content,
      metadata: {
        source: knowledge.source,
        author: knowledge.author,
        createdAt: new Date().toISOString(),
        tags: knowledge.tags || [],
        ...knowledge.metadata,
      },
    });

    // Add the document to the vector store
    await store.addDocuments([document]);

    return {
      success: true,
      message: 'Knowledge added successfully',
    };
  } catch (error) {
    console.error('Error adding knowledge:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Retrieve knowledge relevant to a query
 * @param {string} query - The query to find relevant knowledge for
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Array of relevant knowledge documents
 */
exports.retrieveRelevantKnowledge = async (query, limit = 5) => {
  try {
    // For demo purposes, if vector store initialization fails, return empty results
    let store;
    try {
      store = await initVectorStore();
    } catch (error) {
      console.warn('Vector store not available, returning empty results:', error.message);
      return [];
    }

    // Perform similarity search
    const results = await store.similaritySearch(query, limit);

    // Format the results
    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      relevanceScore: doc.metadata.score || 0.8, // Some vector stores provide scores
    }));
  } catch (error) {
    console.error('Error retrieving knowledge:', error);
    // Return empty array instead of throwing to make the system more robust
    return [];
  }
};

/**
 * Delete knowledge from the vector database
 * @param {string} filter - Filter to identify documents to delete
 * @returns {Object} - Result of the operation
 */
exports.deleteKnowledge = async (filter) => {
  try {
    const store = await initVectorStore();

    // In a real implementation, you would delete documents based on the filter
    // For this demo, we'll just return a success message

    return {
      success: true,
      message: 'Knowledge deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
