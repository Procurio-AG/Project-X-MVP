from pydantic import BaseModel, computed_field
from typing import Optional
from datetime import datetime

class NewsArticleBase(BaseModel):
    id: int
    headline: str
    intro: Optional[str] = None
    context: Optional[str] = None
    story_type: Optional[str] = None
    published_at: datetime
    match_id: Optional[str] = None

class NewsArticleResponse(NewsArticleBase):
    image_id: Optional[str] = None

    @computed_field
    def image_url(self) -> Optional[str]:
        """
        Auto-generates the optimized image URL from the ID.
        """
        if not self.image_id:
            return None
        # Using the standard 600x400 format we verified
        return f"https://static.cricbuzz.com/a/img/v1/600x400/i1/c{self.image_id}/i.jpg"

    class Config:
        from_attributes = True