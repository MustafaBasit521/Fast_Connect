from fastapi import APIRouter, HTTPException, Depends

from app.schemas.report import ReportCreate, ReportOut, ReportResolve
from app.schemas.user import UserOut
from app.services import report_service
from app.dependencies import get_current_user, get_current_admin

router = APIRouter()


@router.post("", response_model=ReportOut)
async def create_report(data: ReportCreate, current_user: UserOut = Depends(get_current_user)):
    return await report_service.create_report(current_user.id, current_user.name, data)


@router.get("", response_model=list[ReportOut])
async def list_reports(admin: UserOut = Depends(get_current_admin)):
    return await report_service.list_reports()


@router.put("/{report_id}/resolve", response_model=ReportOut)
async def resolve_report(report_id: str, data: ReportResolve, admin: UserOut = Depends(get_current_admin)):
    try:
        return await report_service.resolve_report(report_id, data.action)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
