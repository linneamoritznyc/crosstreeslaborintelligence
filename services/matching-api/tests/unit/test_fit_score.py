import pytest
from src.services.fit_score import calculate_fit_score, wilson_score_interval


def test_wilson_score_zero_n():
    low, high = wilson_score_interval(0.5, 0)
    assert low == 0.0
    assert high == 1.0


def test_wilson_score_perfect():
    low, high = wilson_score_interval(1.0, 100)
    assert low > 0.9
    assert high == 1.0


def test_fit_score_returns_none_when_no_job_skills():
    result = calculate_fit_score({"skill-a"}, {}, {})
    assert result is None


def test_fit_score_perfect_match():
    user = {"s1", "s2", "s3"}
    job = {"s1": "required", "s2": "preferred", "s3": "bonus"}
    idf = {"s1": 1.0, "s2": 1.0, "s3": 1.0}
    result = calculate_fit_score(user, job, idf)
    assert result is not None
    assert result["score"] == 100.0
    assert result["missing_required"] == []


def test_fit_score_no_match():
    user = {"s4"}
    job = {"s1": "required", "s2": "required"}
    idf = {"s1": 1.0, "s2": 1.0}
    result = calculate_fit_score(user, job, idf)
    assert result is not None
    assert result["score"] == 0.0
    assert set(result["missing_required"]) == {"s1", "s2"}


def test_fit_score_partial_required():
    user = {"s1"}
    job = {"s1": "required", "s2": "required"}
    idf = {"s1": 1.0, "s2": 1.0}
    result = calculate_fit_score(user, job, idf)
    assert result is not None
    assert result["score"] == pytest.approx(30.0, abs=1.0)


def test_confidence_interval_in_result():
    user = {"s1"}
    job = {"s1": "required"}
    result = calculate_fit_score(user, job, {"s1": 1.0})
    assert result is not None
    ci = result["confidence_interval"]
    assert ci["method"] == "wilson_score_95"
    assert 0.0 <= ci["low"] <= ci["high"] <= 100.0
