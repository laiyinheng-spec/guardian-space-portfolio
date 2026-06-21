# Page 02 – Background & Secondary Research

## 1. Page Goal

Create **Page 02** of the Guardian Space portfolio.

This page should be an **A3 landscape portfolio board** displayed inside a responsive web viewer.

It should not become a long vertical webpage.

The page explains the background and secondary research of the stray animal issue, then leads to the design opportunity for an MR guardian system.

The final result should feel like a clean, warm, editorial portfolio research board.

---

## 2. Responsive Portfolio Viewer

The page should keep an A3 landscape board ratio, but the board should scale to fit the browser screen.

Current issue to fix:

```text
The page currently feels like a fixed poster pasted into the browser.
```

Required behavior:

```text
Keep the A3 landscape board as the design unit.
Center the board in the browser.
Scale the board to fit within the viewport width and height.
Do not require manual browser zoom.
Do not convert this page into a long scrolling webpage.
```

Recommended ratio:

```text
A3 landscape ratio: 1.414 : 1
```

The surrounding browser background can be subtle and neutral, but the board itself should keep the warm cream portfolio style.

---

## 3. Image Assets

Use the provided image assets directly.

Image assets are stored in:

```text
/public/assets/page02/
```

Use these paths in code:

```text
/assets/page02/trend-chart.png
/assets/page02/risk-factor-capsule-chart.png
/assets/page02/china-stray-map.png
/assets/page02/global-stray-distribution.png
```

Optional reference assets:

```text
/assets/page02/current-page02-to-revise.png
/assets/page02/impact-reference.png
/assets/page02/existing-response-reference.png
```

Important:

```text
current-page02-to-revise.png is only for understanding the current problems.
Do not copy the current right-column layout directly.
```

Asset rules:

* Do not redraw the maps.
* Do not redraw the charts.
* Do not invent new data.
* Use the left-column chart and map images directly.
* Keep final page titles and main text editable in HTML/CSS.

---

## 4. Visual Style Tokens

Use a warm, editorial, research-board style.

The project visual tone is:

```text
warm / clean / trustworthy / animal care / MR companionship
```

Avoid:

```text
cold blue tech style
black cyber style
pink feminine style
generic SaaS dashboard style
spreadsheet-style tables
large empty white cards
too many rounded dashboard cards
random decorative icons
heavy shadows
```

### Colors

```css
:root {
  --color-bg: #FFFDF8;
  --color-section: #F7F1E8;
  --color-card: #FDF7EF;

  --color-primary: #7C3F2D;
  --color-accent: #EB6435;
  --color-accent-secondary: #F99761;
  --color-accent-soft: #FBCEA5;
  --color-accent-pale: #FBF1E1;

  --color-text-main: #3E2E27;
  --color-text-secondary: #7B6A5F;
  --color-text-muted: #A99589;

  --color-line: #E6D5C7;
}
```

### Typography

Use clean sans-serif typography.

Recommended fonts:

```text
English: Inter / Helvetica Neue / Avenir / Arial
Chinese fallback: Noto Sans SC / Microsoft YaHei
```

### Typography hierarchy

```text
H1:
BACKGROUND / Secondary Research
Size: 52–60px
Weight: 800
Color: #7C3F2D

H2:
Phenomenon / Survey / Channel Landscape
Size: 20–24px
Weight: 700
Color: #EB6435 or #C9653E

H3:
Module titles
Size: 14–17px
Weight: 700
Color: #7C3F2D

Body text:
Size: 10–13px
Color: #3E2E27

Small caption / source:
Size: 8–10px
Color: #7B6A5F
```

Important title rule:

```text
BACKGROUND and Secondary Research must be horizontally aligned at the top.
They are both H1 titles and should have the same visual level.
Secondary Research should stay on one line if possible.
Do not let Secondary Research drop lower than BACKGROUND.
```

---

## 5. Overall Layout

Use a two-column A3 landscape portfolio board.

```text
Left column: Background / Phenomenon
Right column: Secondary Research / Survey
Bottom-left: Key Finding
Bottom-right: Design Opportunity
```

Recommended proportion:

```text
Left column: 58%–62%
Right column: 36%–40%
Middle gap: about 2%
```

Left side = data evidence.
Right side = research reasoning.

Keep the left column mostly unchanged.

Refine the right column more carefully.

---

## 6. Left Column – Background

### Main title

```text
BACKGROUND
```

### Subsection

```text
· Phenomenon
```

### Intro sentence

```text
Stray animals are not only an animal welfare issue, but also an urban participation and trust issue.
```

This sentence should be editable text.

---

## 7. Left Module 01 – Global Stray Animal Growth Trend

### Module title

```text
Global Stray Animal Growth Trend
```

### Asset

```text
/assets/page02/trend-chart.png
```

Use the provided line chart image directly.

Do not redraw the chart.

### Data logic

China series:

```text
2021: 93M
2022: 120M
2023: 156M
2024: 200M
2025: 214M
2026: 229M
```

Global benchmark series:

```text
2021: 224M
2022: 270M
2023: 318M
2024: 362M
2025: 382M
2026: 402M
```

Data note:

```text
2021 and 2024 are cited public estimates.
2022–2023 are interpolated for visual continuity.
2025–2026 are visual projections, not official data.
```

---

## 8. Left Module 02 – Sources Behind Stray Animals

### Module title

```text
Sources Behind Stray Animals
```

### Asset

```text
/assets/page02/risk-factor-capsule-chart.png
```

Use the provided capsule-bar chart image directly.

Do not recreate it as a table.

### Content

```text
Lost pets never found by owners — 58.7%
Owned dogs not sterilized — 49.6%
Owned cats not sterilized — 41.3%
Considering giving up a pet because of moving — 18.8%
```

Data note:

```text
Adapted from Mars State of Pet Homelessness Project 2024 public insights.
The numbers are used as approximate visualization values, not as the user's own survey data.
```

---

## 9. Left Module 03 – China Stray Animal Scale

### Module title

```text
China Stray Animal Scale
```

### Asset

```text
/assets/page02/china-stray-map.png
```

Use the provided China map image directly.

Do not redraw the map.

### Core data

```text
2021 national estimate:
53M stray cats + 40M stray dogs ≈ 93M total
```

### Hotspot examples

These are reported public examples, not an official province-by-province census.

```text
Beijing:
Stray cats about 200k, reported in 2007.

Shanghai:
Stray cats estimated at 300k–1,000k, reported in 2023.

Guangzhou:
Stray cats and dogs about 100k, reported in 2014.

Chengdu:
Elevated rescue pressure reported by local rescue groups.
Use as a contextual rescue-pressure example, not as a precise citywide count.
```

Important note:

```text
China does not publish a complete official province-by-province stray-pet census.
This map should be treated as reported hotspot examples and relative public reporting presence.
```

---

## 10. Left Module 04 – Global Stray Animal Visibility

### Module title

```text
Global Stray Animal Visibility
```

### Asset

```text
/assets/page02/global-stray-distribution.png
```

Use the provided global distribution map image directly.

Do not redraw the world map.

### Core benchmark

```text
2024 global benchmark:
362M homeless cats and dogs across 20 countries studied
```

### Explanation

```text
This map shows relative visibility of stray / homeless dogs and cats based on public data and reports, not a census.
```

---

## 11. Left Module 05 – Key Finding

### Module title

```text
KEY Finding
```

### Visual form

Use a horizontal insight strip.

Structure:

```text
Overpopulation visual
→ Abandonment visual
→ Stray life visual
→ Shelter shortage visual
→ Participation Gap
```

Optional sentence:

```text
Large-scale stray animals and fragmented rescue systems create a gap between people who want to help and animals that need long-term support.
```

This area should align visually with the bottom-right Design Opportunity area.

---

## 12. Right Column – Secondary Research

### Main title

```text
Secondary Research
```

### Subsection

```text
· Survey
```

Important:

```text
Secondary Research must align horizontally with BACKGROUND.
Do not let it drop lower than BACKGROUND.
Do not wrap it into two lines unless there is no space.
```

Right column logic:

```text
Compact diagram
→ process diagram
→ editorial comparison
→ text insight
→ conclusion strip
```

The right column should not look like:

```text
tiny infographic thumbnails
dashboard widgets
chip/tag UI
a pile of pasted diagrams
```

---

## 13. Right Module 01 – Impact of Unmanaged Stray Animals

### Module title

```text
Impact of Unmanaged Stray Animals
```

### Visual form

Use a readable hub-and-spoke diagram.

This should follow the provided impact reference structure more closely.

Do not shrink it into tiny cards.

Do not paste a full large infographic image.

Rebuild it as an editable HTML/CSS diagram.

### Structure

Top Level 1 node:

```text
Unmanaged Stray Animals
```

Subtitle:

```text
Uncontrolled reproduction, roaming, and human–animal conflicts.
```

Three Level 2 nodes:

```text
Public Health
Community Safety
Urban Ecology
```

Each Level 2 node should include one short data anchor or micro sentence.

Suggested content:

```text
Public Health:
99% of human rabies cases are linked to dog bites / scratches globally.

Community Safety:
Unmanaged feeding and close contact can trigger neighborhood disputes.

Urban Ecology:
Free-ranging cats can create measurable pressure on birds and small mammals.
```

Color rules:

```text
Level 1 node fill: #F99761
Level 2 node fill: #FBCEA5
Icons and connecting lines: #EB6435
Text: #3E2E27
```

Important:

```text
Keep this readable.
Do not make it too small.
Do not make it look like three tiny SaaS cards.
```

---

## 14. Right Module 02 – Existing Response Systems

### Module title

```text
Existing Response Systems
```

### Visual form

Use a readable two-lane process diagram.

This should follow the provided existing response reference structure more closely.

Do not reduce it into tiny pills.

Do not paste a full large infographic image.

Rebuild it as an editable HTML/CSS diagram.

### Route 1

```text
Non-adoption route:
Control → Shelter → Sterilization → Release
```

### Route 2

```text
Adoption route:
Rescue → Medical Care → Review → Follow-up
```

Visual details:

```text
small numbered circles
thin arrows
small icons
label boxes
light separator between the two routes
```

Color rules:

```text
Numbered circles: #EB6435
Icons: #FC935B
Label box fill: #FBF1E1
Text: #3E2E27
Lines and arrows: #EB6435 or #F99761
```

Important:

```text
Keep it slim but readable.
Do not make each label box too large.
Do not shrink it into tiny unreadable pills.
```

---

## 15. Right Module 03 – Channel Landscape

### Module title

```text
· Channel Landscape
```

This is an H2-level section title.

### Visual form

Use a simple editorial comparison block.

Do not use a large ecosystem / network diagram.

Do not use capsule chips.

Do not use SaaS-style tag pills.

Do not add screenshot placeholders for now.

Do not make this area icon-heavy.

### Layout

Use two clean text columns with a thin vertical divider.

```text
Domestic channels        International channels
```

### Domestic side

Title:

```text
Domestic channels
```

Content:

```text
Shelters / Social media / Individual rescuers / Cloud feeding
```

Note:

```text
High information noise and inconsistent verification.
```

### International side

Title:

```text
International channels
```

Content:

```text
Shelter networks / TNR programs / Donation platforms / Adoption matching
```

Note:

```text
More searchable and structured, but less emotionally continuous.
```

Visual style:

```text
two clean text columns
thin vertical divider
short slash-separated channel text
one short note under each side
light horizontal divider lines
no rounded chips
no icon-heavy layout
```

Color rules:

```text
Section title: #EB6435 or #C9653E
Column title: #7C3F2D
Main text: #3E2E27
Note text: #7B6A5F
Divider line: #E6D5C7
Small accents: #EB6435
```

---

## 16. Right Module 04 – Pain Points

### Module title

```text
PAIN POINTS
```

### Visual form

Use a text-based insight block.

Do not use an icon chain.

Do not use another infographic.

Do not use four generic cards.

### Text

Use these two short paragraphs:

```text
Stray-animal support is fragmented across shelters, social media, individual rescuers, and cloud-feeding platforms. Users often struggle to verify information, track support use, and maintain continuous contact with the animals they care about.

Real adoption requires space, time, approval, and long-term responsibility. This creates a participation gap between public willingness to help and existing support channels.
```

### Keyword tags

Add four small text keywords below the paragraphs:

```text
Information Fragmentation
Funding Opacity
High Participation Barrier
Weak Emotional Connection
```

The keywords should be subtle text labels, not large chips.

Visual style:

```text
comfortable line height
readable paragraph width
not overly bold
small keyword labels
no icon chain
no large empty space below
```

Color rules:

```text
Heading: #7C3F2D
Body text: #3E2E27
Keyword text: #7C3F2D or #EB6435
Divider line: #E6D5C7
```

---

## 17. Right Module 05 – Design Opportunity

### Module title

```text
DESIGN OPPORTUNITY
```

### Visual form

Use a terracotta conclusion strip.

Restore this closer to the earlier better version:

```text
small icon on the left
strong conclusion text
clean horizontal strip
not too tall
aligned with the bottom area of the left Key Finding section
```

Main text:

```text
A low-barrier, transparent, and emotionally responsive MR guardian system is needed.
```

Supporting sentence, optional:

```text
The system should lower the barrier to participation, make support more traceable, and create continuous emotional feedback between users and rescued animals.
```

Important:

```text
Keep it visually connected to Pain Points.
Do not make it look like a normal SaaS card.
Do not make it too tall.
Do not remove the small icon if it helps the strip look balanced.
```

Color rule:

```text
Strip fill: #EB6435 or darker terracotta
Text: #FFFDF8
Small icon: #FFFDF8 or #FBF1E1
```

---

## 18. Right Column Layout Rhythm

Recommended height distribution:

```text
Title area: 10%
Impact of Unmanaged Stray Animals: 20%
Existing Response Systems: 20%
Channel Landscape: 18%
Pain Points: 20%
Design Opportunity: 12%
```

Design logic:

```text
Impact = compact readable diagram
Existing Response Systems = process diagram
Channel Landscape = editorial text comparison
Pain Points = text-based insight
Design Opportunity = conclusion / next page entrance
```

The right column should balance diagrams and text.

Do not make it all diagrams.

Do not make it all text.

---

## 19. Implementation Rules for Codex

Follow these rules strictly:

1. Do not redesign the whole page freely.
2. Do not convert it into a long scrolling webpage.
3. Make the A3 board responsive to the browser viewport.
4. Keep BACKGROUND and Secondary Research horizontally aligned.
5. Keep the left column mostly unchanged.
6. Use the provided left-column images directly.
7. Do not redraw maps or charts.
8. Do not invent new data.
9. Do not use spreadsheet-style tables.
10. Do not use generic SaaS-style cards.
11. Do not make every section an infographic.
12. Do not use chip/tag capsule UI for Channel Landscape.
13. Do not use an icon chain for Pain Points.
14. Reduce icon density.
15. Add more breathing space.
16. Keep final text editable in HTML/CSS.
17. Only refine Page 02.
18. Do not modify other pages unless necessary.

---

## 20. Expected Result

The final page should look like a clean A3 landscape portfolio research board.

Left side:

```text
data evidence + maps + key finding
```

Right side:

```text
compact impact diagram
+ two-lane response process
+ editorial channel comparison
+ text pain-point insight
+ terracotta design opportunity strip
```

The page should feel:

```text
warm
editorial
clear
research-driven
portfolio-ready
not AI-looking
not SaaS-dashboard-like
```
