import { describe, it, expect } from 'vitest';
import { dialArcPath, pointOnDial } from './dial-geometry';
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
