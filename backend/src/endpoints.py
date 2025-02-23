from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prompt_engineering import fact_check_text, analyze_article
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FactCheckRequest(BaseModel):
    text: str

class ArticleRequest(BaseModel):
    url: str

@app.post("/fact-check")
async def fact_check_endpoint(request: FactCheckRequest):
    """
    Receives highlighted text from the frontend, processes it via fact_check_text,
    and returns the verdict, reasoning, sources, and credibility score.
    """
    result = fact_check_text(request.text)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/analyze-article")
async def analyze_article_endpoint(request: ArticleRequest):
    """
    Receives a URL from the frontend when the user clicks the dedicated button,
    processes it via analyze_article, and returns the article analysis.
    """
    result = analyze_article(request.url)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
