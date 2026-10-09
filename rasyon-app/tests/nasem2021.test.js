import { describe, it, expect } from 'vitest';
import { calcNELRequirements } from '../src/core/nrc2001.js';
import {
  nelMaintenanceNASEM, nelPregnancyNASEM,
  calcNELRequirementsNASEM, compareNRCvsNASEM,
  calcMPRequirementsNASEM,
} from '../src/core/nasem2021.js';

const TOLERANCE = 0.02;

function withinTolerance(actual, expected, tol = TOLERANCE) {
  if (expected === 0) return actual < 0.01;
  return Math.abs(actual - expected) / expected <= tol;
}

describe('NASEM 2021 İdame NEL', () => {
  it('NASEM 2021: 0.10 × BW^0.75 (NRC 2001\'den %25 yüksek)', () => {
    const bw = 600;
    const nasemNEL = nelMaintenanceNASEM(bw);
    const nrc2001NEL = 0.08 * Math.pow(bw, 0.75);
    const pctIncrease = (nasemNEL - nrc2001NEL) / nrc2001NEL * 100;
    expect(Math.abs(pctIncrease - 25)).toBeLessThan(1);
  });

  it('600 kg inek → 0.10 × 600^0.75 ≈ 12.12 Mcal/gün', () => {
    const nel = nelMaintenanceNASEM(600);
    expect(withinTolerance(nel, 12.12)).toBe(true);
  });
});

describe('NASEM 2021 Gebelik NEL', () => {
  it('190 günden önce 0 olmalı', () => {
    expect(nelPregnancyNASEM(180)).toBe(0);
  });

  it('210. gün gebelik NEL pozitif', () => {
    expect(nelPregnancyNASEM(210)).toBeGreaterThan(0);
  });

  it('Gebelik ilerledikçe NEL artmalı', () => {
    expect(nelPregnancyNASEM(250)).toBeGreaterThan(nelPregnancyNASEM(210));
  });
});

describe('NASEM 2021 Toplam NEL Karşılaştırması', () => {
  const testAnimal = {
    bw: 600, milkYield: 35, milkFat: 3.7, milkProtein: 3.2,
    milkLactose: 4.8, bcs: 3.0, targetBcs: 3.0, dim: 60,
    pregnant: false, gestDays: 0, dailyWalkKm: 0,
  };

  it('NASEM 2021 toplam NEL > NRC 2001 (idame farkı nedeniyle)', () => {
    const nrc = calcNELRequirements(testAnimal);
    const nasem = calcNELRequirementsNASEM(testAnimal);
    expect(nasem.total).toBeGreaterThan(nrc.total);
  });

  it('Fark sadece idame bileşeninden kaynaklanmalı (laktasyon aynı)', () => {
    const nrc = calcNELRequirements(testAnimal);
    const nasem = calcNELRequirementsNASEM(testAnimal);
    expect(nrc.lactation).toBeCloseTo(nasem.lactation, 1);
  });

  it('compareNRCvsNASEM doğru fark yüzdesi (~%15-20 arası)', () => {
    const nrc = calcNELRequirements(testAnimal);
    const nasem = calcNELRequirementsNASEM(testAnimal);
    const comparison = compareNRCvsNASEM(nrc, nasem);
    // İdame artışı (%25) toplam NEL'de %15-20 artışa dönüşür
    expect(comparison.totalPctChange).toBeGreaterThan(5);
    expect(comparison.totalPctChange).toBeLessThan(30);
  });
});

describe('NASEM 2021 MP İdame', () => {
  const testAnimal = {
    bw: 600,
    milkYield: 30,
    milkFat: 4,
    milkProtein: 3.2,
    milkLactose: 4.8,
    pregnant: false,
    gestDays: 0,
  };

  it('test vakasında ham protein kalemleri rehberle uyumludur', () => {
    const mp = calcMPRequirementsNASEM(testAnimal, 21.8, 32);
    expect(mp.raw.scurfTP).toBeCloseTo(7.9, 1);
    expect(mp.raw.fecalTP).toBeCloseTo(253, 0);
    expect(mp.raw.milkTP).toBe(960);
    expect(mp.urine).toBe(199);
  });

  it('test vakasında MP katkıları ve toplam tutarlıdır', () => {
    const mp = calcMPRequirementsNASEM(testAnimal, 21.8, 32);
    expect(mp.scurf).toBe(11);
    expect(mp.fecal).toBe(367);
    expect(mp.lactation).toBe(1391);
    expect(mp.maintenance).toBe(mp.scurf + mp.fecal + mp.urine);
    expect(mp.total).toBeGreaterThanOrEqual(1965);
    expect(mp.total).toBeLessThanOrEqual(1975);
  });
});
