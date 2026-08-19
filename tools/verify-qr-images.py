from __future__ import annotations

from pathlib import Path

import zxingcpp
from PIL import Image, ImageFilter


PROJECT_ROOT = Path(__file__).resolve().parents[1]
QR_DIRECTORY = PROJECT_ROOT / "QR_FINAL_12_TABLES"


def decode(image: Image.Image) -> str | None:
    results = zxingcpp.read_barcodes(image)
    return results[0].text if results else None


for table in range(1, 13):
    label = f"{table:02d}"
    path = QR_DIRECTORY / f"NU-table-{label}.png"
    expected = f"https://nu-irk.github.io/table-{label}/"
    original = Image.open(path)
    variants = (
        original,
        original.resize((320, 320)),
        original.resize((320, 320)).filter(ImageFilter.GaussianBlur(0.6)),
    )

    for variant in variants:
        actual = decode(variant)
        if actual != expected:
            raise RuntimeError(f"{path.name}: ожидалось {expected!r}, прочитано {actual!r}")

print("OK: все 12 QR-кодов читаются в оригинале, уменьшении и с размытием.")
