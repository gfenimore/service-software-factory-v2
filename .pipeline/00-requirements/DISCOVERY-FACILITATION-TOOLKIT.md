# 🛠️ Discovery Facilitation Toolkit
## How to Fill the Factory Discovery Canvas

*Practical methods and tools for gathering information to complete each section of the Factory Discovery Canvas*

---

## 📋 Overview

This toolkit provides **specific methods** for gathering the information needed to complete each section of the Factory Discovery Canvas. Each method includes templates, question scripts, and time estimates.

---

## 🎯 SECTION 1 TOOLKIT: Vision & Objectives

### **Method 1: Executive Stakeholder Interview**
**Time:** 90 minutes  
**Participants:** Decision makers, budget owners

#### **Pre-Interview Prep**
- [ ] Research the company (website, LinkedIn, industry reports)
- [ ] Prepare company context summary
- [ ] Review any existing documentation

#### **Interview Script Template**

**Opening (5 minutes)**
> "I'm going to ask questions to understand the business context and objectives for this software project. This will help ensure we build the right solution."

**Business Problem Discovery (30 minutes)**
- "Walk me through the process that's causing problems today."
- "What happens when this process goes wrong?"
- "How much time/money does this problem cost weekly?"
- "What have you tried to solve this before?"
- "If we don't build this software, what happens in 6 months?"

**Success Definition (20 minutes)**
- "How will you know this software was worth the investment?"
- "What metrics do you track today that this should improve?"
- "6 months after launch, what would make you call this a success?"
- "What would make this feel like a 'must have' vs 'nice to have'?"

**Constraints & Context (20 minutes)**
- "What's your budget range for this project?"
- "When do you need this operational?"
- "Are there any systems this must integrate with?"
- "What compliance or security requirements exist?"

**Wrap-up (15 minutes)**
- "Who else should I talk to understand this better?"
- "What documentation should I review?"
- "What am I not asking that I should be?"

#### **Output Template**
```markdown
## Business Vision Summary

**Problem Statement:** [2-3 sentences describing core problem]

**Success Metrics:** 
- Primary: [Most important KPI]
- Secondary: [2-3 supporting metrics]

**Constraints:**
- Budget: $[range] 
- Timeline: [deadline]
- Technical: [key constraints]

**Stakeholders:**
- Champion: [name/role]
- Users: [key user types identified]
- IT Contact: [name/role]
```

---

### **Method 2: Current State Documentation Review**
**Time:** 2-3 hours  
**Solo work**

#### **Documents to Request**
- [ ] Organizational chart
- [ ] Current software/system list
- [ ] Process documentation (if exists)
- [ ] User manuals or training materials
- [ ] Previous software evaluations or RFPs

#### **Review Checklist**
- [ ] Map out current technology stack
- [ ] Identify process bottlenecks mentioned in docs
- [ ] Note inconsistencies between different documents
- [ ] List integration points mentioned
- [ ] Flag compliance or security requirements

---

## 👥 SECTION 2-3 TOOLKIT: Users & Workflows  

### **Method 3: User Journey Mapping Interviews**
**Time:** 60 minutes per user type  
**Participants:** 2-3 representatives of each user type

#### **Pre-Interview Setup**
- [ ] Prepare persona hypothesis template
- [ ] Create empty workflow diagram
- [ ] Set up screen sharing for collaborative mapping

#### **Interview Structure**

**User Context (15 minutes)**
- "Tell me about your role and daily responsibilities"
- "What software/tools do you use regularly?"
- "How long have you been doing this type of work?"
- "What's the most challenging part of your job?"

**Workflow Mapping (35 minutes)**
> "I want to map out how you currently accomplish [specific task]. Walk me through it step by step, and I'll draw it as we go."

**For Each Workflow Step:**
- "What do you do here exactly?"
- "What tools or systems do you use?"
- "What information do you need to complete this step?"
- "What slows you down or causes problems?"
- "Who else is involved in this step?"

**Pain Point Deep-Dive (10 minutes)**
- "Of everything we discussed, what frustrates you most?"
- "Where do you waste the most time?"
- "What causes you to have to redo work?"
- "If you could fix one thing, what would it be?"

#### **Live Workflow Mapping Template**
```
[Start] → [Step 1] → [Decision Point] → [Step 2] → [End]
           ↓             ↓                ↓
        [Tools]      [Pain Point]     [Handoff]
        [Time]       [Frequency]      [Who]
```

#### **Output: User Persona Cards**
```markdown
## [User Type] Persona

**Demographics:**
- Experience: [years in role]
- Tech Comfort: [Low/Medium/High]
- Work Environment: [Office/Field/Remote]

**Primary Goals:**
- [Goal 1: specific outcome they need]
- [Goal 2: specific outcome they need]

**Key Workflows:**
- [Workflow 1: frequency, complexity]
- [Workflow 2: frequency, complexity]

**Pain Points:**
- [Pain 1: specific frustration]
- [Pain 2: specific frustration]

**Success Metrics:**
- [How they measure success in their role]

**Quotes:**
- "[Direct quote that captures their mindset]"
```

---

### **Method 4: Workflow Shadowing/Observation**
**Time:** 2-4 hours per user type  
**Best for:** Complex or unclear processes

#### **Observation Protocol**
- [ ] Ask permission to observe normal work
- [ ] Don't interrupt during tasks
- [ ] Take timestamped notes
- [ ] Note emotional reactions (frustration, confusion)
- [ ] Ask clarifying questions during breaks

#### **Observation Notes Template**
```
Time: [timestamp]
User Action: [what they did]
System/Tool: [what they used]
Duration: [how long it took]
Observed Issues: [problems, delays, confusion]
User Comments: [anything they said]
```

---

## ⚙️ SECTION 4 TOOLKIT: Technical Context

### **Method 5: Technical Systems Audit**
**Time:** 3-4 hours  
**Participants:** IT contact, system administrators

#### **Systems Inventory Checklist**
- [ ] **Software Applications**
  - [ ] CRM system (name, version, customizations)
  - [ ] Accounting software
  - [ ] Scheduling/calendar tools
  - [ ] Communication tools
  - [ ] Industry-specific software

- [ ] **Data Storage**
  - [ ] Database systems (type, size, age)
  - [ ] File storage (local, cloud, network drives)
  - [ ] Backup systems
  - [ ] Data export capabilities

- [ ] **Infrastructure**
  - [ ] Server setup (cloud, on-premise, hybrid)
  - [ ] Network configuration
  - [ ] Security measures
  - [ ] Mobile device management

#### **Integration Assessment Questions**
- "What systems need to share data?"
- "How is data currently transferred between systems?"
- "What manual data entry could be eliminated?"
- "What reports are generated from multiple systems?"
- "Where do you experience data inconsistencies?"

#### **Technical Constraints Interview**
- "What security policies exist for new software?"
- "Are there any systems we cannot integrate with?"
- "What performance requirements exist?"
- "Who manages software updates and maintenance?"
- "What's the approval process for new technology?"

---

### **Method 6: Data Model Validation Workshop**
**Time:** 2 hours  
**Participants:** Key users + IT contact

#### **Workshop Structure**

**Entity Brainstorming (30 minutes)**
- "What 'things' does your business need to track?"
- Write each entity on a sticky note
- Group related entities together

**Relationship Mapping (45 minutes)**
- "How do these things connect to each other?"
- Draw lines between related entities
- Label relationships (one-to-many, many-to-many)

**Business Rules Discovery (30 minutes)**
- "What rules govern these relationships?"
- "What validations are required?"
- "What calculations are needed?"

**Data Source Mapping (15 minutes)**
- "Where does this data come from today?"
- "Who is responsible for keeping it accurate?"

---

## 💡 SECTION 5-6 TOOLKIT: Solutions & Metrics

### **Method 7: Solution Assumption Mapping**
**Time:** 90 minutes  
**Participants:** Key stakeholders + users

#### **Assumption Generation Process**

**Problem-Solution Fit Assumptions**
- "We assume the main problem is [X]"
- "We assume [user type] experiences this problem when [situation]"
- "We assume solving [X] will result in [Y] improvement"

**Solution Approach Assumptions**
- "We assume [user type] will prefer [interface approach]"
- "We assume the system should prioritize [speed/accuracy/ease-of-use]"
- "We assume integration with [system] is [critical/nice-to-have]"

**Technical Architecture Assumptions**
- "We assume [technology choice] is the right approach"
- "We assume performance requirements are [X]"
- "We assume [deployment model] will work best"

#### **Assumption Testing Planning**
For each assumption:
- **How might we test this?** [interview, prototype, research]
- **What would prove it wrong?** [specific evidence]
- **How important is it?** [critical, important, nice-to-know]

---

### **Method 8: Success Metrics Definition Workshop**
**Time:** 60 minutes  
**Participants:** Stakeholders who will measure success

#### **Current State Metrics Discovery**
- "What do you measure today?"
- "How do you know when things are going well/poorly?"
- "What reports do you look at regularly?"
- "What would you like to measure but can't today?"

#### **Future State Metrics Design**
- "If this software works perfectly, what will improve?"
- "How will we measure that improvement?"
- "How often will we check these metrics?"
- "Who will be responsible for tracking them?"

#### **Metrics Prioritization**
- **Tier 1:** Must improve or project fails
- **Tier 2:** Important improvements that justify investment  
- **Tier 3:** Nice to have improvements

---

## ⚠️ SECTION 7-8 TOOLKIT: Risks & Next Steps

### **Method 9: Risk Assessment Session**
**Time:** 45 minutes  
**Participants:** Full discovery team

#### **Risk Brainstorming Categories**
- **User Adoption Risks:** Will users actually use this?
- **Technical Risks:** Can we build what we're proposing?
- **Business Risks:** Will this solve the actual problem?
- **Integration Risks:** Will it work with existing systems?
- **Resource Risks:** Do we have what we need to succeed?

#### **Risk Scoring Framework**
**Impact Scale (1-5)**
- 1: Minor inconvenience
- 3: Moderate problem, workaround possible
- 5: Project failure

**Probability Scale (1-5)**
- 1: Very unlikely (10% chance)
- 3: Possible (50% chance)  
- 5: Very likely (90% chance)

**Priority = Impact × Probability**
- 15-25: Critical risk, needs mitigation plan
- 10-14: Important risk, monitor closely
- 5-9: Medium risk, document and watch
- 1-4: Low risk, acknowledge

---

### **Method 10: Validation Planning Session**
**Time:** 60 minutes  
**Participants:** Discovery team + key stakeholders

#### **Validation Experiment Design**

**For Each Key Assumption:**
```markdown
## Experiment: [Name]

**Assumption to Test:** [Specific hypothesis]

**Method:** [How we'll test it]
- [ ] User interviews (# needed)
- [ ] Clickable prototype
- [ ] Survey (# responses needed)
- [ ] Competitive analysis
- [ ] Technical spike

**Success Criteria:** 
- What result would confirm the assumption?
- What result would disprove it?

**Timeline:** [When we'll complete this]

**Owner:** [Who's responsible]

**Budget:** [Resources needed]
```

---

## 🚀 Canvas Completion Process

### **Recommended Discovery Timeline**

**Week 1: Foundation**
- Method 1: Executive Interview
- Method 2: Documentation Review
- Section 1 Complete

**Week 2: User Deep-Dive**
- Method 3: User Journey Interviews (2-3 user types)
- Method 4: Workflow Observation (if needed)
- Sections 2-3 Complete

**Week 3: Technical & Solutions**
- Method 5: Technical Systems Audit
- Method 6: Data Model Workshop
- Method 7: Solution Assumptions
- Sections 4-5 Complete

**Week 4: Validation Planning**
- Method 8: Success Metrics Workshop
- Method 9: Risk Assessment
- Method 10: Validation Planning
- Sections 6-8 Complete
- **Canvas Review & Sign-off**

### **Quality Gates**

**Section 1 Ready When:**
- [ ] Problem statement in 2-3 sentences
- [ ] Success metrics are specific and measurable
- [ ] Constraints are documented with numbers/dates

**Sections 2-3 Ready When:**
- [ ] 3+ user personas with real quotes
- [ ] Current workflow maps with pain points identified
- [ ] Jobs-to-be-done statements completed

**Section 4 Ready When:**
- [ ] Complete systems inventory
- [ ] Integration requirements prioritized
- [ ] Technical constraints documented

**Sections 5-6 Ready When:**
- [ ] Solution hypotheses are testable
- [ ] Success metrics have baseline numbers
- [ ] UX patterns selected with rationale

**Sections 7-8 Ready When:**
- [ ] Top 5 risks identified with mitigation plans
- [ ] Validation experiments designed with success criteria
- [ ] Next steps have owners and timelines

---

## 📊 Discovery Session Templates

### **Stakeholder Interview Agenda**
```
Discovery Interview: [Project Name]
Participant: [Name, Role]
Date/Time: [Schedule]
Duration: 90 minutes

AGENDA:
0:00-0:05  Opening & Context
0:05-0:35  Business Problem Discovery  
0:35-0:55  Success Definition
0:55-1:15  Constraints & Context
1:15-1:30  Next Steps & Follow-ups

PREP MATERIALS:
- Company research summary
- Existing documentation reviewed
- Question scripts printed
- Canvas section to fill
```

### **User Interview Agenda**
```
User Journey Interview: [Project Name]  
Participant: [Name, Role]
Date/Time: [Schedule]
Duration: 60 minutes

AGENDA:
0:00-0:05  Introduction
0:05-0:20  User Context & Background
0:20-0:55  Workflow Mapping & Pain Points
0:55-1:00  Wrap-up & Next Steps

PREP MATERIALS:  
- User persona hypothesis
- Workflow mapping tool ready
- Screen sharing setup
- Pain point template
```

### **Technical Workshop Agenda**
```
Technical Systems Workshop: [Project Name]
Participants: [IT Contact, Key Users]  
Date/Time: [Schedule]
Duration: 2 hours

AGENDA:
0:00-0:30  Systems Inventory
0:30-1:15  Data Model Validation
1:15-1:45  Integration Requirements
1:45-2:00  Technical Constraints & Next Steps

PREP MATERIALS:
- Systems inventory template
- Data model hypothesis
- Integration assessment questions
```

---

*Discovery Facilitation Toolkit v1.0 - Companion to Factory Discovery Canvas*