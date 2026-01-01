# Development Guidelines for Portfolio Lens

Follow these instructions carefully and do not deviate from them.

---

## 🎯 Documentation-First Development Philosophy

**CRITICAL**: This project follows a **strict documentation-driven development** approach.

### Core Principle

> **No code without docs. No code without tests.**

### Development Workflow

1. **Requirements Phase** (Phase 1)

   - Write user stories in `docs/phase-1-requirements/01-user-stories/`
   - Document functional requirements in `docs/phase-1-requirements/02-functional-requirements/`
   - Define non-functional requirements in `docs/phase-1-requirements/03-non-functional-requirements/`
   - **NO technical decisions at this stage**

2. **Design Phase** (Phase 2)

   - Create/update High-Level Design in `docs/phase-2-high-level-design/HLD-master.md`
   - Document architecture decisions in ADRs
   - Define technology stack and project structure
   - **GATE: HLD must be approved before proceeding**

3. **Detailed Design Phase** (Phase 3)

   - Create Low-Level Design in `docs/phase-3-low-level-design/features/{feature-name}/`
   - Document behaviors, data models, and API contracts
   - Write test specifications BEFORE implementation
   - **Directory structures and code patterns only appear here**

4. **Implementation Phase** (Phase 4)
   - Write tests according to test specifications
   - Implement code following LLD documents
   - Verify against acceptance criteria

### Reference Documents

📘 **Product Requirements Document (PRD)**  
Primary reference: `docs/PRD.md`

This document defines:

- Documentation hierarchy and templates
- Phase gates and approval criteria
- Traceability requirements
- Quality standards

**Before writing ANY code, check:**

- ✅ Does a user story exist? (`US-{number}`)
- ✅ Is there a functional requirement? (`FR-{number}`)
- ✅ Has HLD been approved?
- ✅ Does LLD exist for this feature?
- ✅ Are test specifications written?

If any answer is "No", **STOP and create the required documentation first**.

---

## Project Overview & Structure

Comprehensive guide to the folder structure and organization of the project, including all main directories, key files, and their purposes.

**Note**: Project structure is defined in `docs/phase-2-high-level-design/HLD-master.md` after architecture decisions are made.

@.cursor/rules/project-structure.mdc

---

## Tech Stack & Dependencies

Complete listing of the tech stack, frameworks, libraries, and dependencies used throughout the project, with version information and usage patterns.

**Note**: Technology selections are documented with rationale in `docs/phase-2-high-level-design/HLD-master.md` under "Technology Stack" section.

@.cursor/rules/tech-stack-dependencies.mdc

---

## TypeScript Code Style Guide

TypeScript conventions including parameter passing patterns, type safety rules, import organization, functional programming practices, and documentation standards.

**Note**: All type definitions must be documented in feature-specific `data-models.md` files in LLD before implementation.

@.cursor/rules/typescript-style.mdc

---

## Next.js

Expert guidance on React, Next.js App Router, and related technologies including code structure, naming conventions, React best practices, UI styling, forms, metadata, error handling, accessibility, and security.

@.cursor/rules/nextjs.mdc

---

## UI Components from Shadcn UI

Guidelines for using Shadcn UI components from the shared UI library, including usage, import conventions, and best practices for composing user interfaces.

@.cursor/rules/ui-components.mdc

---

## Tailwind CSS Styling Practices

Tailwind CSS conventions covering class organization, responsive design, color system usage, layout patterns, design system integration, and styling best practices.

@.cursor/rules/tailwind-styling.mdc

---

## Landing Page Components Rule

Instructions for building public-facing pages using landing page components, including component sources, documentation references, structure examples, and implementation best practices.

@.cursor/rules/landing-components.mdc

---

## Self-Improvement

Guidelines for continuously improving rules based on emerging code patterns, including analysis processes, rule updates, quality checks, and documentation maintenance.

**Extension**: When updating rules, also check if corresponding documentation templates in `docs/PRD.md` need updates to maintain consistency.

@.cursor/rules/self-improve.mdc

---

## Git & Version Control

### Commit Strategy

- Add and commit automatically whenever an entire task is finished
- Use descriptive commit messages that capture the full scope of changes

### Commit Message Format

```
[PHASE] Type: Brief description

- Reference: US-{number}, FR-{number}, or LLD feature
- Changes: List of changes
- Tests: Test coverage added
- Docs: Documentation updated
```

**Examples**:

```
[PHASE-1] feat: Add user story for portfolio input
- Reference: US-001
- Docs: Created US-001-portfolio-input.md

[PHASE-3] feat: Document XIRR calculation behavior
- Reference: FR-002.1, B-002-1
- Docs: Created LLD for metrics-engine/behaviors/xirr-calculation.md
- Tests: Added test specifications

[PHASE-4] feat: Implement XIRR calculation
- Reference: B-002-1
- Tests: Added UT-002-1 through UT-002-5
- Implementation: As per LLD specs
```

---

## Retrieving Library Documentation

When the user requests code examples, setup or configuration steps, or library/API documentation, use the context7 mcp server to get the information.

**Documentation-First Rule**: Even with library docs, ensure the usage is documented in the appropriate LLD section before implementation.

---

## Verifying Features in the Browser

Use the Playwright MCP server to verify features in the browser.
Check for console errors and ensure the implemented functionality is working as expected.

**Verification Checklist**:

- ✅ Matches acceptance criteria from user story
- ✅ Passes all test cases from test specifications
- ✅ Meets performance criteria from NFRs
- ✅ No console errors or warnings

---

## **EXTREMELY IMPORTANT:** Code Quality Checks

**ALWAYS follow these instructions before completing a task.**

### Pre-Implementation Checklist

1. **Documentation exists**:

   - [ ] User Story written and approved
   - [ ] Functional Requirements documented
   - [ ] Non-Functional Requirements defined
   - [ ] HLD approved (if Phase 2+)
   - [ ] LLD completed (if Phase 3+)
   - [ ] Test specifications written (if Phase 3+)

2. **Diagnostics check**:

   - Run `mcp__ide__getDiagnostics` to check all files for diagnostics
   - Fix any linting or type errors before considering the task complete
   - Do this for _each_ file you create or edit

3. **Test verification**:

   - [ ] All unit tests pass
   - [ ] All integration tests pass
   - [ ] E2E tests pass (if applicable)
   - [ ] Test coverage meets targets defined in test specifications

4. **Documentation updates**:
   - [ ] Code comments reference relevant doc sections
   - [ ] API contracts match implementation
   - [ ] Data models match implementation
   - [ ] Any deviations from LLD documented with rationale

This is a CRITICAL step that must NEVER be skipped when working on any code-related task.

---

## Task Completion Checklist

Before marking ANY task as complete:

### Phase 1 Tasks (Requirements)

- [ ] User story follows template in `docs/PRD.md` section 5.1
- [ ] Functional requirements documented with acceptance criteria
- [ ] Non-functional requirements measurable
- [ ] All requirements reviewed and approved
- [ ] No technical decisions made prematurely

### Phase 2 Tasks (HLD)

- [ ] Architecture decisions documented in ADR format
- [ ] Technology choices justified with rationale
- [ ] Component boundaries defined
- [ ] Project structure defined
- [ ] HLD approved before proceeding

### Phase 3 Tasks (LLD)

- [ ] Feature README created with component breakdown
- [ ] All behaviors documented
- [ ] Data models defined
- [ ] API contracts specified
- [ ] Test specifications complete
- [ ] All documents link back to requirements

### Phase 4 Tasks (Implementation)

- [ ] Tests written and passing
- [ ] Code follows LLD specifications
- [ ] Documentation updated if implementation differs
- [ ] Diagnostics clean
- [ ] Browser verification complete
- [ ] Commit message references all relevant docs

---

## Quick Reference: Where to Find What

| Need to know...           | Check...                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Why feature exists        | `docs/phase-1-requirements/01-user-stories/US-{number}.md`                         |
| What system must do       | `docs/phase-1-requirements/02-functional-requirements/features/FR-{name}.md`       |
| Quality requirements      | `docs/phase-1-requirements/03-non-functional-requirements/domains/NFR-{domain}.md` |
| System architecture       | `docs/phase-2-high-level-design/HLD-master.md`                                     |
| Why tech choice made      | `docs/phase-2-high-level-design/HLD-master.md` → ADR section                       |
| How to implement feature  | `docs/phase-3-low-level-design/features/{feature-name}/README.md`                  |
| Specific behavior details | `docs/phase-3-low-level-design/features/{feature-name}/behaviors/{behavior}.md`    |
| Data structures           | `docs/phase-3-low-level-design/features/{feature-name}/data-models.md`             |
| API contracts             | `docs/phase-3-low-level-design/features/{feature-name}/api-contracts.md`           |
| What to test              | `docs/phase-3-low-level-design/features/{feature-name}/test-specifications.md`     |

---

## Emergency Override (Use Sparingly)

If you absolutely must write code without complete documentation (e.g., rapid prototyping, spike):

1. **Mark it clearly**:

   ```typescript
   /**
    * TODO: SPIKE CODE - NOT PRODUCTION READY
    * Documentation required before production:
    * - User Story: Missing
    * - LLD: Missing
    * - Tests: Missing
    * Spike ticket: [SPIKE-XXX]
    */
   ```

2. **Create a debt ticket**:

   - Document what's missing
   - Create user story and requirements
   - Schedule LLD and test writing

3. **Never deploy spike code to production**

---

## Questions?

If you're unsure about:

- What phase you're in → Check `docs/PRD.md` Section 6 (Workflow)
- What template to use → Check `docs/PRD.md` Section 5 (Templates)
- Whether to proceed → Check gate criteria in `docs/PRD.md`

**When in doubt**: Document first, code second.
