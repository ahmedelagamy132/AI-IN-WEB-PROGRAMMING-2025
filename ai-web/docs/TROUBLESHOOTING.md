# Database Troubleshooting Guide

## Common Issues and Solutions

---

## 🔴 Issue 1: Database Connection Failed

### Symptoms
```
sqlalchemy.exc.OperationalError: could not connect to server
psycopg2.OperationalError: connection refused
```

### Solutions

#### Check if PostgreSQL is running
```bash
docker-compose ps
```

Expected output:
```
NAME              STATUS        PORTS
ai-web-db-1       Up (healthy)  0.0.0.0:5432->5432/tcp
```

#### View database logs
```bash
docker-compose logs db
```

Look for:
```
database system is ready to accept connections
```

#### Restart the database
```bash
docker-compose restart db
```

#### Complete reset
```bash
docker-compose down
docker-compose up -d
```

---

## 🔴 Issue 2: Tables Don't Exist

### Symptoms
```
relation "conversations" does not exist
relation "messages" does not exist
```

### Solutions

#### Check backend startup logs
```bash
docker-compose logs backend | grep -i database
```

Expected:
```
INFO:     Initializing database...
INFO:     Database initialized successfully
```

#### Manually initialize
```bash
docker exec -it ai-web-backend-1 python -c "from app.database import init_db; init_db(); print('Tables created')"
```

#### Force recreation
```bash
docker-compose down -v  # WARNING: Deletes all data!
docker-compose up --build
```

---

## 🔴 Issue 3: Import Errors in IDE

### Symptoms
```
Import "sqlalchemy" could not be resolved
Import "psycopg2" could not be resolved
```

### Explanation
This is **EXPECTED** and **NOT AN ERROR**. The packages are installed in the Docker container, not in your local environment.

### Solutions (if you want local type hints)

#### Option 1: Install in virtual environment
```bash
# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

#### Option 2: Use Dev Container
Configure VS Code to use the Docker container for development.

#### Option 3: Ignore the warnings
The code **will work correctly** in Docker regardless of local warnings.

---

## 🔴 Issue 4: Backend Can't Reach Database

### Symptoms
```
connection to server at "localhost:5432", connection refused
could not translate host name "db" to address
```

### Solutions

#### Check network configuration
```bash
docker network ls
docker network inspect ai-web_default
```

#### Verify environment variable
```bash
docker exec -it ai-web-backend-1 env | grep DATABASE
```

Expected:
```
DATABASE_URL=postgresql://aiwebuser:aiwebpass@db:5432/aiweb
```

#### Check docker-compose.yml
Ensure backend has `depends_on` with health check:
```yaml
backend:
  depends_on:
    db:
      condition: service_healthy
```

---

## 🔴 Issue 5: Authentication Failed

### Symptoms
```
FATAL: password authentication failed for user "aiwebuser"
```

### Solutions

#### Check credentials in .env
```bash
cat backend/.env | grep DATABASE
```

Should match docker-compose.yml:
```
DATABASE_URL=postgresql://aiwebuser:aiwebpass@db:5432/aiweb
```

#### Reset database with new credentials
```bash
docker-compose down -v
# Edit docker-compose.yml with new credentials
# Edit backend/.env with matching credentials
docker-compose up --build
```

---

## 🔴 Issue 6: Port Already in Use

### Symptoms
```
Error: port 5432 is already allocated
Bind for 0.0.0.0:5432 failed
```

### Solutions

#### Check what's using the port
```bash
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432
```

#### Stop local PostgreSQL
```bash
# Windows (as Administrator)
net stop postgresql-x64-15

# Mac
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

#### Change port in docker-compose.yml
```yaml
db:
  ports:
    - "5433:5432"  # Use 5433 on host instead
```

Then update backend/.env:
```
DATABASE_URL=postgresql://aiwebuser:aiwebpass@localhost:5433/aiweb
```

---

## 🔴 Issue 7: Data Not Persisting

### Symptoms
- Data disappears after restart
- Fresh database every time

### Solutions

#### Check volume exists
```bash
docker volume ls
```

Should show:
```
ai-web_postgres_data
```

#### Inspect volume
```bash
docker volume inspect ai-web_postgres_data
```

#### Ensure volume is mounted
In docker-compose.yml:
```yaml
db:
  volumes:
    - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Recreate volume
```bash
docker-compose down
docker volume rm ai-web_postgres_data
docker-compose up
```

---

## 🔴 Issue 8: Conversation Not Found

### Symptoms
```
404 Not Found: Conversation {id} not found
```

### Solutions

#### Verify conversation exists
```bash
curl http://localhost:8000/conversations
```

#### Create a conversation first
```bash
curl -X POST http://localhost:8000/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Conversation"}'
```

#### Check database directly
```bash
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb -c "SELECT * FROM conversations;"
```

---

## 🔴 Issue 9: Slow Query Performance

### Symptoms
- API responses taking >1 second
- Database queries timing out

### Solutions

#### Check connection pool
In `app/database.py`, ensure:
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)
```

#### Add indexes (already done)
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### Use pagination
```bash
# Don't fetch all at once
curl "http://localhost:8000/conversations?limit=20"
```

#### Monitor database
```bash
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb -c "
SELECT * FROM pg_stat_activity WHERE state = 'active';
"
```

---

## 🔴 Issue 10: Backend Won't Start

### Symptoms
```
backend exited with code 1
ModuleNotFoundError: No module named 'sqlalchemy'
```

### Solutions

#### Rebuild containers
```bash
docker-compose build --no-cache backend
docker-compose up
```

#### Check requirements.txt
Ensure it includes:
```
sqlalchemy
psycopg2-binary
alembic
```

#### View build logs
```bash
docker-compose build backend
```

Look for successful installation:
```
Successfully installed sqlalchemy-2.x.x psycopg2-binary-2.x.x
```

---

## 🟡 Diagnostic Commands

### Full System Check
```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f
```

### Database Check
```bash
# Test connection
docker exec -it ai-web-backend-1 python scripts/test_database.py

# Connect to database
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb

# List tables
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb -c "\dt"

# Count records
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb -c "
SELECT 
  (SELECT COUNT(*) FROM conversations) as conversations,
  (SELECT COUNT(*) FROM messages) as messages;
"
```

### Network Check
```bash
# Verify backend can reach database
docker exec -it ai-web-backend-1 ping db

# Check DNS resolution
docker exec -it ai-web-backend-1 nslookup db

# Test port connectivity
docker exec -it ai-web-backend-1 nc -zv db 5432
```

---

## 🟢 Health Checks

### Verify Everything is Working

#### 1. Services Running
```bash
docker-compose ps
```
All should show "Up" or "Up (healthy)"

#### 2. Database Responding
```bash
docker exec -it ai-web-db-1 psql -U aiwebuser -d aiweb -c "SELECT 1;"
```
Should return `1`

#### 3. Backend Connected
```bash
docker exec -it ai-web-backend-1 python scripts/test_database.py
```
Should show all green checkmarks

#### 4. API Working
```bash
curl http://localhost:8000/health
```
Should return `{"status":"ok"}`

#### 5. Database Endpoints
```bash
curl http://localhost:8000/conversations
```
Should return array (may be empty)

---

## 🛠️ Maintenance Commands

### Backup Database
```bash
docker exec ai-web-db-1 pg_dump -U aiwebuser aiweb > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup_20251104.sql | docker exec -i ai-web-db-1 psql -U aiwebuser -d aiweb
```

### Clear All Data (Start Fresh)
```bash
docker-compose down -v
docker-compose up --build
docker exec -it ai-web-backend-1 python scripts/seed_database.py
```

### View Disk Usage
```bash
docker system df
docker volume ls
```

---

## 📞 Getting Help

### Check Documentation
1. `docs/QUICK_START_DATABASE.md` - Simple guide
2. `docs/DATABASE_INTEGRATION.md` - Technical details
3. `docs/DATABASE_README.md` - Overview
4. `DATABASE_SUMMARY.md` - Quick reference

### Interactive API Docs
http://localhost:8000/docs

### Check Logs First
```bash
docker-compose logs backend | tail -100
docker-compose logs db | tail -100
```

### Test Systematically
1. Test database connection
2. Test table creation
3. Test API endpoints
4. Test frontend integration

---

## ✅ Prevention Tips

### Before Starting Work
```bash
# Always start clean
docker-compose down
docker-compose up -d

# Verify health
docker-compose ps
```

### Regular Maintenance
```bash
# Weekly: Clean unused resources
docker system prune

# Monthly: Backup database
./backup.sh

# As needed: Update dependencies
docker-compose build --no-cache
```

### Development Best Practices
- Always commit before making database schema changes
- Test locally before deploying
- Keep environment files in sync
- Document custom configurations
- Use version control for migrations

---

## 🎯 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Connection refused | `docker-compose restart db` |
| Tables missing | `docker-compose down -v && docker-compose up` |
| Port in use | Stop local PostgreSQL or change port |
| Import errors | Ignore (Docker-only packages) |
| Data not saved | Check volume configuration |
| Slow queries | Use pagination, check indexes |
| 404 errors | Verify resource exists in database |

---

**Remember**: Most issues are solved by `docker-compose down -v` followed by `docker-compose up --build`. This gives you a fresh start!
