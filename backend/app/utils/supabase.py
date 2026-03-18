"""
Supabase client configuration.

Provides a singleton initialized with the service role key,
giving the backend admin access to the database and storage.
"""

from supabase import Client, create_client

from app.config import settings

# Create a Supabase client using the service role key.
# This client bypasses Row Level Security (RLS) entirely, so only use it
# for trusted backend operations.
supabase_client: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key,
)
