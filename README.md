
```
TerraBangHack
├─ backend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ config
│  │  │  └─ db.ts
│  │  ├─ controllers
│  │  │  ├─ helper.controller.ts
│  │  │  ├─ offboarding.controller.ts
│  │  │  └─ task.controller.ts
│  │  ├─ middleware
│  │  │  └─ auth.ts
│  │  ├─ models
│  │  │  ├─ Employee.ts
│  │  │  ├─ index.ts
│  │  │  ├─ OffboardingCase.ts
│  │  │  ├─ Role.ts
│  │  │  ├─ User.ts
│  │  │  ├─ WorkflowAuditLog.ts
│  │  │  ├─ WorkflowStage.ts
│  │  │  └─ WorkflowTemplate.ts
│  │  ├─ routes
│  │  │  └─ index.ts
│  │  ├─ scripts
│  │  │  └─ seed.ts
│  │  ├─ server.ts
│  │  └─ services
│  │     ├─ email.service.ts
│  │     └─ pdf.service.ts
│  ├─ tsconfig.json
│  └─ uploads
│     └─ documents
│        ├─ noc-OFF-212657.pdf
│        ├─ noc-OFF-651273.pdf
│        ├─ noc-OFF-924875.pdf
│        ├─ relieving-OFF-212657.pdf
│        ├─ relieving-OFF-651273.pdf
│        ├─ relieving-OFF-924875.pdf
│        ├─ resignation-OFF-212657.pdf
│        ├─ resignation-OFF-651273.pdf
│        └─ resignation-OFF-924875.pdf
├─ employee-offboarding-mongodb-schema.md
├─ frontend
│  ├─ AGENTS.md
│  ├─ CLAUDE.md
│  ├─ components.json
│  ├─ eslint.config.mjs
│  ├─ next-env.d.ts
│  ├─ next.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ next.svg
│  │  ├─ vercel.svg
│  │  └─ window.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ favicon.ico
│  │  │  ├─ globals.css
│  │  │  ├─ hr
│  │  │  │  ├─ cases
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ initiate
│  │  │  │     └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ tasks
│  │  │     └─ page.tsx
│  │  ├─ components
│  │  │  ├─ FadeIn.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  └─ ui
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ checkbox.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ label.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ separator.tsx
│  │  │     ├─ table.tsx
│  │  │     ├─ tabs.tsx
│  │  │     ├─ textarea.tsx
│  │  │     ├─ toast.tsx
│  │  │     └─ toaster.tsx
│  │  ├─ context
│  │  │  └─ AuthContext.tsx
│  │  └─ lib
│  │     ├─ api.ts
│  │     └─ utils.ts
│  └─ tsconfig.json
├─ Problem-statement.md
└─ project-context
   ├─ API_CONTRACT.md
   ├─ CURRENT_STATE.md
   └─ TASK_TRACKER.md

```