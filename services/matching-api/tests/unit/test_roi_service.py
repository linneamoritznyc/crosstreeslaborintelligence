"""Tester för bootstrap-baserad ROI-kalkyl (PRD KR-05)."""
from src.services.roi_service import calculate_roi_with_confidence


def test_roi_returnerar_konfidensintervall():
    result = calculate_roi_with_confidence(
        participants=20,
        training_cost_per_person=45_000,
        rng_seed=42,
    )
    assert result["net_benefit_kr"] is not None
    assert result["ci_95_low_kr"] is not None
    assert result["ci_95_high_kr"] is not None
    assert result["ci_95_low_kr"] <= result["net_benefit_kr"]
    assert result["net_benefit_kr"] <= result["ci_95_high_kr"]
    assert result["method"] == "bootstrap_95"
    assert result["n_simulations"] == 1000


def test_roi_inga_deltagare_returnerar_none():
    result = calculate_roi_with_confidence(
        participants=0,
        training_cost_per_person=10_000,
    )
    assert result["net_benefit_kr"] is None
    assert result["ci_95_low_kr"] is None
    assert result["roi_procent"] is None


def test_roi_antaganden_pa_svenska():
    result = calculate_roi_with_confidence(
        participants=10,
        training_cost_per_person=30_000,
        rng_seed=1,
    )
    assert len(result["antaganden"]) >= 4
    for antagande in result["antaganden"]:
        assert isinstance(antagande, str)
        assert len(antagande) > 0


def test_roi_determinism_med_seed():
    r1 = calculate_roi_with_confidence(
        participants=15, training_cost_per_person=40_000, rng_seed=7
    )
    r2 = calculate_roi_with_confidence(
        participants=15, training_cost_per_person=40_000, rng_seed=7
    )
    assert r1["net_benefit_kr"] == r2["net_benefit_kr"]
    assert r1["ci_95_low_kr"] == r2["ci_95_low_kr"]
    assert r1["ci_95_high_kr"] == r2["ci_95_high_kr"]


def test_roi_transition_score_paverkar_resultat():
    hog = calculate_roi_with_confidence(
        participants=20,
        training_cost_per_person=40_000,
        transition_score=0.95,
        rng_seed=1,
    )
    lag = calculate_roi_with_confidence(
        participants=20,
        training_cost_per_person=40_000,
        transition_score=0.50,
        rng_seed=1,
    )
    assert hog["net_benefit_kr"] > lag["net_benefit_kr"]
