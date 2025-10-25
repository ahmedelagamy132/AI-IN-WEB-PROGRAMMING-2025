"""Simple script to test database connectivity.

Run this script to verify that the database connection is working correctly
and that tables have been created. Useful for troubleshooting and demonstrations.
"""

import os
import sys

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import Conversation, Message


def test_connection():
    """Test basic database connectivity."""
    
    print("Testing database connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        print("✓ Database connection successful!")
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False


def test_tables():
    """Test that tables exist and are accessible."""
    
    print("\nTesting database tables...")
    db = SessionLocal()
    
    try:
        # Test conversations table
        conv_count = db.query(Conversation).count()
        print(f"✓ Conversations table accessible ({conv_count} records)")
        
        # Test messages table
        msg_count = db.query(Message).count()
        print(f"✓ Messages table accessible ({msg_count} records)")
        
        return True
    except Exception as e:
        print(f"✗ Table access failed: {e}")
        return False
    finally:
        db.close()


def show_schema_info():
    """Display information about the database schema."""
    
    print("\nDatabase Schema Information:")
    print("-" * 60)
    
    db = SessionLocal()
    
    try:
        # Get table information using raw SQL
        query = text("""
            SELECT 
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position;
        """)
        
        result = db.execute(query)
        
        current_table = None
        for row in result:
            if row.table_name != current_table:
                current_table = row.table_name
                print(f"\nTable: {current_table}")
                print("-" * 60)
            
            nullable = "NULL" if row.is_nullable == "YES" else "NOT NULL"
            default = f" DEFAULT {row.column_default}" if row.column_default else ""
            print(f"  {row.column_name:<20} {row.data_type:<20} {nullable}{default}")
        
    except Exception as e:
        print(f"Could not retrieve schema information: {e}")
    finally:
        db.close()


def show_data_summary():
    """Display a summary of data in the database."""
    
    print("\n" + "=" * 60)
    print("Database Data Summary")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Count conversations
        conv_count = db.query(Conversation).count()
        print(f"Total conversations: {conv_count}")
        
        if conv_count > 0:
            # Show recent conversations
            recent = db.query(Conversation).order_by(
                Conversation.updated_at.desc()
            ).limit(5).all()
            
            print("\nRecent conversations:")
            for conv in recent:
                msg_count = conv.messages.count()
                print(f"  - {conv.title or 'Untitled'} ({msg_count} messages)")
                print(f"    ID: {conv.id}")
                print(f"    Created: {conv.created_at}")
        
        # Count messages
        msg_count = db.query(Message).count()
        print(f"\nTotal messages: {msg_count}")
        
    except Exception as e:
        print(f"Error retrieving data summary: {e}")
    finally:
        db.close()


def main():
    """Run all database tests."""
    
    print("=" * 60)
    print("Database Connection Test")
    print("=" * 60)
    print()
    
    # Test connection
    if not test_connection():
        print("\n❌ Database connection test failed!")
        print("   Make sure PostgreSQL is running and DATABASE_URL is correct.")
        sys.exit(1)
    
    # Test tables
    if not test_tables():
        print("\n❌ Table access test failed!")
        print("   Tables may not be created. Run initialization script.")
        sys.exit(1)
    
    # Show schema information
    show_schema_info()
    
    # Show data summary
    show_data_summary()
    
    print("\n" + "=" * 60)
    print("✅ All database tests passed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
