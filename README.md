# Team Coffee ☕ — Odin: The Contract War Room

> **TantraFiesta '26 | IIIT Nagpur — RAGNAROK Hackathon**  
> **Track 2:** *Odin: A Multi-Agent Contract Intelligence System for Risk Foresight*  
> **Target Enterprise:** *Quillhub Inc. (Austin, TX — Route Optimization B2B SaaS)*

---

## 👥 The Team
* **KIller13b** ([@KIller13b](https://github.com/KIller13b))
* **Devansh Bhasme** ([@devanshbhasme](https://github.com/devanshbhasme))
* **Aryan25875** ([@Aryan25875](https://github.com/Aryan25875))

---

# Odin: The Contract War Room
**Autonomous Multi-Agent Contract Intelligence Engine for Quillhub Inc.**  
*Track 2 — RAGNAROK Hackathon*

---

## ⚡ Overview

**Odin** is a multi-agent risk war room and legal intelligence engine built to solve the **Quillhub Inc.** contract portfolio challenge. 

Unlike single-call static LLM summarizers, Odin coordinates six specialized agents across temporal simulated checkpoints and real-world event feeds to continuously extract obligations, project deadlines, simulate adversarial attacks, monitor incidents, arbitrate disputes, and draft ready-to-send legal notices grounded in verbatim citations.

```
                      ┌──────────────────────┐
                      │    ODIN (FR1)        │
                      │ Orchestrator & Plans │
                      └──────────┬───────────┘
                                 │
     ┌────────────────┬──────────┴─────────┬────────────────┐
     ▼                ▼                     ▼                ▼
┌─────────┐      ┌─────────┐           ┌─────────┐      ┌─────────┐
│  THOR   │      │  NORNS  │           │  LOKI   │      │HEIMDALL │
│  (FR2)  │      │  (FR3)  │           │  (FR4)  │      │  (FR5)  │
│Extract &│      │Timeline │           │Adversary│      │Events & │
│ Ground  │      │Exposure │           │ Attacks │      │ Alerts  │
└────┬────┘      └─────────┘           └────┬────┘      └────┬────┘
     │                                      │                │
     │   Clarifications                     │ Debate/Verify  │
     └──────────────────────────────────────┴───────┬────────┘
                                                    ▼
                                              ┌───────────┐
                                              │ TYR (FR6) │
                                              │Arbitration│
                                              │ & Actions │
                                              └───────────┘
```

---

## 🎯 PS-2 ODIN Benchmark Verification

### Question 1: Is Quillhub in default or material breach of Harbor Retail (B1), unrelated to service outages?
1. **Imminent Material Breach of Insurance Covenant ([B1 §7.1 & §7.2](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/contracts/B1.txt#L107))**:
   - Both Meridian Mutual policies (MML-2024-88714 & MML-2024-88715) expire **June 30, 2027** ([context.txt](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/company/context.txt)).
   - B1 §7.1 requires continuous coverage through **September 14, 2029**.
   - B1 §7.2 states that a lapse constitutes an immediate **material breach**, entitling Harbor to terminate under B1 §8.2.
   - Event E-16 shows renewal instructions were required by June 25, 2027.
2. **Procedural Breach of 4-Hour Incident Notice ([B1 §4.1](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/contracts/B1.txt#L80))**:
   - March 3 outage began at 10:05 UTC. Notice (E-05) was sent March 4 at 14:30 UTC (>28 hours late).
3. **Procedural Default on Mandatory Root-Cause Analysis ([B1 §4.2](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/contracts/B1.txt#L87))**:
   - Mandatory written RCA due within 5 business days after service restoration was never delivered.
4. **Territorial Exclusivity Overlap ([B1 §6.1](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/contracts/B1.txt#L102) vs [C1 §4.1](file:///home/killer13b/Projects/yoooo/Pack/odin_dev_pack/bundle/contracts/C1.txt#L84))**:
   - Harbor's exclusive rights over Route Optimizer Enterprise in PNW grocery conflicts with Vantage Logistics' exclusivity across *all tiers* in PNW 3PL.

---

### Question 2: March 3 Outage — Uptime %, Customer Credits Owed, and StratoNode Upstream Recovery
1. **Quillhub Platform Uptime**:
   - Total March minutes: $31 \times 24 \times 60 = \mathbf{44,640 \text{ min}}$.
   - Downtime (E-04): $\mathbf{190 \text{ min}}$ (Scheduled Maintenance: 0 min).
   - $\text{Monthly Uptime \%} = \frac{44,450}{44,640} \times 100 = \mathbf{99.574\%}$.
2. **Credits Owed to Customers**:
   - **Harbor Retail (B1 §3.3)**: Breached 99.9% target $\rightarrow$ 15% credit on $40,000 = \mathbf{\$6,000.00}$.
     *(Defense: Harbor's June 15 claim in E-17 is time-barred under B1 §3.5 as the 45-day deadline closed May 15).*
   - **Vantage Logistics (C1)**: $\mathbf{\$0.00}$ (service was not live until May 15, 2027 per E-14).
3. **Credits Recoverable from StratoNode**:
   - **$\mathbf{\$0.00}$**. StratoNode's uptime target in A2 §2.1 is $99.5\%$. At $99.574\%$, StratoNode **met** its target (allowed 223.2 min downtime $> 190$ min actual).
   - The 15-day claim window under A3 §1 expired April 15, 2027 with no claim filed.
4. **Net Financial Recovery Gap**:
   $$\text{Downstream Liability} - \text{Upstream Recovery} = \mathbf{-\$6,000.00 \text{ Unrecoverable Loss}}$$

---

## 🚀 Quickstart

### 💬 Council Chatbot
An interactive chatbot is available directly in the web UI under the **COUNCIL CHATBOT** tab. You can:
- Query the entire **Council** or route questions directly to **Loki** (adversarial counsel), **Norns** (financial & SLA math), **Thor** (clauses & evidence), **Heimdall** (incident events), or **Tyr** (arbitration & draft notices).
- Use 1-click **Quick Prompt chips** to ask the official benchmark questions (PS-2 Q1 & Q2), insurance expiration traps, territorial conflicts, and deemed acceptance rules.
- Inspect **verbatim grounded citations** attached to every response.

### 1. Run the Multi-Agent CLI Evaluator
```bash
python3 cli.py
```

### 2. Launch the Full Interactive War Room (Backend + Web UI)
```bash
./run.sh
```
- **Interactive War Room UI**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend & Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏛 War Room UI Features (FR9)

1. **FR9.1 — Interactive Contract & Conflict Knowledge Graph**: Visual nodes for all portfolio entities, standard terms, and color-coded conflict edges.
2. **FR9.2 — Temporal Time Slider**: Move through checkpoints (`2027-03-15`, `2027-06-01`, `2027-09-15`) with live recalculations of obligations and exposures.
3. **FR9.3 — Exposure Views & Heatmaps**: Gross liability vs. Net unrecoverable recovery gap breakdowns.
4. **FR9.4 — Agent Debate Stream**: Live transcript of Loki's attacks, Heimdall's verification challenges, and Tyr's arbitration rulings.
5. **FR9.5 — Action Panel & Draft Notices**: 1-click review and export of formal legal notices with verbatim contract citations.
