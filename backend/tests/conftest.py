import os
import sys

import pytest


_repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_repo_root = os.path.dirname(_repo_root)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)


def pytest_collection_modifyitems(items):
    for item in items:
        path = str(item.fspath)
        if "\\tests\\integration\\" in path or "/tests/integration/" in path:
            item.add_marker(pytest.mark.integration)
        if "\\tests\\unit\\" in path or "/tests/unit/" in path:
            item.add_marker(pytest.mark.unit)
