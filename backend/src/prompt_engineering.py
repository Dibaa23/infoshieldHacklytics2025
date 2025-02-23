import openai
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# Set API Key
openai.api_key = "sk-svcacct-3WUszL9FEVP5CyqL6HTcrO-y6LpCh2wXKRnAlPtPkAuaWmr_z3M00HEIyCh6P4KFFT3BlbkFJEI2Ae4IPXjYlXtX1CThQprFuQ2Xy4k-tUPE_r3u3l6NeZmTh9mO_RJRZDbNby46AA"  # Replace with your actual API key

# Initialize OpenAI client
client = openai.OpenAI(api_key=openai.api_key)

def extract_urls(text):
    """
    Extracts URLs from the GPT response and returns a formatted list with organization names.
    """
    urls = re.findall(r"https?://[^\s\)\]]+", text)  # Extracts clean URLs
    unique_urls = list(set(urls))  # Remove duplicates

    # Format as [Org Name](URL)
    formatted_sources = []
    for url in unique_urls:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.replace("www.", "").split(".")[0]  # Extract core domain
        formatted_sources.append(f"[{domain.capitalize()}]({url})")  # Format properly

    return formatted_sources if formatted_sources else ["No valid sources found"]


def fact_check_text(text):
    """
    Queries GPT to fact-check a given text, returning a credibility score, sources with clean links, final verdict, and 
    a single-sentence reasoning with a specific, verifiable factual reason.
    """
    prompt = f"""
    You are a fact-checking assistant. Given the following text, assess its credibility from 0-100, provide up to 3 sources (with working URLs), 
    and determine if the text is credible (True if score > 60, False otherwise). Also, provide a **concise, single-sentence reasoning** 
    that includes **one direct, quantifiable scientific fact** (e.g., "Earth’s shadow on the moon during a lunar eclipse is always round," rather than "NASA confirms it is round").

    Text: "{text}"

    IMPORTANT:
    - **Sources must be real URLs from reputable websites** (e.g., NASA, WHO, CDC, BBC, etc.).
    - **DO NOT make up sources** or use generic search links.
    - **The reasoning must include a single numerical, physical, or observational fact that proves the claim true or false.**
    - If no source exists, state "No valid sources found."

    Respond in this strict format:
    Credibility Score: [0-100]
    Sources: 
    - [Valid URL 1]
    - [Valid URL 2] (if available)
    - [Valid URL 3] (if available)
    Verdict: [True/False]
    Reasoning: [A **single sentence** stating a measurable, undeniable fact that proves the claim true or false.]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Use GPT-4o for better accuracy
            messages=[
                {"role": "system", "content": "You are a fact-checking assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        
        result = response.choices[0].message.content.strip()

        # Extract values
        score_line = next((line for line in result.split("\n") if "Credibility Score" in line), None)
        sources_lines = [line.strip("- ").strip() for line in result.split("\n") if line.startswith("- http")]
        verdict_line = next((line for line in result.split("\n") if "Verdict" in line), None)
        reasoning_line = next((line for line in result.split("\n") if "Reasoning" in line), None)

        score = int(score_line.split(": ")[1]) if score_line else None
        sources = extract_urls("\n".join(sources_lines)) if sources_lines else ["No valid sources found"]
        verdict = verdict_line.split(": ")[1] if verdict_line else None
        reasoning = reasoning_line.split(": ")[1] if reasoning_line else "No reasoning provided"

        return {
            "Verdict": verdict,
            "Reasoning": reasoning,  # Now enforces a measurable fact
            "Sources": sources,  # Properly formatted markdown sources
            "Credibility Score": score
        }

    except Exception as e:
        return {"error": str(e)}


def get_article_text(url):
    """
    Fetches and extracts the main content text from an article URL.
    """
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract text from paragraphs
        paragraphs = soup.find_all("p")
        article_text = " ".join([p.get_text() for p in paragraphs if p.get_text()])

        return article_text if article_text else None
    except Exception as e:
        return None

def analyze_article(url):
    """
    Analyzes an article by extracting problematic sentences and fact-checking them.

    Args:
        url (str): The article URL.

    Returns:
        dict: A structured dictionary containing problematic sentences, their scores, one source, and reasoning.
    """
    article_text = get_article_text(url)
    if not article_text:
        return {"error": "Failed to retrieve article content."}

    prompt = f"""
    You are a fact-checking assistant. Analyze the following article and extract **up to 3 problematic sentences** that contain **false or misleading information**.
    For each problematic sentence, provide:
    - A **credibility score (0-100)**.
    - A **concise, single-sentence explanation** of why it is false or misleading.
    
    Then, provide **one** reliable source (valid URL) that addresses the problematic claims.

    Article Content:
    "{article_text[:3000]}"  # Limit text size to fit GPT input

    Respond in this strict format:
    - Problematic Sentence: ["Exact problematic sentence from the article"]
    - Credibility Score: [0-100]
    - Reasoning: [A **single sentence** explaining why it's false or misleading.]
    - Source: [One working URL that supports fact-checking]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a fact-checking assistant."},
                      {"role": "user", "content": prompt}],
            max_tokens=500
        )
        
        result = response.choices[0].message.content.strip()

        # Extracting problematic sentences and their info
        sentences = re.findall(r'- Problematic Sentence: "(.*?)"', result)
        scores = re.findall(r'- Credibility Score: (\d+)', result)
        reasonings = re.findall(r'- Reasoning: (.*)', result)
        source_match = re.search(r'- Source: (https?://[^\s]+)', result)
        source_url = source_match.group(1) if source_match else "[Google Search](https://www.google.com/search?q=fact+check+" + url.replace(" ", "+") + ")"

        structured_results = []
        for i in range(len(sentences)):
            structured_results.append({
                "Problematic Sentence": sentences[i],
                "Credibility Score": int(scores[i]) if i < len(scores) else None,
                "Reasoning": reasonings[i] if i < len(reasonings) else "No reasoning provided."
            })

        return {
            "Article URL": url,
            "Problematic Sentences": structured_results,
            "Source": extract_urls(source_url)[0]
        }

    except Exception as e:
        return {"error": str(e)}
