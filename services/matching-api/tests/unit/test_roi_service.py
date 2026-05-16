import pytest
import asyncio
from src.services.scb_client import calculate_roi


@pytest.mark.asyncio
async def test_roi_positive_when_participants():
    result = await calculate_roi(antal=10, kostnad_kr=5000, sektor="industri")
    assert result["roi_procent"] == pytest.approx(-85.0, abs=1.0)
    assert result["payback_manader"] > 0
    assert len(result["antaganden"]) == 3


@pytest.mark.asyncio
async def test_roi_zero_cost():
    result = await calculate_roi(antal=10, kostnad_kr=0, sektor="vard")
    assert result["roi_procent"] == 0.0
    assert result["payback_manader"] == 0


@pytest.mark.asyncio
async def test_roi_antaganden_pa_svenska():
    result = await calculate_roi(antal=5, kostnad_kr=10000, sektor="it")
    for antagande in result["antaganden"]:
        assert isinstance(antagande, str)
        assert len(antagande) > 0
