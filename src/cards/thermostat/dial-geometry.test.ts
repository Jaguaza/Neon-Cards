import { describe, it, expect } from 'vitest';
import { angleForTemp, buildArcModel, dialArcPath, pointOnDial, tempForAngle } from './dial-geometry';
import { DIAL_END_ANGLE, DIAL_START_ANGLE } from './constants';

describe('pointOnDial', () => {
  it('0° está arriba y el ángulo crece en sentido horario', () => {
    const top = pointOnDial(50, 50, 40, 0);
    expect(top.x).toBeCloseTo(50);
    expect(top.y).toBeCloseTo(10);
    const right = pointOnDial(50, 50, 40, 90);
    expect(right.x).toBeCloseTo(90);
    expect(right.y).toBeCloseTo(50);
    const left = pointOnDial(50, 50, 40, -90);
    expect(left.x).toBeCloseTo(10);
    expect(left.y).toBeCloseTo(50);
  });
});

describe('dialArcPath', () => {
  it('traza un arco SVG de 180° con el flag de arco grande a 0 y sentido horario', () => {
    const path = dialArcPath(50, 50, 40, DIAL_START_ANGLE, DIAL_END_ANGLE);
    expect(path).toMatch(/^M [-\d.e]+ [-\d.e]+ A 40 40 0 0 1 [-\d.e]+ [-\d.e]+$/);
    const nums = path.match(/-?\d+(\.\d+)?(e-?\d+)?/g)!.map(Number);
    expect(nums[0]).toBeCloseTo(10);
    expect(nums[1]).toBeCloseTo(50);
    expect(nums[nums.length - 2]).toBeCloseTo(90);
    expect(nums[nums.length - 1]).toBeCloseTo(50);
  });
});

describe('angleForTemp', () => {
  it('reparte el rango de temperaturas a lo largo de los 180° del dial', () => {
    expect(angleForTemp(7, 7, 35)).toBe(DIAL_START_ANGLE);
    expect(angleForTemp(35, 7, 35)).toBe(DIAL_END_ANGLE);
    expect(angleForTemp(21, 7, 35)).toBeCloseTo(0);
  });

  it('una temperatura fuera de rango se queda en el extremo', () => {
    expect(angleForTemp(-5, 7, 35)).toBe(DIAL_START_ANGLE);
    expect(angleForTemp(99, 7, 35)).toBe(DIAL_END_ANGLE);
  });

  it('con un rango nulo o invertido devuelve el ángulo inicial', () => {
    expect(angleForTemp(20, 20, 20)).toBe(DIAL_START_ANGLE);
    expect(angleForTemp(20, 30, 10)).toBe(DIAL_START_ANGLE);
  });
});

describe('tempForAngle', () => {
  it('es la inversa de angleForTemp dentro del arco', () => {
    for (const t of [7, 12.5, 21, 30, 35]) {
      expect(tempForAngle(angleForTemp(t, 7, 35), 7, 35)).toBeCloseTo(t);
    }
  });

  it('un ángulo fuera del arco se queda en el extremo más cercano', () => {
    expect(tempForAngle(-170, 7, 35)).toBe(7);
    expect(tempForAngle(170, 7, 35)).toBe(35);
  });
});

describe('buildArcModel', () => {
  it('coloca el punto en el extremo inicial si no hay consigna', () => {
    const arc = buildArcModel('dial-grad', 'climate.salon', 7, 35, null);
    expect(arc.dot.x).toBeCloseTo(arc.start.x);
    expect(arc.dot.y).toBeCloseTo(arc.start.y);
  });

  it('coloca el punto sobre el arco según la consigna', () => {
    const arc = buildArcModel('dial-grad', 'climate.salon', 7, 35, 21);
    expect(arc.dot.x).toBeCloseTo(50);
    expect(arc.dot.y).toBeCloseTo(8);
  });

  it('acota la fracción del degradado entre 0,08 y 0,92', () => {
    expect(buildArcModel('d', 'climate.x', 7, 35, 7).dotFraction).toBe(0.08);
    expect(buildArcModel('d', 'climate.x', 7, 35, 35).dotFraction).toBe(0.92);
    expect(buildArcModel('d', 'climate.x', 7, 35, 21).dotFraction).toBeCloseTo(0.5);
  });

  it('genera un id de degradado único por entidad y sin caracteres especiales', () => {
    expect(buildArcModel('ring-grad', 'climate.salón_1', 7, 35, 21).gradientId).toBe('ring-grad-climate-sal-n-1');
    const a = buildArcModel('dial-grad', 'climate.a', 7, 35, 21).gradientId;
    const b = buildArcModel('dial-grad', 'climate.b', 7, 35, 21).gradientId;
    expect(a).not.toBe(b);
  });

  it('el trazo coincide con dialArcPath del mismo arco', () => {
    const arc = buildArcModel('dial-grad', 'climate.x', 7, 35, 21);
    expect(arc.fullPath).toBe(dialArcPath(50, 50, 42, DIAL_START_ANGLE, DIAL_END_ANGLE));
  });
});
