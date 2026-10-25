# Team Coffee ☕ — Odin: The Contract War Room

> **TantraFiesta '26 | IIIT Nagpur — RAGNAROK Hackathon**  
> **Track 2:** *Odin: A Multi-Agent Contract Intelligence System for Risk Foresight*

---

## 👥 The Team
* **KIller13b** ([@KIller13b](https://github.com/KIller13b))
* **Devansh Bhasme** ([@devanshbhasme](https://github.com/devanshbhasme))
* **Aryan25875** ([@Aryan25875](https://github.com/Aryan25875))

---

## 📖 Overview
Organizations manage hundreds of interconnected contracts (cloud hosting, enterprise customers, sub-contractors, SLAs). Missed obligations, auto-renewals, and conflicting terms often cost companies tens of thousands of dollars before anyone notices.

**Odin** is a multi-agent contract intelligence system and war room that:
1. Ingests commercial contracts, corporate context, payment ledgers, and event streams.
2. Identifies obligations with **verbatim, unhallucinated citations**.
3. Projects risk dynamically along a **simulated clock**.
4. Tests findings **adversarially** through cross-agent debate.
5. Recommends and automatically drafts **concrete, citation-backed legal actions**.

---

## 🏛️ Multi-Agent Architecture

```text
                  ┌──────────────────────┐
                  │  ODIN (Orchestrator) │
                  │  Plans & Coordinates │
                  └──────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ THOR            │ │ THE NORNS       │ │ LOKI            │
│ The Extractor   │ │ The Timekeeper  │ │ Hostile Lawyer  │
│ Verbatim quotes │ │ Simulated clock │ │ Hunts for traps │
│ & obligations   │ │ & exposures     │ │ & contradictions│
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ HEIMDALL        │
                    │ The Sentinel    │
                    │ Monitors events │
                    │ & incident logs │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ TYR             │
                    │ The Arbitrator  │
                    │ Rulings & legal │
                    │ notice drafting │
                    └─────────────────┘
```

### Specialized Agents:
* **Odin (Allfather / Orchestrator):** Builds workstreams per contract and coordinates the cross-contract synthesis.
* **Thor (Extraction Agent):** Extracts parties, terms, SLAs, and penalties with confidence scores and exact clause citations (`doc_id`, `clause`, `verbatim_quote`).
* **The Norns (Timeline Agent):** Calculates commitments, auto-renewals, and worst-case financial liabilities across a advancing simulated clock (`clock.json`).
* **Loki (Adversarial Review Agent):** Scans contracts as opposing counsel to detect one-sided liabilities, ambiguities, and cross-contract conflicts (e.g. upstream vs downstream SLA mismatches).
* **Heimdall (Event Monitoring Agent):** Maps incoming real-world incidents (`events_drop1.jsonl`, `events_drop2.jsonl`, payments) to specific contract clauses and verifies claims.
* **Tyr (Arbitration & Action Agent):** Resolves Loki/Heimdall disputes and drafts ready-to-send legal notices (SLA refund claims, cure notices, termination letters).

---

## 📂 Project Structure
```text
team-coffee/
├── odin_data/                 # Canonical problem dataset
│   ├── bundle/
│   │   ├── company/           # Quillhub corporate profile
│   │   ├── contracts/         # Master STD, Cloud A1-A3, Customer B1-B2, C1, Contractor D1
│   │   ├── data/              # Payments ledger & holiday schedule
│   │   └── events/            # Operational event drops (Drop 1 & Drop 2)
│   ├── clock.json             # Simulated clock checkpoints
│   ├── docs/                  # Format specifications & citation rules
│   └── README.md
├── src/
│   ├── agents/                # Odin, Thor, Norns, Loki, Heimdall, Tyr
│   ├── core/                  # Citation verifier, state store, clock engine
│   └── utils/                 # Data parsers and helpers
├── backend/                   # API / Agent execution service
├── frontend/                  # Interactive War Room dashboard (Graph, Slider, Chat)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+

*(Setup and execution commands to be updated as services are spun up)*
