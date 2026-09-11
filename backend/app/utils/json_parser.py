import json


class JsonParser:

	@staticmethod
	def extract(response_text):
		"""
		Extract JSON from model response.
		"""
		if not response_text:
			return None

		text = response_text.strip()

		# Remove Markdown code fences
		if text.startswith("```"):

			lines = text.splitlines()

			if lines and lines[0].startswith("```"):
				lines = lines[1:]

			if lines and lines[-1].strip() == "```":
				lines = lines[:-1]

			text = "\n".join(lines).strip()

		# Direct JSON
		try:
			return json.loads(text)

		except json.JSONDecodeError:
			pass

		# JSON surrounded by text
		start = text.find("{")
		end = text.rfind("}")

		if start != -1 and end != -1:

			try:
				return json.loads(
					text[start:end + 1]
				)

			except json.JSONDecodeError:
				pass

		return None
