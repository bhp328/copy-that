# COPY THAT?

**A racing game prototype built around asymmetric information, communication, and decision-making.**

COPY THAT? explores a two-player Formula racing concept where the **Driver drives the car** and the **Engineer drives the race**. Each player has access to different information, so neither can make the best decision alone. Communication is not just a social feature — it is part of the control system.

This repository contains an ongoing prototype and the research, simulation, and design work used to test that idea.

## Current Direction

The current product direction is a **Steam-first, online two-player co-op racing game**:

- **Driver** — controls the car directly and reacts to immediate driving conditions.
- **Engineer** — analyzes broader race information, anticipates what comes next, and communicates strategy.
- **Core challenge** — combine incomplete information from both roles through clear and timely communication.

The project is currently in a **prototype / product-validation stage**. The existing web implementation is primarily a research and simulation environment rather than a finished game.

## What I Worked On

- Gameplay and racing-system prototyping
- Asymmetric Driver / Engineer information design
- Deterministic simulation and repeatable test scenarios
- Overtaking, race-state, and vehicle-behavior models
- Engineer and player UI experiments
- Product design, iteration, and structured testing
- Documentation of design decisions, risks, and test criteria

## Tech Stack

- **TypeScript**
- **Three.js**
- **Vite**
- Custom simulation and testing scripts

## Project Structure

```text
src/       Gameplay, UI, vehicle, and simulation logic
scripts/   Deterministic simulation and test utilities
docs/      Product research, design decisions, and test plans
```

## Run the Prototype

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

The repository also includes simulation scripts for fixed-step behavior, overtaking, track logic, and race scenarios.

## Design Thesis

> **Conversation is the control system.**  
> **Driver drives the car. Engineer drives the race. Neither has enough information alone.**

The project tests whether communication, incomplete information, and complementary player roles can create meaningful racing decisions rather than functioning as an added layer on top of conventional racing gameplay.

## Status

**Active prototype / experimental development.**

The project is intentionally being tested and revised before committing to a final production architecture, engine, networking model, or full content scope.
