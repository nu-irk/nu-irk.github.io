from __future__ import annotations

import csv
import re
import zipfile
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_M


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PNG_DIR = PROJECT_ROOT / "QR_PNG_NEW"
PUBLIC_BASE_URL = "https://nu-irk.github.io"
QR_REVISION = "20260819-5"


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
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=24,
        border=6,
    )
    qr.add_data(url, optimize=20)
    qr.make(fit=True)
    modules = qr.get_matrix()
    total_modules = len(modules)

    image = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    image.save(png_path, format="PNG", optimize=True)

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
            svg.append(
                f'<rect x="{column_index}" y="{row_index}" width="1" height="1"/>'
            )

    svg.extend(("</g>", "</svg>"))
    svg_path.write_text("\n".join(svg) + "\n", encoding="utf-8")


def main() -> None:
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    links = load_netmonet_links()
    rows: list[dict[str, str]] = []

    for table in range(1, 13):
        label = f"{table:02d}"
        public_url = f"{PUBLIC_BASE_URL}/table-{label}/?qr={QR_REVISION}"
        svg_path = PNG_DIR / f"NU-table-{label}-NEW.svg"
        png_path = PNG_DIR / f"NU-table-{label}-NEW.png"
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
        "НЕ УСЛОЖНЯЙ — НОВЫЕ QR-коды столов",
        "Использовать только файлы с пометкой NEW из этой папки.",
        "Каждый QR ведёт на самостоятельную страницу своего стола.",
        "",
    ]
    report.extend(
        f"Стол {row['table']}: {row['public_url']}" for row in rows
    )
    (PNG_DIR / "README.txt").write_text(
        "\n".join(report) + "\n", encoding="utf-8"
    )

    zip_path = PROJECT_ROOT / "QR_PNG_NEW_12_tables.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(PNG_DIR.iterdir()):
            archive.write(path, arcname=path.name)

    print("Созданы 12 новых QR-кодов на отдельные страницы столов.")


if __name__ == "__main__":
    main()
