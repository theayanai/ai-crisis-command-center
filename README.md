# 🚨 AI Crisis Command Center (Multimodal Safety OS)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

🛡️🤖 AI-powered crisis orchestration system that unifies fragmented emergency signals into structured, real-time response with intelligent severity scoring, automated escalation, and AI-driven communication.

---

## 🌍 SDG Alignment  

This project aligns with the United Nations Sustainable Development Goals:

- **SDG 11 – Sustainable Cities & Communities**  
  Improving disaster response systems through intelligent coordination  

- **SDG 3 – Good Health & Well-being**  
  Enabling faster emergency medical and safety response  

---

## 🧠 Problem  

In real-world environments (hotels, campuses, malls):

- CCTV systems operate independently  
- Fire sensors and alarms work in isolation  
- Staff communication is disconnected  

👉 This fragmentation leads to **delayed, uncoordinated, and inefficient emergency response**.

---

## 💡 Solution  

We built an **AI-powered Crisis Command Center** that:

- Aggregates signals from multiple sources  
- Uses AI reasoning (Gemini) to understand context  
- Assigns severity (1–10 scale)  
- Determines impact scope (individual vs mass)  
- Orchestrates response and communication in real time  

---

## 🔥 Core Innovation  

> **We don’t detect emergencies — we orchestrate fragmented systems into coordinated response.**

---

## ⚙️ System Architecture  

```
Multi-source Signals (CCTV + Sensors + Manual Input)
                ↓
        AI Orchestration (Gemini)
                ↓
   Severity Scoring + Impact Analysis (1–10)
                ↓
   Response Planning + Staff Assignment
                ↓
     Broadcast & Notification System
                ↓
         Real-time Dashboard UI
```

---

## 🧠 AI Integration (Google Gemini)

We use **Google Gemini** as the reasoning engine to:

- Combine fragmented signals  
- Infer incident type  
- Assign severity score (1–10)  
- Determine impact (individual vs multi-person)  
- Generate human-readable emergency briefings  

---

## 🧠 AI Crisis Briefing (Key Feature)

The system generates real-time instructions for responders:

```
🚨 Emergency Briefing

Incident: FIRE  
Location: Room 101  

Severity: 9/10 (High Risk)  
Impact: Multi-person risk  

AI Reasoning:
Multiple signals (fire sensor + smoke detection) indicate an active fire hazard.

Response Plan:
- Fire Response Team dispatched  
- Security assigned for evacuation  

Action Required:
Immediate evacuation and containment.
```

---

## 🚨 Intelligent Escalation System  

The AI assigns severity levels:

| Severity | Meaning |
|--------|--------|
| 1–3 | Minor / Individual |
| 4–6 | Moderate |
| 7–8 | Serious |
| 9–10 | Critical (Mass Impact) |

---

### 🚨 Automatic Broadcast Trigger  

If severity ≥ 9:

- Alerts sent to all occupants  
- Emergency notifications triggered  
- Response escalation activated  

```
🚨 BROADCAST ALERT ACTIVATED  
All nearby occupants notified  
Evacuation instructions issued  
```

---

## ✨ Key Features  

### 🧩 Multi-Signal Fusion  
Combines inputs from CCTV, sensors, and manual alerts  

### 🧠 AI Decision Engine  
Gemini-powered reasoning for incident understanding  

### 📊 Severity Scoring (1–10)  
Quantifies risk and impact  

### 🗣️ AI Emergency Communication  
Generates real-time responder instructions  

### 🚨 Smart Broadcast System  
Escalates alerts for high-risk scenarios  

### 👥 Smart Staff Assignment  
Assigns nearest responders  

### 🗺️ Routing Engine  
Provides safe evacuation paths  

### 📊 Unified Dashboard  
Displays all actions in real time  

---

## 🎬 Demo Flow  

1. Multiple signals triggered (CCTV + Sensor + Manual)  
2. AI processes and identifies incident  
3. Severity score assigned  
4. AI generates emergency briefing  
5. Staff assigned and routes generated  
6. Broadcast triggered (if high severity)  
7. Dashboard updates in real time  

---

## 👥 User Testing & Iteration  

We conducted usability testing with 3 users:

### Feedback:
- “Signal sources were unclear”  
→ Added multi-signal display  

- “AI decision wasn’t obvious”  
→ Improved AI explanation panel  

- “Actions didn’t feel interactive”  
→ Added clickable action simulation  

### Result:
Improved clarity, realism, and usability  

---

## 💻 How to Run Locally  

### 1. Clone Repository
```bash
git clone https://github.com/theayanai/ai-crisis-command-center.git
cd ai-crisis-command-center
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Environment Variable
```bash
export GEMINI_API_KEY=your_api_key
```

(Windows)
```bash
set GEMINI_API_KEY=your_api_key
```

### 4. Run Backend
```bash
python backend/main.py
```

### 5. Open UI
```
http://localhost:8000
```

---

## 🚀 Deployment  

Designed for deployment on:

- **Google Cloud Run** (scalable backend)  
- **Google Gemini API** for AI reasoning  

---

## ⚠️ Limitations  

- Uses simulated inputs (no live CCTV yet)  
- AI responses depend on prompt quality  
- Prototype-level implementation  

---

## 🔮 Future Improvements  

- Real-time sensor integration  
- Video-based AI detection  
- Mobile emergency alerts  
- Multi-building coordination  
- Integration with emergency services  

---

## 🏆 Why This Matters  

Modern emergency systems are fragmented.

This project proves:

> 🔥 AI can transform chaos into structured, intelligent crisis response  

---

## 👨‍💻 Developer  

**Mohammed Ayan**  
Building intelligent AI systems and real-time platforms  

---

## ⭐ Support  

If you found this useful, consider giving a ⭐ on GitHub!
