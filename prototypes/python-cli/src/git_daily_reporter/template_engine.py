from __future__ import annotations

from pathlib import Path

from jinja2 import Template


def render_template_file(template_path: Path, context: dict[str, object]) -> str:
    template = Template(template_path.read_text(encoding="utf-8"))
    return template.render(**context)

