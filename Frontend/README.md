# ChainChat — Frontend

A small React (Vite) frontend for your ChainChat backend.

## 1. Setup

```bash
cd chainchat-frontend
npm install
npm run dev
```

This starts the dev server at `http://localhost:5173`.

Make sure your backend is running at `http://localhost:3000` (or change
`BASE_URL` in `src/api.js`).

## 2. Folder structure

```
src/
├── api.js              ← every fetch call lives here
├── App.jsx             ← routes (login, signup, dashboard, chat)
├── index.css           ← all styling
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   └── CourseChat.jsx  ← the chat interface
└── components/
    ├── CourseCard.jsx
    ├── NewCourseModal.jsx
    └── SessionChain.jsx
```

## 3. How fetch + your backend connect (the important part)

### a) `fetch` basics

```js
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

const data = await res.json()
```

- `fetch` returns a `Response` object, not your data directly.
- `res.json()` parses the response body as JSON — this is itself
  async, so it needs `await`.
- `res.ok` is `true` for status codes 200-299. Anything else
  (404, 500, etc.) is `false`, but `fetch` does **not** throw —
  you have to check `res.ok` yourself and throw manually if you
  want errors to be catchable.

### b) Why everything goes through `api.js`

Every request needs:
1. The base URL (`http://localhost:3000`)
2. `Content-Type: application/json` header
3. The JWT token (if logged in) in `Authorization: Bearer <token>`
4. JSON parsing
5. Error handling (throwing if `res.ok` is false)

Instead of repeating that in every component, `api.js` has one
`request()` helper that does all five, and then small wrapper
functions like `api.login()`, `api.getCourses()`, etc.

So in a component you just write:

```js
const data = await api.getCourses()
```

and either get back data, or a `catch` block runs with a readable
error message.

### c) The auth flow

1. User submits the login form → `api.login(email, password)`
2. Backend responds with `{ token: '...' }`
3. We do `localStorage.setItem('token', data.token)`
4. From then on, `api.js` automatically reads that token and
   attaches it to every request:
   ```js
   headers['Authorization'] = `Bearer ${token}`
   ```
5. Your `authenticate` middleware reads this header and verifies
   the JWT.

If your `/auth/login` response uses a different key than `token`,
update this one line in `src/pages/Login.jsx`:

```js
localStorage.setItem('token', data.token)
```

### d) The course → session → messages flow

This mirrors your backend logic exactly:

1. `CourseChat.jsx` calls `api.getCourse(id)` →
   `GET /courses/:id`
   - Backend returns `{ course, session }`
   - `session` is either the existing active session, or a brand
     new one (possibly chained via `parent_session_id`)

2. Then `api.getMessages(session.id)` →
   `GET /sessions/:id/messages`
   - Loads the chat history for that session

3. When the user sends a message:
   `api.sendMessage(session.id, content)` →
   `POST /sessions/:id/messages`
   - Backend saves the user message, calls Groq with full
     history + parent summary, saves and returns the assistant
     reply

4. "End session & continue later":
   `api.endSession(session.id)` →
   `PATCH /sessions/:id`
   - Backend generates a summary and marks the session completed
   - We then call `loadCourse()` again, which creates the *next*
     session in the chain

## 4. Adjusting to match your exact backend responses

The two places most likely to need small tweaks:

- `src/pages/Login.jsx` — the key used for the JWT (`data.token`)
- `src/pages/Dashboard.jsx` — the key used for the course list
  (`data.course`, matching your `getAllCourses` response)

Everything else follows the response shapes you already tested in
Postman.
