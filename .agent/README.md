# Agent Routing Guide

> Read your own agent file first, then load only the skills it lists for the task at hand.

This directory defines the operational roles, skill assignments, and hand-off protocols for AI agents working in this workspace.

## Agent Directory Overview

- **Claude** ([`claude.md`](file:///c:/Users/Sonali/Downloads/kalajay-v2/.agent/claude.md)): Architecture, reasoning, design systems, and large refactors.
- **Gemini** ([`gemini.md`](file:///c:/Users/Sonali/Downloads/kalajay-v2/.agent/gemini.md)): Visual design, references, benchmarking, and rapid iteration.
- **ChatGPT** ([`chatgpt.md`](file:///c:/Users/Sonali/Downloads/kalajay-v2/.agent/chatgpt.md)): Precise implementation, interaction choreography, animation, and polish.

## Routing Matrix

| Agent | Responsibility | Primary Skills | Secondary Skills |
|---|---|---|---|
| Claude | Architecture, reasoning, design systems, large refactors | `impeccable`, `design-taste-frontend`, `web-design-guidelines`, `ui-ux-pro-max` | `tailwind` |
| Gemini | Visual design, references, rapid iteration | `ui-ux-pro-max`, `awwwards`, `jury`, `tailwind` | `design-taste-frontend` |
| ChatGPT | Precise implementation, animation, polish | `framer-motion-animator`, Emil Kowalski skills suite, `tailwind` | `web-design-guidelines` |

## Core Working Principles

1. **Selective Skill Loading**: Load only the skills relevant to the immediate task. Never flood context with unused skill instructions.
2. **Preserve Conventions**: Never modify or overwrite existing design tokens, CSS variables, or architectural patterns without explicit user authorization.
3. **Mandatory Final Review**: Every agent must complete a [`web-design-guidelines`](file:///C:/Users/Sonali/.gemini/config/skills/web-design-guidelines/SKILL.md) review before declaring any UI task finished.

