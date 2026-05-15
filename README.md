# GemmaFin - Breaking the Cycle of Debt with Conversational AI

![GemmaFin Cover](./public/banner.jpg)


[![Gemma 4](https://img.shields.io/badge/Model-Gemma_4_E2B-blueviolet)](https://blog.google/technology/ai/google-gemma-4-ai-model/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange)](https://web.dev/progressive-web-apps/)

**GemmaFin** is an AI-powered personal finance Progressive Web App (PWA) specifically designed for low-income Brazilian families and informal workers. It leverages the multimodal power of **Gemma 4 E2B** to turn financial management from a burden into a conversation.

---

## 📺 Demo

[Watch the Demo Video](https://your-video-link-here.com)  
*(Insert your video link here showing the Antigravity MVP recording)*

---

## 📖 What I Built

In 2026, Brazil is facing a structural household debt crisis. A staggering **80.9% of families are in debt**, and a large portion of the population is trapped in a cycle of high-interest credit card revolving debt and the rising epidemic of unregulated online gambling ("Bets"). Traditional budgeting apps have failed to solve this because they require a high level of financial literacy and impose severe cognitive friction—forcing exhausted workers to manually type numbers, navigate drop-down menus, and categorize every penny.

**GemmaFin subverts this paradigm.** Built specifically for low-income families and informal workers (who often do not get formal receipts for their services), GemmaFin is a PWA that mimics a simple messaging interface like WhatsApp.

Instead of filling out spreadsheets, the user simply "talks" to the app:

*   **Audio Inputs for the Informal Economy:** A user can send a voice memo saying, *"I did some electrical work today and got 200 Reais on Pix, but spent 50 at the barber."*
*   **Visual Inputs for Messy Realities:** A user can snap a photo of a crumpled, faded grocery receipt or upload a screenshot of their bank statement.

The AI autonomously parses these unstructured multimodal inputs, categorizes the income and expenses, updates the local ledger, and generates simplified visual dashboards. More importantly, it acts as an **"Agentic Nudge,"** proactively sending empathetic alerts if it detects toxic financial patterns (like transferring too much money to betting platforms) to prevent insolvency before it happens.

---

## 🧠 How I Used Gemma 4

To build a financial assistant for vulnerable populations, two things are absolutely non-negotiable: **Privacy** and **Zero-Friction Multimodality**. For these reasons, the **Gemma 4 E2B (Effective 2 Billion)** model was the perfect and only logical fit for this architecture.

### 1. On-Device Privacy (Zero Data Exposure)
Financial data (bank statements, income audio memos) is highly sensitive. Sending this data to the cloud is a massive privacy risk. Because the E2B model is optimized for edge devices and runs locally with an incredibly small memory footprint, all inference happens completely on-device. The user's financial life never leaves their phone.

### 2. Native Audio & Vision Understanding
Classical OCR fails miserably on crumpled, poorly lit receipts. Gemma 4 E2B natively supports text, high-resolution images (up to 1120 tokens for reading fine print on taxes), and raw audio. The model directly listens to the user's voice memos about informal jobs and reads bank screenshots end-to-end without relying on fragile, third-party speech-to-text or OCR pipelines.

### 3. Agentic Workflows via `<|think|>` and Function Calling
GemmaFin doesn't just chat; it acts. Using Gemma 4's native `<|think|>` reasoning mode, the model mathematically calculates the user's new balance internally before responding. It then leverages native structured JSON function calling to autonomously trigger the local `update_ledger` function. This transforms unstructured real-world chaos (voice and photos) into clean, categorized LocalStorage database entries entirely in the background.

---

## 🚀 Key Features

### 🧠 Multimodal Processing (Simulated Gemma 4)
*   **Voice (Audio-to-Action):** Record earnings and expenses via voice. The AI transcribes, categorizes, and updates your balance instantly.
*   **Vision (Bank Statement OCR):** Send a screenshot of your bank statement or a photo of a receipt. The AI automatically identifies transactions.
*   **Exposed Reasoning (`<|think|>`):** Animated thought blocks show the AI's "step-by-step" logic, increasing transparency and user trust.

### 📊 Interactive Data Visualization
*   **Comprehensive Monthly Report:** Comparative bar charts (Income vs. Expenses) showing the evolution over the last 3 months.
*   **Trend Analysis:** The AI detects and warns about price variations in critical categories like Groceries and Gas.
*   **Budget Goals:** Circular progress indicators that help the user stay within the limits set for the month.

### 💬 "WhatsApp-First" Experience
*   **Familiar Interface:** Design optimized for the Brazilian user, using WhatsApp's visual patterns to lower the learning curve.
*   **Smart Suggestions (Quick Replies):** Buttons that guide the user to the next logical actions (e.g., *"How much did I spend at the grocery store?"*, *"View summary"*).
*   **Personalized Tips:** Savings advice based on the actual consumption profile, such as brand substitution suggestions.

### 🛠️ System Architecture

GemmaFin is designed as an offline-first Progressive Web App (PWA). Since the MVP does not connect to a real backend running the Gemma model, the "Agentic" behavior is rigorously simulated via a local state machine in React.

*   **State Management (`useChat.js`)**: Acts as the orchestrator. It manages the conversational memory (messages array), the financial ledger (income/expenses arrays), and the current balance. Data is persisted in `LocalStorage` under `gemmafin_state`.
*   **Smart Engine**: A deterministic NLP-like keyword matcher that simulates the capabilities of Gemma 4's intent recognition. It parses user text, extracts relevant entities (like prices or categories), and routes the query to specific "skills" (like generating a report or providing savings tips).
*   **Agentic `<|think|>` Visualization**: The `ThinkingBlock` component explicitly renders the simulated internal reasoning steps of the Gemma model (e.g., data extraction, opportunity cost calculation) before presenting the final text response, building user trust.

### 🧠 Advanced Reasoning Modules (New in MVP V2)

We implemented specific high-level advisory modules to showcase the analytical power of the Gemma 4 E2B engine:

1.  **Point-of-Sale Decision Engine (Installments vs. Cash)**:
    When a user asks if they should buy an item in installments or take a cash discount, the engine extracts the price, discount, and installments. It cross-references this with the user's current liquid balance. It calculates the opportunity cost (comparing the discount against a standard CDI yield) and recommends the safest cash-flow option.
2.  **Debt Rescue & Refinancing Alert**:
    If the engine detects the user is paying only the "minimum" on their credit card (triggering the revolving interest trap at ~14% a.m.), it interrupts the flow with a `<WarningCard />`. This card visualizes the exponential cost of the debt and proactively suggests refinancing via a cheaper personal loan, potentially saving the user hundreds of Reais.

---

## 🛠️ Tech Stack

*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS 4
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **PWA:** `vite-plugin-pwa`
*   **State Management:** Custom React Hooks + LocalStorage

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v20 or higher)
*   npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gemmafin.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production (PWA):
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Google Gemma Challenge 2026.**
