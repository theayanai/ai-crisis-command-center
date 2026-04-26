# 🚨 AI Crisis Command Center (Multimodal Safety OS)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

🛡️🤖 AI-powered orchestration system that unifies fragmented emergency signals into structured, real-time crisis response.

---

## 🌍 SDG Alignment  

This project aligns with the United Nations Sustainable Development Goals:

- **SDG 11 – Sustainable Cities & Communities**  
  Improving disaster response systems through intelligent coordination  

- **SDG 3 – Good Health & Well-being**  
  Enabling faster emergency medical and safety response  

This system transforms fragmented emergency infrastructure into a centralized AI-driven command center.

---

## 🧠 Problem  

In real-world hospitality environments:

- CCTV systems operate independently  
- Fire alarms function separately  
- Staff communication is disconnected  

👉 This **fragmentation causes delayed and chaotic response** during emergencies.

---

## 💡 Solution  

We built an **AI-powered Crisis Command Center** that:

- Aggregates signals from multiple systems  
- Uses AI reasoning to understand the situation  
- Orchestrates structured response in real time  

---

## 🔥 Core Innovation  

Instead of detecting emergencies, we:

> **Unify fragmented systems into a centralized AI orchestration hub**

---

## ⚙️ System Architecture  

```
Multi-source Signals (CCTV + Sensors + Manual Input)
                ↓
        AI Orchestration (Gemini)
                ↓
      Structured Decision Output
                ↓
   Staff Assignment + Routing Engine
                ↓
         Real-time Dashboard UI
```

---

## 🧠 AI Integration (Google Gemini)

We use **Google Gemini** as the reasoning engine to:

- Combine multiple signals  
- Infer incident type  
- Assign priority level  
- Decide required response teams  

### Example  

**Input signals:**
- CCTV → Fight detected  
- Fire Sensor → Heat alert  
- Manual → Panic alert  

**AI Output:**
```json
{
  "incident": "fire",
  "priority": "high",
  "teams": ["fire_team", "security"]
}
```

👉 This demonstrates **multi-signal reasoning**, not simple rule-based logic.

---

## ✨ Key Features  

### 🧩 Multi-Signal Fusion  
Combines inputs from different systems into a unified context  

### 🧠 AI Decision Engine  
Uses Gemini for real-time reasoning and prioritization  

### 👥 Smart Staff Assignment  
Automatically assigns nearest and relevant responders  

### 🗺️ Dynamic Routing  
Provides safe evacuation or response paths  

### 📊 Unified Dashboard  
Displays alerts, decisions, and actions in one interface  

### 📜 AI Explanation Layer  
Generates human-readable reasoning for every decision  

---

## 🎬 Demo Flow  

1. Multiple signals triggered  
2. AI processes and identifies incident  
3. System assigns staff and route  
4. Dashboard updates in real time  

---

## 👥 User Testing & Iteration  

We conducted usability testing with 3 users:

### Feedback:
- “Signal sources were unclear”  
→ Added multi-signal display  

- “AI decision wasn’t obvious”  
→ Improved explanation panel  

- “Actions didn’t feel interactive”  
→ Added clickable action simulation  

### Result:
Improved clarity, realism, and user experience  

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
- **Google AI (Gemini API)** for reasoning  

---

## ⚠️ Limitations  

- Uses simulated inputs (not live CCTV)  
- AI decisions depend on prompt quality  
- Not a full production emergency system  

---

## 🔮 Future Improvements  

- Real-time sensor integration  
- Video-based incident detection  
- Multi-building coordination  
- Mobile alert system  

---

## 🏆 Why This Matters  

Modern systems are fragmented.

This project proves:

> 🔥 AI can transform chaos into coordinated response

---

## 👨‍💻 Developer  

**Mohammed Ayan**  
Building intelligent AI systems and real-time platforms  

---

## ⭐ Support  

If you found this useful, consider giving a ⭐ on GitHub!
