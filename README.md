# 🚨 AI Crisis Command Center (Multimodal Safety OS)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

🛡️🤖 AI-powered crisis orchestration system that transforms fragmented emergency signals into **structured, intelligent, real-time response** using Google Gemini.

---

## 🌍 SDG Alignment  

Aligned with:

- **SDG 11 – Sustainable Cities & Communities**  
  Smart disaster response and emergency coordination  

- **SDG 3 – Good Health & Well-being**  
  Faster medical response and life-saving systems  

---

## 🧠 Problem  

In real-world environments (hotels, campuses, malls):

- CCTV detects incidents independently  
- Fire sensors trigger isolated alerts  
- Manual panic signals lack coordination  

👉 These systems operate in **silos**, leading to:
- delayed response  
- confusion  
- increased risk  

---

## 💡 Solution  

We built an **AI Crisis Command Center** that:

- Aggregates multiple emergency signals  
- Uses AI (Gemini) to understand context  
- Assigns severity (1–10 scale)  
- Determines impact (individual vs mass)  
- Generates response plans  
- Communicates instructions to responders  
- Triggers broadcast alerts when needed  

---

## 🔥 Core Innovation  

> ❗ We don’t detect emergencies — we **orchestrate fragmented systems into coordinated response**

---

## ⚙️ System Architecture  

```
Multi-source Signals (CCTV + Sensors + Manual Input)
                ↓
        AI Orchestration (Gemini)
                ↓
   Incident + Severity + Impact Analysis
                ↓
   Response Planning + Staff Assignment
                ↓
     Broadcast & Notification System
                ↓
         Real-time Dashboard UI
```

---

## 🧠 AI Integration (Google Gemini)

Gemini acts as the **decision-making brain**:

- Combines multiple signals  
- Identifies incident type  
- Assigns severity (1–10)  
- Determines risk level  
- Generates human-readable explanations  

---

## 🧠 AI Crisis Briefing (Key Feature)

The system generates real-time instructions for emergency responders:

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

## 🚨 Severity Intelligence System  

| Severity | Meaning |
|--------|--------|
| 1–3 | Individual / minor |
| 4–6 | moderate |
| 7–8 | serious |
| 9–10 | critical (mass impact) |

---

## 🚨 Smart Broadcast System  

If severity ≥ 9:

- Alerts all occupants  
- Sends emergency notifications  
- Triggers evacuation guidance  

```
🚨 BROADCAST ALERT ACTIVATED  
All nearby occupants notified  
Evacuation instructions issued  
```

---

## ✨ Key Features  

### 🧩 Multi-Signal Fusion  
Combines CCTV, sensors, and manual alerts  

### 🧠 AI Decision Engine  
Gemini-powered reasoning system  

### 📊 Severity Scoring (1–10)  
Quantifies emergency impact  

### 🗣️ AI Emergency Communication  
Explains situation to responders  

### 🚨 Intelligent Broadcast  
Escalates alerts automatically  

### 👥 Smart Staff Assignment  
Assigns nearest responders  

### 🗺️ Dynamic Evacuation Routing  
Generates fastest and safest exit paths  

### 📊 Unified Dashboard  
Displays all system decisions in real time  

---

## 🎬 Demo Flow  

1. Multiple signals triggered  
2. AI processes and identifies incident  
3. Severity score assigned  
4. AI generates briefing  
5. Staff assigned + route generated  
6. Broadcast triggered (if critical)  
7. Dashboard updates instantly  

---

## 👥 User Testing & Iteration  

We tested with 3 users:

### Feedback:
- “Signal sources unclear”  
→ Added multi-signal visualization  

- “AI decision unclear”  
→ Added AI reasoning panel  

- “System felt static”  
→ Added interactive actions  

### Result:
Improved clarity, usability, and realism  

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

### 3. Set API Key
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

Designed for:

- **Google Cloud Run** (scalable backend)  
- **Google Gemini API** (AI reasoning)  

---

## ⚠️ Limitations  

- Uses simulated inputs (no live CCTV)  
- AI output depends on prompt quality  
- Prototype-level system  

---

## 🔮 Future Improvements  

- Real-time CCTV integration  
- WhatsApp / mobile alerts  
- Multi-location coordination  
- Predictive risk analysis  
- Integration with emergency services  

---

## 🏆 Why This Matters  

Traditional systems fail due to fragmentation.

This project shows:

> 🔥 AI can transform chaos into intelligent, coordinated emergency response  

---

## 👨‍💻 Developer  

**Mohammed Ayan**  
AI Systems Developer  

---

## ⭐ Support  

If you found this useful, give a ⭐ on GitHub!
