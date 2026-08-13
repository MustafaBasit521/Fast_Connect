from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.resource import ResourceCreate, ResourceOut


def _to_resource_out(resource: dict) -> ResourceOut:
    return ResourceOut(
        id=str(resource["_id"]),
        title=resource["title"],
        course_code=resource.get("course_code"),
        file_url=resource["file_url"],
        file_type=resource["file_type"],
        file_size=resource["file_size"],
        uploaded_by_id=resource["uploaded_by_id"],
        uploaded_by_name=resource["uploaded_by_name"],
        downloads_count=resource.get("downloads_count", 0),
        created_at=resource["created_at"],
    )


async def create_resource(user_id: str, user_name: str, data: ResourceCreate) -> ResourceOut:
    resource_data = data.model_dump()
    resource_data["uploaded_by_id"] = user_id
    resource_data["uploaded_by_name"] = user_name
    resource_data["downloads_count"] = 0
    resource_data["created_at"] = datetime.now(timezone.utc)

    result = await db["resources"].insert_one(resource_data)
    resource_data["_id"] = result.inserted_id

    return _to_resource_out(resource_data)


async def list_resources(course_code: str | None = None, search: str | None = None) -> list[ResourceOut]:
    query = {}
    if course_code:
        query["course_code"] = {"$regex": f"^{course_code}$", "$options": "i"}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    cursor = db["resources"].find(query).sort("created_at", -1)

    resources = []
    async for resource in cursor:
        resources.append(_to_resource_out(resource))

    return resources


async def get_resource(resource_id: str) -> ResourceOut | None:
    try:
        object_id = ObjectId(resource_id)
    except InvalidId:
        return None

    resource = await db["resources"].find_one({"_id": object_id})
    if resource is None:
        return None

    return _to_resource_out(resource)


async def record_download(resource_id: str) -> ResourceOut:
    try:
        object_id = ObjectId(resource_id)
    except InvalidId:
        raise ValueError("Resource not found")

    await db["resources"].update_one({"_id": object_id}, {"$inc": {"downloads_count": 1}})

    resource = await db["resources"].find_one({"_id": object_id})
    if resource is None:
        raise ValueError("Resource not found")

    return _to_resource_out(resource)


async def delete_resource(resource_id: str, current_user_id: str, is_admin: bool = False):
    try:
        object_id = ObjectId(resource_id)
    except InvalidId:
        raise ValueError("Resource not found")

    resource = await db["resources"].find_one({"_id": object_id})
    if resource is None:
        raise ValueError("Resource not found")

    if not is_admin and resource["uploaded_by_id"] != current_user_id:
        raise PermissionError("You can only delete your own resources")

    await db["resources"].delete_one({"_id": object_id})


async def ensure_indexes():
    await db["resources"].create_index("course_code")
    await db["resources"].create_index("uploaded_by_id")
