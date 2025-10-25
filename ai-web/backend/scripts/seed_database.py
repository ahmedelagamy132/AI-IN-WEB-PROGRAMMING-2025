"""Database initialization and seeding script for development.

This script demonstrates how to populate a database with sample data for
testing and development purposes. Instructors can use this to quickly set up
a realistic environment for demonstrations.
"""

import os
import sys
import uuid
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, init_db
from app.models import Conversation, Message


def create_sample_conversations(db: Session) -> None:
    """Create sample conversations with messages for testing.
    
    This function demonstrates:
    - Creating related records (conversations and messages)
    - Using transactions properly
    - Generating realistic test data
    
    Args:
        db: Database session to use for operations.
    """
    
    print("Creating sample conversations...")
    
    # Sample conversation 1: Python basics
    conv1_id = str(uuid.uuid4())
    conv1 = Conversation(
        id=conv1_id,
        title="Learning Python Basics",
        created_at=datetime.utcnow() - timedelta(days=2),
        updated_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(conv1)
    
    messages_conv1 = [
        Message(
            conversation_id=conv1_id,
            role="user",
            content="What is Python and why should I learn it?",
            created_at=datetime.utcnow() - timedelta(days=2, hours=0)
        ),
        Message(
            conversation_id=conv1_id,
            role="assistant",
            content="Python is a high-level, interpreted programming language known for its simplicity and readability. You should learn it because it's versatile, has a large ecosystem, and is great for beginners while being powerful enough for advanced applications.",
            created_at=datetime.utcnow() - timedelta(days=2, hours=0, minutes=1)
        ),
        Message(
            conversation_id=conv1_id,
            role="user",
            content="Can you explain what variables are?",
            created_at=datetime.utcnow() - timedelta(days=2, hours=0, minutes=5)
        ),
        Message(
            conversation_id=conv1_id,
            role="assistant",
            content="Variables in Python are containers for storing data values. Unlike some other languages, you don't need to declare their type. For example:\n\n```python\nname = 'Alice'  # A string variable\nage = 25        # An integer variable\nheight = 5.6    # A float variable\n```\n\nPython automatically determines the type based on the value you assign.",
            created_at=datetime.utcnow() - timedelta(days=2, hours=0, minutes=6)
        ),
    ]
    
    for msg in messages_conv1:
        db.add(msg)
    
    # Sample conversation 2: Web development
    conv2_id = str(uuid.uuid4())
    conv2 = Conversation(
        id=conv2_id,
        title="Understanding Web APIs",
        created_at=datetime.utcnow() - timedelta(days=1),
        updated_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add(conv2)
    
    messages_conv2 = [
        Message(
            conversation_id=conv2_id,
            role="user",
            content="What is a REST API?",
            created_at=datetime.utcnow() - timedelta(days=1, hours=0)
        ),
        Message(
            conversation_id=conv2_id,
            role="assistant",
            content="REST (Representational State Transfer) is an architectural style for designing networked applications. A REST API uses HTTP requests to perform CRUD operations:\n\n- GET: Retrieve data\n- POST: Create new data\n- PUT/PATCH: Update existing data\n- DELETE: Remove data\n\nREST APIs are stateless, meaning each request contains all necessary information.",
            created_at=datetime.utcnow() - timedelta(days=1, hours=0, minutes=1)
        ),
        Message(
            conversation_id=conv2_id,
            role="user",
            content="How do I create an API endpoint in FastAPI?",
            created_at=datetime.utcnow() - timedelta(days=1, hours=0, minutes=10)
        ),
        Message(
            conversation_id=conv2_id,
            role="assistant",
            content="Here's a simple example of creating an API endpoint in FastAPI:\n\n```python\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Item(BaseModel):\n    name: str\n    price: float\n\n@app.post('/items')\ndef create_item(item: Item):\n    return {'message': f'Created {item.name} for ${item.price}'}\n```\n\nThis creates a POST endpoint that accepts JSON data matching the Item schema.",
            created_at=datetime.utcnow() - timedelta(days=1, hours=0, minutes=11)
        ),
    ]
    
    for msg in messages_conv2:
        db.add(msg)
    
    # Sample conversation 3: Recent conversation
    conv3_id = str(uuid.uuid4())
    conv3 = Conversation(
        id=conv3_id,
        title="Database Design Questions",
        created_at=datetime.utcnow() - timedelta(hours=2),
        updated_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(conv3)
    
    messages_conv3 = [
        Message(
            conversation_id=conv3_id,
            role="user",
            content="What's the difference between SQL and NoSQL databases?",
            created_at=datetime.utcnow() - timedelta(hours=2)
        ),
        Message(
            conversation_id=conv3_id,
            role="assistant",
            content="SQL databases are relational, use structured schemas, and support ACID transactions. They're great for complex queries and data integrity.\n\nNoSQL databases are non-relational, have flexible schemas, and prioritize scalability. They're ideal for unstructured data and horizontal scaling.\n\nChoose SQL for: Banking, e-commerce, applications needing strong consistency\nChoose NoSQL for: Social media, real-time analytics, flexible data models",
            created_at=datetime.utcnow() - timedelta(hours=2, minutes=-1)
        ),
    ]
    
    for msg in messages_conv3:
        db.add(msg)
    
    db.commit()
    print(f"✓ Created {3} sample conversations with messages")


def main():
    """Main function to initialize and seed the database."""
    
    print("=" * 60)
    print("Database Initialization and Seeding Script")
    print("=" * 60)
    print()
    
    # Step 1: Create tables
    print("Step 1: Creating database tables...")
    init_db()
    print("✓ Tables created successfully")
    print()
    
    # Step 2: Create a database session
    print("Step 2: Connecting to database...")
    db = SessionLocal()
    print("✓ Connected successfully")
    print()
    
    try:
        # Step 3: Check if data already exists
        existing_count = db.query(Conversation).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} conversations.")
            response = input("Do you want to clear existing data and reseed? (y/N): ")
            if response.lower() == 'y':
                print("Clearing existing data...")
                db.query(Message).delete()
                db.query(Conversation).delete()
                db.commit()
                print("✓ Existing data cleared")
                print()
            else:
                print("Keeping existing data. Exiting.")
                return
        
        # Step 4: Create sample data
        print("Step 3: Creating sample data...")
        create_sample_conversations(db)
        print()
        
        # Step 5: Verify the data
        print("Step 4: Verifying created data...")
        total_conversations = db.query(Conversation).count()
        total_messages = db.query(Message).count()
        print(f"✓ Total conversations: {total_conversations}")
        print(f"✓ Total messages: {total_messages}")
        print()
        
        print("=" * 60)
        print("Database seeding completed successfully!")
        print("=" * 60)
        print()
        print("You can now:")
        print("  - View conversations: GET http://localhost:8000/conversations")
        print("  - View specific conversation: GET http://localhost:8000/conversations/{id}")
        print("  - Check API docs: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
