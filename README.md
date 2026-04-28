# 🚨 AI Crisis Command Center (Multimodal Safety OS)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

🛡️🤖 AI-powered crisis orchestration platform that transforms fragmented emergency signals into intelligent decisions, real-time response coordination, and AI-driven communication with responders.

---

## 🌍 SDG Alignment  

Aligned with:

- **SDG 11 – Sustainable Cities & Communities**  
  Smarter disaster response systems  

- **SDG 3 – Good Health & Well-being**  
  Faster emergency and medical response  

---

## 🧠 Problem  

In real-world environments (hotels, campuses, malls):

- CCTV operates independently  
- Fire alarms and sensors work in isolation  
- Staff communication is fragmented  

👉 This leads to **slow, uncoordinated, and inefficient emergency response**

---

## 💡 Solution  

We built an **AI Crisis Command Center** that:

- Aggregates multiple emergency signals  
- Uses AI (Google Gemini) for reasoning  
- Assigns severity (1–10 scale)  
- Determines impact scope (individual vs mass)  
- Generates real-time responder communication  
- Automatically escalates critical situations  

---

## 🔥 Core Innovation  

> **We don’t detect emergencies — we orchestrate fragmented systems into coordinated response using AI reasoning.**

---

## ⚙️ System Architecture  

```
Multi-source Signals (CCTV + Sensors + Manual Input)
                ↓
        AI Orchestration (Gemini)
                ↓
   Incident + Severity + Impact Analysis
                ↓
   AI Chat + Emergency Briefing Generation
                ↓
   Staff Assignment + Routing Engine
                ↓
     Broadcast & Notification System
                ↓
         Real-time Dashboard UI
```

---

## 🧠 AI Integration (Google Gemini)

Gemini acts as the **decision-making brain**:

- Combines multiple signals  
- Understands context  
- Identifies incident type  
- Assigns severity (1–10 scale)  
- Determines impact level  
- Generates human-like emergency communication  

👉 Unlike rule-based systems, this enables **real-time reasoning and decision-making**

---

## 🤖 AI Emergency Chat (Key Feature)

The system includes an **AI communication layer** that interacts like a dispatcher:

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

👉 This allows the system to **communicate clearly with responders**, not just display data.

---

## 📊 Severity Intelligence (1–10 Scale)

| Severity | Meaning |
|--------|--------|
| 1–3 | Minor / Individual |
| 4–6 | Moderate |
| 7–8 | Serious |
| 9–10 | Critical (Mass Impact) |

---

## 🚨 Smart Escalation & Broadcast  

If severity ≥ 9:

- System triggers **mass alert broadcast**  
- Notifies all occupants  
- Sends evacuation instructions  
- Escalates response automatically  

```
🚨 BROADCAST ALERT ACTIVATED  
All nearby occupants notified  
Emergency response escalated  
```

---

## ✨ Key Features  

### 🧩 Multi-Signal Fusion  
Combines CCTV, sensors, and manual alerts  

### 🧠 AI Decision Engine  
Gemini-powered reasoning for incident understanding  

### 📊 Severity Scoring  
Quantifies emergency impact (1–10)  

### 🤖 AI Chat Communication  
Generates human-like instructions for responders  

### 🚨 Smart Broadcast System  
Automatically escalates high-risk situations  

### 👥 Smart Staff Assignment  
Assigns nearest responders  

### 🗺️ Evacuation Routing  
Computes safest and fastest exit paths  

### 📊 Unified Dashboard  
Displays signals → AI decision → response  

---

## 🎬 Demo Flow  

1. Multiple signals triggered  
2. AI processes and identifies incident  
3. Severity score assigned  
4. AI generates emergency briefing (chat-style)  
5. Staff assigned and routes generated  
6. Broadcast triggered (if critical)  
7. Dashboard updates in real time  

---

## 👥 User Testing & Iteration  

Tested with 3 users:

- “Signal sources unclear” → Added multi-signal display  
- “AI not visible” → Added AI chat + explanation  
- “Feels static” → Added interactive actions  

👉 Result: Improved clarity, realism, and usability  

---

## 💻 How to Run Locally  

```bash
git clone https://github.com/theayanai/ai-crisis-command-center.git
cd ai-crisis-command-center
pip install -r requirements.txt
```

Set API Key:

```bash
export GEMINI_API_KEY=your_api_key
```

Run:

```bash
python backend/main.py
```

Open:

```
http://localhost:8000
```

---

## 🚀 Deployment  

Designed for:

- Google Cloud Run (scalable backend)  
- Gemini API (AI reasoning engine)  

---

## ⚠️ Limitations  

- Uses simulated inputs  
- No real CCTV integration yet  
- Depends on prompt accuracy  

---

## 🔮 Future Improvements  

- Real-time video AI detection  
- WhatsApp / SMS emergency alerts  
- Mobile responder app  
- Predictive risk analysis  
- Multi-building coordination  

---

## 🏆 Why This Matters  

Modern systems fail due to fragmentation.

This project proves:

> 🔥 AI can transform chaos into intelligent, coordinated crisis response  

---

## 👨‍💻 Developer  

**Mohammed Ayan**  
AI Systems & Real-Time Platforms  

---

## ⭐ Support  

If you found this useful, consider giving a ⭐ on GitHub!