from lukwolfly_bot.config import Settings, _ids


def test_ids_parse():
    assert _ids("1, 2,3") == frozenset({1, 2, 3})
    assert _ids("") == frozenset()


def test_defaults(monkeypatch):
    monkeypatch.delenv("TELEGRAM_BOT_TOKEN", raising=False)
    s = Settings()
    assert s.site_api_url == "http://app:3000"
    assert s.token == ""
