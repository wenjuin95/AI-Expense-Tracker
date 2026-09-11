from pathlib import Path

class Config:
	BASE_DIR = Path(__file__).resolve().parent.parent.parent

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

	MODEL_OPTIONS = {
		"temperature": 0,
		"num_ctx": 4096,
	}

	# for determine how sharp, detailed the output image should be, higher value means more sharp and detailed
	PDF_DPI = 200
