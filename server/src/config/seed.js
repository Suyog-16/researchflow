import pool from "./db.js";

export const initialCollections = [
  { name: "Agentic AI & Reasoning" },
  { name: "Large Language Models" },
  { name: "Retrieval-Augmented Generation" },
  { name: "Efficient Inference & Serving" },
  { name: "Mathematical Foundations" },
];

export const initialPapers = [
  {
    title: "Toolformer: Language Models Can Teach Themselves to Use Tools",
    authors: ["T. Schick", "J. Dwivedi-Yu", "R. Dessì", "R. Raileanu", "M. Lomeli", "L. Zettlemoyer", "T. Scialom"],
    publication_year: 2023,
    collection: "Agentic AI & Reasoning",
    status: "not read",
    current_page: 4,
    total_pages: 14,
    date_added: "2024-11-07",
    venue: "NeurIPS 2023",
    arxiv_id: "2302.04761",
    pdf_url: "https://arxiv.org/pdf/2302.04761.pdf",
    abstract: "Language models exhibit remarkable abilities to solve new tasks from only a few examples or textual instructions, especially at scale. Paradoxically, they struggle with basic tasks such as arithmetic or factual lookup. In this work, we show that LMs can self-teach using simple APIs via self-supervised learning.",
    notes: `### Synthesis & Reading Notes
- **Referenced Highlight [H1]**: Autonomous tool triggers save us from writing manual routing heuristics.
- **Referenced Highlight [H2]**: Mathematical threshold $\\tau$ balances tool usage frequency against latency.
- **Referenced Highlight [H3]**: Need to check Section 4 for non-deterministic web search evaluation.`,
    highlights: [
      {
        id: "H1",
        color: "green",
        pageNum: 2,
        text: "our approach enables language models to autonomously determine which APIs to call, when to call them, and how to incorporate returned executions.",
        rects: [],
        note: "Key architectural principle: let the LM determine API trigger points autonomously instead of hardcoded regex filters.",
        createdAt: "2024-11-07T10:15:00Z",
      },
      {
        id: "H2",
        color: "blue",
        pageNum: 5,
        text: "L_i(c_i) - min(L_i(ε), L_i(ĉ_i)) ≥ τ",
        rects: [],
        note: "Loss delta threshold τ: must tune on validation set. If τ is too small, trivial API calls pollute the training batch.",
        createdAt: "2024-11-07T10:30:00Z",
      },
      {
        id: "H3",
        color: "red",
        pageNum: 3,
        text: "What happens when tool APIs have non-deterministic return signatures?",
        rects: [],
        note: "Unresolved: if an API returns fluctuating timestamps, how is gradient variance bounded during fine-tuning?",
        createdAt: "2024-11-07T11:00:00Z",
      },
    ],
    tags: ["Agentic AI", "Tool Calling", "Self-Supervised"],
  },
  {
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    authors: ["T. Dao", "D. Y. Fu", "S. Ermon", "A. Rudra", "C. Ré"],
    publication_year: 2022,
    collection: "Efficient Inference & Serving",
    status: "not read",
    current_page: 3,
    total_pages: 12,
    date_added: "2024-11-05",
    venue: "NeurIPS 2022",
    arxiv_id: "2205.14135",
    pdf_url: "https://arxiv.org/pdf/2205.14135.pdf",
    abstract: "Transformers are slow and memory-hungry on long sequences, as the time and memory complexity of self-attention are quadratic in sequence length. We propose FlashAttention, an IO-aware exact attention algorithm that uses tiling to reduce memory reads/writes between GPU HBM and on-chip SRAM.",
    notes: `### IO-Awareness Architecture
- Bottleneck is GPU High Bandwidth Memory (HBM) bandwidth.
- See referenced math formula [H1] for streaming row maximum update.`,
    highlights: [
      {
        id: "H1",
        color: "blue",
        pageNum: 3,
        text: "Online softmax maintains running row max m_i = max(m_{i-1}, max(S^{(k)}))",
        rects: [],
        note: "Online softmax update formula: permits single-pass scaling without storing intermediate logits.",
        createdAt: "2024-11-05T14:00:00Z",
      },
    ],
    tags: ["GPU Kernel", "FlashAttention", "Hardware"],
  },
  {
    title: "Language Models are Few-Shot Learners",
    authors: ["T. B. Brown", "B. Mann", "N. Ryder", "M. Subbiah", "J. Kaplan", "P. Dhariwal"],
    publication_year: 2020,
    collection: "Large Language Models",
    status: "read",
    current_page: 75,
    total_pages: 75,
    date_added: "2024-11-04",
    venue: "NeurIPS 2020",
    arxiv_id: "2005.14165",
    pdf_url: "https://arxiv.org/pdf/2005.14165.pdf",
    abstract: "We investigate scaling up language models to 175B parameters and find that in-context learning achieves competitive results across a wide array of NLP benchmarks without any gradient updates or fine-tuning.",
    notes: `Fundamental GPT-3 paper on in-context few-shot scaling.`,
    highlights: [],
    tags: ["LLM", "In-Context Learning", "Scaling"],
  },
  {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: ["P. Lewis", "E. Perez", "A. Piktus", "F. Petroni", "V. Karpukhin", "N. Goyal"],
    publication_year: 2020,
    collection: "Retrieval-Augmented Generation",
    status: "read",
    current_page: 12,
    total_pages: 12,
    date_added: "2024-11-03",
    venue: "NeurIPS 2020",
    arxiv_id: "2005.11401",
    pdf_url: "https://arxiv.org/pdf/2005.11401.pdf",
    abstract: "We explore general-purpose fine-tuning recipes for retrieval-augmented generation (RAG) models combining pre-trained parametric and non-parametric memory.",
    notes: `DPR + BART formulation for factual knowledge grounding.`,
    highlights: [],
    tags: ["RAG", "DPR", "Dense Retrieval"],
  },
  {
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    authors: ["J. Wei", "X. Wang", "D. Schuurmans", "M. Bosma", "B. Ichter", "E. Chi", "Q. Le", "D. Zhou"],
    publication_year: 2022,
    collection: "Agentic AI & Reasoning",
    status: "read",
    current_page: 14,
    total_pages: 14,
    date_added: "2024-11-02",
    venue: "NeurIPS 2022",
    arxiv_id: "2201.11903",
    pdf_url: "https://arxiv.org/pdf/2201.11903.pdf",
    abstract: "We show that generating a sequence of intermediate reasoning steps significantly improves the ability of large language models to perform multi-step arithmetic, commonsense, and symbolic reasoning.",
    notes: `Emergent reasoning abilities via step-by-step reasoning tokens.`,
    highlights: [],
    tags: ["Reasoning", "CoT", "Prompting"],
  },
  {
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    authors: ["E. J. Hu", "Y. Shen", "P. Wallis", "Z. Allen-Zhu", "Y. Li", "S. Wang", "L. Wang", "W. Chen"],
    publication_year: 2021,
    collection: "Large Language Models",
    status: "read",
    current_page: 14,
    total_pages: 14,
    date_added: "2024-11-01",
    venue: "ICLR 2022",
    arxiv_id: "2106.09685",
    pdf_url: "https://arxiv.org/pdf/2106.09685.pdf",
    abstract: "LoRA freezes pre-trained model weights and injects trainable rank decomposition matrices into each transformer layer, drastically cutting the number of trainable parameters.",
    notes: `Weight decomposition delta W = B * A with zero inference latency overhead.`,
    highlights: [],
    tags: ["LoRA", "PEFT", "Optimization"],
  },
  {
    title: "Llama 3: Open and Efficient Foundation Language Models",
    authors: ["Meta AI Team", "H. Touvron", "L. Martin", "K. Stone", "P. Albert"],
    publication_year: 2024,
    collection: "Large Language Models",
    status: "not read",
    current_page: 1,
    total_pages: 92,
    date_added: "2024-11-08",
    venue: "arXiv preprint",
    arxiv_id: "2407.21783",
    pdf_url: "https://arxiv.org/pdf/2407.21783.pdf",
    abstract: "We introduce the Llama 3 herd of models in 8B, 70B, and 405B parameter configurations, trained on over 15T tokens with extensive post-training recipes.",
    notes: "",
    highlights: [],
    tags: ["Llama 3", "Open Weights", "Foundation Models"],
  },
  {
    title: "Graph Neural Networks in Recommender Systems: A Survey",
    authors: ["S. Wu", "F. Sun", "W. Zhang", "X. Xie", "B. Cui"],
    publication_year: 2022,
    collection: "Mathematical Foundations",
    status: "not read",
    current_page: 1,
    total_pages: 24,
    date_added: "2024-10-28",
    venue: "ACM Computing Surveys",
    arxiv_id: "2011.02260",
    pdf_url: "https://arxiv.org/pdf/2011.02260.pdf",
    abstract: "A comprehensive categorization of GNN architectures applied to collaborative filtering, session-based recommendation, and multi-behavior graphs.",
    notes: "",
    highlights: [],
    tags: ["GNN", "Graphs", "Survey"],
  },
];

export async function seedDatabase() {
  try {
    // 1. Ensure default user exists
    let userResult = await pool.query("SELECT id FROM users LIMIT 1");
    let ownerId;
    if (userResult.rows.length === 0) {
      const insertUser = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
        ["researcher@researchflow.local", "hash_placeholder"]
      );
      ownerId = insertUser.rows[0].id;
    } else {
      ownerId = userResult.rows[0].id;
    }

    // 2. Ensure collections exist
    const colCount = await pool.query("SELECT COUNT(*) FROM collections");
    if (parseInt(colCount.rows[0].count, 10) === 0) {
      console.log("Seeding default collections...");
      for (const col of initialCollections) {
        await pool.query(
          "INSERT INTO collections (owner_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [ownerId, col.name]
        );
      }
    }

    // 3. Ensure papers exist
    const paperCount = await pool.query("SELECT COUNT(*) FROM papers");
    if (parseInt(paperCount.rows[0].count, 10) <= 1) {
      console.log("Seeding default research papers...");
      // Remove any partial single row if present
      await pool.query("DELETE FROM papers WHERE owner_id = $1", [ownerId]);

      for (const p of initialPapers) {
        const paperInsert = await pool.query(
          `INSERT INTO papers
           (owner_id, title, abstract, publication_year, venue, arxiv_id, pdf_url,
            status, current_page, total_pages, date_added, collection, notes, highlights, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id`,
          [
            ownerId,
            p.title,
            p.abstract,
            p.publication_year,
            p.venue,
            p.arxiv_id,
            p.pdf_url,
            p.status,
            p.current_page,
            p.total_pages,
            p.date_added,
            p.collection,
            p.notes,
            JSON.stringify(p.highlights || []),
            p.tags || [],
          ]
        );

        const newPaperId = paperInsert.rows[0].id;

        // Insert authors
        if (p.authors && p.authors.length > 0) {
          for (let i = 0; i < p.authors.length; i++) {
            await pool.query(
              `INSERT INTO paper_authors (paper_id, author_name, author_order)
               VALUES ($1, $2, $3)`,
              [newPaperId, p.authors[i], i + 1]
            );
          }
        }
      }
      console.log("Default research papers seeded successfully.");
    }
  } catch (err) {
    console.error("Database seed error:", err);
  }
}
