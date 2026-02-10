import asyncio
from redis.asyncio import Redis
from redis.commands.search.field import TagField, NumericField, GeoField, TextField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

REDIS_URL = "redis://localhost:6379"

async def create_index():
    r = Redis.from_url(REDIS_URL) # Standard redis-py supports search commands via .ft()

    # Define schema
    # mm_entry:{user_id}

    schema = (
        TagField("gender", separator=","),
        TagField("pref_genders", separator=","),
        TagField("languages", separator=","),
        TagField("blocked_ids", separator="|"), # Can query if I am in their blocklist
        TagField("history_ids", separator="|"),
        NumericField("joined_at", sortable=True),
        NumericField("age", sortable=True),
        GeoField("location"), # We need to store location in the Hash too, or use GEO filter.
                              # Wait, GEOADD uses a separate key.
                              # But RediSearch creates index on Hash documents.
                              # We need to replicate lat/lon into the Hash as a Geo string "lon,lat" for RediSearch to index it as GEO.
                              # My previous code stored 'lat' and 'lon' as separate fields.
                              # I should update them to a single 'location' field "lon,lat" in the endpoint and seed script.
                              # OR I can use Apply Logic in search? No, simpler to store "lon,lat".

        # Lifestyle
        TagField("religion"),
        TagField("is_smoker"),
        TagField("wants_children"),
    )

    try:
        # Create Index
        await r.ft("idx:matchmaking").create_index(
            schema,
            definition=IndexDefinition(prefix=["mm_entry:"], index_type=IndexType.HASH)
        )
        print("Index created successfully")
    except Exception as e:
        if "Index already exists" in str(e):
            print("Index already exists")
        else:
            print(f"Error creating index: {e}")

    await r.aclose()

if __name__ == "__main__":
    asyncio.run(create_index())

