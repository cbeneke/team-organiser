# point-blank
Point.Blank App


# Backend

## Requirements
Create a virtual Env with Python 3.9 and install the requirements.txt. If you are running VSCode, ensure that the `cwd` in the launch.json is configured to the backend subfolder (needs an absolute path).

Then create a `.env` file in the project root folder, which contains the database URL and JWT key:

```bash
DATABASE_URL=sqlite:///backend.db
JWT_SECRET_KEY=<someValue>
```

You can generate a JWT secret for example with `openssl rand -hex 32`.

## Database migrations

Before running the code, you need to ensure that your database is on the latest state. We use Alembic to manage the migrations:

```bash
alembic upgrade head
```

## Upstream documentation

We are using [FastAPI](https://fastapi.tiangolo.com/) following these best practices:
- https://github.com/zhanymkanov/fastapi-best-practices 
