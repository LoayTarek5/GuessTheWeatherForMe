import json
from fastapi_cache import FastAPICache


class CacheUtility:
    async def get_dict(self, key: str) -> dict | None:
        cache = FastAPICache.get_backend()
        cached = await cache.get(key)
        if not cached:
            return None
        if isinstance(cached, bytes):
            cached = cached.decode("utf-8")  # bytes → str
        return json.loads(cached)  # str → dict

    async def set_dict(self, key: str, value: dict, expire: int = 3600):
        cache = FastAPICache.get_backend()
        await cache.set(
            key,
            json.dumps(value).encode("utf-8"),  # dict → str → bytes
            expire=expire
        )

    def GenerateKey(self, long: float, lat: float) -> str:
        return f"{long}:{lat}"
