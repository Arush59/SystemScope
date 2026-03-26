# 🚀 SystemScope – Visual System Design Simulator

SystemScope is a full-stack MERN application that enables users to design and analyze distributed systems through an interactive visual interface. It simulates real-time traffic across system components to evaluate performance, detect bottlenecks, and understand scalability behavior.

## 🧠 Key Features

- 🎯 Drag-and-drop system design using React Flow
- ⚙️ Custom traffic simulation engine using graph traversal (BFS)
- 🔍 Automatic bottleneck detection with real-time visual feedback
- 📊 Dynamic dashboards for latency, throughput, and error rates
- 🧩 Prebuilt architecture templates (basic, scalable, microservices)
- 💾 Save & load system designs with authentication (JWT)
- 🌙 Modern dark UI with interactive tooltips and animations

## 🛠️ Tech Stack

- Frontend: React, Tailwind CSS, React Flow, Recharts
- Backend: Node.js, Express.js
- Database: MongoDB
- State Management: Zustand

## ⚙️ How It Works

Users create system architectures by connecting components like API servers, databases, and load balancers. The backend processes the structure as a graph and simulates traffic flow, evaluating each node's capacity to calculate latency, failures, and overall system performance.

## 🎯 Purpose

This project demonstrates system design concepts such as scalability, load distribution, and bottleneck analysis in an interactive and visual way, making it easier to understand how real-world distributed systems behave under traffic.

## 🚀 Future Improvements

- Animated request flow visualization
- Docker-based deployment
- Advanced AI-based system recommendations
