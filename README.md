# Foundora Journey Builder

Build the first complete FRONTEND UI foundation for a web application called Foundora.

Foundora is a privacy-first co-founder matching and startup-building platform.

IMPORTANT:

I have limited Lovable credits.

Please implement this entire frontend scope in ONE pass.

Do not stop after giving me a plan.

Do not ask unnecessary follow-up questions.

Make sensible UI/UX decisions yourself.

Do not tell me to send separate prompts for each page.

For this stage:

FRONTEND ONLY.

Do NOT:

connect Supabase yet

create database tables

implement real authentication

connect OpenRouter or any AI API

create Edge Functions

create backend APIs

implement server logic

Use mock/local data and localStorage where appropriate.

PRODUCT FLOW

The final Foundora journey will be:

Landing

→ Sign Up / Login

→ Founder Profile

→ Anonymous Discovery

→ Interested

→ Mutual Match

→ Anonymous Chat

→ Mutual Identity Reveal

→ AI Compatibility

→ Guided Conversation

→ Share Project Direction

→ AI Project Proposal

→ Both Accept

→ Startup Workspace

For this first UI build, prepare the frontend experience for this complete journey.

BRAND

Product name:

Foundora

Never use:

FounderMatch

Founder Match

Use Foundora consistently everywhere.

Brand personality:

modern

intelligent

trustworthy

welcoming

professional

youthful without looking childish

suitable for technical and non-technical founders

privacy-first

startup-oriented

Avoid making the product feel like:

a dating app

an admin dashboard

a corporate HR tool

a gaming interface

THEME SYSTEM

Foundora should allow users to choose the visual theme from the Home/Landing experience.

Create a small elegant theme selector.

Provide 3 themes:

1. Sky — DEFAULT

Primary:

#5BA7F7

Background:

#F7FBFF

Soft surface:

#EAF4FF

Border:

#D7E9FB

Main text:

#16324F

Muted:

#6B7F93

2. Lavender

Primary:

soft modern purple

Background:

very light lavender/off-white

Surface:

soft lavender

Main text:

dark muted purple/navy

Keep it professional and calm.

3. Neutral

Primary:

modern slate/blue-gray

Background:

clean white/off-white

Surface:

soft gray

Text:

dark slate

Keep this theme extremely clean and universal.

THEME REQUIREMENTS

Theme switching should:

work instantly

affect all major pages

use shared design variables/tokens

persist with localStorage

remain selected after refresh

Default theme:

Sky

Do NOT create six or ten themes.

Only these 3 well-designed options.

Theme selector should be visible from the Home/Landing page and accessible later from the authenticated app header/settings area.

DESIGN SYSTEM

Use:

clean typography

clear hierarchy

generous spacing

rounded but not excessively rounded cards

subtle shadows

modern form controls

simple icons

reusable chips/tags

polished empty states

clear primary/secondary button hierarchy

Avoid:

excessive glassmorphism

neon colors

huge gradients

overly large hero text

giant cards with wasted space

unnecessary animations

Animations should be subtle:

hover

card transitions

button feedback

page transitions if lightweight

RESPONSIVE

Everything must work well on:

desktop

tablet

mobile

Mobile should not feel like a compressed desktop layout.

Use appropriate:

stacked layouts

collapsible navigation

responsive cards

touch-friendly buttons

1. LANDING / PUBLIC HOME PAGE

Make this page visually strong because it is the first impression of Foundora.

Hero:

Find the right person to build with.

Supporting copy:

Foundora helps founders discover compatible people, connect privately, and turn a promising match into something worth building together.

Primary CTA:

Find your co-founder

Secondary CTA:

Log in

Also show:

How Foundora works

Use a clear visual journey:

Discover

→ Match

→ Chat

→ Reveal

→ Build

HOME PAGE FEATURE SECTION

Show Foundora's strongest product ideas clearly.

Use attractive feature cards for:

Discover Privately

Explore founders through skills, interests, commitment, and working style without exposing personal identity.

Match Intentionally

Interest becomes a match only when both founders choose each other.

Connect Safely

Start through anonymous conversation before deciding whether to reveal identity.

Understand Compatibility

Use AI-assisted insights to explore strengths, friction points, and useful discussion topics.

Build Together

Turn shared direction into a structured AI-assisted project proposal.

Do not overcrowd the section.

HOME PAGE DIRECTED ACTIONS

I want the Home page to have WELL-ORGANIZED DIRECTED BUTTONS.

Do not scatter random buttons everywhere.

Create a clear action hierarchy.

Main actions:

New visitor

Primary:

Find your co-founder

Secondary:

Create founder profile

Tertiary:

See how it works

Returning user

Log in

Use clear navigation so users always understand what to do next.

THEME CHOOSER ON HOME

Include an attractive but compact control such as:

Choose your Foundora style

Options:

Sky

Lavender

Neutral

Show a small color preview for each.

Changing the theme should immediately update the page.

Do not make theme selection dominate the landing page.

2. SIGN UP PAGE

Create a polished signup UI.

Fields:

Email

Password

Confirm password

CTA:

Create account

Supporting message:

Your identity stays private while you explore potential co-founders.

Include:

Already have an account? Log in

Use mock authentication only.

After valid mock signup:

→ Founder Profile onboarding

3. LOGIN PAGE

Fields:

Email

Password

Primary CTA:

Log in

Link:

Create an account

Include:

validation state

loading state

password visibility toggle if appropriate

Mock authentication only.

4. AUTHENTICATED HOME / DASHBOARD

Do NOT make this look like a corporate analytics dashboard.

This should feel like a founder journey hub.

Welcome area:

Ready to find your next collaborator?

Show compact progress:

Profile

→ Discover

→ Match

→ Build

Create well-organized quick action cards/buttons:

Complete / View Profile

Manage your founder profile.

Discover Founders

Browse compatible founders anonymously.

Matches

See mutual connections.

Continue Conversations

Return to matched founder chats.

Build Together

Access AI collaboration for active matches.

Each action must clearly lead somewhere.

Avoid duplicated buttons.

5. FOUNDER PROFILE

Create a professional Create/Edit Founder Profile page.

Fields:

Anonymous Founder Name

Example:

Founder #A27

Include:

Generate name

Real Name

Mark:

Private

Supporting text:

Kept private until both founders agree to reveal identities.

Skills / What You Can Do

Multi-select/tag input.

Examples:

React

Python

UI/UX

Product Management

Marketing

Sales

Finance

Business Strategy

Data

Operations

What You Want to Build

Textarea.

Clearly display:

Your startup idea stays private.

Industry Interests

AI

FinTech

EdTech

HealthTech

SaaS

E-commerce

Sustainability

Gaming

Creator Economy

Available Hours Per Week

Experience Level

Beginner

Intermediate

Experienced

Looking For

Co-founder

Teammate

Advisor

Working Style

Structured

Flexible

Fast-paced

Collaborative

Independent

Commitment Level

Exploring

Part-time

Serious part-time

Full-time ready

Desired Partner Traits

Communicative

Technical

Business-minded

Creative

Reliable

Strategic

Fast learner

Product-minded

Primary CTA:

Save Profile

Use local state/localStorage.

Support:

Create

→ Save

→ View Profile

→ Edit Profile

6. ANONYMOUS DISCOVERY

Create an attractive Discovery page using 5–6 realistic mock founders.

Founder cards should show:

Anonymous founder name

Skills

Industries

Available hours

Experience

Looking for

Working style

Commitment

Desired partner traits

Do NOT show:

Email

Real name

Startup idea

Privacy badge:

Identity protected

Actions should be highly visible and organized:

Secondary:

Pass

Primary:

Interested

On Interested:

→ Interest sent

For at least one mock founder, simulate:

→ It's a match!

Use tasteful feedback, not a dating-app-style explosion.

7. MATCHES

Create Matches page.

Show mutual matches.

Each card should include:

Anonymous identity

Key skills

Industries

Commitment

Compatibility preview if useful

Primary action:

Open chat

Empty state:

No matches yet. Keep discovering founders.

8. ANONYMOUS CHAT

Create a polished anonymous conversation screen.

Include:

Anonymous founder identity

Privacy status

Message history

Own message bubbles

Partner message bubbles

Input

Send

Messages should work with local state.

Also include a compact relationship/progress header such as:

Matched

→ Chatting

→ Reveal

→ Build

Do not overwhelm the chat.

9. MUTUAL IDENTITY REVEAL

Include:

Request identity reveal

Initial:

Identity protected.

After current user requests:

Reveal requested — waiting for your match.

Provide a demo/mock action to simulate partner consent.

After both agree:

Identity revealed

Then reveal the mock partner's real name.

Never show email.

Clearly communicate:

Identity is revealed only when both founders agree.

10. AI COMPATIBILITY UI

Inside the matched relationship, include a well-designed collapsible area:

AI Founder Compatibility

For now use mock AI behavior.

Button:

Generate compatibility

After a short mock loading state show:

82% Compatibility

Strengths:

Complementary skill sets

Similar commitment

Shared interest in AI

Potential friction:

Different working styles

Availability needs discussion

Keep language advisory, not absolute.

Use:

AI Compatibility Insight

not:

Perfect Match Score

11. GUIDED CONVERSATION

Below compatibility, show approximately 4–6 recommended discussion prompts.

Examples:

How many hours can each of you consistently commit?

Who should lead product?

Who should lead growth?

How will you resolve disagreements?

What does success in the first 30 days look like?

Make them visually easy to use.

12. BUILD TOGETHER

Create a shared project direction section.

Fields:

Project title

Problem to solve

Target users

Rough solution

Notes

CTA:

Save project direction

Mock/local state only.

13. AI PROJECT PROPOSAL

Button:

Generate AI Proposal

Show a short loading state then display a polished mock proposal containing:

Project Name

Problem

Proposed Solution

Target Users

Founder Roles

First MVP

First 30-Day Plan

Key Risks / Questions

Keep it concise.

14. PROPOSAL ACCEPTANCE

Primary action:

Accept Proposal

After current user accepts:

Accepted by you — waiting for your match.

Provide a demo action/state that simulates partner acceptance.

After both accept:

Proposal accepted by both founders

Then show:

Go to Workspace

15. SIMPLE STARTUP WORKSPACE UI

Create the frontend UI for a simple workspace.

Do NOT make it a full project management system yet.

Show:

Project overview

Founder roles

MVP goal

30-day plan

Simple task list

AI proposal summary

Use example/mock data.

Primary actions should be clearly organized.

Do not add:

complex Kanban

file management

payments

advanced analytics

APP NAVIGATION

Authenticated navigation should be clean and consistent.

Desktop:

Home

Profile

Discover

Matches

Workspace

Theme selector

Logout

Mobile:

Use a clean mobile navigation pattern.

Do not put every secondary action in the main navigation.

MOCK INTERACTION FLOW

Make the frontend feel connected.

I should be able to demonstrate:

Landing

→ Signup

→ Profile

→ Discover

→ Interested

→ Match

→ Matches

→ Chat

→ Reveal

→ AI Compatibility

→ Project Direction

→ AI Proposal

→ Accept

→ Workspace

Use localStorage where useful so state survives refresh.

REUSABLE COMPONENTS

Use reasonable reusable components for:

navigation

buttons

cards

tags

form controls

privacy indicators

theme selector

progress/journey indicator

section containers

Do not over-engineer.

CREDIT-SAVING REQUIREMENT

Complete this whole frontend UI foundation in this ONE request.

Do not stop halfway.

Do not ask me to submit another prompt just to finish the remaining pages.

Do not connect backend services yet.

At the end, verify:

Foundora naming is consistent

no FounderMatch text exists

all major routes work

main CTA buttons navigate correctly

theme switching works

theme persists after refresh

default theme is Sky

all three themes remain readable

mobile layouts work

mock journey can be demonstrated end-to-end

privacy-related fields are visually treated correctly

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://foundora-found-co.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/17f2664d-c5cd-4e11-b0b0-8e2401f51f9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
