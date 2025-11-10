from fastapi import FastAPI
from app.routes import predict

app = FastAPI(title="AI Product Classifier")
app.include_router(predict.router)
