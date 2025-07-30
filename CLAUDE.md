# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pomo is a Pomodoro timer desktop application built with Tauri (Rust backend) and React/TypeScript frontend. It features integrations with Slack for status updates and notification management during focus sessions.

## Development Commands

All npm-based tools must be run via `volta run` to ensure consistent tooling versions:

### Core Commands
- `volta run pnpm dev` - Run the Tauri app locally in development mode
- `volta run pnpm build` - Build the application for production
- `volta run pnpm dev:client` - Run only the React frontend in browser
- `volta run pnpm build:client` - Build only the React frontend

### Code Quality
- `volta run pnpm check` - Run full quality checks (tests, TypeScript, linting, prettier)
- `volta run pnpm test:client` - Run Vitest tests
- `volta run pnpm lint:client` - Run ESLint on TypeScript/React code
- `volta run pnpm ts` - TypeScript type checking without compilation
- `volta run pnpm format:client` - Format code with Prettier

### State Machine Development
- `volta run pnpm machine` - Generate TypeScript types for XState machines (run after modifying state machines)

### Dependency Management
- `volta run pnpm knip` - Find unused dependencies and exports
- `volta run pnpm knip:fix` - Automatically fix unused exports and files

## Architecture

### Frontend (client/)
- **React + TypeScript** with strict type checking
- **XState** for state management - all application state is managed through state machines
- **Tailwind CSS** for styling
- **Vitest** for testing with globals enabled

### Key State Machines
- **Main Machine** (`client/src/machines/main/machine.ts`) - Orchestrates the entire application
- **Pomodoro Machine** - Manages timer states and Pomodoro sessions
- **Config Machine** - Handles user configuration and settings
- **Timer Machine** - Core timer functionality

### Backend (tauri/)
- **Rust** with Tauri framework
- **System tray integration** for desktop notifications
- **Tauri commands** exposed to frontend via `client/src/utils/commands.ts`

### Integration System
All timer lifecycle hooks are managed through `client/src/integrations/index.ts`:
- **Slack integration** - Status updates and DND management
- **OS integration** - System notifications and tray updates
- **Statistics tracking** - Session completion data

### Data Flow
1. Frontend React components interact with XState machines
2. State machines communicate with Tauri backend via commands
3. Timer events trigger integration hooks (Slack, OS, stats)
4. Configuration stored via Tauri plugin store

### Path Aliases
- `@shared/*` → `client/src/utils/*`
- `@client/*` → `client/src/*`
- `@test/*` → `client/src/testHelpers/*`

## Testing

- Test files use `.spec.ts` extension
- Vitest configuration in `client/vite.config.ts`
- Test setup in `client/src/testHelpers/test.setup.ts`
- Global test utilities available via imports from `@test/*`

## Build Configuration

- **Workspace structure** - Root Cargo.toml defines workspace with `tauri/` and `lib/` members
- **Tauri build** outputs to `dist/` directory
- **TypeScript** strict mode enabled throughout
- **Development** uses Vite dev server with React SWC plugin