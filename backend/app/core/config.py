from pathlib import Path
import os

from dotenv import load_dotenv


load_dotenv()

class Config:
	BASE_DIR = Path(__file__).resolve().parent.parent.parent
	DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR))

	RECEIPT_DIR = BASE_DIR / "receipts"

	SUPPORT_EXTENSIONS = {
		".jpg",
		".jpeg",
		".png",
		".webp",
		".pdf",
	}

	MODELS = [
		{
			"name": "gemma3",
			"model": "gemma3:4b",
		}
	]

	GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
	GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

	# change modal here
	# switch between "ollama" and "gemini" to select the model provider
	MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "gemini").lower()

	MODEL_OPTIONS = {
		"temperature": 0,
		"num_ctx": 4096,
	}

	# for determine how sharp, detailed the output image should be, higher value means more sharp and detailed
	PDF_DPI = 200
