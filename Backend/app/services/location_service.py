from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.location import LocationCreate, LocationOut


def _to_location_out(location: dict) -> LocationOut:
    return LocationOut(
        id=str(location["_id"]),
        name=location["name"],
        category=location["category"],
        latitude=location["latitude"],
        longitude=location["longitude"],
        description=location.get("description"),
    )


async def create_location(data: LocationCreate) -> LocationOut:
    location_data = data.model_dump()

    result = await db["campus_locations"].insert_one(location_data)
    location_data["_id"] = result.inserted_id

    return _to_location_out(location_data)


async def list_locations() -> list[LocationOut]:
    cursor = db["campus_locations"].find().sort("name", 1)

    locations = []
    async for location in cursor:
        locations.append(_to_location_out(location))

    return locations


async def delete_location(location_id: str):
    try:
        object_id = ObjectId(location_id)
    except InvalidId:
        raise ValueError("Location not found")

    result = await db["campus_locations"].delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise ValueError("Location not found")
