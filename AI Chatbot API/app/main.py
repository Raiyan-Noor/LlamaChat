from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware


template = """
Answer the question below.

Here is the conversation history: {context}

Question: {question}

Answer:
"""

model = OllamaLLM(model="llama3.1")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_contexts = {}


class ChatRequest(BaseModel):
    user_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_id = request.user_id
    question = request.question

    context = user_contexts.get(user_id, "")

    try:
        result = chain.invoke({"context": context, "question": question})
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}"
        )

    user_contexts[user_id] = context + f"\nUser: {question}\nAI: {result}"

    return ChatResponse(answer=result)


@app.post("/clear_context")
async def clear_context(user_id: str):
    if user_id in user_contexts:
        del user_contexts[user_id]
        return {"message": "Context cleared."}
    else:
        return {"message": "No context found for this user."}
