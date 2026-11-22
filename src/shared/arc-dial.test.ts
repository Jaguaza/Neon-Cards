import { describe, it, expect } from 'vitest';
import { DIAL_END_ANGLE, DIAL_START_ANGLE, angleForValue, angleFromPoint, buildArcModel, dialArcPath, pointOnDial, valueForAngle } from './arc-dial';

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

describe('angleForValue', () => {
  it('reparte el rango de valores a lo largo de los 180° del dial', () => {
    expect(angleForValue(7, 7, 35)).toBe(DIAL_START_ANGLE);
    expect(angleForValue(35, 7, 35)).toBe(DIAL_END_ANGLE);
    expect(angleForValue(21, 7, 35)).toBeCloseTo(0);
  });

  it('un valor fuera de rango se queda en el extremo', () => {
    expect(angleForValue(-5, 7, 35)).toBe(DIAL_START_ANGLE);
    expect(angleForValue(99, 7, 35)).toBe(DIAL_END_ANGLE);
  });

  it('con un rango nulo o invertido devuelve el ángulo inicial', () => {
    expect(angleForValue(20, 20, 20)).toBe(DIAL_START_ANGLE);
    expect(angleForValue(20, 30, 10)).toBe(DIAL_START_ANGLE);
  });
});

describe('valueForAngle', () => {
  it('es la inversa de angleForValue dentro del arco', () => {
    for (const t of [7, 12.5, 21, 30, 35]) {
      expect(valueForAngle(angleForValue(t, 7, 35), 7, 35)).toBeCloseTo(t);
    }
  });

  it('un ángulo fuera del arco se queda en el extremo más cercano', () => {
    expect(valueForAngle(-170, 7, 35)).toBe(7);
    expect(valueForAngle(170, 7, 35)).toBe(35);
  });
});

describe('buildArcModel', () => {
  it('coloca el punto en el extremo inicial si no hay valor', () => {
    const arc = buildArcModel('dial-grad', 'climate.salon', 7, 35, null);
    expect(arc.dot.x).toBeCloseTo(arc.start.x);
    expect(arc.dot.y).toBeCloseTo(arc.start.y);
  });

  it('coloca el punto sobre el arco según el valor', () => {
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

describe('angleFromPoint', () => {
  const rect = { left: 100, top: 200, width: 100, height: 100 };

  it('un punto justo encima del centro es 0°, a la derecha 90° y a la izquierda -90°', () => {
    expect(angleFromPoint(rect, 150, 200)).toBeCloseTo(0);
    expect(angleFromPoint(rect, 200, 250)).toBeCloseTo(90);
    expect(angleFromPoint(rect, 100, 250)).toBeCloseTo(-90);
  });

  it('no acota al arco: un punto bajo el centro supera los 90°', () => {
    expect(angleFromPoint(rect, 200, 300)).toBeGreaterThan(90);
  });
});
