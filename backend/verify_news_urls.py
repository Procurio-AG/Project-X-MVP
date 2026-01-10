import asyncio
import httpx
import re
from app.core.config import settings

# --- CONFIG ---
API_KEY = settings.RAPID_API_KEY 
HOST = "cricbuzz-cricket.p.rapidapi.com"

# --- THE PROPOSED LOGIC ---
def generate_cricbuzz_url(story_id: int, headline: str) -> str:
    """
    Proposed logic to reconstruct the URL.
    """
    if not headline:
        return ""
    
    # 1. Lowercase
    slug = headline.lower()
    # 2. Remove special chars (keep alphanumeric, spaces, hyphens)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # 3. Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug).strip()
    
    return f"https://www.cricbuzz.com/cricket-news/{story_id}/{slug}"

async def verify_news_data():
    print("="*60)
    print("CRICBUZZ URL VERIFICATION TOOL")
    print("="*60)

    url = f"https://{HOST}/news/v1/index"
    headers = {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": HOST
    }

    async with httpx.AsyncClient() as client:
        print("\nFetching fresh news list...")
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            story_list = data.get("storyList", [])
            
            if not story_list:
                print("No stories found.")
                return

            # Grab the first valid story
            first_item = story_list[0].get("story")
            if not first_item:
                print("First item had no 'story' object.")
                return

            print(f"Fetched Story ID: {first_item.get('id')}")
            print(f"Headline: {first_item.get('hline')}")
            
            # --- CHECK 1: RAW DATA INSPECTION ---
            print("\nINSPECTING RAW JSON KEYS (Looking for hidden links)...")
            keys = first_item.keys()
            print(f"   Keys found: {list(keys)}")
            
            # recursive search for 'http' values just in case
            found_links = []
            for k, v in first_item.items():
                if isinstance(v, str) and v.startswith("http"):
                    found_links.append(f"{k}: {v}")
            
            if found_links:
                print(f"   Found existing links: {found_links}")
            else:
                print("   CONFIRMED: No direct URLs found in the response.")

            # --- CHECK 2: TEST GENERATED LINK ---
            print("\nTESTING URL GENERATION LOGIC...")
            generated_link = generate_cricbuzz_url(first_item.get('id'), first_item.get('hline'))
            print(f"   Generated: {generated_link}")
            
            print("   Pinging this URL to see if it exists (200 OK)...")
            # We use a real browser-like header to avoid being blocked by cricbuzz.com
            test_headers = {"User-Agent": "Mozilla/5.0"} 
            link_resp = await client.get(generated_link, headers=test_headers, follow_redirects=True)
            
            if link_resp.status_code == 200:
                print(f"   SUCCESS! Link is valid (Status: {link_resp.status_code})")
                print("   The logic works. You can safely implement this.")
            else:
                print(f"   FAILED. Link returned Status: {link_resp.status_code}")

        except Exception as e:
            print(f"Error during verification: {e}")

if __name__ == "__main__":
    asyncio.run(verify_news_data())