import time
from pathlib import Path

from google import genai
from google.genai import types

from .prompts import EXPENSES_PROMPT


class GeminiClient:

	def __init__(self, api_key, model_name):
		self.api_key = api_key
		self.model_name = model_name
		self.client = genai.Client(api_key=api_key) if api_key else None

	def read_receipt_and_extract(self, model_info, image_path):

		model_name = model_info["name"]
		model_type = model_info["model"]

		print()
		print("-" * 40)
		print(f"Model		: {model_name}")
		print(f"Model type	: {model_type}")
		print("-" * 40)

		start_execution = time.perf_counter()

		try:
			if self.client is None:
				raise ValueError("GEMINI_API_KEY is not configured")

			image_path = Path(image_path)
			response = self.client.models.generate_content(
				model=self.model_name,
				contents=[
					EXPENSES_PROMPT,
					types.Part.from_bytes(
						data=image_path.read_bytes(),
						mime_type=self._mime_type(image_path),
					),
				],
				config=types.GenerateContentConfig(
					response_mime_type="application/json",
					temperature=0,
					automatic_function_calling=types.AutomaticFunctionCallingConfig(
						disable=True,
					),
				),
			)

			total_execution = time.perf_counter() - start_execution

			output = response.text

			print(f"Time\t: {total_execution:.2f} seconds")
			print()
			print(output)

			return {
				"model": "gemini",
				"model_id": self.model_name,
				"success": True,
				"time_seconds": round(time.perf_counter() - start_execution, 2),
				"response": response.text,
				"error": None,
			}
		except Exception as error:

			total_execution = time.perf_counter() - start_execution
			print(f"Error after {total_execution:.2f} seconds")
			print(str(error))

			return {
				"model": "gemini",
				"model_id": self.model_name,
				"success": False,
				"time_seconds": round(time.perf_counter() - start_execution, 2),
				"response": None,
				"error": str(error),
			}

	@staticmethod
	def _mime_type(image_path):
		return {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".webp": "image/webp",
		}[image_path.suffix.lower()]
