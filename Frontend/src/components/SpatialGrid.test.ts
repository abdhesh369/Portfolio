import { describe, it, expect, beforeEach } from "vitest";
import { SpatialGrid } from "./PlexusBackground";

describe("SpatialGrid", () => {
    let grid: SpatialGrid;
    const CELL_SIZE = 100;

    beforeEach(() => {
        grid = new SpatialGrid(CELL_SIZE);
    });

    it("creates a grid with the given cell size", () => {
        expect(grid.cellSize).toBe(CELL_SIZE);
    });

    it("inserts and retrieves particles in the same cell", () => {
        grid.insert(0, 10, 10, 10);
        grid.insert(1, 20, 20, 20);

        const nearby = grid.getNearby(15, 15, 15);
        expect(nearby).toContain(0);
        expect(nearby).toContain(1);
    });

    it("retrieves particles from neighboring cells", () => {
        // Particle at boundary — in cell (0,0,0)
        grid.insert(0, 99, 99, 99);
        // Particle in adjacent cell (1,1,1)
        grid.insert(1, 101, 101, 101);

        const nearby = grid.getNearby(99, 99, 99);
        expect(nearby).toContain(0);
        expect(nearby).toContain(1);
    });

    it("does not return particles from distant cells", () => {
        grid.insert(0, 0, 0, 0);
        // Far away — more than 1 cell apart (cell 5,5,5 vs 0,0,0)
        grid.insert(1, 500, 500, 500);

        const nearby = grid.getNearby(0, 0, 0);
        expect(nearby).toContain(0);
        expect(nearby).not.toContain(1);
    });

    it("handles negative coordinates", () => {
        grid.insert(0, -50, -50, -50);
        grid.insert(1, -60, -60, -60);

        const nearby = grid.getNearby(-55, -55, -55);
        expect(nearby).toContain(0);
        expect(nearby).toContain(1);
    });

    it("clear() removes all particles", () => {
        grid.insert(0, 10, 10, 10);
        grid.insert(1, 20, 20, 20);

        grid.clear();

        const nearby = grid.getNearby(15, 15, 15);
        expect(nearby).toHaveLength(0);
    });

    it("handles many particles efficiently", () => {
        // Insert 300 particles in a small area
        for (let i = 0; i < 300; i++) {
            grid.insert(i, Math.random() * 800 - 400, Math.random() * 600 - 300, Math.random() * 400 - 200);
        }

        // Should complete quickly and return only nearby particles
        const nearby = grid.getNearby(0, 0, 0);
        // All returned indices should be valid
        for (const idx of nearby) {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(300);
        }
        // Should not return all 300 (most are in different cells)
        expect(nearby.length).toBeLessThan(300);
    });

    it("returns correct results after reuse (clear + insert)", () => {
        grid.insert(0, 10, 10, 10);
        grid.clear();
        grid.insert(1, 15, 15, 15);

        const nearby = grid.getNearby(12, 12, 12);
        expect(nearby).not.toContain(0);
        expect(nearby).toContain(1);
    });
});
