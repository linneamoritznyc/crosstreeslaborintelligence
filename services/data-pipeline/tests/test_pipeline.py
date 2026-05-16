import pytest
from src.transform.occupations import transform_occupations
from src.transform.skills import transform_skills
from src.transform.substitutability import build_substitutability_matrix
from src.evaluate.pagerank_sensitivity import compute_pagerank
from src.evaluate.bias_audit import audit_match_results


def test_transform_occupations_filters_incomplete():
    raw = [
        {"conceptId": "o1", "preferredLabel": "Mjukvaruutvecklare"},
        {"conceptId": "", "preferredLabel": "Saknar id"},
        {"conceptId": "o3", "preferredLabel": ""},
    ]
    result = transform_occupations(raw)
    assert len(result) == 1
    assert result[0]["id"] == "o1"
    assert result[0]["name"] == "Mjukvaruutvecklare"


def test_transform_skills_filters_incomplete():
    raw = [{"conceptId": "s1", "preferredLabel": "Python"}, {"conceptId": "", "preferredLabel": "Tomt"}]
    result = transform_skills(raw)
    assert len(result) == 1
    assert result[0]["id"] == "s1"


def test_substitutability_jaccard_threshold():
    occ_skills = {
        "o1": {"s1", "s2", "s3"},
        "o2": {"s1", "s2", "s4"},
        "o3": {"s9", "s10"},
    }
    scores = build_substitutability_matrix(occ_skills)
    assert ("o1", "o2") in scores
    assert ("o1", "o3") not in scores and ("o3", "o1") not in scores


def test_pagerank_sum_approximately_one():
    adjacency = {
        "o1": [("o2", 1.0), ("o3", 0.5)],
        "o2": [("o1", 0.8)],
        "o3": [],
    }
    ranks = compute_pagerank(adjacency)
    assert abs(sum(ranks.values()) - 1.0) < 0.01


def test_bias_audit_detects_disparity():
    results = [
        {"kön": "kvinna", "åldersgrupp": "25-34", "utbildningsnivå": "gymnasie", "score": 40.0},
        {"kön": "man", "åldersgrupp": "25-34", "utbildningsnivå": "gymnasie", "score": 85.0},
    ]
    report = audit_match_results(results)
    assert report.kön_paritet < 0.8
    assert len(report.flaggor) > 0


def test_bias_audit_clean_results():
    results = [
        {"kön": "kvinna", "åldersgrupp": "25-34", "utbildningsnivå": "högskola", "score": 80.0},
        {"kön": "man", "åldersgrupp": "25-34", "utbildningsnivå": "högskola", "score": 82.0},
    ]
    report = audit_match_results(results)
    assert report.flaggor == []
