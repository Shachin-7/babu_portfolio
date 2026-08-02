import { useState, useEffect, useCallback, useRef } from "react";
import "./role-experience.css";

/**
 * Ordered left to right in the stack = chronological (oldest on the right,
 * most recent card on the left).
 */
const ROLES = [
  {
    id: "abb-pmm",
    company: "ABB",
    location: "Bloomfield, CT",
    years: "2018 – Present",
    title: "Product Marketing Manager",
    visual: "graph",
    summary:
      "Lead commercial strategy for Automatic Transfer Switches (ATS), energy management systems, and digital power solutions supporting mission-critical applications across North America.",
    bullets: [
      {
        label: "Strategic & Portfolio Leadership",
        text: "Develop segment-specific strategies aligned to price realization, market share growth, and profitability.",
      },
      {
        label: "Product Marketing",
        text: "Support long-term product lifecycle strategy and customer segment alignment.",
      },
      {
        label: "Impact",
        text: "Positioned portfolio to achieve 3x revenue growth vs. 2025 baseline.",
      },
    ],
    tags: ["PORTFOLIO STRATEGY", "PRICING", "REVENUE GROWTH"],
  },
  {
    id: "abb-npi",
    company: "ABB",
    location: "Bloomfield, CT",
    years: "2018 – Present",
    title: "NPI Commercialization Lead",
    visual: "chat",
    summary:
      "Drive New Product Introduction (NPI) life cycles, launch planning, and sales readiness to accelerate technology adoption across the distribution portfolio.",
    bullets: [
      {
        label: "NPI Execution",
        text: "Own cross-functional launch readiness from concept gate through general availability.",
      },
      {
        label: "Launch Planning",
        text: "Build go-to-market timelines and readiness checklists for new platform releases.",
      },
      {
        label: "Sales Enablement",
        text: "Equip field and channel teams with positioning, training, and launch collateral.",
      },
    ],
    tags: ["NPI EXECUTION", "LAUNCH PLANNING", "SALES ENABLEMENT"],
  },
  {
    id: "abb-hyperscale",
    company: "ABB",
    location: "Bloomfield, CT",
    years: "2018 – Present",
    title: "Hyperscale Partner Acceleration",
    visual: "nodes",
    summary:
      "Accelerating strategic partnerships and modular power distribution packages for hyperscale cloud data center segments.",
    bullets: [
      {
        label: "Hyperscale Partners",
        text: "Engage with cloud data center operators and engineering consultants to specify custom electrical distribution packages.",
      },
      {
        label: "Modular Strategy",
        text: "Push design-in of modular power skids to shrink lead times and lower field construction costs.",
      },
      {
        label: "Cloud Acceleration",
        text: "Direct segment initiatives for hyperscale accounts across global engineering clusters.",
      },
    ],
    tags: ["HYPERSCALE PARTNERS", "CLOUD ACCELERATION", "STRATEGIC ACCOUNTS"],
  },
  {
    id: "ge-global-pm",
    company: "GE Industrial Solutions",
    location: "Plainville, CT",
    years: "2015 – 2018",
    title: "Global Product Marketing Leader",
    visual: "funnel",
    summary:
      "Directed global commercialization strategy and competitive value differentiation for critical power distribution systems.",
    bullets: [
      {
        label: "GTM Strategy",
        text: "Set global go-to-market direction across regional product marketing teams.",
      },
      {
        label: "Launch Execution",
        text: "Ran launch execution end to end for new distribution platforms.",
      },
      {
        label: "Pricing Analysis",
        text: "Led competitive pricing analysis to defend and grow share.",
      },
    ],
    tags: ["GTM STRATEGY", "LAUNCH EXECUTION", "PRICING ANALYSIS"],
  },
  {
    id: "ge-systems-engineer",
    company: "GE Industrial Solutions",
    location: "India & Plainville, CT",
    years: "2004 – 2015",
    title: "Senior Lead Systems Engineer",
    visual: "circuit",
    summary:
      "Developed multi-generation product plans, technical-commercial roadmaps, and systems architectures for utilities.",
    bullets: [
      {
        label: "Product Strategy & Technical Leadership",
        text: "Developed multi-generation product plans integrating market demand forecasting and profitability analysis.",
      },
      {
        label: "NPI Support",
        text: "Supported new product launches with technical-commercial alignment.",
      },
      {
        label: "Client Facing",
        text: "Presented technical and commercial solutions to utilities, industrial customers, and engineering consultants.",
      },
    ],
    tags: ["PRODUCT STRATEGY", "TECHNICAL LEADERSHIP", "SYSTEMS DESIGN"],
  },
  {
    id: "tvs-cherry",
    company: "TVS Cherry",
    location: "India",
    years: "1999 – 2004",
    title: "Development Engineer",
    visual: "blueprint",
    summary:
      "Led NPI engineering design-for-manufacturability and production efficiency for high-reliability electrical components.",
    bullets: [
      {
        label: "Product Development",
        text: "Led mechanical and electromechanical development of switches and sensors.",
      },
      {
        label: "NPI Design",
        text: "Created robust product specs and validation protocols under TVS Cherry joint venture.",
      },
      {
        label: "Process Optimization",
        text: "Improved manufacturability and production efficiency across the product line.",
      },
    ],
    tags: ["PRODUCT DEVELOPMENT", "NPI DESIGN", "PROCESS OPTIMIZATION"],
  },
];

function RenderVisual({ type }) {
  if (type === "graph") {
    return (
      <div className="card-visual graph-visual">
        <span className="card-visual-badge">GROWTH</span>
        <div className="graph-container">
          <div className="graph-line"></div>
          <div className="graph-bar" style={{ height: "55%" }}></div>
          <div className="graph-bar" style={{ height: "35%" }}></div>
          <div className="graph-bar active" style={{ height: "85%" }}></div>
          <div className="graph-bar" style={{ height: "65%" }}></div>
        </div>
      </div>
    );
  }
  if (type === "chat") {
    return (
      <div className="card-visual chat-visual">
        <span className="card-visual-badge">LAUNCH</span>
        <div className="chat-container">
          <div className="chat-bubble bubble-1">
            <div className="chat-avatar orange-avatar">✦</div>
            <div className="chat-text">
              <span className="chat-user">User 12</span>
              <p>Hey, can we enable the NPI platform?</p>
            </div>
          </div>
          <div className="chat-bubble bubble-2">
            <div className="chat-avatar text-avatar">MJ</div>
            <div className="chat-text">
              <span className="chat-user">Mallory Jen <span className="online-dot"></span></span>
              <p>Checklists are complete, launching Monday!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "nodes") {
    return (
      <div className="card-visual nodes-visual">
        <span className="card-visual-badge">CLOUD</span>
        <div className="nodes-container">
          <svg className="nodes-svg" viewBox="0 0 200 100">
            <line x1="30" y1="50" x2="100" y2="25" stroke="rgba(21, 21, 20, 0.15)" strokeWidth="1.5" />
            <line x1="30" y1="50" x2="100" y2="75" stroke="rgba(21, 21, 20, 0.15)" strokeWidth="1.5" />
            <line x1="100" y1="25" x2="170" y2="50" stroke="rgba(21, 21, 20, 0.15)" strokeWidth="1.5" />
            <line x1="100" y1="75" x2="170" y2="50" stroke="rgba(21, 21, 20, 0.15)" strokeWidth="1.5" />
            <line x1="100" y1="25" x2="100" y2="75" stroke="rgba(21, 21, 20, 0.15)" strokeWidth="1.5" />
            <circle cx="30" cy="50" r="6" fill="#151514" />
            <circle cx="100" cy="25" r="6" fill="#f0592c" className="glow-node" />
            <circle cx="100" cy="75" r="6" fill="#151514" />
            <circle cx="170" cy="50" r="6" fill="#151514" />
          </svg>
        </div>
      </div>
    );
  }
  if (type === "funnel") {
    return (
      <div className="card-visual funnel-visual">
        <span className="card-visual-badge">GTM</span>
        <div className="funnel-container">
          <div className="funnel-tier tier-1">Strategy</div>
          <div className="funnel-tier tier-2">Pricing</div>
          <div className="funnel-tier tier-3">Growth</div>
        </div>
      </div>
    );
  }
  if (type === "circuit") {
    return (
      <div className="card-visual circuit-visual">
        <span className="card-visual-badge">SYSTEMS</span>
        <div className="circuit-container">
          <div className="circuit-block">IN</div>
          <div className="circuit-line"><span className="pulse"></span></div>
          <div className="circuit-gate">&amp;</div>
          <div className="circuit-line"></div>
          <div className="circuit-block active">OUT</div>
        </div>
      </div>
    );
  }
  if (type === "blueprint") {
    return (
      <div className="card-visual blueprint-visual">
        <span className="card-visual-badge">NPI</span>
        <div className="blueprint-container">
          <div className="blueprint-ring"></div>
          <div className="blueprint-crosshair"></div>
          <div className="blueprint-line h"></div>
          <div className="blueprint-line v"></div>
        </div>
      </div>
    );
  }
  return null;
}

export default function RoleExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState(null); // null = closed

  const isModalOpen = modalIndex !== null;

  const openModal = (i) => setModalIndex(i);
  const closeModal = () => setModalIndex(null);
  const goPrev = useCallback(
    () => setModalIndex((i) => (i - 1 + ROLES.length) % ROLES.length),
    []
  );
  const goNext = useCallback(
    () => setModalIndex((i) => (i + 1) % ROLES.length),
    []
  );

  // Keyboard nav for the modal
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, goPrev, goNext]);

  // Group roles into rows of 2
  const chunkedRoles = [];
  for (let i = 0; i < ROLES.length; i += 2) {
    chunkedRoles.push(ROLES.slice(i, i + 2));
  }

  return (
    <section className="role-exp" aria-label="Experience">
      <div className="role-exp-grid">
        {chunkedRoles.map((pair, rowIndex) => (
          <div className="role-exp-row" key={rowIndex}>
            {pair.map((role, pairIndex) => {
              const globalIndex = rowIndex * 2 + pairIndex;
              const isActive = globalIndex === activeIndex;
              return (
                <button
                  type="button"
                  key={role.id}
                  className={`role-exp-card${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  onFocus={() => setActiveIndex(globalIndex)}
                  onClick={() => openModal(globalIndex)}
                  aria-label={`${role.company} — ${role.title}`}
                >
                  <div className="role-exp-card-content-wrap">
                    <div className="role-exp-card-top">
                      <span className="role-exp-company">{role.company}</span>
                      <span className="role-exp-years">{role.years}</span>
                    </div>

                    <div className="role-exp-card-body">
                      <p className="role-exp-summary">{role.summary}</p>
                      <div className="role-exp-tags">
                        {role.tags.slice(0, 2).map((t) => (
                          <span className="role-exp-tag" key={t}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="role-exp-card-bottom">
                      <span className="role-exp-eyebrow">
                        {role.company} | {role.title.toUpperCase()}
                      </span>
                      <h3 className="role-exp-title">{role.title}</h3>
                    </div>
                  </div>

                  <div className="card-visual-wrapper">
                    <RenderVisual type={role.visual} />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="role-exp-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="role-exp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="role-exp-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>

            <button
              className="role-exp-arrow role-exp-arrow-left"
              onClick={goPrev}
              aria-label="Previous role"
            >
              ←
            </button>

            <div className="role-exp-modal-content">
              <span className="role-exp-modal-years">
                {ROLES[modalIndex].years.toUpperCase()}
              </span>
              <h2 className="role-exp-modal-title">
                {ROLES[modalIndex].title.toUpperCase()}
              </h2>
              <p className="role-exp-modal-meta">
                {ROLES[modalIndex].company}
                {ROLES[modalIndex].location ? ` | ${ROLES[modalIndex].location}` : ""}
              </p>

              <hr className="role-exp-divider" />

              <p className="role-exp-modal-summary">
                {ROLES[modalIndex].summary}
              </p>

              <ul className="role-exp-bullets">
                {ROLES[modalIndex].bullets.map((b) => (
                  <li key={b.label}>
                    <strong>{b.label}:</strong> {b.text}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="role-exp-arrow role-exp-arrow-right"
              onClick={goNext}
              aria-label="Next role"
            >
              →
            </button>

            <div className="role-exp-dots">
              {ROLES.map((_, i) => (
                <span
                  key={i}
                  className={`role-exp-dot${i === modalIndex ? " is-active" : ""}`}
                  onClick={() => setModalIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
