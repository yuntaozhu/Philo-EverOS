import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { 
  Network, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Bookmark, 
  BookOpen, 
  Info, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  Compass
} from "lucide-react";
import { AcademicProfile, ConsensusNode, ChatMessage } from "../types";

export interface TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  originalTerm: string;
  language: string;
  school: string;
  isProfileAnchor: boolean;
  profileAnchorRule?: string;
  isConsensus: boolean;
  consensusText?: string;
  mentionCount: number;
  isActiveInContext: boolean;
  category: "ontology" | "epistemology" | "phenomenology" | "dialectics" | "language";
}

export interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
  source: string | TopologyNode;
  target: string | TopologyNode;
  relation: string;
  type: "condition" | "tension" | "derivation" | "sublation" | "cooccurrence";
  weight: number;
  description?: string;
}

interface SemanticTopologyMapProps {
  messages: ChatMessage[];
  profile?: AcademicProfile;
  consensusList?: ConsensusNode[];
  onInsertToInput?: (text: string) => void;
}

// Canonical philosophical vocabulary with domain relations
const CANONICAL_PHILOSOPHICAL_CONCEPTS: Array<{
  id: string;
  name: string;
  originalTerm: string;
  aliases: string[];
  language: string;
  school: string;
  category: "ontology" | "epistemology" | "phenomenology" | "dialectics" | "language";
}> = [
  {
    id: "transcendental",
    name: "先验",
    originalTerm: "Transzendental",
    aliases: ["先验", "Transzendental", "Transcendental", "先验主体", "先验认识", "先验批判"],
    language: "德文 (Deutsch)",
    school: "康德 / 先验批判哲学",
    category: "epistemology"
  },
  {
    id: "apperzeption",
    name: "先验统觉",
    originalTerm: "Transzendentale Apperzeption",
    aliases: ["先验统觉", "统觉", "我思", "Apperzeption", "Ich denke", "纯粹统觉"],
    language: "德文 (Deutsch)",
    school: "康德 / 认识论公理",
    category: "epistemology"
  },
  {
    id: "dasein",
    name: "此在",
    originalTerm: "Dasein",
    aliases: ["此在", "Dasein", "生存论", "在者", "Jemeinigkeit", "向死存在"],
    language: "德文 (Deutsch)",
    school: "海德格尔 / 基础存在论",
    category: "ontology"
  },
  {
    id: "in-der-welt-sein",
    name: "在世界之中存在",
    originalTerm: "In-der-Welt-sein",
    aliases: ["在世界之中存在", "In-der-Welt-sein", "在世存在", "周围世界", "用具因缘"],
    language: "德文 (Deutsch)",
    school: "海德格尔 / 基础存在论",
    category: "ontology"
  },
  {
    id: "vorhandenheit",
    name: "现成存在",
    originalTerm: "Vorhandenheit",
    aliases: ["现成存在", "Vorhandenheit", "现成状态", "现成之物", "对象化凝视"],
    language: "德文 (Deutsch)",
    school: "海德格尔 / 存在论批判",
    category: "ontology"
  },
  {
    id: "zeitlichkeit",
    name: "时间性",
    originalTerm: "Zeitlichkeit",
    aliases: ["时间性", "Zeitlichkeit", "原初时间", "向死而生", "绽出的一统"],
    language: "德文 (Deutsch)",
    school: "海德格尔 / 存在论境域",
    category: "ontology"
  },
  {
    id: "substantia",
    name: "实体",
    originalTerm: "Substantia",
    aliases: ["实体", "Substantia", "斯宾诺莎实体", "自因", "Causa sui"],
    language: "拉丁文 (Latina)",
    school: "斯宾诺莎 / 唯理实体论",
    category: "ontology"
  },
  {
    id: "ousia",
    name: "本体 / 实事",
    originalTerm: "Οὐσία (Ousia)",
    aliases: ["Ousia", "Οὐσία", "第一本体", "第二本体", "本质"],
    language: "希腊文 (Greek)",
    school: "亚里士多德 / 形而上学",
    category: "ontology"
  },
  {
    id: "epoche",
    name: "现象学悬搁",
    originalTerm: "Epoché",
    aliases: ["悬搁", "Epoché", "加括号", "现象学还原", "中止判断"],
    language: "希腊/德文",
    school: "胡塞尔 / 纯粹现象学",
    category: "phenomenology"
  },
  {
    id: "aletheia",
    name: "无蔽 / 澄明",
    originalTerm: "Ἀλήθεια (Aletheia)",
    aliases: ["无蔽", "Aletheia", "Ἀλήθεια", "去蔽", "澄明", "真理的原初本质"],
    language: "希腊文 (Greek)",
    school: "海德格尔 / 存在之真理",
    category: "phenomenology"
  },
  {
    id: "aufhebung",
    name: "扬弃",
    originalTerm: "Aufhebung",
    aliases: ["扬弃", "Aufhebung", "否定之否定", "辩证法", "绝对精神"],
    language: "德文 (Deutsch)",
    school: "黑格尔 / 唯心辩证法",
    category: "dialectics"
  },
  {
    id: "differance",
    name: "延异",
    originalTerm: "Différance",
    aliases: ["延异", "Différance", "解构", "踪迹", "在场形而上学批判"],
    language: "法文 (Français)",
    school: "德里达 / 解构主义",
    category: "language"
  },
  {
    id: "sprachspiel",
    name: "语言游戏",
    originalTerm: "Sprachspiel",
    aliases: ["语言游戏", "Sprachspiel", "生活形式", "家族相似", "意义即使用"],
    language: "德文 (Deutsch)",
    school: "后期维特根斯坦 / 日常语言哲学",
    category: "language"
  },
  {
    id: "cogito",
    name: "我思实体",
    originalTerm: "Cogito / Res cogitans",
    aliases: ["我思", "Cogito", "Res cogitans", "思维实体", "笛卡尔我思"],
    language: "拉丁文 (Latina)",
    school: "笛卡尔 / 二元本体论",
    category: "epistemology"
  }
];

// Curated philosophical dialectical and lineage links
const CANONICAL_RELATIONS: Array<{
  sourceId: string;
  targetId: string;
  relation: string;
  type: TopologyLink["type"];
  weight: number;
  description: string;
}> = [
  {
    sourceId: "transcendental",
    targetId: "apperzeption",
    relation: "先验形式奠基",
    type: "condition",
    weight: 1.5,
    description: "先验统觉的综合统一是一切先验知识与客体范畴可能性的终极公理前提。"
  },
  {
    sourceId: "transcendental",
    targetId: "dasein",
    relation: "存在论解构 / 对勘",
    type: "tension",
    weight: 2.0,
    description: "海德格尔批判康德将主体无时间化、先验主体性错置为脱离世界的孤立知性机能。"
  },
  {
    sourceId: "dasein",
    targetId: "in-der-welt-sein",
    relation: "源初生存形态",
    type: "derivation",
    weight: 1.8,
    description: "此在的本质即是生存，其存在论原初宪章即是在世界之中存在。"
  },
  {
    sourceId: "in-der-welt-sein",
    targetId: "vorhandenheit",
    relation: "派生遮蔽 / 沉沦",
    type: "tension",
    weight: 1.6,
    description: "现成存在是由于用具因缘断裂后衍生出的对象化主客凝视，非原初实在。"
  },
  {
    sourceId: "dasein",
    targetId: "zeitlichkeit",
    relation: "存在论境域",
    type: "condition",
    weight: 1.7,
    description: "时间性是领会存在意义的源初生存论地平线。"
  },
  {
    sourceId: "substantia",
    targetId: "dasein",
    relation: "实体论 vs 生存论断裂",
    type: "tension",
    weight: 1.8,
    description: "斯宾诺莎的无限自因实体与海德格尔有限向死之此在在本体论开端上根本对立。"
  },
  {
    sourceId: "substantia",
    targetId: "ousia",
    relation: "范畴与词源演变",
    type: "derivation",
    weight: 1.3,
    description: "拉丁经院哲学术语 Substantia 源自亚里士多德第一本体 Ousia 的翻译与形而上学变迁。"
  },
  {
    sourceId: "ousia",
    targetId: "differance",
    relation: "在场形而上学解构",
    type: "tension",
    weight: 1.5,
    description: "德里达解构了自古希腊 Ousia 确立的‘在场’（Anwesenheit）特权体系。"
  },
  {
    sourceId: "apperzeption",
    targetId: "cogito",
    relation: "批判笛卡尔实体化我思",
    type: "tension",
    weight: 1.4,
    description: "康德先验统觉纯为反思综合机能，严禁如笛卡尔般偷换为思维实体（Res cogitans）。"
  },
  {
    sourceId: "epoche",
    targetId: "aletheia",
    relation: "现象学悬置与去蔽",
    type: "derivation",
    weight: 1.4,
    description: "通过悬搁自然态度，还原本体直观与无蔽显现之境域。"
  },
  {
    sourceId: "aufhebung",
    targetId: "transcendental",
    relation: "辩证超越",
    type: "sublation",
    weight: 1.3,
    description: "黑格尔将康德主观先验逻辑扬弃提升为绝对精神的辩证自我展开。"
  },
  {
    sourceId: "sprachspiel",
    targetId: "transcendental",
    relation: "日常语言消解先验形式",
    type: "tension",
    weight: 1.6,
    description: "后期维特根斯坦将先验理性范畴还原为生活形式中动态流变的语言游戏规则。"
  },
  {
    sourceId: "dasein",
    targetId: "aletheia",
    relation: "此在生存论揭示",
    type: "condition",
    weight: 1.5,
    description: "此在既在真理中又在非真理中，存在之去蔽（Aletheia）在此在之敞开中发生。"
  }
];

export const SemanticTopologyMap: React.FC<SemanticTopologyMapProps> = ({
  messages,
  profile,
  consensusList = [],
  onInsertToInput
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "active_only" | "profile_only">("all");
  const simulationRef = useRef<d3.Simulation<TopologyNode, TopologyLink> | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 180
  });

  // Observe container resizing with ResizeObserver & debouncing
  useEffect(() => {
    if (!containerRef.current) return;
    let timeoutId: NodeJS.Timeout | null = null;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = Math.max(320, Math.floor(entry.contentRect.width));
      const targetHeight = isExpanded ? 340 : 180;

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions((prev) => {
          if (prev.width === newWidth && prev.height === targetHeight) return prev;
          return { width: newWidth, height: targetHeight };
        });
      }, 100);
    });

    observer.observe(containerRef.current);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [isExpanded]);

  // Combine message text for active concept frequency scanning
  const combinedMessageText = useMemo(() => {
    return messages.map((m) => m.content).join(" ");
  }, [messages]);

  // Extract Profile Concept Anchors
  const profileAnchorKeys = useMemo(() => {
    if (!profile || !profile.concept_anchors) return [];
    return Object.keys(profile.concept_anchors);
  }, [profile]);

  // Extract EverOS Consensus Concepts
  const consensusConcepts = useMemo(() => {
    return consensusList.map((c) => c.concept);
  }, [consensusList]);

  // Build Topology Graph Nodes & Links dynamically
  const graphData = useMemo(() => {
    // 1. Calculate occurrence counts and profile flags for canonical concepts
    const nodesMap = new Map<string, TopologyNode>();

    CANONICAL_PHILOSOPHICAL_CONCEPTS.forEach((c) => {
      // Check if matches profile anchor
      const isProfileAnchor = profileAnchorKeys.some(
        (key) =>
          key.toLowerCase().includes(c.id.toLowerCase()) ||
          c.aliases.some((alias) => alias.toLowerCase().includes(key.toLowerCase())) ||
          c.name.toLowerCase().includes(key.toLowerCase())
      );

      const profileRule = isProfileAnchor
        ? Object.entries(profile?.concept_anchors || {}).find(
            ([key]) =>
              key.toLowerCase().includes(c.id.toLowerCase()) ||
              c.aliases.some((alias) => alias.toLowerCase().includes(key.toLowerCase())) ||
              c.name.toLowerCase().includes(key.toLowerCase())
          )?.[1]
        : undefined;

      // Check consensus
      const consensusMatch = consensusList.find(
        (cn) =>
          cn.concept.toLowerCase().includes(c.name.toLowerCase()) ||
          c.aliases.some((alias) => cn.concept.toLowerCase().includes(alias.toLowerCase()))
      );

      // Count occurrences in conversation messages
      let count = 0;
      c.aliases.forEach((alias) => {
        if (!alias) return;
        const regex = new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        const matches = combinedMessageText.match(regex);
        if (matches) {
          count += matches.length;
        }
      });

      nodesMap.set(c.id, {
        id: c.id,
        name: c.name,
        originalTerm: c.originalTerm,
        language: c.language,
        school: c.school,
        category: c.category,
        isProfileAnchor,
        profileAnchorRule: profileRule,
        isConsensus: !!consensusMatch,
        consensusText: consensusMatch?.affirmation,
        mentionCount: count,
        isActiveInContext: count > 0
      });
    });

    // Also add any custom Profile anchors that weren't in canonical list
    if (profile?.concept_anchors) {
      Object.entries(profile.concept_anchors).forEach(([key, rule]) => {
        const existing = Array.from(nodesMap.values()).find(
          (n) => n.id.toLowerCase() === key.toLowerCase() || n.name.includes(key)
        );
        if (!existing) {
          const customId = `profile-${key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          let count = 0;
          const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          const matches = combinedMessageText.match(regex);
          if (matches) count = matches.length;

          nodesMap.set(customId, {
            id: customId,
            name: key,
            originalTerm: key,
            language: "学术画像指定",
            school: profile.school_of_thought || "自定义研讨体系",
            category: "ontology",
            isProfileAnchor: true,
            profileAnchorRule: rule,
            isConsensus: false,
            mentionCount: count,
            isActiveInContext: count > 0
          });
        }
      });
    }

    // 2. Filter nodes based on user preference
    let allNodes = Array.from(nodesMap.values());
    if (filterMode === "active_only") {
      allNodes = allNodes.filter((n) => n.isActiveInContext || n.isProfileAnchor);
    } else if (filterMode === "profile_only") {
      allNodes = allNodes.filter((n) => n.isProfileAnchor || n.isConsensus);
    }

    const activeNodeIds = new Set(allNodes.map((n) => n.id));

    // 3. Collect Canonical Links where both endpoints exist
    const links: TopologyLink[] = [];
    CANONICAL_RELATIONS.forEach((rel) => {
      if (activeNodeIds.has(rel.sourceId) && activeNodeIds.has(rel.targetId)) {
        const sourceNode = nodesMap.get(rel.sourceId);
        const targetNode = nodesMap.get(rel.targetId);
        const bothActiveInChat = (sourceNode?.isActiveInContext ?? false) && (targetNode?.isActiveInContext ?? false);

        links.push({
          source: rel.sourceId,
          target: rel.targetId,
          relation: rel.relation,
          type: rel.type,
          weight: bothActiveInChat ? rel.weight * 1.5 : rel.weight,
          description: rel.description
        });
      }
    });

    // 4. If any custom profile anchors exist, connect them to nearest category nodes
    allNodes.forEach((node) => {
      if (node.id.startsWith("profile-")) {
        // Find a canonical anchor to bridge
        const bridgeCandidate = allNodes.find((n) => !n.id.startsWith("profile-") && n.isProfileAnchor);
        if (bridgeCandidate) {
          links.push({
            source: node.id,
            target: bridgeCandidate.id,
            relation: "画像概念锚定",
            type: "condition",
            weight: 1.2,
            description: "源自学者个人学术画像定义的先决本体论承诺。"
          });
        }
      }
    });

    return { nodes: allNodes, links };
  }, [profile, consensusList, combinedMessageText, profileAnchorKeys, filterMode]);

  // Statistics
  const activeCount = useMemo(() => graphData.nodes.filter((n) => n.isActiveInContext).length, [graphData]);
  const anchorCount = useMemo(() => graphData.nodes.filter((n) => n.isProfileAnchor).length, [graphData]);

  // D3 Rendering & Force Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isCollapsed) return;

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Defs for arrowheads & glows
    const defs = svg.append("defs");

    // Arrow markers
    const markerTypes = [
      { id: "arrow-condition", color: "#38bdf8" },
      { id: "arrow-tension", color: "#f87171" },
      { id: "arrow-derivation", color: "#fbbf24" },
      { id: "arrow-sublation", color: "#c084fc" },
      { id: "arrow-cooccurrence", color: "#34d399" }
    ];

    markerTypes.forEach((m) => {
      defs
        .append("marker")
        .attr("id", m.id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 22)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", m.color)
        .attr("opacity", 0.8);
    });

    // Filter for glowing profile anchors
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Main graph group with zoom support
    const g = svg.append("g").attr("class", "graph-root");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Deep clones to feed simulation safely
    const nodes: TopologyNode[] = graphData.nodes.map((d) => ({ ...d }));
    const links: TopologyLink[] = graphData.links.map((d) => ({ ...d }));

    // Create D3 Force Simulation
    const simulation = d3
      .forceSimulation<TopologyNode, TopologyLink>(nodes)
      .force(
        "link",
        d3
          .forceLink<TopologyNode, TopologyLink>(links)
          .id((d) => d.id)
          .distance((d) => (isExpanded ? 110 : 75) / (d.weight || 1))
      )
      .force("charge", d3.forceManyBody().strength(isExpanded ? -220 : -130))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => (d.isProfileAnchor ? 28 : 22)))
      .alphaDecay(0.04);

    simulationRef.current = simulation;

    // Render Links
    const linkGroup = g.append("g").attr("class", "links");
    const link = linkGroup
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => (d.weight > 1.5 ? 1.8 : 1.1))
      .attr("stroke", (d) => {
        switch (d.type) {
          case "tension":
            return "#f87171"; // red
          case "condition":
            return "#38bdf8"; // sky blue
          case "derivation":
            return "#fbbf24"; // amber
          case "sublation":
            return "#c084fc"; // purple
          default:
            return "#52525b";
        }
      })
      .attr("stroke-dasharray", (d) => (d.type === "tension" ? "4,3" : "none"))
      .attr("stroke-opacity", 0.5)
      .attr("marker-end", (d) => {
        switch (d.type) {
          case "tension":
            return "url(#arrow-tension)";
          case "condition":
            return "url(#arrow-condition)";
          case "derivation":
            return "url(#arrow-derivation)";
          case "sublation":
            return "url(#arrow-sublation)";
          default:
            return "url(#arrow-cooccurrence)";
        }
      });

    // Render Link Text Labels (shown in expanded view or on hover)
    const linkText = linkGroup
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .text((d) => d.relation)
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("fill", "#a8a29e")
      .attr("text-anchor", "middle")
      .attr("dy", -3)
      .attr("opacity", isExpanded ? 0.75 : 0)
      .style("pointer-events", "none");

    // Render Nodes Group
    const nodeGroup = g.append("g").attr("class", "nodes");

    const node = nodeGroup
      .selectAll<SVGGElement, TopologyNode>("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-item cursor-pointer")
      .call(
        d3
          .drag<SVGGElement, TopologyNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Profile Anchor Halo / Glow Ring
    node
      .filter((d) => d.isProfileAnchor)
      .append("circle")
      .attr("r", isExpanded ? 21 : 16)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3,2")
      .attr("filter", "url(#glow)")
      .attr("opacity", 0.9);

    // Context Active Pulsing Ring
    node
      .filter((d) => d.isActiveInContext && !d.isProfileAnchor)
      .append("circle")
      .attr("r", isExpanded ? 18 : 14)
      .attr("fill", "none")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1.2)
      .attr("opacity", 0.7);

    // Main Circle
    node
      .append("circle")
      .attr("r", (d) => {
        if (d.isProfileAnchor) return isExpanded ? 15 : 12;
        if (d.isActiveInContext) return isExpanded ? 13 : 10;
        return isExpanded ? 10 : 8;
      })
      .attr("fill", (d) => {
        if (d.isProfileAnchor) return "#78350f"; // warm deep amber
        if (d.isActiveInContext) return "#0369a1"; // deep ocean blue
        if (d.isConsensus) return "#065f46"; // emerald
        return "#27272a"; // dark zinc
      })
      .attr("stroke", (d) => {
        if (d.isProfileAnchor) return "#fbbf24";
        if (d.isActiveInContext) return "#38bdf8";
        if (d.isConsensus) return "#34d399";
        return "#71717a";
      })
      .attr("stroke-width", (d) => (d.isProfileAnchor || d.isActiveInContext ? 2 : 1.2));

    // Node labels
    node
      .append("text")
      .text((d) => d.name)
      .attr("dy", (d) => (d.isProfileAnchor ? (isExpanded ? 26 : 22) : isExpanded ? 22 : 18))
      .attr("text-anchor", "middle")
      .attr("font-family", "serif")
      .attr("font-size", (d) => (d.isProfileAnchor ? "11px" : "10px"))
      .attr("font-weight", (d) => (d.isProfileAnchor || d.isActiveInContext ? "600" : "400"))
      .attr("fill", (d) => {
        if (d.isProfileAnchor) return "#fef3c7";
        if (d.isActiveInContext) return "#e0f2fe";
        return "#d6d3d1";
      })
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.9)")
      .style("pointer-events", "none");

    // Hover & Click Interactions
    node
      .on("mouseenter", (event, d) => {
        setHoveredNode(d);

        // Highlight connected edges & neighbors
        const connectedNodeIds = new Set<string>([d.id]);
        link.each((l: any) => {
          const sId = typeof l.source === "object" ? l.source.id : l.source;
          const tId = typeof l.target === "object" ? l.target.id : l.target;
          if (sId === d.id) connectedNodeIds.add(tId);
          if (tId === d.id) connectedNodeIds.add(sId);
        });

        node.attr("opacity", (n) => (connectedNodeIds.has(n.id) ? 1 : 0.25));
        link.attr("stroke-opacity", (l: any) => {
          const sId = typeof l.source === "object" ? l.source.id : l.source;
          const tId = typeof l.target === "object" ? l.target.id : l.target;
          return sId === d.id || tId === d.id ? 0.95 : 0.1;
        });
        linkText.attr("opacity", (l: any) => {
          const sId = typeof l.source === "object" ? l.source.id : l.source;
          const tId = typeof l.target === "object" ? l.target.id : l.target;
          return sId === d.id || tId === d.id ? 1 : 0;
        });
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        node.attr("opacity", 1);
        link.attr("stroke-opacity", 0.5);
        linkText.attr("opacity", isExpanded ? 0.75 : 0);
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
      });

    // Simulation tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkText
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, isExpanded, isCollapsed, dimensions]);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="border-b border-stone-800 bg-stone-950 text-stone-200 transition-all duration-200 relative overflow-hidden"
    >
      {/* Topology Top Header & Controls */}
      <div className="px-3.5 py-1.5 bg-stone-900/95 flex items-center justify-between border-b border-stone-800/80 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-amber-400">
            <Network className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-semibold text-[11.5px] text-stone-100 tracking-wide font-serif">
              概念语义关系拓扑 (D3 Semantic Graph)
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-stone-400 pl-1 border-l border-stone-700">
            <span className="bg-amber-950/70 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/60">
              画像锚点: {anchorCount}
            </span>
            <span className="bg-sky-950/70 text-sky-300 px-1.5 py-0.2 rounded border border-sky-800/60">
              对话唤醒: {activeCount}
            </span>
            <span className="text-stone-500 hidden md:inline">
              · 共勘连线: {graphData.links.length}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Filter Pills */}
          <div className="hidden md:flex items-center space-x-1 text-[10.5px]">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                filterMode === "all" ? "bg-stone-700 text-stone-100" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              全部 ({graphData.nodes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("active_only")}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                filterMode === "active_only" ? "bg-stone-700 text-sky-300" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              仅激活
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("profile_only")}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                filterMode === "profile_only" ? "bg-stone-700 text-amber-300" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              画像锚点
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
            title="居中重置拓扑视角"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
            title={isExpanded ? "收起为精简微型模式" : "展开为全屏大拓扑"}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700"
            title={isCollapsed ? "展开拓扑图" : "折叠拓扑图"}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* D3 Graph Canvas */}
      {!isCollapsed && (
        <div className="relative bg-gradient-to-b from-stone-950 to-stone-900 select-none">
          <svg
            ref={svgRef}
            className="w-full transition-all duration-200"
            style={{ height: isExpanded ? 340 : 180 }}
          />

          {/* Micro Legend & Interaction Tip */}
          <div className="absolute bottom-1.5 left-2.5 flex items-center space-x-3 text-[10px] font-mono text-stone-400 pointer-events-none bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800/80 backdrop-blur-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-amber-300/80" />
              <span>学术画像锚点</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>对话研讨高频唤醒</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-0.5 bg-red-400 inline-block" />
              <span>张力/对勘</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-0.5 bg-sky-400 inline-block" />
              <span>先决条件</span>
            </span>
            <span className="text-stone-500 hidden sm:inline">拖拽节点 / 滚轮缩放 / 点击查看锚定</span>
          </div>

          {/* Dynamic Hover Tooltip / Detail Floater */}
          {(hoveredNode || selectedNode) && (
            <div className="absolute top-2 right-2 max-w-xs bg-stone-900/95 border border-stone-700 rounded-lg p-2.5 text-xs shadow-xl backdrop-blur-md animate-in fade-in duration-100 z-20 font-serif">
              {(() => {
                const node = hoveredNode || selectedNode;
                if (!node) return null;

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1 border-b border-stone-800 pb-1">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-stone-100 text-sm">{node.name}</span>
                          <span className="font-mono text-[10px] text-amber-300">
                            {node.originalTerm}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-mono text-stone-400">
                          {node.school} · {node.language}
                        </div>
                      </div>

                      {selectedNode && (
                        <button
                          type="button"
                          onClick={() => setSelectedNode(null)}
                          className="text-stone-500 hover:text-stone-300 font-mono text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Profile Anchor Directive */}
                    {node.isProfileAnchor && node.profileAnchorRule && (
                      <div className="bg-amber-950/60 border border-amber-700/60 rounded p-1.5 text-[11px] text-amber-200">
                        <div className="flex items-center space-x-1 font-mono text-[9.5px] text-amber-400 font-bold mb-0.5">
                          <Bookmark className="w-3 h-3" />
                          <span>学者画像先验约束 (Concept Anchor)</span>
                        </div>
                        <div className="leading-snug">{node.profileAnchorRule}</div>
                      </div>
                    )}

                    {/* Consensus Context */}
                    {node.isConsensus && node.consensusText && (
                      <div className="bg-emerald-950/60 border border-emerald-700/60 rounded p-1.5 text-[11px] text-emerald-200">
                        <div className="flex items-center space-x-1 font-mono text-[9.5px] text-emerald-400 font-bold mb-0.5">
                          <BookOpen className="w-3 h-3" />
                          <span>EverOS 共识图谱</span>
                        </div>
                        <div className="leading-snug">{node.consensusText}</div>
                      </div>
                    )}

                    {/* Context Occurrence in current Seminar */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-0.5">
                      <span>本轮研讨出现频次:</span>
                      <span className={node.mentionCount > 0 ? "text-sky-300 font-bold" : "text-stone-500"}>
                        {node.mentionCount} 次
                      </span>
                    </div>

                    {/* Action Links */}
                    {onInsertToInput && (
                      <div className="pt-1 border-t border-stone-800 flex items-center justify-between text-[10.5px] font-mono">
                        <button
                          type="button"
                          onClick={() =>
                            onInsertToInput(
                              `/deconstruct 剖析概念【${node.name}】(${node.originalTerm})之形式推论前提与先验假定。`
                            )
                          }
                          className="text-amber-400 hover:text-amber-300 flex items-center space-x-0.5"
                        >
                          <span>解构形式前提</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onInsertToInput(
                              `/etymology 追踪概念【${node.name}】(${node.originalTerm})从古典到现当代的词源演变。`
                            )
                          }
                          className="text-sky-400 hover:text-sky-300"
                        >
                          词源考释
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
