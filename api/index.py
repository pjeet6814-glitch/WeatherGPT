import os
import sys
from urllib.parse import parse_qs, urlencode

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app as fastapi_app

class VercelRouteMiddleware:
    """Restores the original subpath and query parameters rewritten by Vercel."""
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            qs = scope.get("query_string", b"").decode("utf-8")
            if "__route__" in qs:
                params = parse_qs(qs, keep_blank_values=True)
                route = params.pop("__route__", [""])[0].strip("/")
                scope["path"] = f"/api/{route}" if route else "/api"
                flat = []
                for k, vals in params.items():
                    for v in vals:
                        flat.append((k, v))
                scope["query_string"] = urlencode(flat).encode("utf-8")
        await self.asgi_app(scope, receive, send)

app = VercelRouteMiddleware(fastapi_app)
