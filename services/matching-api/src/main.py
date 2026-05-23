from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

from .routers import (
    occupations, skills, recommend, match,
    jobs, cv, jobed, trends, kompetensradet, chatt, health
)
from .middleware.logging import setup_logging
from .middleware.rate_limit import limiter

setup_logging()

app = FastAPI(
    title="Crosstrees Labor Intelligence API",
    version="1.0.0",
    description="AI-driven arbetsmarknadsmatchning för Sverige"
)

app.state.limiter = limiter

_cors_default = "http://localhost:3000,http://localhost:3001"
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", _cors_default).split(","),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(occupations.router, prefix="/occupations", tags=["Yrken"])
app.include_router(skills.router, prefix="/skills", tags=["Kompetenser"])
app.include_router(recommend.router, prefix="/recommend", tags=["Rekommendationer"])
app.include_router(match.router, prefix="/match", tags=["Matchning"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobb"])
app.include_router(cv.router, prefix="/cv", tags=["CV"])
app.include_router(jobed.router, prefix="/jobed", tags=["Utbildning"])
app.include_router(trends.router, prefix="/trends", tags=["Trender"])
app.include_router(kompetensradet.router, prefix="/kompetensradet", tags=["Kompetensrådet"])
app.include_router(chatt.router, prefix="/chatt", tags=["Chatt"])
app.include_router(health.router, tags=["Hälsa"])
