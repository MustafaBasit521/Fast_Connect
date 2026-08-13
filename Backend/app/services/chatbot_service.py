import os
from datetime import datetime, timezone

from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from dotenv import load_dotenv

from app.database.connection import db
from app.schemas.chatbot import ChatResponse, ChatMessageOut

load_dotenv()

# Gemini's free tier — no card required. Get a key at aistudio.google.com/apikey
# Using the "latest" alias (not a dated model like gemini-2.5-flash) so this keeps working
# as Google rolls dated models off new API keys.
MODEL = "gemini-flash-latest"
MAX_OUTPUT_TOKENS = 2048
HISTORY_CONTEXT_LIMIT = 20  # messages sent to the model as context, not the full history
DISPLAY_HISTORY_LIMIT = 200  # messages returned to the frontend on load

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
IS_AI_CONFIGURED = bool(GEMINI_API_KEY)

client = genai.Client(api_key=GEMINI_API_KEY) if IS_AI_CONFIGURED else None

SYSTEM_PROMPT = """You are FAST AI, the AI companion built into FAST Connect, a social network for the \
FAST-NUCES university community. You're talking with {user_name}.

You're here for casual conversation when a friend isn't around, for study/technical questions, for \
recommendations, or just for someone to talk to. You are NOT a customer-support bot — never say things \
like "How may I assist you today?" or talk like a formal ticketing system.

How to talk:
- Friendly, warm, and conversational — like a smart friend, not a corporate assistant.
- Light humor is welcome when it fits naturally.
- Keep it concise when a short answer is enough; go into real depth when the user is asking to learn \
something or explicitly wants detail.
- Not overly formal, not robotic, no stiff boilerplate.
- Respectful always — casual tone doesn't mean careless answers.

What you are:
- You are an AI, and you should never pretend to be a real human or claim to have lived experiences \
(you haven't been to a place, you don't have a body, you don't get tired).
- Stay a supportive companion, not something the user should feel emotionally dependent on — if a \
conversation drifts toward that, gently keep things grounded.
- You have no memory of anything outside this conversation with {user_name} — you can't see their \
posts, messages, or friends.
"""


class AIConfigError(Exception):
    pass


class AIServiceError(Exception):
    pass


async def _get_or_create_conversation(user_id: str) -> str:
    conversation = await db["ai_conversations"].find_one({"user_id": user_id})
    if conversation is not None:
        return str(conversation["_id"])

    result = await db["ai_conversations"].insert_one({
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
    })
    return str(result.inserted_id)


async def _get_recent_messages(conversation_id: str, limit: int) -> list[dict]:
    cursor = (
        db["ai_messages"]
        .find({"conversation_id": conversation_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    messages = [msg async for msg in cursor]
    messages.reverse()
    return messages


async def _save_message(conversation_id: str, user_id: str, role: str, content: str):
    await db["ai_messages"].insert_one({
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "created_at": datetime.now(timezone.utc),
    })


def _to_gemini_role(role: str) -> str:
    # Gemini uses "model" where we (and Claude-style schemas) use "assistant"
    return "model" if role == "assistant" else "user"


async def send_message(user_id: str, user_name: str, message: str) -> ChatResponse:
    if not IS_AI_CONFIGURED:
        raise AIConfigError("FAST AI isn't configured on the server yet. Set GEMINI_API_KEY.")

    conversation_id = await _get_or_create_conversation(user_id)
    history = await _get_recent_messages(conversation_id, HISTORY_CONTEXT_LIMIT)

    contents = [
        types.Content(role=_to_gemini_role(m["role"]), parts=[types.Part(text=m["content"])])
        for m in history
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    try:
        response = await client.aio.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT.format(user_name=user_name),
                max_output_tokens=MAX_OUTPUT_TOKENS,
            ),
        )
    except genai_errors.ClientError:
        raise AIServiceError("FAST AI had trouble responding. Please try again.")
    except genai_errors.ServerError:
        raise AIServiceError("FAST AI is a little overwhelmed right now. Please try again shortly.")
    except genai_errors.APIError:
        raise AIServiceError("Couldn't reach FAST AI right now. Please try again.")

    reply = response.text
    if not reply:
        raise AIServiceError("FAST AI didn't have a response. Please try again.")

    await _save_message(conversation_id, user_id, "user", message)
    await _save_message(conversation_id, user_id, "assistant", reply)

    return ChatResponse(message=reply)


async def get_history(user_id: str) -> list[ChatMessageOut]:
    conversation = await db["ai_conversations"].find_one({"user_id": user_id})
    if conversation is None:
        return []

    cursor = (
        db["ai_messages"]
        .find({"conversation_id": str(conversation["_id"])})
        .sort("created_at", 1)
        .limit(DISPLAY_HISTORY_LIMIT)
    )
    return [
        ChatMessageOut(role=m["role"], content=m["content"], created_at=m["created_at"])
        async for m in cursor
    ]


async def ensure_indexes():
    await db["ai_messages"].create_index([("conversation_id", 1), ("created_at", 1)])
    await db["ai_messages"].create_index("user_id")
    await db["ai_conversations"].create_index("user_id")
