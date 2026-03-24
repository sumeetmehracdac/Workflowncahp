# Workflow Management Section — Functional Requirements Documentation

## Context

The **Workflow Management** section is the **administrative backbone** that defines, configures, and controls how proposals and project-monitoring requests move through their lifecycle — from submission through review, approval, sanctioning, and settlement. It is a **workflow engine configuration suite** — not used by end-users (PIs/researchers), but by system administrators to define the rules, roles, transitions, conditions, and statuses that govern the entire proposal processing pipeline.

---

## Overall Unified Purpose

The Workflow Management section collectively serves **one core purpose**: to allow administrators to fully define and configure the **state machine** (workflow engine) that drives how proposals and monitoring requests are processed across the system. It answers the questions:

1. **What actions can be taken** on a proposal/request? (Actions)
2. **Under what conditions** does a particular workflow path apply? (Condition Variables)
3. **Which role is allowed** to perform which action? (Condition Approval Master)
4. **What roles exist** and what committee types do they belong to? (Role Committee Type Mapping)
5. **Where does a proposal go next** after an action is taken? (Next Role After Action)
6. **What is the full approval chain** — role → action → next role → conditions → status transition? (Approval Master)
7. **What status does a proposal have** at each stage? (Proposal Status Master)
8. **What status does the PI see** when a particular action is taken? (PI Status Master)
9. **What file/document view** is shown to a user when a particular action has been performed? (Configure File View)
10. **How is a workflow copied/replicated** across schemes and request types? (Workflow Configuration)
11–13. The above questions repeated for **monitoring/post-sanctioning workflows** specifically (Monitoring Next Role After Action, Monitoring Condition Approval Master, Monitoring Approval Master).

---

## Page-by-Page Functional Requirements

---

### 1. Add Edit Action

**Core Functionality:** Master registry of all workflow actions that can be performed on a proposal or request throughout the system.

**Functional Requirements:**
- Create, edit, and manage **workflow actions** (e.g., "Accept", "Reject", "Send for Review", "Forward to Committee", "Send Sanction Letter to PI", etc.)
- Each action is linked to a **Process Name** (a process category like "Confirm Action")
- Define the **display label** shown to the user performing the action ("Action Performed" text)
- Define the **NoteSheet text** — what gets recorded on the official note sheet when this action is taken
- Configure whether the action has an **icon** representation, and if so, specify the icon name and tooltip title
- Set the action as **Active or Inactive** to control availability system-wide
- This is the foundational building block — every other page in Workflow Management references actions defined here

---

### 2. Add/Edit Condition Variable

**Core Functionality:** Define conditional variables and their value ranges that determine which workflow path a proposal follows.

**Functional Requirements:**
- Create and manage **condition variables** (e.g., `proposal_amt`, `no_condition`)
- For each variable, define a **minimum and maximum value** range — creating threshold brackets (e.g., proposal amount 0–80 lakhs, 80 lakhs–5 crores, 5 crores–100 crores)
- Assign a **Condition ID** to group related condition ranges
- Set each condition as **Active or Inactive**
- These condition variables are used downstream (in Approval Master) to route proposals through different approval chains based on criteria like proposal budget amount — e.g., low-value proposals may need fewer approvals than high-value ones

---

### 3. Condition Approval Master

**Core Functionality:** Map which actions a specific role is allowed to perform, creating the role-action permission matrix.

**Functional Requirements:**
- Select a **Role** (with its committee type, e.g., "Chairperson (Expert Committee)")
- Assign one or more **Actions** that this role is permitted to perform
- This creates the **role-action authorization matrix** — controlling what buttons/actions appear for a user based on their assigned role
- Actions are referenced by their IDs from the Action master (Page 1)
- Roles include committee type context (e.g., a Chairperson of an Expert Committee has different permissions than a Chairperson of a Task Force)

---

### 4. Role Committee Type Mapping

**Core Functionality:** Define the valid combinations of roles and committee types that exist in the system.

**Functional Requirements:**
- Create mappings between **Roles** (e.g., "Member Secretary", "Chairperson", "Committee Member", "Finance Officer") and **Committee Types** (e.g., "PAC", "Expert Committee", "Apex Committee", "Task Force", "No Committee Type")
- Each mapping gets a unique primary key used throughout the workflow engine
- Examples: "Finance Officer + No Committee Type", "Member Secretary + PAC", "Committee Member + Expert Committee"
- This is the role identity layer — a role alone is not sufficient; it must be paired with a committee type to define the user's functional identity in the workflow

---

### 5. Next Role After Action

**Core Functionality:** Define the workflow transition rules — after a specific action is performed, which role(s) should the proposal be routed to next.

**Functional Requirements:**
- Select an **Action** (e.g., "Accept", "Reject", "Forward")
- Select one or more **Roles** that should receive the proposal after this action is performed
- This is the core **state transition definition** — it defines the directed edges in the workflow graph
- Multiple roles can be selected (e.g., after "Forward to Committee", the proposal becomes available to all Committee Members)
- This controls the routing/forwarding logic of the entire proposal pipeline

---

### 6. Approval Master

**Core Functionality:** The comprehensive workflow rule builder that ties together roles, schemes, actions, next roles, conditions, and statuses into complete approval chains.

**Functional Requirements:**
- Select the **Current Role** performing the action
- Select the **Scheme** this rule applies to (e.g., "Post Doctoral Fellowship")
- Select the **Action(s)** this role can take under this scheme
- Select the **Next Role** — who receives the proposal after this action
- Define the **Action(s)** available to the next role
- Attach **Condition Variables** — define under which conditions (e.g., proposal amount range) this specific approval path applies
- Assign the **Stage/Status** — what proposal status code is set when this transition occurs
- This is the **master orchestration page** — it combines everything from pages 1–5 into executable workflow rules
- It is scheme-specific, meaning different schemes can have entirely different approval chains

---

### 7. Proposal Status Master

**Core Functionality:** Master registry of all possible proposal lifecycle statuses.

**Functional Requirements:**
- Create and manage **proposal statuses** with a human-readable name and a system status code
- Examples: "Proposal Submitted" (SUBMIT), "Technically Recommended" (TECHRECOM), "Technically Revised" (TECHREV), "Internal" (INT)
- Each status has a unique **Status ID**
- Statuses can be set as **Active or Inactive**
- These statuses are referenced in the Approval Master to define what stage a proposal transitions to after an action
- The status codes serve as the canonical identifiers used programmatically throughout the system

---

### 8. PI Status Master

**Core Functionality:** Map workflow actions to the status labels visible to the Principal Investigator (PI/applicant).

**Functional Requirements:**
- For each **Action** taken internally (e.g., "Send Sanction Letter to PI", "Send Rejection to PI", "Send Revision to PI"), define the **PI-facing status text** (e.g., "Sanction Order Issued", "Not Recommended", "Revised")
- Set each mapping as **Active or Inactive**
- This provides a **translation layer** between internal workflow actions and the external status shown to the applicant/PI on their dashboard
- Ensures PIs see meaningful, simplified status updates rather than internal workflow terminology

---

### 9. Configure File View

**Core Functionality:** Configure what document/file links and remarks are displayed to users when viewing a proposal at a specific action stage.

**Functional Requirements:**
- For each **Action**, configure:
  - A **display Action Name** (label shown to the user)
  - A **Link** (URL path to the relevant document/view page)
  - A **Link Name** (clickable text label for the link)
  - Whether the **View Link is shown** (Yes/No)
  - Whether **Remarks** are associated with this action
  - Whether **Show Remarks** is enabled (Yes/No)
  - **Parameters** to pass to the view link (e.g., transaction ID, PI ID)
- Set each configuration as **Active or Inactive**
- This controls the **document visibility and navigation** layer — what documents, letters, or views are accessible when a proposal is at a particular workflow stage

---

### 10. Workflow Configuration

**Core Functionality:** Copy/replicate an entire workflow definition from one scheme to another, and copy request-type workflow flows between schemes.

**Functional Requirements:**
- **Copy Scheme Flow**: Select a source scheme and a target scheme to replicate the entire proposal workflow (all approval chains, role mappings, conditions)
- **Copy Request Type Flow**: Select a source and target request type to replicate the monitoring/request workflow
- Filter by workflow stream: **Regular** (proposal processing), **Monitoring** (post-sanctioning), or **All**
- This is a **workflow cloning/replication utility** — avoids manual recreation of complex approval chains when a new scheme needs a similar workflow to an existing one

---

### 11. Monitoring Next Role After Action

**Core Functionality:** Same as "Next Role After Action" (Page 5), but specifically for **monitoring/post-sanctioning workflows**.

**Functional Requirements:**
- Select a monitoring **Action** (e.g., actions related to progress reports, utilization certificates, additional grants)
- Assign which **Role(s)** should receive the request next after this monitoring action is performed
- Defines the **routing/transition logic** specifically for post-sanctioning request processing (as opposed to initial proposal processing)

---

### 12. Monitoring Condition Approval Master

**Core Functionality:** Same as "Condition Approval Master" (Page 3), but specifically for **monitoring/post-sanctioning workflows**.

**Functional Requirements:**
- Select a **Role** (with committee type)
- Assign which monitoring **Actions** that role is permitted to perform
- Creates the **role-action permission matrix** specifically for monitoring/post-sanctioning request workflows

---

### 13. Monitoring Approval Master

**Core Functionality:** Same as "Approval Master" (Page 6), but specifically for **monitoring/post-sanctioning workflows**.

**Functional Requirements:**
- Select a **Request Type** (e.g., "Additional Grants", "Progress Report", "UC Submitted", "Change of Equipment", "Addition of COPI")
- Select the **Current Role**, **Scheme**, **Action(s)**, **Next Role**, **Condition Variables**, and **Stage/Status** — same comprehensive rule-building as the Approval Master
- Builds complete **monitoring approval chains** for each request type
- Scheme-specific and request-type-specific — different request types can have entirely different monitoring approval chains

---

## How the Pages Interact Together

The 13 pages form a **layered configuration system** where each page depends on and feeds into others:

```
FOUNDATION LAYER (Building Blocks)
├── [1] Add Edit Action ──────────── Defines all possible actions
├── [2] Condition Variable ────────── Defines conditional routing criteria
├── [4] Role Committee Type Mapping ── Defines who exists in the system
├── [7] Proposal Status Master ────── Defines all lifecycle stages
└── [8] PI Status Master ─────────── Defines PI-visible status labels

PERMISSION LAYER (Who Can Do What)
├── [3] Condition Approval Master ──── Maps roles → allowed actions (proposals)
└── [12] Monitoring Condition Approval ── Maps roles → allowed actions (monitoring)

ROUTING LAYER (Where Things Go Next)
├── [5] Next Role After Action ────── Action → Next Role transitions (proposals)
└── [11] Monitoring Next Role ─────── Action → Next Role transitions (monitoring)

ORCHESTRATION LAYER (Complete Workflow Rules)
├── [6] Approval Master ──────────── Full approval chains per scheme (proposals)
└── [13] Monitoring Approval Master ── Full approval chains per request type (monitoring)

PRESENTATION LAYER (What Users See)
└── [9] Configure File View ──────── Document links and remarks per action stage

UTILITY LAYER (Workflow Replication)
└── [10] Workflow Configuration ───── Copy workflows between schemes
```

**Data flow:**
1. Actions (Page 1), Roles (Page 4), Statuses (Page 7), and Conditions (Page 2) are created as **master data**
2. Permissions are assigned: which roles can perform which actions (Pages 3, 12)
3. Transitions are defined: after an action, which role gets the proposal next (Pages 5, 11)
4. Everything is assembled into **complete approval chains** per scheme (Page 6) or per request type (Page 13), incorporating conditions for branching logic
5. PI-facing status labels are mapped (Page 8) and document views are configured (Page 9)
6. Entire workflows can be cloned across schemes (Page 10)

**The system maintains a clear separation between two parallel workflow tracks:**
- **Proposal Processing (Regular):** Pages 1–9 — handles the initial proposal lifecycle from submission to sanctioning
- **Monitoring (Post-Sanctioning):** Pages 11–13 — handles post-sanctioning activities like progress reports, additional grants, utilization certificates, and settlement

Both tracks share the same foundational building blocks (Actions, Roles, Statuses, Conditions) but have independent permission, routing, and orchestration configurations.
