from fastapi import APIRouter
from app.models.image_request import ImageRequest
from app.services.clarifai_service import predict_image

router = APIRouter()

@router.post("/api/marchify/predict/")
def predict(request: ImageRequest):
    return {"predictions": predict_image(request.image_base64)}