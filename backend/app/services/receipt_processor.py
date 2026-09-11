import pymupdf
import tempfile
from pathlib import Path

class ReceiptProcessor:

	def __init__(self, support_extensions, pdf_dpi=200):
		self.support_extensions = support_extensions
		self.pdf_dpi = pdf_dpi

	def find_receipt(self, receipt_dir):
		"""Find all support receipt file"""

		return sorted(
			file
			for file in receipt_dir.iterdir()
			if file.is_file() and file.suffix.lower() in self.support_extensions
		)

	def check_extension(self, file_path):
		"""
		Check if the file extension is supported

		Images are returned unchanged
		PDF are converted to PNG
		"""

		try:
			if file_path.suffix.lower() != ".pdf":
				return file_path
		except AttributeError:
			raise ValueError("Invalid file path")

		return self._convert_pdf(file_path)

	def _convert_pdf(self, file_path):
		"""Convert PDF to PNG"""

		try:
			# Open the PDF file
			file = pymupdf.open(file_path)
			file_page = file[0]

			# PyMuPDF's default resolution is 72 DPI.
			# Calculate the zoom matrix factor to match your target DPI (e.g., 200).
			zoom = self.pdf_dpi / 72
			matrix = pymupdf.Matrix(zoom, zoom)

			# Render file_page to an image (pixmap) using the matrix
			pix = file_page.get_pixmap(matrix=matrix)

			# Save to a temporary directory
			temp_dir = Path(tempfile.mkdtemp())
			png_path = temp_dir / f"{file_path.stem}.png"
			pix.save(str(png_path))

			file.close()

			if not png_path.exists():
				raise RuntimeError(f"PDF conversion failed to generate image: {file_path.name}")

			return png_path

		except Exception as e:
			raise RuntimeError(
				f"Failed to convert PDF: {file_path.name}\n"
				f"{str(e)}"
			)
