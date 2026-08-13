from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.event import EventCreate, EventOut


def _to_event_out(event: dict, current_user_id: str) -> EventOut:
    going = event.get("going", [])
    return EventOut(
        id=str(event["_id"]),
        title=event["title"],
        description=event.get("description"),
        category=event["category"],
        venue_name=event["venue_name"],
        latitude=event.get("latitude"),
        longitude=event.get("longitude"),
        start_time=event["start_time"],
        end_time=event["end_time"],
        organizer_id=event["organizer_id"],
        organizer_name=event["organizer_name"],
        created_at=event["created_at"],
        going_count=len(going),
        going_by_me=current_user_id in going,
    )


async def create_event(organizer_id: str, organizer_name: str, data: EventCreate) -> EventOut:
    event_data = data.model_dump()
    event_data["organizer_id"] = organizer_id
    event_data["organizer_name"] = organizer_name
    event_data["going"] = []
    event_data["created_at"] = datetime.now(timezone.utc)

    result = await db["events"].insert_one(event_data)
    event_data["_id"] = result.inserted_id

    return _to_event_out(event_data, organizer_id)


async def list_upcoming_events(current_user_id: str, category: str | None = None) -> list[EventOut]:
    query = {"end_time": {"$gte": datetime.now(timezone.utc)}}
    if category:
        query["category"] = category

    cursor = db["events"].find(query).sort("start_time", 1)

    events = []
    async for event in cursor:
        events.append(_to_event_out(event, current_user_id))

    return events


async def get_event(event_id: str, current_user_id: str) -> EventOut | None:
    try:
        object_id = ObjectId(event_id)
    except InvalidId:
        return None

    event = await db["events"].find_one({"_id": object_id})
    if event is None:
        return None

    return _to_event_out(event, current_user_id)


async def toggle_going(event_id: str, current_user_id: str) -> EventOut:
    try:
        object_id = ObjectId(event_id)
    except InvalidId:
        raise ValueError("Event not found")

    event = await db["events"].find_one({"_id": object_id})
    if event is None:
        raise ValueError("Event not found")

    if current_user_id in event.get("going", []):
        await db["events"].update_one({"_id": object_id}, {"$pull": {"going": current_user_id}})
    else:
        await db["events"].update_one({"_id": object_id}, {"$addToSet": {"going": current_user_id}})

    event = await db["events"].find_one({"_id": object_id})
    if event is None:
        raise ValueError("Event not found")

    return _to_event_out(event, current_user_id)


async def delete_event(event_id: str, current_user_id: str, is_admin: bool = False):
    try:
        object_id = ObjectId(event_id)
    except InvalidId:
        raise ValueError("Event not found")

    event = await db["events"].find_one({"_id": object_id})
    if event is None:
        raise ValueError("Event not found")

    if not is_admin and event["organizer_id"] != current_user_id:
        raise PermissionError("You can only delete your own events")

    await db["events"].delete_one({"_id": object_id})


async def ensure_indexes():
    await db["events"].create_index("end_time")
    await db["events"].create_index("organizer_id")
