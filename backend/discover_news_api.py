import asyncio
import httpx
import json
from app.core.config import settings

API_KEY = settings.RAPID_API_KEY 
HOST = "cricbuzz-cricket.p.rapidapi.com"
TEST_STORY_ID = "137205" # From your previous result
TEST_IMAGE_ID = "820370" # From your previous result

async def extended_discovery():
    print("="*60)
    print("NEWS API: DEEP DIVE")
    print("="*60)

    headers = {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": HOST
    }

    async with httpx.AsyncClient() as client:
        # 1. Check Story Detail
        print(f"\n1. Fetching Detail for ID {TEST_STORY_ID}...")
        try:
            url = f"https://{HOST}/news/v1/detail/{TEST_STORY_ID}"
            resp = await client.get(url, headers=headers)
            data = resp.json()
            # Save for review
            with open("news_detail_sample.json", "w") as f:
                json.dump(data, f, indent=2)
            
            # Print structure
            print("   keys found:", data.keys())
            if "content" in data:
                print(f"   Content Preview: {str(data['content'])[:100]}...")
        except Exception as e:
            print(f"   Detail Fetch Failed: {e}")

        # 2. Check Topics (for filtering)
        print(f"\n2. Fetching Topics...")
        try:
            url = f"https://{HOST}/news/v1/get-topics"
            resp = await client.get(url, headers=headers)
            data = resp.json()
            # Print first few topics
            topics = data.get("topics", [])
            print(f"   Found {len(topics)} topics.")
            for t in topics[:3]:
                print(f"      - {t.get('headline')} (ID: {t.get('id')})")
        except Exception as e:
            print(f"   Topics Fetch Failed: {e}")

    # 3. Image URL Verification (No API call needed, just logic)
    print(f"\n3. Image URL Hypothesis")
    # Standard Cricbuzz pattern
    generated_url = f"https://static.cricbuzz.com/a/img/v1/600x400/i1/c{TEST_IMAGE_ID}/i.jpg"
    print(f"   Please open this URL in your browser to verify:")
    print(f"      {generated_url}")

if __name__ == "__main__":
    asyncio.run(extended_discovery())