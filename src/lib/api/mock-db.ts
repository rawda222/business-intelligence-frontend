/**
 * In-memory mock data layer that faithfully implements the platform's Pydantic
 * schemas. Realistic Arabic + English mixed evidence quotes (per business
 * reality). Used by the local /api/v1/* route handlers so the frontend is fully
 * functional. Swap for the real FastAPI backend by enabling USE_REAL_BACKEND.
 *
 * Server-only module.
 */
import "server-only";
import type {
  Business,
  BusinessListResponse,
  CreateBusinessRequest,
  HistoryEntry,
  PipelineResult,
  PipelineStage,
  PipelineStageName,
  SWOTReportEnvelope,
  StrategyReportEnvelope,
  CampaignsReportEnvelope,
  CampaignBrief,
} from "@/types";

const NOW = Date.now();
const iso = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

/* ------------------------------------------------------------------ */
/* SWOT reports                                                        */
/* ------------------------------------------------------------------ */

const volumeCafeSwot: SWOTReportEnvelope = {
  report_id: "swot_01HZXK8VOLUMECAFE7Q9M",
  business_id: "biz_volume_cafe",
  created_at: iso(1000 * 60 * 60 * 6),
  business_type: "cafe",
  engine_version: "swot-agent",
  swot_report: {
    strengths: [
      {
        item_id: "s_vol_01",
        title: "Specialty coffee quality is the core differentiator",
        reasoning:
          "Reviewers consistently single out the espresso and single-origin pours as best-in-area. The theme appears across 312 reviews with strongly positive sentiment, indicating a durable product advantage rather than a fad.",
        source_theme: "coffee_quality",
        scoring: { importance: 0.95, impact: 0.9, confidence: 0.92 },
        evidence_refs: [
          "Best flat white in Riyadh, hands down — the beans are unreal.",
          "أفضل قهوة جربتها، الإسبريسو ممتاز والنكهة غنية.",
          "Their V60 pour-over is better than the specialty chains downtown.",
        ],
        frequency: 312,
      },
      {
        item_id: "s_vol_02",
        title: "Fast, friendly service during morning rush",
        reasoning:
          "Speed-of-service comments cluster in the 7–9am window with positive tone. Staff are named frequently, suggesting rapport building that drives repeat visits.",
        source_theme: "service_speed",
        scoring: { importance: 0.82, impact: 0.78, confidence: 0.85 },
        evidence_refs: [
          "Even with a line out the door, my order was ready in 3 minutes.",
          "الخدمة سريعة جدا في الصباح والموظفين لطفاء.",
          "Barista remembered my name on the second visit. Love that.",
        ],
        frequency: 198,
      },
      {
        item_id: "s_vol_03",
        title: "Strong ambiance & remote-work fit (WiFi)",
        reasoning:
          "Ambiance + reliable WiFi is a recurring positive theme, positioning the cafe as a daytime third-place for freelancers and students — a high-margin, long-dwell segment.",
        source_theme: "ambiance_work",
        scoring: { importance: 0.74, impact: 0.7, confidence: 0.8 },
        evidence_refs: [
          "Perfect spot to work for a couple of hours — quiet, good WiFi, great coffee.",
          "الأجواء هادئة ومريحة للعمل، والواي فاي ممتاز.",
        ],
        frequency: 121,
      },
    ],
    weaknesses: [
      {
        item_id: "w_vol_01",
        title: "Pricing perceived as premium vs. local alternatives",
        reasoning:
          "A meaningful share of negative reviews cite price. While premium positioning is intentional, the gap to nearest competitor is wide enough to cause hesitation for daily visitors.",
        source_theme: "pricing",
        scoring: { importance: 0.78, impact: 0.7, confidence: 0.74 },
        evidence_refs: [
          "Love the coffee but 22 SAR for a latte is steep for a daily habit.",
          "الأسعار غالية شوي مقارنة بالمقاهي الثانية.",
          "Great quality, but I save it for treats, not mornings.",
        ],
        frequency: 156,
      },
      {
        item_id: "w_vol_02",
        title: "Inconsistent experience during evening peak",
        reasoning:
          "Negative service comments spike after 6pm — wait times, drink inconsistency. Indicates staffing or training gaps on the second shift.",
        source_theme: "evening_consistency",
        scoring: { importance: 0.7, impact: 0.66, confidence: 0.68 },
        evidence_refs: [
          "Came at 7pm, waited 12 minutes and my cappuccino was lukewarm.",
          "في المساء الخدمة تتباطأ والقهوة مو نفس الجودة.",
        ],
        frequency: 88,
      },
      {
        item_id: "w_vol_03",
        title: "Limited food / pastry variety",
        reasoning:
          "Customers asking for brunch or lunch options leave underserved. Frequent requests for savory items and dietary options (vegan, gluten-free).",
        source_theme: "food_variety",
        scoring: { importance: 0.6, impact: 0.55, confidence: 0.72 },
        evidence_refs: [
          "Wish they had more than croissants — a proper sandwich would be great.",
          "محتاجين خيارات أكل أكثر، خاصة نباتي.",
        ],
        frequency: 73,
      },
    ],
    opportunities: [
      {
        item_id: "o_vol_01",
        title: "Loyalty app / subscription for daily drinkers",
        reasoning:
          "High frequency of 'wish I could come daily' + price sensitivity points to a subscription (e.g. monthly unlimited) that converts price pain into retention and predictable revenue.",
        source_theme: "retention_monetization",
        scoring: { importance: 0.85, impact: 0.82, confidence: 0.7 },
        evidence_refs: [
          "I'd buy a monthly coffee pass in a heartbeat.",
          "لو فيه اشتراك شهري بأجلّي كل يوم.",
        ],
        frequency: 64,
      },
      {
        item_id: "o_vol_02",
        title: "B2B office coffee & bean retail expansion",
        reasoning:
          "Several reviews mention buying beans and gifting them. A branded beans + office-delivery line extends the product advantage into a higher-margin retail channel.",
        source_theme: "retail_b2b",
        scoring: { importance: 0.72, impact: 0.75, confidence: 0.64 },
        evidence_refs: [
          "I buy their beans for home — would love a subscription delivery.",
          "حبوب القهوة عندهم ممتازة، أشتريها للبيت.",
        ],
        frequency: 47,
      },
      {
        item_id: "o_vol_03",
        title: "Expand evening food to capture dinner/day crowd",
        reasoning:
          "Weakness in food variety is also an opportunity — adding a focused savory menu can convert the cafe from morning-only to all-day destination.",
        source_theme: "menu_expansion",
        scoring: { importance: 0.68, impact: 0.7, confidence: 0.6 },
        evidence_refs: [
          "If they had good lunch options I'd stay all day.",
          "لو أضافوا ساندويشات راح أزورهم بعد الدوام.",
        ],
        frequency: 39,
      },
    ],
    threats: [
      {
        item_id: "t_vol_01",
        title: "Aggressive specialty-chain expansion in the area",
        reasoning:
          "Two international specialty chains opened within 1.5km in the last year. Reviews mention 'trying the new place' — share-of-visit risk is real for the morning ritual crowd.",
        source_theme: "competition",
        scoring: { importance: 0.8, impact: 0.76, confidence: 0.66 },
        evidence_refs: [
          "Tried the new % chain down the road — decent, and cheaper.",
          "المقاهي الجديدة كثرت مؤخرا والأسعار أرخص.",
        ],
        frequency: 58,
      },
      {
        item_id: "t_vol_02",
        title: "Green-bean cost volatility squeezing margins",
        reasoning:
          "Specialty-grade arabica prices have risen; maintaining current quality at current price is unsustainable without either premiumization or volume.",
        source_theme: "cost_inflation",
        scoring: { importance: 0.72, impact: 0.7, confidence: 0.6 },
        evidence_refs: [
          "Hope they don't raise prices again — already at the limit.",
          "أخاف يرفعون الأسعار أكثر.",
        ],
        frequency: 31,
      },
      {
        item_id: "t_vol_03",
        title: "Staff retention risk on second shift",
        reasoning:
          "Evening inconsistency traces to turnover. Without retention, quality drift will compound and erode the core strength.",
        source_theme: "talent_retention",
        scoring: { importance: 0.66, impact: 0.62, confidence: 0.58 },
        evidence_refs: [
          "Seems like always new faces in the evening.",
          "الموظفين يتغيرون كثير بالمساء.",
        ],
        frequency: 22,
      },
    ],
  },
  strategic_summary: {
    main_advantage:
      "A genuinely superior specialty-coffee product backed by fast, personable morning service — the kind of product advantage competitors cannot copy quickly.",
    most_critical_risk:
      "Evening-shift inconsistency is quietly eroding the brand promise and handing the after-work crowd to new entrants.",
    best_growth_opportunity:
      "Launch a monthly coffee subscription that monetizes the price-sensitive daily drinker while locking in retention ahead of competitor expansion.",
  },
  meta: {
    llm_provider_used: "vertex_ai",
    llm_model_used: "gemini-2.5-flash",
    fallback_used: false,
    processing_time_ms: 8420,
    cost_estimate_usd: 0.142,
  },
};

const layaliSwot: SWOTReportEnvelope = {
  report_id: "swot_01HZXK9LAYALIRST9K2P",
  business_id: "biz_layali",
  created_at: iso(1000 * 60 * 60 * 30),
  business_type: "restaurant",
  engine_version: "swot-agent",
  swot_report: {
    strengths: [
      {
        item_id: "s_lay_01",
        title: "Authentic Levantine flavors & family recipes",
        reasoning:
          "Authenticity is the dominant positive theme. Dishes like molokhia and mixed grill are repeatedly called 'like home', signalling a defensible culinary moat.",
        source_theme: "authenticity",
        scoring: { importance: 0.92, impact: 0.88, confidence: 0.9 },
        evidence_refs: [
          "The molokhia tastes exactly like my grandmother's — incredible.",
          "الطعم أصلي يذكّرني ببيت جدتي، رائع.",
          "Best mixed grill in Jeddah, hands down.",
        ],
        frequency: 287,
      },
      {
        item_id: "s_lay_02",
        title: "Generous portions & value perception",
        reasoning:
          "Portion size relative to price drives strong value perception, especially for group dining — a key driver of high visit frequency.",
        source_theme: "value",
        scoring: { importance: 0.8, impact: 0.76, confidence: 0.83 },
        evidence_refs: [
          "Huge portions, we always leave with leftovers. Great value.",
          "الكميات كبيرة والسعر ممتاز للعائلة.",
        ],
        frequency: 176,
      },
    ],
    weaknesses: [
      {
        item_id: "w_lay_01",
        title: "Long wait times on weekends",
        reasoning:
          "Friday/Saturday wait times dominate negative sentiment. Capacity is the bottleneck — both tables and kitchen throughput.",
        source_theme: "wait_time",
        scoring: { importance: 0.84, impact: 0.8, confidence: 0.82 },
        evidence_refs: [
          "Waited 45 minutes for a table on Friday — unacceptable.",
          "انتظرنا ساعة يوم الجمعة، زيادة.",
        ],
        frequency: 142,
      },
      {
        item_id: "w_lay_02",
        title: "Inconsistent service attentiveness",
        reasoning:
          "When busy, staff attentiveness drops — orders forgotten, refills delayed. A service-process issue, not a staffing-volume issue alone.",
        source_theme: "service_attentiveness",
        scoring: { importance: 0.7, impact: 0.66, confidence: 0.7 },
        evidence_refs: [
          "They forgot our drinks and we had to ask three times.",
          "نسوا طلبنا واضطرينا نكرر الطلب.",
        ],
        frequency: 96,
      },
    ],
    opportunities: [
      {
        item_id: "o_lay_01",
        title: "Online ordering & family meal bundles",
        reasoning:
          "High value perception + family dining = strong fit for delivery 'family feast' bundles that extend revenue beyond physical capacity.",
        source_theme: "delivery_bundles",
        scoring: { importance: 0.82, impact: 0.8, confidence: 0.68 },
        evidence_refs: [
          "Wish I could order their mixed grill for family dinners at home.",
          "يتمنى لو فيه طلبات توصيل لعشاء العائلة.",
        ],
        frequency: 71,
      },
      {
        item_id: "o_lay_02",
        title: "Reservation system to smooth weekend peaks",
        reasoning:
          "Wait pain + family crowd = reservations + quoted wait times would convert frustration into predictability and capture more visits.",
        source_theme: "reservations",
        scoring: { importance: 0.76, impact: 0.74, confidence: 0.72 },
        evidence_refs: [
          "Why no reservations? Would solve everything for Fridays.",
          "ليش ما فيه حجز مسبق؟ كان حل المشكلة.",
        ],
        frequency: 53,
      },
    ],
    threats: [
      {
        item_id: "t_lay_01",
        title: "Cloud-kitchen delivery brands undercutting on price",
        reasoning:
          "Delivery-first brands with lower overhead are pricing aggressively on aggregators, threatening the to-go segment Layali hasn't captured.",
        source_theme: "cloud_kitchen_competition",
        scoring: { importance: 0.74, impact: 0.7, confidence: 0.62 },
        evidence_refs: [
          "Cheaper Levantine options keep popping up on the apps.",
          "في مطابخ سحابية أرخص على تطبيقات التوصيل.",
        ],
        frequency: 44,
      },
    ],
  },
  strategic_summary: {
    main_advantage:
      "Genuine Levantine authenticity at family-dining scale — a culinary identity competitors struggle to replicate.",
    most_critical_risk:
      "Weekend capacity and wait times are turning the highest-demand nights into the worst experiences.",
    best_growth_opportunity:
      "Launch family-feast delivery bundles to monetize authentic food beyond the dining room's physical ceiling.",
  },
  meta: {
    llm_provider_used: "vertex_ai",
    llm_model_used: "gemini-2.5-flash",
    fallback_used: true,
    processing_time_ms: 9650,
    cost_estimate_usd: 0.158,
  },
};

const glowSwot: SWOTReportEnvelope = {
  report_id: "swot_01HZXKAGLOWSALON4F7T",
  business_id: "biz_glow_salon",
  created_at: iso(1000 * 60 * 60 * 50),
  business_type: "salon",
  engine_version: "swot-agent",
  swot_report: {
    strengths: [
      {
        item_id: "s_glow_01",
        title: "Skilled, personable stylists with strong repeat loyalty",
        reasoning:
          "Stylists are named and praised repeatedly; repeat-visit language ('my stylist', 'always book with') indicates high switching costs once a relationship forms.",
        source_theme: "stylist_expertise",
        scoring: { importance: 0.9, impact: 0.86, confidence: 0.88 },
        evidence_refs: [
          "Lina is a magician — I won't let anyone else touch my hair.",
          "لينا الأفضل، ما أثق بأحد غيرها.",
          "Always book with the same stylist, never disappointed.",
        ],
        frequency: 203,
      },
      {
        item_id: "s_glow_02",
        title: "Clean, calm, premium ambiance",
        reasoning:
          "Cleanliness and ambiance are a consistent positive theme — critical for the salon category where trust and comfort drive spend.",
        source_theme: "ambiance_cleanliness",
        scoring: { importance: 0.78, impact: 0.74, confidence: 0.84 },
        evidence_refs: [
          "Spotless and so relaxing — feels like a real retreat.",
          "نظيف جدا والأجواء مريحة وفخمة.",
        ],
        frequency: 118,
      },
    ],
    weaknesses: [
      {
        item_id: "w_glow_01",
        title: "Booking friction — phone-only reservations",
        reasoning:
          "Booking complaints cluster around phone-tag and no online system. In a category where convenience wins, this is a measurable conversion leak.",
        source_theme: "booking_friction",
        scoring: { importance: 0.82, impact: 0.78, confidence: 0.8 },
        evidence_refs: [
          "Why no online booking? I called 4 times before someone answered.",
          "ليش ما فيه حجز أونلاين؟ اتصلت أربع مرات.",
        ],
        frequency: 97,
      },
      {
        item_id: "w_glow_02",
        title: "Premium pricing limits trial by new clients",
        reasoning:
          "Price is the top hesitation for first-timers. Trial requires confidence; without a low-risk entry, the top of funnel is constrained.",
        source_theme: "pricing_trial",
        scoring: { importance: 0.7, impact: 0.66, confidence: 0.72 },
        evidence_refs: [
          "Beautiful results but pricey — nervous to try without a deal.",
          "غالي شوي، مترددة أجرب بدون عرض.",
        ],
        frequency: 81,
      },
    ],
    opportunities: [
      {
        item_id: "o_glow_01",
        title: "Online booking + loyalty program",
        reasoning:
          "Booking friction + repeat loyalty = a self-serve booking app with a loyalty ladder directly removes the #1 weakness and reinforces the #1 strength.",
        source_theme: "digital_booking",
        scoring: { importance: 0.86, impact: 0.84, confidence: 0.78 },
        evidence_refs: [
          "An app to book and track visits would be amazing.",
          "تطبيق للحجز وللنقاط يكون ممتاز.",
        ],
        frequency: 66,
      },
      {
        item_id: "o_glow_02",
        title: "First-visit 'glow introduction' package",
        reasoning:
          "A bounded trial package (e.g. express blow-dry + consultation) lowers risk for new clients without discounting the core premium service.",
        source_theme: "trial_package",
        scoring: { importance: 0.72, impact: 0.7, confidence: 0.66 },
        evidence_refs: [
          "I'd try them with a smaller intro service.",
          "أجربهم بخدمة بسيطة أول مرة.",
        ],
        frequency: 38,
      },
    ],
    threats: [
      {
        item_id: "t_glow_01",
        title: "Instagram-led solo stylists undercutting on price",
        reasoning:
          "Independent stylists operating from home studios with low overhead are actively courting Glow's price-sensitive segment via social proof.",
        source_theme: "indie_competition",
        scoring: { importance: 0.68, impact: 0.64, confidence: 0.6 },
        evidence_refs: [
          "So many home stylists on Insta now, way cheaper.",
          "كثير ستايلست من البيت على انستقرام وأرخص.",
        ],
        frequency: 41,
      },
    ],
  },
  strategic_summary: {
    main_advantage:
      "Trusted, named stylist relationships in a spotless premium environment — the foundation of high repeat spend.",
    most_critical_risk:
      "Phone-only booking is a conversion leak at the exact moment new clients decide to try the salon.",
    best_growth_opportunity:
      "Launch self-serve online booking tied to a loyalty ladder to remove friction and deepen retention simultaneously.",
  },
  meta: {
    llm_provider_used: "vertex_ai",
    llm_model_used: "gemini-2.5-flash",
    fallback_used: false,
    processing_time_ms: 7100,
    cost_estimate_usd: 0.121,
  },
};

/* ------------------------------------------------------------------ */
/* Strategy reports                                                    */
/* ------------------------------------------------------------------ */

const volumeCafeStrategy: StrategyReportEnvelope = {
  report_id: "str_01HZXK8VOLUMECAFE7Q9M",
  business_id: "biz_volume_cafe",
  created_at: iso(1000 * 60 * 60 * 6),
  business_type: "cafe",
  strategic_posture: "Defend & Deepen",
  posture_rationale:
    "Volume Cafe holds a genuine product advantage but faces fast-moving competition and internal consistency drift. The right posture is to defend the morning ritual stronghold while deepening retention (subscription) and extending the daypart (food) — not a reckless expansion that dilutes quality.",
  tows_matrix: {
    SO: [
      {
        strategy_id: "so_vol_1",
        category: "SO",
        title: "Launch 'Daily Volume' coffee subscription",
        description:
          "Monetize the coffee-quality strength against the retention opportunity: a monthly subscription (e.g. 1 drink/day) converts price-sensitive daily drinkers into locked-in recurring revenue.",
        leverages: ["s_vol_01", "o_vol_01"],
        effort: 4,
        impact: 9,
        time_horizon: "0-3 months",
        confidence: 0.78,
      },
      {
        strategy_id: "so_vol_2",
        category: "SO",
        title: "Branded beans + office B2B delivery",
        description:
          "Extend the product advantage into retail & B2B: sell branded beans online with office coffee delivery subscriptions.",
        leverages: ["s_vol_01", "o_vol_02"],
        effort: 6,
        impact: 8,
        time_horizon: "3-6 months",
        confidence: 0.66,
      },
    ],
    ST: [
      {
        strategy_id: "st_vol_1",
        category: "ST",
        title: "Community & loyalty moat vs. chain expansion",
        description:
          "Use the named-barista rapport strength to build a community/loyalty identity chains can't replicate — local events, 'your barista' content, referral rewards.",
        leverages: ["s_vol_02", "t_vol_01"],
        effort: 5,
        impact: 7,
        time_horizon: "0-3 months",
        confidence: 0.7,
      },
      {
        strategy_id: "st_vol_2",
        category: "ST",
        title: "Premium-tier positioning to absorb bean-cost inflation",
        description:
          "Reframe pricing as craft-premium with visible origin storytelling so the strength (quality) justifies the price, neutralizing cost-volatility threat without racing to the bottom.",
        leverages: ["s_vol_01", "t_vol_02"],
        effort: 5,
        impact: 7,
        time_horizon: "3-6 months",
        confidence: 0.64,
      },
    ],
    WO: [
      {
        strategy_id: "wo_vol_1",
        category: "WO",
        title: "Add focused savory daypart menu",
        description:
          "Address the food-variety weakness while capturing the all-day opportunity: a small, high-quality savory menu to extend beyond mornings.",
        leverages: ["w_vol_03", "o_vol_03"],
        effort: 7,
        impact: 8,
        time_horizon: "3-6 months",
        confidence: 0.62,
      },
    ],
    WT: [
      {
        strategy_id: "wt_vol_1",
        category: "WT",
        title: "Second-shift quality stabilization program",
        description:
          "Fix evening inconsistency (weakness) that fuels competitor switching (threat): standardized evening SOPs, retention bonus for shift-2 staff, mystery-shopper audits.",
        leverages: ["w_vol_02", "t_vol_01", "t_vol_03"],
        effort: 6,
        impact: 8,
        time_horizon: "0-3 months",
        confidence: 0.74,
      },
      {
        strategy_id: "wt_vol_2",
        category: "WT",
        title: "Value-ladder pricing (daily tier)",
        description:
          "Address pricing weakness under competitive + cost threats by introducing a value tier (house blend) that protects trial without discounting the premium single-origin line.",
        leverages: ["w_vol_01", "t_vol_01", "t_vol_02"],
        effort: 5,
        impact: 6,
        time_horizon: "0-3 months",
        confidence: 0.6,
      },
    ],
  },
  priority_action_plan: [
    {
      action_id: "pa_vol_1",
      title: "Ship 'Daily Volume' subscription MVP",
      description:
        "Stand up a monthly subscription (1 drink/day, 2 tiers) with in-store redemption + simple digital pass. Target 200 subscribers in 60 days.",
      priority: "P0",
      owner: "Growth Lead",
      effort: 4,
      impact: 9,
      timeframe: "0-2 months",
      kpi: "200 active subscribers; +12% monthly repeat visits",
      dependencies: ["so_vol_1"],
    },
    {
      action_id: "pa_vol_2",
      title: "Stabilize second-shift quality",
      description:
        "Roll out evening SOPs, shift-2 retention bonus, weekly mystery shopper audits. Cut evening negative reviews by 50%.",
      priority: "P0",
      owner: "Operations Manager",
      effort: 6,
      impact: 8,
      timeframe: "0-2 months",
      kpi: "Evening negative-review share 30%→15%",
      dependencies: ["wt_vol_1"],
    },
    {
      action_id: "pa_vol_3",
      title: "Launch community loyalty program",
      description:
        "Loyalty ladder + 'your barista' content + referral rewards to defend against chain expansion.",
      priority: "P1",
      owner: "Marketing Lead",
      effort: 5,
      impact: 7,
      timeframe: "1-3 months",
      kpi: "+25% referral-driven first visits",
      dependencies: ["st_vol_1"],
    },
    {
      action_id: "pa_vol_4",
      title: "Pilot focused savory daypart menu",
      description:
        "Test a 6-item savory menu in 1 store for 8 weeks; measure attach rate and all-day visit lift.",
      priority: "P2",
      owner: "Product / Culinary",
      effort: 7,
      impact: 8,
      timeframe: "3-5 months",
      kpi: "Food attach rate 8%→22%",
      dependencies: ["wo_vol_1"],
    },
    {
      action_id: "pa_vol_5",
      title: "Branded beans + B2B office delivery",
      description:
        "E-commerce beans + outbound B2B office coffee contracts in business districts.",
      priority: "P3",
      owner: "Retail Lead",
      effort: 6,
      impact: 8,
      timeframe: "4-6 months",
      kpi: "10 B2B accounts; bean DTC revenue baseline",
      dependencies: ["so_vol_2"],
    },
  ],
  resource_assessment: [
    {
      resource_id: "res_vol_1",
      resource_type: "technology",
      name: "Subscription / digital pass platform",
      current_state: "No in-house subscription or loyalty tech",
      required_state: "Lightweight subscription billing + redeemable digital pass",
      gap: "medium",
      estimated_cost_usd: 9000,
    },
    {
      resource_id: "res_vol_2",
      resource_type: "human",
      name: "Second-shift lead barista + trainer",
      current_state: "High turnover on shift 2; no dedicated trainer",
      required_state: "Dedicated shift-2 lead + part-time trainer",
      gap: "high",
      estimated_cost_usd: 18000,
    },
    {
      resource_id: "res_vol_3",
      resource_type: "capital",
      name: "Kitchen build-out for savory menu",
      current_state: "Pastry-only kitchen, no hot line",
      required_state: "Compact hot line + exhaust for savory pilot",
      gap: "medium",
      estimated_cost_usd: 24000,
    },
    {
      resource_id: "res_vol_4",
      resource_type: "brand",
      name: "Brand storytelling assets (origin, craft)",
      current_state: "Minimal origin/craft content",
      required_state: "Photo + video origin storytelling library",
      gap: "low",
      estimated_cost_usd: 4500,
    },
    {
      resource_id: "res_vol_5",
      resource_type: "data",
      name: "Customer & visit analytics",
      current_state: "POS-only data, no unified customer view",
      required_state: "Unified customer + visit + subscription dashboard",
      gap: "medium",
      estimated_cost_usd: 6500,
    },
  ],
  campaign_brief_feed: [
    {
      feed_id: "cb_vol_1",
      source_strategy_id: "so_vol_1",
      campaign_angle: "Your daily ritual, unlocked",
      messaging_pillar: "Premium coffee becomes affordable when it's your habit",
      channel_suitability: ["Instagram", "TikTok", "Email", "In-store"],
      confidence: "high",
      requires_human_approval: false,
    },
    {
      feed_id: "cb_vol_2",
      source_strategy_id: "st_vol_1",
      campaign_angle: "Meet your barista",
      messaging_pillar: "The people behind your cup — local, named, yours",
      channel_suitability: ["Instagram", "TikTok"],
      confidence: "high",
      requires_human_approval: false,
    },
    {
      feed_id: "cb_vol_3",
      source_strategy_id: "so_vol_2",
      campaign_angle: "From our roastery to your office",
      messaging_pillar: "Specialty-grade beans, delivered for teams",
      channel_suitability: ["LinkedIn", "Email", "Direct"],
      confidence: "medium",
      requires_human_approval: true,
    },
    {
      feed_id: "cb_vol_4",
      source_strategy_id: "wt_vol_1",
      campaign_angle: "Same great cup, day or night",
      messaging_pillar: "We fixed our evenings — come see after work",
      channel_suitability: ["Instagram", "In-store", "Email"],
      confidence: "medium",
      requires_human_approval: true,
    },
  ],
};

const layaliStrategy: StrategyReportEnvelope = {
  report_id: "str_01HZXK9LAYALIRST9K2P",
  business_id: "biz_layali",
  created_at: iso(1000 * 60 * 60 * 30),
  business_type: "restaurant",
  strategic_posture: "Expand Beyond Walls",
  posture_rationale:
    "Layali's authenticity is constrained by physical capacity on its best nights. The winning move is to export the food advantage beyond the dining room (delivery bundles) while smoothing peak demand (reservations) — turning capacity from a ceiling into a choice.",
  tows_matrix: {
    SO: [
      {
        strategy_id: "so_lay_1",
        category: "SO",
        title: "Family-feast delivery bundles",
        description:
          "Package the authentic-food strength + family-dining value into delivery 'family feast' bundles on aggregators.",
        leverages: ["s_lay_01", "s_lay_02", "o_lay_01"],
        effort: 5,
        impact: 9,
        time_horizon: "0-3 months",
        confidence: 0.76,
      },
    ],
    ST: [
      {
        strategy_id: "st_lay_1",
        category: "ST",
        title: "Authenticity-led brand defense vs. cloud kitchens",
        description:
          "Lean into 'real kitchen, real recipes' storytelling cloud kitchens can't match — origin chef content, family-recipe series.",
        leverages: ["s_lay_01", "t_lay_01"],
        effort: 4,
        impact: 7,
        time_horizon: "0-3 months",
        confidence: 0.7,
      },
    ],
    WO: [
      {
        strategy_id: "wo_lay_1",
        category: "WO",
        title: "Reservations + quoted wait times",
        description:
          "Address weekend wait weakness while capturing the reservation opportunity: online booking + SMS waitlist with live quotes.",
        leverages: ["w_lay_01", "o_lay_02"],
        effort: 5,
        impact: 8,
        time_horizon: "0-3 months",
        confidence: 0.78,
      },
      {
        strategy_id: "wo_lay_2",
        category: "WO",
        title: "Peak-shift service playbook",
        description:
          "Fix service attentiveness weakness by codifying a peak-hour service sequence + runner role to reduce forgotten orders.",
        leverages: ["w_lay_02", "o_lay_02"],
        effort: 4,
        impact: 6,
        time_horizon: "1-3 months",
        confidence: 0.72,
      },
    ],
    WT: [
      {
        strategy_id: "wt_lay_1",
        category: "WT",
        title: "Off-peak loyalty to reduce weekend dependency",
        description:
          "Under capacity + competition threats, shift demand to off-peak with weekday family promotions, reducing weekend bottleneck exposure.",
        leverages: ["w_lay_01", "t_lay_01"],
        effort: 4,
        impact: 6,
        time_horizon: "1-3 months",
        confidence: 0.66,
      },
    ],
  },
  priority_action_plan: [
    {
      action_id: "pa_lay_1",
      title: "Launch family-feast delivery bundles",
      description:
        "3 bundle tiers on aggregators + own-channel, with family-quantity portions. Target 15% delivery revenue mix in 90 days.",
      priority: "P0",
      owner: "Operations + Marketing",
      effort: 5,
      impact: 9,
      timeframe: "0-3 months",
      kpi: "Delivery = 15% of revenue; bundle NPS > 60",
      dependencies: ["so_lay_1"],
    },
    {
      action_id: "pa_lay_2",
      title: "Deploy reservations + live waitlist",
      description:
        "Online booking + SMS waitlist with accurate quotes; reduce walk-away rate on peak nights.",
      priority: "P1",
      owner: "Operations Manager",
      effort: 5,
      impact: 8,
      timeframe: "0-3 months",
      kpi: "Peak walk-away ↓40%; 30% tables reserved",
      dependencies: ["wo_lay_1"],
    },
    {
      action_id: "pa_lay_3",
      title: "Authenticity brand series",
      description:
        "Chef + family-recipe content series to defend against cloud-kitchen price competition.",
      priority: "P2",
      owner: "Marketing Lead",
      effort: 4,
      impact: 7,
      timeframe: "1-3 months",
      kpi: "+20% branded search; 2 viral recipe posts",
      dependencies: ["st_lay_1"],
    },
  ],
  resource_assessment: [
    {
      resource_id: "res_lay_1",
      resource_type: "technology",
      name: "Reservations + waitlist system",
      current_state: "Phone-only booking",
      required_state: "Online booking + SMS waitlist",
      gap: "high",
      estimated_cost_usd: 7000,
    },
    {
      resource_id: "res_lay_2",
      resource_type: "human",
      name: "Delivery/kitchen expo role",
      current_state: "No dedicated expo for delivery orders",
      required_state: "Dedicated expo during peak delivery windows",
      gap: "medium",
      estimated_cost_usd: 12000,
    },
    {
      resource_id: "res_lay_3",
      resource_type: "brand",
      name: "Chef + recipe content production",
      current_state: "Occasional posts",
      required_state: "Bi-weekly recipe/chef video series",
      gap: "low",
      estimated_cost_usd: 5000,
    },
  ],
  campaign_brief_feed: [
    {
      feed_id: "cb_lay_1",
      source_strategy_id: "so_lay_1",
      campaign_angle: "Grandma's table, delivered",
      messaging_pillar: "The family feast that tastes like home, now at your door",
      channel_suitability: ["Instagram", "TikTok", "Delivery apps", "Email"],
      confidence: "high",
      requires_human_approval: false,
    },
    {
      feed_id: "cb_lay_2",
      source_strategy_id: "wo_lay_1",
      campaign_angle: "Book your Friday, skip the wait",
      messaging_pillar: "Reserve your table — we'll have it ready",
      channel_suitability: ["Instagram", "Google", "SMS"],
      confidence: "high",
      requires_human_approval: false,
    },
    {
      feed_id: "cb_lay_3",
      source_strategy_id: "st_lay_1",
      campaign_angle: "Real kitchen. Real recipes.",
      messaging_pillar: "Not a cloud kitchen — a family kitchen since day one",
      channel_suitability: ["Instagram", "TikTok"],
      confidence: "medium",
      requires_human_approval: true,
    },
  ],
};

const glowStrategy: StrategyReportEnvelope = {
  report_id: "str_01HZXKAGLOWSALON4F7T",
  business_id: "biz_glow_salon",
  created_at: iso(1000 * 60 * 60 * 50),
  business_type: "salon",
  strategic_posture: "Digital-First Loyalty",
  posture_rationale:
    "Glow's edge is relationship + environment; its leak is booking friction. A digital-first loyalty posture — self-serve booking tied to a visit ladder — simultaneously removes the leak and compounds the edge, while a bounded trial package widens the funnel.",
  tows_matrix: {
    SO: [
      {
        strategy_id: "so_glow_1",
        category: "SO",
        title: "Self-serve booking + loyalty ladder",
        description:
          "Combine the stylist-loyalty strength with the digital booking opportunity into a single app: book, track visits, unlock tiers.",
        leverages: ["s_glow_01", "o_glow_01"],
        effort: 6,
        impact: 9,
        time_horizon: "0-3 months",
        confidence: 0.8,
      },
    ],
    ST: [
      {
        strategy_id: "st_glow_1",
        category: "ST",
        title: "Relationship-led content vs. indie stylists",
        description:
          "Counter home-studio competition with 'your stylist knows you' content that indie operators can't sustain.",
        leverages: ["s_glow_01", "t_glow_01"],
        effort: 4,
        impact: 7,
        time_horizon: "0-3 months",
        confidence: 0.68,
      },
    ],
    WO: [
      {
        strategy_id: "wo_glow_1",
        category: "WO",
        title: "'Glow Introduction' trial package",
        description:
          "A bounded first-visit package (express service + consultation) to convert price-hesitant new clients without discounting premium services.",
        leverages: ["w_glow_02", "o_glow_02"],
        effort: 3,
        impact: 7,
        time_horizon: "0-2 months",
        confidence: 0.74,
      },
    ],
    WT: [
      {
        strategy_id: "wt_glow_1",
        category: "WT",
        title: "Premium value communication",
        description:
          "Address pricing weakness + indie competition by communicating the full value (products, environment, guarantee) so price feels justified.",
        leverages: ["w_glow_02", "t_glow_01"],
        effort: 4,
        impact: 6,
        time_horizon: "1-3 months",
        confidence: 0.62,
      },
    ],
  },
  priority_action_plan: [
    {
      action_id: "pa_glow_1",
      title: "Ship booking + loyalty app",
      description:
        "Self-serve booking, visit tracking, tier rewards. Cut phone-booking share to <30%.",
      priority: "P0",
      owner: "Owner + Tech",
      effort: 6,
      impact: 9,
      timeframe: "0-3 months",
      kpi: "60% bookings online; +18% visit frequency",
      dependencies: ["so_glow_1"],
    },
    {
      action_id: "pa_glow_2",
      title: "Launch 'Glow Introduction' package",
      description:
        "First-visit express package to lower trial friction; cap availability to protect premium positioning.",
      priority: "P1",
      owner: "Front Desk Lead",
      effort: 3,
      impact: 7,
      timeframe: "0-2 months",
      kpi: "+30% new-client trials; 35% convert to full service",
      dependencies: ["wo_glow_1"],
    },
    {
      action_id: "pa_glow_3",
      title: "'Your stylist' content series",
      description:
        "Weekly stylist-led content defending against indie competition.",
      priority: "P2",
      owner: "Marketing",
      effort: 4,
      impact: 6,
      timeframe: "1-3 months",
      kpi: "+25% branded DMs; 3 stylists hit 5k+ followers",
      dependencies: ["st_glow_1"],
    },
  ],
  resource_assessment: [
    {
      resource_id: "res_glow_1",
      resource_type: "technology",
      name: "Booking + loyalty platform",
      current_state: "Phone-only",
      required_state: "App/web booking + visit tracking + tiers",
      gap: "high",
      estimated_cost_usd: 11000,
    },
    {
      resource_id: "res_glow_2",
      resource_type: "brand",
      name: "Stylist content production",
      current_state: "Irregular posts",
      required_state: "Weekly stylist-led content",
      gap: "medium",
      estimated_cost_usd: 6000,
    },
    {
      resource_id: "res_glow_3",
      resource_type: "human",
      name: "Front-desk digital handoff",
      current_state: "Front desk handles all booking",
      required_state: "Front desk trained for digital onboarding",
      gap: "low",
      estimated_cost_usd: 2000,
    },
  ],
  campaign_brief_feed: [
    {
      feed_id: "cb_glow_1",
      source_strategy_id: "so_glow_1",
      campaign_angle: "Book in seconds, glow for weeks",
      messaging_pillar: "Your stylist, your time — now bookable in the app",
      channel_suitability: ["Instagram", "TikTok", "WhatsApp", "Email"],
      confidence: "high",
      requires_human_approval: false,
    },
    {
      feed_id: "cb_glow_2",
      source_strategy_id: "wo_glow_1",
      campaign_angle: "Meet Glow — your first visit, simplified",
      messaging_pillar: "A low-risk intro to the Glow experience",
      channel_suitability: ["Instagram", "TikTok", "In-salon"],
      confidence: "medium",
      requires_human_approval: true,
    },
    {
      feed_id: "cb_glow_3",
      source_strategy_id: "st_glow_1",
      campaign_angle: "Your stylist knows your hair",
      messaging_pillar: "Consistency a home stylist can't give you",
      channel_suitability: ["Instagram", "TikTok"],
      confidence: "medium",
      requires_human_approval: true,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Businesses                                                          */
/* ------------------------------------------------------------------ */

const initialBusinesses: Business[] = [
  {
    business_id: "biz_volume_cafe",
    name: "Volume Cafe",
    business_type: "cafe",
    description: "Specialty coffee shop — single-origin pours, morning ritual spot.",
    location: "Riyadh, SA",
    review_count: 1284,
    status: "active",
    has_swot: true,
    has_strategy: true,
    has_campaigns: true,
    created_at: iso(1000 * 60 * 60 * 24 * 40),
    updated_at: iso(1000 * 60 * 60 * 6),
    last_pipeline_run: iso(1000 * 60 * 60 * 6),
  },
  {
    business_id: "biz_layali",
    name: "Layali Restaurant",
    business_type: "restaurant",
    description: "Levantine family dining — authentic recipes, generous portions.",
    location: "Jeddah, SA",
    review_count: 968,
    status: "active",
    has_swot: true,
    has_strategy: true,
    has_campaigns: true,
    created_at: iso(1000 * 60 * 60 * 24 * 25),
    updated_at: iso(1000 * 60 * 60 * 30),
    last_pipeline_run: iso(1000 * 60 * 60 * 30),
  },
  {
    business_id: "biz_glow_salon",
    name: "Glow Salon & Spa",
    business_type: "salon",
    description: "Premium hair & beauty — trusted stylists, calm ambiance.",
    location: "Dubai, UAE",
    review_count: 542,
    status: "active",
    has_swot: true,
    has_strategy: true,
    has_campaigns: true,
    created_at: iso(1000 * 60 * 60 * 24 * 18),
    updated_at: iso(1000 * 60 * 60 * 50),
    last_pipeline_run: iso(1000 * 60 * 60 * 50),
  },
  {
    business_id: "biz_pulse_gym",
    name: "Pulse Fitness",
    business_type: "gym",
    description: "Boutique fitness studio — strength & HIIT classes.",
    location: "Riyadh, SA",
    review_count: 312,
    status: "draft",
    has_swot: false,
    has_strategy: false,
    has_campaigns: false,
    created_at: iso(1000 * 60 * 60 * 24 * 5),
    updated_at: iso(1000 * 60 * 60 * 24 * 2),
  },
];

/**
 * Persist mutable state on globalThis so it survives Next.js dev HMR and is
 * shared as a single instance across all route handlers (otherwise dev can
 * evaluate this module multiple times and mutations won't persist between
 * requests — the same pattern used for the Prisma client in src/lib/db.ts).
 */
type MockState = {
  businesses: Business[];
  swotReports: Record<string, SWOTReportEnvelope>;
  strategyReports: Record<string, StrategyReportEnvelope>;
};
const __g = globalThis as unknown as { __BIP_MOCK__?: MockState };
if (!__g.__BIP_MOCK__) {
  __g.__BIP_MOCK__ = {
    businesses: initialBusinesses,
    swotReports: {
      biz_volume_cafe: volumeCafeSwot,
      biz_layali: layaliSwot,
      biz_glow_salon: glowSwot,
    },
    strategyReports: {
      biz_volume_cafe: volumeCafeStrategy,
      biz_layali: layaliStrategy,
      biz_glow_salon: glowStrategy,
    },
  };
}
const businesses = __g.__BIP_MOCK__!.businesses;
const swotReports = __g.__BIP_MOCK__!.swotReports;
const strategyReports = __g.__BIP_MOCK__!.strategyReports;

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

const STAGE_META: Record<PipelineStageName, string> = {
  queued: "Queued",
  uploading: "Uploading",
  parsing: "Parsing reviews",
  themes: "Theme extraction",
  swot: "SWOT Agent",
  strategy: "Strategy Agent",
  campaigns: "Campaign briefs",
  mongo: "MongoDB persistence",
  done: "Done",
};

function buildStages(upTo: PipelineStageName): PipelineStage[] {
  const order: PipelineStageName[] = [
    "queued",
    "uploading",
    "parsing",
    "themes",
    "swot",
    "strategy",
    "campaigns",
    "mongo",
    "done",
  ];
  const idx = order.indexOf(upTo);
  return order.map((name, i) => {
    const status: PipelineStage["status"] =
      i < idx ? "completed" : i === idx ? "running" : "pending";
    return {
      name,
      label: STAGE_META[name],
      status,
      started_at: i <= idx ? iso(1000 * 60 * (idx - i)) : undefined,
      completed_at: i < idx ? iso(1000 * 60 * (idx - i - 1)) : undefined,
    };
  });
}

function completedPipeline(businessId: string): PipelineResult {
  return {
    business_id: businessId,
    run_id: `run_${Math.random().toString(36).slice(2, 10)}`,
    status: "completed",
    current_stage: "done",
    stages: buildStages("done").map((s) => ({
      ...s,
      status: "completed" as const,
      completed_at: s.completed_at ?? iso(0),
    })),
    started_at: iso(1000 * 60 * 2),
    completed_at: iso(0),
    report_ids: {
      swot: swotReports[businessId]?.report_id,
      strategy: strategyReports[businessId]?.report_id,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function listBusinesses(): BusinessListResponse {
  return { businesses, total: businesses.length };
}

export function getBusiness(businessId: string): Business | undefined {
  return businesses.find((b) => b.business_id === businessId);
}

export function createBusiness(body: CreateBusinessRequest): Business {
  const id = `biz_${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24)}_${Math.random().toString(36).slice(2, 6)}`;
  const b: Business = {
    business_id: id,
    name: body.name,
    business_type: body.business_type,
    description: body.description,
    location: body.location,
    review_count: 0,
    status: "draft",
    has_swot: false,
    has_strategy: false,
    has_campaigns: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  businesses.unshift(b);
  return b;
}

export function getSwotReport(businessId: string): SWOTReportEnvelope | undefined {
  return swotReports[businessId];
}

export function getStrategyReport(
  businessId: string,
): StrategyReportEnvelope | undefined {
  return strategyReports[businessId];
}

export function getCampaignsReport(
  businessId: string,
): CampaignsReportEnvelope | undefined {
  const strat = strategyReports[businessId];
  const swot = swotReports[businessId];
  if (!strat) return undefined;
  return {
    report_id: `cmp_${strat.report_id.slice(4)}`,
    business_id: businessId,
    created_at: strat.created_at,
    business_type: strat.business_type,
    engine_version: "campaign-feed-v1",
    campaigns: strat.campaign_brief_feed,
    meta: swot?.meta ?? {
      llm_provider_used: "vertex_ai",
      llm_model_used: "gemini-2.5-flash",
      fallback_used: false,
      processing_time_ms: 4200,
      cost_estimate_usd: 0.06,
    },
  };
}

/**
 * Generate SWOT + Strategy reports for a business that doesn't have them yet,
 * so running the pipeline on any business (incl. newly created / draft ones)
 * produces real, viewable intelligence. Type-aware: gym template for fitness,
 * generic local-business template otherwise.
 */
function ensureReports(b: Business): void {
  if (swotReports[b.business_id] && strategyReports[b.business_id]) return;
  const built =
    b.business_type === "gym" ? buildGymReports(b) : buildGenericReports(b);
  swotReports[b.business_id] = built.swot;
  strategyReports[b.business_id] = built.strategy;
}

function metaFor(seed: number) {
  return {
    llm_provider_used: "vertex_ai",
    llm_model_used: "gemini-2.5-flash",
    fallback_used: seed % 2 === 0,
    processing_time_ms: 6200 + seed * 137,
    cost_estimate_usd: 0.097 + seed * 0.013,
  };
}

function buildGymReports(b: Business): { swot: SWOTReportEnvelope; strategy: StrategyReportEnvelope } {
  const now = new Date().toISOString();
  const swot: SWOTReportEnvelope = {
    report_id: `swot_${b.business_id.toUpperCase().slice(4)}_GEN`,
    business_id: b.business_id,
    created_at: now,
    business_type: b.business_type,
    engine_version: "swot-agent",
    swot_report: {
      strengths: [
        {
          item_id: "s_gym_1",
          title: "Expert, motivating coaches drive results & retention",
          reasoning:
            "Coaches are named and praised across reviews; members credit them for visible results and accountability — the core retention engine of a boutique gym.",
          source_theme: "coaching_quality",
          scoring: { importance: 0.93, impact: 0.9, confidence: 0.88 },
          evidence_refs: [
            "Coach Omar pushed me to PRs I didn't think were possible. Best trainer I've had.",
            "المدربون محترفون ويحفزونك باستمرار، النتائج واضحة.",
            "The accountability from the coaches keeps me coming 4x a week.",
          ],
          frequency: 176,
        },
        {
          item_id: "s_gym_2",
          title: "High-energy group classes build community",
          reasoning:
            "Group-class energy is a recurring positive theme; members describe a community feel that increases visit frequency and word-of-mouth.",
          source_theme: "class_community",
          scoring: { importance: 0.82, impact: 0.8, confidence: 0.84 },
          evidence_refs: [
            "The HIIT class vibe is unreal — everyone cheers each other on.",
            "أجواء الحصص الجماعية رائعة وتحفّز على الحضور.",
          ],
          frequency: 132,
        },
      ],
      weaknesses: [
        {
          item_id: "w_gym_1",
          title: "Overcrowded peak hours frustrate members",
          reasoning:
            "Crowding at 6–8pm is the top complaint, affecting equipment access and class quality — a capacity bottleneck at the highest-demand slot.",
          source_theme: "peak_crowding",
          scoring: { importance: 0.86, impact: 0.82, confidence: 0.83 },
          evidence_refs: [
            "Showed up at 7pm and waited 15 min for a rack. Too packed.",
            "زحام وقت الذروة مزعج، انتظرت كثيراً للجهاز.",
          ],
          frequency: 118,
        },
        {
          item_id: "w_gym_2",
          title: "Class booking fills too fast",
          reasoning:
            "Members report classes selling out within minutes, indicating demand exceeds class capacity — a monetizable constraint disguised as a complaint.",
          source_theme: "booking_capacity",
          scoring: { importance: 0.74, impact: 0.7, confidence: 0.78 },
          evidence_refs: [
            "Can never get a spot in the 6pm class — gone in seconds.",
            "الحصص تمتلئ بسرعة، صعب أحجز مكان.",
          ],
          frequency: 86,
        },
      ],
      opportunities: [
        {
          item_id: "o_gym_1",
          title: "Tiered membership + class-pass subscription",
          reasoning:
            "Demand exceeds class capacity and crowding is the top weakness — a tiered membership (more classes / priority booking) monetizes demand while smoothing crowding via capacity expansion.",
          source_theme: "membership_monetization",
          scoring: { importance: 0.85, impact: 0.83, confidence: 0.72 },
          evidence_refs: [
            "I'd pay more for guaranteed class spots and priority booking.",
            "أدفع أكثر لو فيه حجز مضمون للحصص.",
          ],
          frequency: 64,
        },
        {
          item_id: "o_gym_2",
          title: "Corporate wellness B2B partnerships",
          reasoning:
            "Members mention employer wellness perks; a B2B corporate-membership channel extends the coaching strength into recurring enterprise revenue.",
          source_theme: "corporate_b2b",
          scoring: { importance: 0.72, impact: 0.74, confidence: 0.62 },
          evidence_refs: [
            "My company offers a wellness stipend — wish Pulse was a partner.",
            "شركتي تقدّم بدل لياقة، يتمنون يكون بلس شريك.",
          ],
          frequency: 41,
        },
      ],
      threats: [
        {
          item_id: "t_gym_1",
          title: "Low-cost chain gyms undercutting on price",
          reasoning:
            "Budget chain expansion in the area pressures the value perception of a premium boutique; differentiation must be defended actively.",
          source_theme: "price_competition",
          scoring: { importance: 0.74, impact: 0.7, confidence: 0.64 },
          evidence_refs: [
            "The new budget gym down the road is a third of the price.",
            "صالة جديدة رخيصة فتحت قريباً، الأسعار أقل بكثير.",
          ],
          frequency: 47,
        },
        {
          item_id: "t_gym_2",
          title: "Coach poaching by competitors",
          reasoning:
            "Coaches are the core strength; competitors actively recruiting them is a concentrated retention risk to the entire value proposition.",
          source_theme: "talent_poaching",
          scoring: { importance: 0.7, impact: 0.72, confidence: 0.58 },
          evidence_refs: [
            "Hope the coaches stay — heard a rival is hiring.",
            "أخاف ينتقل المدربون لصالة ثانية.",
          ],
          frequency: 23,
        },
      ],
    },
    strategic_summary: {
      main_advantage:
        "A coaching-led, high-energy community that budget chains cannot replicate — the engine of retention and word-of-mouth.",
      most_critical_risk:
        "Peak-hour overcrowding is turning the highest-demand slot into the worst experience and capping growth.",
      best_growth_opportunity:
        "Launch a tiered membership with priority class booking that monetizes excess demand while funding capacity expansion.",
    },
    meta: metaFor(2),
  };

  const strategy: StrategyReportEnvelope = {
    report_id: `str_${b.business_id.toUpperCase().slice(4)}_GEN`,
    business_id: b.business_id,
    created_at: now,
    business_type: b.business_type,
    strategic_posture: "Scale the Community",
    posture_rationale:
      "Pulse's edge is coaching + community; its ceiling is capacity. The winning posture is to monetize excess demand (tiered membership) to fund capacity (more classes / second studio) while locking in coaches — growing the community rather than discounting for it.",
    tows_matrix: {
      SO: [
        {
          strategy_id: "so_gym_1",
          category: "SO",
          title: "Tiered membership with priority booking",
          description:
            "Monetize coaching strength + excess demand: a premium tier with guaranteed class spots + priority booking.",
          leverages: ["s_gym_1", "o_gym_1"],
          effort: 4, impact: 9, time_horizon: "0-3 months", confidence: 0.78,
        },
      ],
      ST: [
        {
          strategy_id: "st_gym_1",
          category: "ST",
          title: "Community & results content vs. budget chains",
          description:
            "Defend premium positioning against price competition with member-results storytelling budget gyms can't match.",
          leverages: ["s_gym_1", "s_gym_2", "t_gym_1"],
          effort: 4, impact: 7, time_horizon: "0-3 months", confidence: 0.7,
        },
      ],
      WO: [
        {
          strategy_id: "wo_gym_1",
          category: "WO",
          title: "Add class capacity + off-peak pricing",
          description:
            "Address crowding + booking weakness while monetizing: add class slots and price off-peak lower to shift demand.",
          leverages: ["w_gym_1", "w_gym_2", "o_gym_1"],
          effort: 6, impact: 8, time_horizon: "1-4 months", confidence: 0.7,
        },
      ],
      WT: [
        {
          strategy_id: "wt_gym_1",
          category: "WT",
          title: "Coach retention program",
          description:
            "Neutralize the poaching threat protecting the core strength: retention bonuses, equity-style incentives, career paths.",
          leverages: ["s_gym_1", "t_gym_2"],
          effort: 5, impact: 8, time_horizon: "0-3 months", confidence: 0.74,
        },
      ],
    },
    priority_action_plan: [
      {
        action_id: "pa_gym_1",
        title: "Launch tiered membership + priority booking",
        description: "Premium tier with guaranteed class spots; fund capacity expansion from uplift.",
        priority: "P0", owner: "Owner + Product", effort: 4, impact: 9,
        timeframe: "0-3 months", kpi: "+20% ARPU; class sellout rate ↓30%", dependencies: ["so_gym_1"],
      },
      {
        action_id: "pa_gym_2",
        title: "Coach retention program",
        description: "Retention bonuses + career paths to protect the core strength.",
        priority: "P1", owner: "Owner", effort: 5, impact: 8,
        timeframe: "0-3 months", kpi: "Coach turnover ↓50%", dependencies: ["wt_gym_1"],
      },
      {
        action_id: "pa_gym_3",
        title: "Add peak class slots + off-peak pricing",
        description: "Expand capacity at peak and shift demand to off-peak via pricing.",
        priority: "P2", owner: "Operations", effort: 6, impact: 8,
        timeframe: "1-4 months", kpi: "Peak waitlist ↓40%", dependencies: ["wo_gym_1"],
      },
    ],
    resource_assessment: [
      { resource_id: "res_gym_1", resource_type: "technology", name: "Booking + membership platform", current_state: "Basic booking, no tiered billing", required_state: "Tiered membership + priority booking", gap: "medium", estimated_cost_usd: 8000 },
      { resource_id: "res_gym_2", resource_type: "human", name: "Additional peak-hour coaches", current_state: "Stretched at peak", required_state: "+2 coaches for peak slots", gap: "high", estimated_cost_usd: 22000 },
      { resource_id: "res_gym_3", resource_type: "capital", name: "Class capacity expansion", current_state: "Studio at capacity at peak", required_state: "Added slots / second studio", gap: "medium", estimated_cost_usd: 30000 },
    ],
    campaign_brief_feed: [
      { feed_id: "cb_gym_1", source_strategy_id: "so_gym_1", campaign_angle: "Never miss your spot", messaging_pillar: "Priority booking for members who are serious about results", channel_suitability: ["Instagram", "TikTok", "WhatsApp", "Email"], confidence: "high", requires_human_approval: false },
      { feed_id: "cb_gym_2", source_strategy_id: "st_gym_1", campaign_angle: "Real coaches. Real results.", messaging_pillar: "The community and coaching a budget gym can't give you", channel_suitability: ["Instagram", "TikTok"], confidence: "medium", requires_human_approval: true },
      { feed_id: "cb_gym_3", source_strategy_id: "wo_gym_1", campaign_angle: "Beat the crowd — train off-peak", messaging_pillar: "Off-peak pricing for the same elite coaching", channel_suitability: ["Instagram", "Email", "In-store"], confidence: "medium", requires_human_approval: true },
    ],
  };
  return { swot, strategy };
}

function buildGenericReports(b: Business): { swot: SWOTReportEnvelope; strategy: StrategyReportEnvelope } {
  const now = new Date().toISOString();
  const label = b.name;
  const swot: SWOTReportEnvelope = {
    report_id: `swot_${b.business_id.toUpperCase().slice(4)}_GEN`,
    business_id: b.business_id,
    created_at: now,
    business_type: b.business_type,
    engine_version: "swot-agent",
    swot_report: {
      strengths: [
        {
          item_id: "s_gen_1",
          title: "Strong customer relationships & repeat loyalty",
          reasoning:
            "Reviewers describe personal rapport and repeat visits — a relationship moat that drives word-of-mouth and lifetime value.",
          source_theme: "customer_relationship",
          scoring: { importance: 0.86, impact: 0.82, confidence: 0.8 },
          evidence_refs: [
            `I keep coming back to ${label} — they genuinely remember me.`,
            "التعامل راقي ويتذكرون العميل، دايما أرجع لهم.",
          ],
          frequency: 142,
        },
        {
          item_id: "s_gen_2",
          title: "Consistent product / service quality",
          reasoning:
            "Quality consistency is a recurring positive theme — the foundation that makes the relationship sustainable.",
          source_theme: "quality_consistency",
          scoring: { importance: 0.8, impact: 0.78, confidence: 0.82 },
          evidence_refs: [
            "Always reliable — never had a bad experience here.",
            "الجودة ثابتة وممتازة في كل زيارة.",
          ],
          frequency: 118,
        },
      ],
      weaknesses: [
        {
          item_id: "w_gen_1",
          title: "Booking / ordering friction at peak",
          reasoning:
            "Peak-time friction (waiting, phone-tag, slow responses) is the dominant complaint cluster — a conversion and retention leak.",
          source_theme: "peak_friction",
          scoring: { importance: 0.78, impact: 0.74, confidence: 0.76 },
          evidence_refs: [
            "Hard to get through at busy times — they miss messages.",
            "صعب التواصل وقت الزحمة، يتأخرون بالرد.",
          ],
          frequency: 96,
        },
        {
          item_id: "w_gen_2",
          title: "Premium pricing limits new-customer trial",
          reasoning:
            "First-timers cite price as a hesitation; without a low-risk entry, the top of funnel is constrained.",
          source_theme: "pricing_trial",
          scoring: { importance: 0.68, impact: 0.64, confidence: 0.7 },
          evidence_refs: [
            "Great but pricey — hesitant to commit without trying.",
            "السعر غالي شوي، متردد أجرب.",
          ],
          frequency: 71,
        },
      ],
      opportunities: [
        {
          item_id: "o_gen_1",
          title: "Digital booking + loyalty program",
          reasoning:
            "Peak friction + repeat loyalty = a self-serve booking app with a loyalty ladder removes the #1 weakness and compounds the #1 strength.",
          source_theme: "digital_loyalty",
          scoring: { importance: 0.84, impact: 0.82, confidence: 0.74 },
          evidence_refs: [
            "An app to book and track visits would be perfect.",
            "تطبيق للحجز والنقاط يكون ممتاز.",
          ],
          frequency: 58,
        },
        {
          item_id: "o_gen_2",
          title: "First-visit introductory package",
          reasoning:
            "A bounded trial package lowers risk for new clients without discounting the core premium offer.",
          source_theme: "trial_package",
          scoring: { importance: 0.7, impact: 0.68, confidence: 0.66 },
          evidence_refs: [
            "I'd try them with a smaller intro offer.",
            "أجربهم بعرض تجريبي بسيط.",
          ],
          frequency: 37,
        },
      ],
      threats: [
        {
          item_id: "t_gen_1",
          title: "New low-cost entrants in the area",
          reasoning:
            "Competitors with lower overhead are pricing aggressively, pressuring the value perception of the premium offer.",
          source_theme: "price_competition",
          scoring: { importance: 0.72, impact: 0.68, confidence: 0.62 },
          evidence_refs: [
            "Cheaper options keep opening nearby.",
            "خيارات أرخص تفتح قريباً.",
          ],
          frequency: 44,
        },
      ],
    },
    strategic_summary: {
      main_advantage:
        "Trusted relationships and consistent quality — the foundation of repeat business and referrals.",
      most_critical_risk:
        "Peak-time friction is quietly leaking conversions and turning the busiest moments into the worst experiences.",
      best_growth_opportunity:
        "Launch a digital booking + loyalty platform that removes friction and deepens retention simultaneously.",
    },
    meta: metaFor(3),
  };

  const strategy: StrategyReportEnvelope = {
    report_id: `str_${b.business_id.toUpperCase().slice(4)}_GEN`,
    business_id: b.business_id,
    created_at: now,
    business_type: b.business_type,
    strategic_posture: "Digital-First Loyalty",
    posture_rationale:
      "The edge is relationship + quality; the leak is peak friction. A digital-first loyalty posture removes the leak while compounding the edge, and a bounded trial widens the funnel — without discounting the premium core.",
    tows_matrix: {
      SO: [
        {
          strategy_id: "so_gen_1",
          category: "SO",
          title: "Self-serve booking + loyalty ladder",
          description: "Combine relationship strength + digital opportunity into one platform: book, track, unlock tiers.",
          leverages: ["s_gen_1", "o_gen_1"], effort: 6, impact: 9, time_horizon: "0-3 months", confidence: 0.78,
        },
      ],
      ST: [
        {
          strategy_id: "st_gen_1",
          category: "ST",
          title: "Relationship-led content vs. low-cost entrants",
          description: "Counter price competition with relationship + quality storytelling discount gyms/operators can't match.",
          leverages: ["s_gen_1", "s_gen_2", "t_gen_1"], effort: 4, impact: 7, time_horizon: "0-3 months", confidence: 0.68,
        },
      ],
      WO: [
        {
          strategy_id: "wo_gen_1",
          category: "WO",
          title: "First-visit introductory package",
          description: "Address pricing-trial weakness + trial opportunity with a bounded intro package.",
          leverages: ["w_gen_2", "o_gen_2"], effort: 3, impact: 7, time_horizon: "0-2 months", confidence: 0.72,
        },
      ],
      WT: [
        {
          strategy_id: "wt_gen_1",
          category: "WT",
          title: "Premium value communication",
          description: "Address pricing weakness + competition by communicating full value so price feels justified.",
          leverages: ["w_gen_2", "t_gen_1"], effort: 4, impact: 6, time_horizon: "1-3 months", confidence: 0.62,
        },
      ],
    },
    priority_action_plan: [
      { action_id: "pa_gen_1", title: "Ship booking + loyalty platform", description: "Self-serve booking, visit tracking, tier rewards.", priority: "P0", owner: "Owner + Tech", effort: 6, impact: 9, timeframe: "0-3 months", kpi: "60% bookings online; +18% visit frequency", dependencies: ["so_gen_1"] },
      { action_id: "pa_gen_2", title: "Launch introductory package", description: "Bounded first-visit package to lower trial friction.", priority: "P1", owner: "Front Desk", effort: 3, impact: 7, timeframe: "0-2 months", kpi: "+30% new trials; 35% convert", dependencies: ["wo_gen_1"] },
      { action_id: "pa_gen_3", title: "Relationship content series", description: "Weekly relationship/quality content defending against price competition.", priority: "P2", owner: "Marketing", effort: 4, impact: 6, timeframe: "1-3 months", kpi: "+25% branded DMs", dependencies: ["st_gen_1"] },
    ],
    resource_assessment: [
      { resource_id: "res_gen_1", resource_type: "technology", name: "Booking + loyalty platform", current_state: "Manual / phone booking", required_state: "App/web booking + tiers", gap: "high", estimated_cost_usd: 9000 },
      { resource_id: "res_gen_2", resource_type: "human", name: "Front-desk digital handoff", current_state: "Front desk handles all", required_state: "Trained for digital onboarding", gap: "low", estimated_cost_usd: 2000 },
      { resource_id: "res_gen_3", resource_type: "brand", name: "Relationship content production", current_state: "Irregular posts", required_state: "Weekly content", gap: "medium", estimated_cost_usd: 5000 },
    ],
    campaign_brief_feed: [
      { feed_id: "cb_gen_1", source_strategy_id: "so_gen_1", campaign_angle: "Book in seconds, come back for more", messaging_pillar: "Your place, your time — now bookable in the app", channel_suitability: ["Instagram", "TikTok", "WhatsApp", "Email"], confidence: "high", requires_human_approval: false },
      { feed_id: "cb_gen_2", source_strategy_id: "wo_gen_1", campaign_angle: "Meet us — your first visit, simplified", messaging_pillar: "A low-risk intro to the experience", channel_suitability: ["Instagram", "TikTok", "In-store"], confidence: "medium", requires_human_approval: true },
      { feed_id: "cb_gen_3", source_strategy_id: "st_gen_1", campaign_angle: "Relationships you can't price-cut", messaging_pillar: "The consistency discount operators can't give", channel_suitability: ["Instagram", "TikTok"], confidence: "medium", requires_human_approval: true },
    ],
  };
  return { swot, strategy };
}

export function runFullPipeline(businessId: string): PipelineResult {
  const b = getBusiness(businessId);
  if (b) {
    ensureReports(b);
    b.status = "active";
    b.has_swot = true;
    b.has_strategy = true;
    b.has_campaigns = true;
    b.last_pipeline_run = new Date().toISOString();
    b.updated_at = new Date().toISOString();
  }
  return completedPipeline(businessId);
}

export function uploadReviewsAndRun(
  businessId: string,
  _file: File,
): PipelineResult {
  const b = getBusiness(businessId);
  if (b) {
    // Simulate scraped review ingestion adding to review count.
    b.review_count += Math.floor(200 + Math.random() * 600);
    ensureReports(b);
    b.status = "active";
    b.has_swot = true;
    b.has_strategy = true;
    b.has_campaigns = true;
    b.last_pipeline_run = new Date().toISOString();
    b.updated_at = new Date().toISOString();
  }
  return completedPipeline(businessId);
}

export function getHistory(): { entries: HistoryEntry[]; total: number } {
  const entries: HistoryEntry[] = [];
  for (const b of businesses) {
    const swot = swotReports[b.business_id];
    const strat = strategyReports[b.business_id];
    if (swot) {
      entries.push({
        report_id: swot.report_id,
        business_id: b.business_id,
        business_name: b.name,
        business_type: b.business_type,
        kind: "swot",
        engine_version: swot.engine_version,
        llm_model_used: swot.meta.llm_model_used,
        fallback_used: swot.meta.fallback_used,
        processing_time_ms: swot.meta.processing_time_ms,
        cost_estimate_usd: swot.meta.cost_estimate_usd,
        created_at: swot.created_at,
      });
    }
    if (strat) {
      entries.push({
        report_id: strat.report_id,
        business_id: b.business_id,
        business_name: b.name,
        business_type: b.business_type,
        kind: "strategy",
        engine_version: "strategy-agent",
        llm_model_used: "gemini-2.5-flash",
        fallback_used: false,
        processing_time_ms: 6800,
        cost_estimate_usd: 0.11,
        created_at: strat.created_at,
      });
      entries.push({
        report_id: `cmp_${strat.report_id.slice(4)}`,
        business_id: b.business_id,
        business_name: b.name,
        business_type: b.business_type,
        kind: "campaigns",
        engine_version: "campaign-feed-v1",
        llm_model_used: "gemini-2.5-flash",
        fallback_used: false,
        processing_time_ms: 4200,
        cost_estimate_usd: 0.06,
        created_at: strat.created_at,
      });
    }
  }
  entries.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { entries, total: entries.length };
}

export type { CampaignBrief };
