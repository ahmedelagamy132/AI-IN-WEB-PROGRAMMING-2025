from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class EchoIn(BaseModel):
    msg: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/echo")
def echo(payload: EchoIn):
    return {"msg": payload.msg}
