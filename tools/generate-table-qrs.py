from __future__ import annotations

import csv
import re
from pathlib import Path

from PIL import Image, ImageDraw
from reportlab.graphics.barcode.qr import QrCodeWidget


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PNG_DIR = PROJECT_ROOT / "QR_PNG"
PUBLIC_BASE_URL = "https://nu-irk.github.io"


def load_netmonet_links() -> dict[int, str]:
    script = (PROJECT_ROOT / "script.js").read_text(encoding="utf-8")
    match = re.search(
        r"const paymentLinks = \{(?P<body>.*?)\};",
        script,
        flags=re.DOTALL,
    )
    if not match:
        raise RuntimeError("Не найден объект paymentLinks в script.js")

    links = {
        int(table): url
        for table, url in re.findall(
            r'^\s*(\d+):\s*"(https://netmonet\.co/[^"]+)"',
            match.group("body"),
            flags=re.MULTILINE,
        )
    }
    if sorted(links) != list(range(1, 13)) or len(set(links.values())) != 12:
        raise RuntimeError("Ожидались 12 уникальных ссылок Netmonet")
    return links


def make_qr(url: str, svg_path: Path, png_path: Path) -> None:
    widget = QrCodeWidget(url, barLevel="H")
    widget.qr.make()
    modules = widget.qr.modules
    module_count = widget.qr.moduleCount
    quiet_zone = 4
    total_modules = module_count + quiet_zone * 2

    image_size = 1080
    module_px = image_size // total_modules
    qr_px = total_modules * module_px
    offset = (image_size - qr_px) // 2
    image = Image.new("L", (image_size, image_size), 255)
    painter = ImageDraw.Draw(image)

    svg = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_modules} {total_modules}" shape-rendering="crispEdges">',
        f'<rect width="{total_modules}" height="{total_modules}" fill="#fff"/>',
        '<g fill="#000">',
    ]

    for row_index, row in enumerate(modules):
        for column_index, dark in enumerate(row):
            if not dark:
                continue
            x_module = column_index + quiet_zone
            y_module = row_index + quiet_zone
            x0 = offset + x_module * module_px
            y0 = offset + y_module * module_px
            painter.rectangle(
                (x0, y0, x0 + module_px - 1, y0 + module_px - 1),
                fill=0,
            )
            svg.append(
                f'<rect x="{x_module}" y="{y_module}" width="1" height="1"/>'
            )

    svg.extend(("</g>", "</svg>"))
    svg_path.write_text("\n".join(svg) + "\n", encoding="utf-8")
    image.save(png_path, format="PNG", optimize=True)


def main() -> None:
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    links = load_netmonet_links()
    rows: list[dict[str, str]] = []

    for table in range(1, 13):
        label = f"{table:02d}"
        public_url = f"{PUBLIC_BASE_URL}/table-{label}/"
        svg_path = PROJECT_ROOT / f"table-{label}.svg"
        png_path = PNG_DIR / f"table-{label}.png"
        make_qr(public_url, svg_path, png_path)
        rows.append(
            {
                "table": label,
                "public_url": public_url,
                "qr_png": png_path.name,
                "qr_svg": svg_path.name,
                "netmonet_url": links[table],
            }
        )

    with (PNG_DIR / "table-links.csv").open(
        "w", encoding="utf-8-sig", newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    report = [
        "НЕ УСЛОЖНЯЙ — QR-коды столов",
        "Каждый QR ведёт на самостоятельную страницу своего стола.",
        "",
    ]
    report.extend(
        f"Стол {row['table']}: {row['public_url']}" for row in rows
    )
    (PNG_DIR / "README.txt").write_text(
        "\n".join(report) + "\n", encoding="utf-8"
    )
    print("Созданы 12 QR-кодов на отдельные страницы столов.")


if __name__ == "__main__":
    main()
