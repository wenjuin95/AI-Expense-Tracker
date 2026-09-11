import time
import ollama
from .prompts import EXPENSES_PROMPT

class OllamaClient:

	def __init__(self, option=None, keep_alive="5m"):
		self.option = option
		self.keep_alive = keep_alive

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
			res = ollama.chat (
				model=model_type,
				messages=[
					{
						"role": "user",
						"content": EXPENSES_PROMPT,
						"images": [str(image_path.resolve())]
					}
				],
				options=self.option,
				format="json",
				keep_alive=self.keep_alive,
			)

			total_execution = time.perf_counter() - start_execution

			output = res.message.content

			print(f"Time\t: {total_execution:.2f} seconds")
			print()
			print(output)

			return {
				"Model": model_name,
				"Model type": model_type,
				"success": True,
				"time_seconds": round(total_execution, 2),
				"response": output,
				"error": None
			}

		except Exception as e:

			total_execution = time.perf_counter() - start_execution

			print(f"Error after {total_execution:.2f} seconds")
			print(str(e))

			return {
				"Model": model_name,
				"Model type": model_type,
				"success": False,
				"time_seconds": round(total_execution, 2),
				"response": None,
				"error": str(e)
			}

