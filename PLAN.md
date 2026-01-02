Objective

Build a small, reliable and production ready quiz management system.

Assumptions:

- No authentication required
- Admin access protected via env variable
- Anyone can take a quix via a public link
- One submission per quiz attempt

Scope:

Admin:
- Create Quiz with title and questions.
- Supported types of questions
    - MCQ
    - True/False

Public:
- Attempt quiz via public URL.
- Submit answers and view score


Test Stack
- Frontned - React Js (Vercel)
- Backend - Python ( FastAPI ) (Render)
- Database - PostgreSQL (Neon)

Database Schema (High Level)
- Quiz: id, title, create_at
- Question : id, quiz_id, type, question_tex, options, correct_ans
- Submission: id, quiz_id, answers, score, create_at

