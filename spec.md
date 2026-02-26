# Specification

## Summary
**Goal:** Build SkillSwap, a peer-to-peer skill exchange platform where users can offer skills they know, find others with complementary skills, request exchanges, message matched partners, and leave reviews.

**Planned changes:**
- User registration and profile management with name, bio, offered skills, and wanted skills; profiles stored on-chain and retrievable by principal
- Skill browsing and search directory showing all users' offered skills, filterable by skill name in real time
- Complementary skill match detection: when two users' offered/wanted skills overlap, display a match indicator and allow sending an exchange request
- Exchange request flow with pending/accepted/declined states; accepted exchanges appear on both users' dashboards under "Active Exchanges"
- In-platform messaging restricted to users with an accepted exchange match; conversation thread ordered chronologically, refreshed on page load
- Ratings and reviews system (1–5 stars + optional text) per accepted exchange; aggregate rating and all received reviews shown on profiles; one rating per exchange per user
- Warm earthy visual theme (terracotta, sage green, off-white) with card-based layouts, clean sans-serif typography, and distinct accent highlights for match/action states

**User-visible outcome:** Users can create a profile listing skills they teach and want to learn, browse and search other users, send and manage skill exchange requests, message accepted partners, and rate completed exchanges — all within a cohesive, community-feel UI.
